import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { db } from "../db";
import { emailVerificationCode } from "../db/schema";

const CODE_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 10;
const VERIFICATION_CODE_LENGTH = 6;
const BASE_COOLDOWN_SECONDS = 60;

/**
 * Calculate progressive cooldown based on recent send count
 * Pattern: 60s, 90s, 120s, 180s, 240s, etc.
 */
const calculateCooldown = (recentSendCount: number): number => {
  // First send: 60s, second: 90s, third: 120s, fourth: 180s, fifth: 240s
  if (recentSendCount === 0) return 60;
  if (recentSendCount === 1) return 90;
  if (recentSendCount === 2) return 120;
  if (recentSendCount === 3) return 180;
  // After 4th send, add 60s for each additional send
  return 180 + (recentSendCount - 3) * 60;
};

/**
 * Constant-time string comparison to prevent timing attacks
 * Compares two strings byte-by-byte without early exit
 */
const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // Use bitwise OR to accumulate differences without early exit
    result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
  }

  return result === 0;
};

/**
 * Generate a 6-digit verification code
 * Uses Web Crypto API (Edge Runtime compatible)
 */
const generateCode = (): string => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);

  // Destructure for type safety - validates all elements exist
  const [a, b, c, d] = array;
  if (
    a === undefined ||
    b === undefined ||
    c === undefined ||
    d === undefined
  ) {
    throw new Error(
      "Failed to generate cryptographically secure random values",
    );
  }

  // Construct a 32-bit integer from the random bytes
  const randomValue = (a << 24) | (b << 16) | (c << 8) | d;
  return (Math.abs(randomValue) % 10 ** VERIFICATION_CODE_LENGTH)
    .toString()
    .padStart(VERIFICATION_CODE_LENGTH, "0");
};

/**
 * Hash a verification code using SHA-256
 * Uses Web Crypto API (Edge Runtime compatible)
 */
const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Check rate limiting for verification code sends
 * Returns true if rate limit exceeded
 */
const checkRateLimit = async (invitationId: string): Promise<boolean> => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const recentCodes = await db
    .select()
    .from(emailVerificationCode)
    .where(
      and(
        eq(emailVerificationCode.invitationId, invitationId),
        gte(emailVerificationCode.createdAt, oneHourAgo),
      ),
    );

  return recentCodes.length >= MAX_SENDS_PER_HOUR;
};

/**
 * Create and send a verification code
 * Returns the masked email and whether code was sent
 * In development, logs the code to console instead of sending email
 */
export const createVerificationCode = async (
  invitationId: string,
  email: string,
): Promise<{
  codeSent: boolean;
  reason?: "cooldown" | "rate_limit";
  cooldownEndsAt?: Date;
  createdAt?: Date;
}> => {
  // Get recent codes to calculate progressive cooldown
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const recentCodes = await db
    .select()
    .from(emailVerificationCode)
    .where(
      and(
        eq(emailVerificationCode.invitationId, invitationId),
        gte(emailVerificationCode.createdAt, oneHourAgo),
      ),
    )
    .orderBy(desc(emailVerificationCode.createdAt));

  // Check rate limiting
  if (recentCodes.length >= MAX_SENDS_PER_HOUR) {
    return {
      codeSent: false,
      reason: "rate_limit",
    };
  }

  // Check cooldown with progressive backoff
  const [mostRecent] = recentCodes;
  if (mostRecent) {
    // Calculate cooldown based on number of recent sends
    const cooldownSeconds = calculateCooldown(recentCodes.length - 1);
    const secondsSinceLastSend =
      (Date.now() - mostRecent.createdAt.getTime()) / 1000;

    if (secondsSinceLastSend < cooldownSeconds) {
      const cooldownEndsAt = new Date(
        mostRecent.createdAt.getTime() + cooldownSeconds * 1000,
      );
      return {
        codeSent: false,
        reason: "cooldown",
        cooldownEndsAt,
      };
    }
  }

  // NOTE: We do NOT delete old unverified codes here because we need them
  // for progressive cooldown calculation. Old codes will naturally expire
  // and can be cleaned up by a background job if needed.

  // Generate and hash code
  const code = generateCode();
  const hashedCode = await hashCode(code);

  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);

  // Store in database with explicit timestamp
  const createdAt = new Date();
  await db.insert(emailVerificationCode).values({
    invitationId,
    email,
    code: hashedCode,
    expiresAt,
    attempts: 0,
    createdAt,
  });

  // TODO: Send email via email service
  // For now, log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log("=".repeat(60));
    console.log("📧 EMAIL VERIFICATION CODE");
    console.log("=".repeat(60));
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log("=".repeat(60));
  }

  return {
    codeSent: true,
    createdAt,
  };
};

/**
 * Validate a verification code
 * Returns validity status and reason for failure
 * Increments attempt counter on invalid code
 */
export const validateVerificationCode = async (
  invitationId: string,
  code: string,
): Promise<{
  valid: boolean;
  reason?: "expired" | "too_many_attempts" | "invalid";
}> => {
  const hashedCode = await hashCode(code);

  // Find the most recent unverified code for this invitation
  const [record] = await db
    .select()
    .from(emailVerificationCode)
    .where(
      and(
        eq(emailVerificationCode.invitationId, invitationId),
        isNull(emailVerificationCode.verifiedAt),
      ),
    )
    .orderBy(emailVerificationCode.createdAt)
    .limit(1);

  if (!record) {
    return {
      valid: false,
      reason: "invalid",
    };
  }

  // Check if expired
  if (new Date() > record.expiresAt) {
    await db
      .delete(emailVerificationCode)
      .where(eq(emailVerificationCode.id, record.id));
    return {
      valid: false,
      reason: "expired",
    };
  }

  // Check if too many attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    await db
      .delete(emailVerificationCode)
      .where(eq(emailVerificationCode.id, record.id));
    return {
      valid: false,
      reason: "too_many_attempts",
    };
  }

  // Validate code using constant-time comparison
  const isValid = constantTimeCompare(record.code, hashedCode);

  if (!isValid) {
    // Increment attempts
    await db
      .update(emailVerificationCode)
      .set({ attempts: record.attempts + 1 })
      .where(eq(emailVerificationCode.id, record.id));

    return {
      valid: false,
      reason: "invalid",
    };
  }

  // Mark as verified
  await db
    .update(emailVerificationCode)
    .set({ verifiedAt: new Date() })
    .where(eq(emailVerificationCode.id, record.id));

  // Delete all verification codes for this invitation to reset rate limit
  await db
    .delete(emailVerificationCode)
    .where(eq(emailVerificationCode.invitationId, invitationId));

  return { valid: true };
};

/**
 * Clean up expired verification codes (can be run as a cron job)
 */
export const cleanupExpiredCodes = async (): Promise<number> => {
  const now = new Date();
  const result = await db
    .delete(emailVerificationCode)
    .where(eq(emailVerificationCode.expiresAt, now));

  return result.length;
};
