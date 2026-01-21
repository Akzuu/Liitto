import { eq, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "../db";
import { invitationSession } from "../db/schema";

const SESSION_EXPIRY_DAYS = 30;
const COOKIE_NAME = "invitation_session";
const MAX_SESSIONS_PER_INVITATION = 5; // Prevent session flooding

export type SessionData = {
  id: string;
  invitationId: string;
  emailVerified: boolean;
  expiresAt: Date;
};

/**
 * Generate a cryptographically secure random token
 * Uses Web Crypto API
 */
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Hash a token using SHA-256
 * Uses Web Crypto API
 */
const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Create a new invitation session
 * Returns the unhashed token (only time it's available)
 */
export const createInvitationSession = async (
  invitationId: string,
): Promise<{ token: string; session: SessionData }> => {
  // Clean up expired sessions first
  await cleanupExpiredSessions();

  // Check session count for this invitation
  const existingSessions = await db
    .select()
    .from(invitationSession)
    .where(eq(invitationSession.invitationId, invitationId));

  // If at limit, delete oldest session
  if (existingSessions.length >= MAX_SESSIONS_PER_INVITATION) {
    const sortedSessions = [...existingSessions].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const oldestSession = sortedSessions[0];

    if (!oldestSession) {
      throw new Error("Expected at least one session but found none");
    }

    await db
      .delete(invitationSession)
      .where(eq(invitationSession.id, oldestSession.id));
  }

  const token = generateToken();
  const hashedToken = await hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const [session] = await db
    .insert(invitationSession)
    .values({
      invitationId,
      token: hashedToken,
      emailVerified: false,
      expiresAt,
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create invitation session");
  }

  return {
    token, // Return unhashed token to store in cookie
    session: {
      id: session.id,
      invitationId: session.invitationId,
      emailVerified: session.emailVerified,
      expiresAt: session.expiresAt,
    },
  };
};

/**
 * Validate a session token and return session data
 * Updates lastAccessedAt on successful validation
 */
export const validateSessionToken = async (
  token: string,
): Promise<SessionData | null> => {
  const hashedToken = await hashToken(token);

  const [session] = await db
    .select()
    .from(invitationSession)
    .where(eq(invitationSession.token, hashedToken))
    .limit(1);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    // Clean up expired session
    await db
      .delete(invitationSession)
      .where(eq(invitationSession.id, session.id));
    return null;
  }

  // Update last accessed time
  await db
    .update(invitationSession)
    .set({ lastAccessedAt: new Date() })
    .where(eq(invitationSession.id, session.id));

  return {
    id: session.id,
    invitationId: session.invitationId,
    emailVerified: session.emailVerified,
    expiresAt: session.expiresAt,
  };
};

/**
 * Mark session as email verified and rotate the token for security
 * Returns new token to update the cookie
 */
export const markEmailVerified = async (
  sessionId: string,
): Promise<{ token: string; expiresAt: Date }> => {
  // Generate new token
  const newToken = generateToken();
  const hashedToken = await hashToken(newToken);

  // Get current session to preserve expiration
  const [currentSession] = await db
    .select()
    .from(invitationSession)
    .where(eq(invitationSession.id, sessionId))
    .limit(1);

  if (!currentSession) {
    throw new Error("Session not found");
  }

  // Update session with new token and mark as verified
  await db
    .update(invitationSession)
    .set({
      emailVerified: true,
      token: hashedToken,
    })
    .where(eq(invitationSession.id, sessionId));

  return {
    token: newToken,
    expiresAt: currentSession.expiresAt,
  };
};

/**
 * Delete a session (logout)
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await db.delete(invitationSession).where(eq(invitationSession.id, sessionId));
};

/**
 * Delete all sessions for an invitation
 */
export const deleteInvitationSessions = async (
  invitationId: string,
): Promise<void> => {
  await db
    .delete(invitationSession)
    .where(eq(invitationSession.invitationId, invitationId));
};

/**
 * Get session cookie options for secure cookies
 */
export const getSessionCookieOptions = (expiresAt: Date) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires: expiresAt,
    path: "/",
  };
};

/**
 * Get the cookie name for invitation session
 */
export const getSessionCookieName = (): string => {
  return COOKIE_NAME;
};

/**
 * Validate session from request cookie
 * Throws NextResponse if validation fails
 */
export const validateSessionFromRequest = async (
  req: NextRequest,
): Promise<SessionData> => {
  const token = req.cookies.get(getSessionCookieName())?.value;

  if (!token) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await validateSessionToken(token);

  if (!session) {
    throw NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return session;
};

/**
 * Higher-order function that wraps route handlers with session validation
 * Automatically validates session and passes it to the handler
 *
 * @example
 * export const POST = withInvitationSession(async (req, session) => {
 *   // session is available here, no need to validate manually
 *   return NextResponse.json({ invitationId: session.invitationId });
 * });
 */
export const withInvitationSession = (
  handler: (req: NextRequest, session: SessionData) => Promise<NextResponse>,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await validateSessionFromRequest(req);
      return await handler(req, session);
    } catch (error) {
      // If error is already a NextResponse (auth failure), return it
      if (error instanceof NextResponse) {
        return error;
      }
      console.error("Error in route handler:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
};

/**
 * Clean up expired sessions (internal use)
 */
const cleanupExpiredSessions = async (): Promise<void> => {
  const now = new Date();
  await db
    .delete(invitationSession)
    .where(lt(invitationSession.expiresAt, now));
};
