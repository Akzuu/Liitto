import { createHash } from "node:crypto";
import { faker } from "@faker-js/faker";
import { db } from "@/db";
import {
  account,
  emailVerificationCode,
  guest,
  invitation,
  invitationSession,
  passkey,
  rsvp,
  session,
  user,
  verification,
} from "@/db/schema";
import type { SessionData } from "@/lib/invitation-session";
import { createInvitationSession } from "@/lib/invitation-session";

export const createTestInvitation = async (
  overrides?: Partial<typeof invitation.$inferInsert>,
) => {
  const [inv] = await db
    .insert(invitation)
    .values({
      code: overrides?.code || `TEST-${faker.string.numeric(4)}`,
      primaryGuestName: overrides?.primaryGuestName || faker.person.fullName(),
      maxGuests: overrides?.maxGuests || 2,
      notes: overrides?.notes || null,
    })
    .returning();

  if (!inv) {
    throw new Error("Failed to create test invitation");
  }

  return inv;
};

export const createTestGuest = async (
  invitationId: string,
  overrides?: Partial<typeof guest.$inferInsert>,
) => {
  const [gst] = await db
    .insert(guest)
    .values({
      invitationId,
      name: overrides?.name || faker.person.fullName(),
      isPrimary: overrides?.isPrimary || false,
      attending: overrides?.attending || null,
      dietaryRestrictions: overrides?.dietaryRestrictions || null,
      photographyConsent: overrides?.photographyConsent || false,
    })
    .returning();

  if (!gst) {
    throw new Error("Failed to create test guest");
  }

  return gst;
};

export const createTestRsvp = async (
  invitationId: string,
  overrides?: Partial<typeof rsvp.$inferInsert>,
) => {
  const [rsvpData] = await db
    .insert(rsvp)
    .values({
      invitationId,
      email: overrides?.email || faker.internet.email(),
      attending: overrides?.attending ?? true,
      guestCount: overrides?.guestCount || 1,
      message: overrides?.message || null,
    })
    .returning();

  if (!rsvpData) {
    throw new Error("Failed to create test RSVP");
  }

  return rsvpData;
};

/**
 * Create a test invitation session
 * Returns both the session data and the unhashed token
 */
export const createTestInvitationSession = async (
  invitationId: string,
): Promise<{ token: string; session: SessionData }> => {
  return await createInvitationSession(invitationId);
};

/**
 * Create a test email verification code
 * Returns the unhashed code for testing
 */
export const createTestVerificationCode = async (
  invitationId: string,
  email: string,
): Promise<{ code: string; hashedCode: string }> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = createHash("sha256").update(code).digest("hex");

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  await db.insert(emailVerificationCode).values({
    invitationId,
    email,
    code: hashedCode,
    expiresAt,
    attempts: 0,
  });

  return { code, hashedCode };
};

export const cleanDatabase = async () => {
  // Clean invitation-related tables
  await db.delete(emailVerificationCode);
  await db.delete(invitationSession);
  await db.delete(rsvp);
  await db.delete(guest);
  await db.delete(invitation);

  // Clean Better Auth tables (in order to respect foreign keys)
  await db.delete(session);
  await db.delete(account);
  await db.delete(passkey);
  await db.delete(verification);
  await db.delete(user);
};
