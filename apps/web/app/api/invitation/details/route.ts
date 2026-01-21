import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { withInvitationSession } from "@/lib/invitation-session";

export const GET = withInvitationSession(async (_, session) => {
  // Fetch invitation with all related data
  const invitationData = await db.query.invitation.findFirst({
    where: eq(invitation.id, session.invitationId),
    with: {
      guests: true,
      rsvp: true,
    },
  });

  if (!invitationData) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 },
    );
  }

  // Gate personal information: hide guest details if email not verified or no RSVP exists
  // This prevents attackers from getting guest names/details with just the invitation code
  const hasRsvp = !!invitationData.rsvp;
  const shouldHideGuestDetails = !hasRsvp || !session.emailVerified;

  if (shouldHideGuestDetails) {
    return NextResponse.json({
      invitation: {
        id: invitationData.id,
        code: invitationData.code,
        maxGuests: invitationData.maxGuests,
      },
      requiresEmailVerification: hasRsvp && !session.emailVerified,
      canSubmitRsvp: !hasRsvp,
      guests: null,
      rsvp: null,
    });
  }

  // Return full invitation data (only after email verification)
  return NextResponse.json({
    invitation: {
      id: invitationData.id,
      code: invitationData.code,
      primaryGuestName: invitationData.primaryGuestName,
      maxGuests: invitationData.maxGuests,
    },
    guests: invitationData.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      isPrimary: guest.isPrimary,
      attending: guest.attending,
      dietaryRestrictions: guest.dietaryRestrictions,
      photographyConsent: guest.photographyConsent,
    })),
    rsvp: invitationData.rsvp
      ? {
          id: invitationData.rsvp.id,
          email: invitationData.rsvp.email,
          attending: invitationData.rsvp.attending,
          guestCount: invitationData.rsvp.guestCount,
          message: invitationData.rsvp.message,
          submittedAt: invitationData.rsvp.submittedAt,
        }
      : null,
    requiresEmailVerification: false,
  });
});
