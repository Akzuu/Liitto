import { desc, eq, gte, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailVerificationCode, rsvp } from "@/db/schema";
import { createVerificationCode } from "@/lib/email-verification";
import { withInvitationSession } from "@/lib/invitation-session";

/**
 * Calculate progressive cooldown based on recent send count
 * Pattern: 60s, 90s, 120s, 180s, 240s, etc.
 */
const calculateCooldown = (recentSendCount: number): number => {
  if (recentSendCount === 0) return 60;
  if (recentSendCount === 1) return 90;
  if (recentSendCount === 2) return 120;
  if (recentSendCount === 3) return 180;
  return 180 + (recentSendCount - 3) * 60;
};

// GET endpoint to check cooldown status
export const GET = withInvitationSession(async (_, session) => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Get recent verification codes for this invitation
  const recentCodes = await db
    .select()
    .from(emailVerificationCode)
    .where(
      and(
        eq(emailVerificationCode.invitationId, session.invitationId),
        gte(emailVerificationCode.createdAt, oneHourAgo),
      ),
    )
    .orderBy(desc(emailVerificationCode.createdAt));

  if (recentCodes.length === 0) {
    return NextResponse.json({
      cooldownActive: false,
    });
  }

  const [mostRecent] = recentCodes;
  if (!mostRecent) {
    return NextResponse.json({
      cooldownActive: false,
    });
  }

  // Calculate cooldown based on number of recent sends
  const cooldownSeconds = calculateCooldown(recentCodes.length - 1);
  const secondsSinceLastSend =
    (Date.now() - mostRecent.createdAt.getTime()) / 1000;
  
  if (secondsSinceLastSend < cooldownSeconds) {
    const cooldownEndsAt = new Date(
      mostRecent.createdAt.getTime() + cooldownSeconds * 1000,
    );
    return NextResponse.json({
      cooldownActive: true,
      cooldownEndsAt: cooldownEndsAt.toISOString(),
    });
  }

  return NextResponse.json({
    cooldownActive: false,
  });
});

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
    // Handle cooldown
    if (
      verificationResult.reason === "cooldown" &&
      verificationResult.cooldownEndsAt
    ) {
      return NextResponse.json(
        {
          error: "Odota hetki ennen kuin pyydät uutta koodia",
          cooldownEndsAt: verificationResult.cooldownEndsAt.toISOString(),
        },
        { status: 429 },
      );
    }

    // Handle rate limit
    return NextResponse.json(
      { error: "Liian monta yritystä. Yritä myöhemmin uudelleen." },
      { status: 400 },
    );
  }

  // Calculate cooldown from actual creation time (same logic as GET endpoint)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  const recentCodes = await db
    .select()
    .from(emailVerificationCode)
    .where(
      and(
        eq(emailVerificationCode.invitationId, session.invitationId),
        gte(emailVerificationCode.createdAt, oneHourAgo),
      ),
    );

  // Use the same calculation as GET endpoint for consistency
  const nextCooldownSeconds = calculateCooldown(recentCodes.length - 1);
  const createdAt = verificationResult.createdAt ?? new Date();
  const cooldownEndsAt = new Date(createdAt.getTime() + nextCooldownSeconds * 1000);
  
  return NextResponse.json({
    success: true,
    cooldownEndsAt: cooldownEndsAt.toISOString(),
  });
});
