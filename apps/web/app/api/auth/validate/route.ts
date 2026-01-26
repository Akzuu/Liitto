import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { createVerificationCode } from "@/lib/email-verification";
import {
  createInvitationSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/invitation-session";

type ValidateRequest = {
  code: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as ValidateRequest;

    // Validate input
    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json(
        { error: "Varmista koodin oikea muoto" },
        { status: 400 },
      );
    }

    // Normalize code (uppercase, ensure format)
    const normalizedCode = body.code.toUpperCase().trim();

    // Query invitation
    const invitationData = await db.query.invitation.findFirst({
      where: eq(invitation.code, normalizedCode),
      with: {
        rsvp: true,
      },
    });

    if (!invitationData) {
      return NextResponse.json(
        { error: "Varmista koodin oikea muoto" },
        { status: 400 },
      );
    }

    // Create session
    const { token, session } = await createInvitationSession(invitationData.id);

    // Auto-send verification email if RSVP exists and email not verified
    if (invitationData.rsvp && !session.emailVerified) {
      // Fire and forget - don't block login if email send fails
      createVerificationCode(
        invitationData.id,
        invitationData.rsvp.email,
      ).catch(() => {
        // Silently fail - login should not be blocked by email send failures
      });
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      invitationId: invitationData.id,
      requiresEmailVerification: !!invitationData.rsvp, // If RSVP exists, require email verification
    });

    // Set session cookie
    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
