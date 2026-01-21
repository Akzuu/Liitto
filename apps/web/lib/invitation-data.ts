import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { type guest, invitation, type rsvp } from "@/db/schema";
import {
  getSessionCookieName,
  type SessionData,
  validateSessionToken,
} from "./invitation-session";

export type InvitationDetails = {
  invitation: Omit<typeof invitation.$inferSelect, "notes">;
  guests: Array<typeof guest.$inferSelect> | null;
  rsvp: typeof rsvp.$inferSelect | null;
  requiresEmailVerification: boolean;
  canSubmitRsvp?: boolean;
};

/**
 * Get invitation session from server component
 * Returns session if valid, null otherwise
 */
export const getInvitationSession = async (): Promise<SessionData | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  return await validateSessionToken(token);
};

/**
 * Fetch invitation details for server components
 * Handles session validation and data access gating
 */
export const getInvitationDetails =
  async (): Promise<InvitationDetails | null> => {
    const session = await getInvitationSession();

    if (!session) {
      return null;
    }

    // Fetch invitation with all related data
    const invitationData = await db.query.invitation.findFirst({
      where: eq(invitation.id, session.invitationId),
      with: {
        guests: true,
        rsvp: true,
      },
    });

    if (!invitationData) {
      return null;
    }

    // Gate personal information: hide guest details if email not verified or no RSVP exists
    const hasRsvp = !!invitationData.rsvp;
    const shouldHideGuestDetails = !hasRsvp || !session.emailVerified;

    // Destructure to omit notes field (prefix with _ to indicate intentionally unused)
    const { notes: _notes, ...invitationWithoutNotes } = invitationData;

    if (shouldHideGuestDetails) {
      return {
        invitation: invitationWithoutNotes,
        requiresEmailVerification: hasRsvp && !session.emailVerified,
        canSubmitRsvp: !hasRsvp,
        guests: null,
        rsvp: null,
      };
    }

    // Return full invitation data (only after email verification)
    return {
      invitation: invitationWithoutNotes,
      guests: invitationData.guests,
      rsvp: invitationData.rsvp,
      requiresEmailVerification: false,
    };
  };
