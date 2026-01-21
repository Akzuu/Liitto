import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as logoutPost } from "@/app/api/auth/logout-invitation/route";
import { POST as validatePost } from "@/app/api/auth/validate/route";
import { GET as detailsGet } from "@/app/api/invitation/details/route";
import { POST as sendVerificationPost } from "@/app/api/invitation/send-verification/route";
import { POST as verifyEmailPost } from "@/app/api/invitation/verify-email/route";
import { getSessionCookieName } from "@/lib/invitation-session";
import {
  createTestGuest,
  createTestInvitation,
  createTestInvitationSession,
  createTestRsvp,
  createTestVerificationCode,
} from "../helpers/db";

describe("Invitation Authentication", () => {
  let invitation: Awaited<ReturnType<typeof createTestInvitation>>;

  beforeEach(async () => {
    invitation = await createTestInvitation({
      code: "ABCD-1234",
    });
  });

  describe("POST /api/auth/validate", () => {
    it("should create session and return success for valid code", async () => {
      const req = new NextRequest("http://test/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ code: "ABCD-1234" }),
      });

      const response = await validatePost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        invitationId: invitation.id,
        requiresEmailVerification: false,
      });

      // Check that session cookie is set
      const cookie = response.cookies.get(getSessionCookieName());
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBeTruthy();
    });

    it("should return requiresEmailVerification=true when RSVP exists", async () => {
      await createTestRsvp(invitation.id);

      const req = new NextRequest("http://test/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ code: "ABCD-1234" }),
      });

      const response = await validatePost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.requiresEmailVerification).toBe(true);
    });

    it("should return 400 for invalid code", async () => {
      const req = new NextRequest("http://test/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ code: "INVALID-CODE" }),
      });

      const response = await validatePost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid code format");
    });

    it("should return 400 for missing code", async () => {
      const req = new NextRequest("http://test/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await validatePost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid code format");
    });

    it("should normalize code to uppercase", async () => {
      const req = new NextRequest("http://test/api/auth/validate", {
        method: "POST",
        body: JSON.stringify({ code: "abcd-1234" }),
      });

      const response = await validatePost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/invitation/send-verification", () => {
    it("should send verification code and return success", async () => {
      await createTestRsvp(invitation.id, {
        email: "vera@example.com",
      });
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest(
        "http://test/api/invitation/send-verification",
        {
          method: "POST",
          headers: {
            Cookie: `${getSessionCookieName()}=${token}`,
          },
        },
      );

      const response = await sendVerificationPost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 401 without session", async () => {
      const req = new NextRequest(
        "http://test/api/invitation/send-verification",
        {
          method: "POST",
        },
      );

      const response = await sendVerificationPost(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when no RSVP exists", async () => {
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest(
        "http://test/api/invitation/send-verification",
        {
          method: "POST",
          headers: {
            Cookie: `${getSessionCookieName()}=${token}`,
          },
        },
      );

      const response = await sendVerificationPost(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No RSVP found for this invitation");
    });
  });

  describe("POST /api/invitation/verify-email", () => {
    it("should verify valid code and update session", async () => {
      const rsvp = await createTestRsvp(invitation.id);
      const { token } = await createTestInvitationSession(invitation.id);
      const { code } = await createTestVerificationCode(
        invitation.id,
        rsvp.email,
      );

      const req = new NextRequest("http://test/api/invitation/verify-email", {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const response = await verifyEmailPost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 401 without session", async () => {
      const req = new NextRequest("http://test/api/invitation/verify-email", {
        method: "POST",
        body: JSON.stringify({ code: "123456" }),
      });

      const response = await verifyEmailPost(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid code", async () => {
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest("http://test/api/invitation/verify-email", {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
        body: JSON.stringify({ code: "999999" }),
      });

      const response = await verifyEmailPost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("verification code");
    });

    it("should return 400 for missing code", async () => {
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest("http://test/api/invitation/verify-email", {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
        body: JSON.stringify({}),
      });

      const response = await verifyEmailPost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Verification code is required");
    });
  });

  describe("GET /api/invitation/details", () => {
    it("should return full invitation details when email is verified", async () => {
      await createTestGuest(invitation.id, {
        name: "Test Guest",
        isPrimary: true,
      });
      const rsvp = await createTestRsvp(invitation.id);
      const { token, session } = await createTestInvitationSession(
        invitation.id,
      );

      // Mark email as verified
      const { markEmailVerified } = await import("@/lib/invitation-session");
      await markEmailVerified(session.id);

      const req = new NextRequest("http://test/api/invitation/details", {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
      });

      const response = await detailsGet(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invitation).toBeDefined();
      expect(data.invitation.id).toBe(invitation.id);
      expect(data.guests).toHaveLength(1);
      expect(data.rsvp).toBeDefined();
      expect(data.rsvp.email).toBe(rsvp.email);
      expect(data.requiresEmailVerification).toBe(false);
    });

    it("should return limited data when email verification is required", async () => {
      await createTestRsvp(invitation.id);
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest("http://test/api/invitation/details", {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
      });

      const response = await detailsGet(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invitation.id).toBe(invitation.id);
      expect(data.requiresEmailVerification).toBe(true);
      expect(data.guests).toBeNull();
      expect(data.rsvp).toBeNull();
      // Should not expose personal data
      expect(data.invitation.primaryGuestName).toBeUndefined();
    });

    it("should return full data for invitations without RSVP", async () => {
      await createTestGuest(invitation.id, {
        name: "Test Guest",
        isPrimary: true,
      });
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest("http://test/api/invitation/details", {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
      });

      const response = await detailsGet(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.guests).toHaveLength(1);
      expect(data.rsvp).toBeNull();
      expect(data.requiresEmailVerification).toBe(false);
    });

    it("should return 401 without session", async () => {
      const req = new NextRequest("http://test/api/invitation/details", {
        method: "GET",
      });

      const response = await detailsGet(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/auth/logout-invitation", () => {
    it("should delete session and clear cookie", async () => {
      const { token } = await createTestInvitationSession(invitation.id);

      const req = new NextRequest("http://test/api/auth/logout-invitation", {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${token}`,
        },
      });

      const response = await logoutPost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that cookie is cleared
      const cookie = response.cookies.get(getSessionCookieName());
      expect(cookie?.value).toBe("");
    });

    it("should succeed even without session", async () => {
      const req = new NextRequest("http://test/api/auth/logout-invitation", {
        method: "POST",
      });

      const response = await logoutPost(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
