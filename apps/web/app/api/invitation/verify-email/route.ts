import { type NextRequest, NextResponse } from "next/server";
import { validateVerificationCode } from "@/lib/email-verification";
import {
  getSessionCookieName,
  getSessionCookieOptions,
  markEmailVerified,
  withInvitationSession,
} from "@/lib/invitation-session";

type VerifyRequest = {
  code: string;
};

export const POST = withInvitationSession(async (req, session) => {
  // Get code from request
  const body = (await req.json()) as VerifyRequest;

  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json(
      { error: "Vahvistuskoodi vaaditaan" },
      { status: 400 },
    );
  }

  // Validate verification code
  const verificationResult = await validateVerificationCode(
    session.invitationId,
    body.code,
  );

  if (!verificationResult.valid) {
    // Provide user-friendly error message
    const errorMessage =
      verificationResult.reason === "expired"
        ? "Koodi on vanhentunut. Pyydä uusi koodi."
        : verificationResult.reason === "too_many_attempts"
          ? "Liian monta yritystä. Pyydä uusi koodi."
          : "Virheellinen koodi. Tarkista ja yritä uudelleen.";

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // Mark session as email verified and rotate token
  const { token: newToken, expiresAt } = await markEmailVerified(session.id);

  // Create response and update cookie with new token
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(
    getSessionCookieName(),
    newToken,
    getSessionCookieOptions(expiresAt),
  );

  return response;
});
