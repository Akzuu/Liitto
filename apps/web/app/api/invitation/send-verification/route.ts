import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rsvp } from "@/db/schema";
import { createVerificationCode } from "@/lib/email-verification";
import { withInvitationSession } from "@/lib/invitation-session";

export const POST = withInvitationSession(async (_, session) => {
  // Get RSVP email for this invitation
  const rsvpData = await db.query.rsvp.findFirst({
    where: eq(rsvp.invitationId, session.invitationId),
  });

  if (!rsvpData) {
    return NextResponse.json(
      { error: "No RSVP found for this invitation" },
      { status: 404 },
    );
  }

  // Create and send verification code
  const verificationResult = await createVerificationCode(
    session.invitationId,
    rsvpData.email,
  );

  if (!verificationResult.codeSent) {
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
  });
});
