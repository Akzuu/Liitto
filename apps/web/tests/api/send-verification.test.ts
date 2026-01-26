import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GET as getCooldownStatus,
  POST as sendVerificationPost,
} from "@/app/api/invitation/send-verification/route";
import { db } from "@/db";
import { emailVerificationCode } from "@/db/schema";
import { getSessionCookieName } from "@/lib/invitation-session";
import {
  createTestInvitation,
  createTestInvitationSession,
  createTestRsvp,
} from "../helpers/db";

// Mock console.error to suppress expected error logs in tests
vi.spyOn(console, "error").mockImplementation(() => {});
// Mock console.log to suppress verification code logs
vi.spyOn(console, "log").mockImplementation(() => {});

describe("POST /api/invitation/send-verification", () => {
  let invitation: Awaited<ReturnType<typeof createTestInvitation>>;
  let rsvpData: Awaited<ReturnType<typeof createTestRsvp>>;
  let session: Awaited<ReturnType<typeof createTestInvitationSession>>;

  beforeEach(async () => {
    invitation = await createTestInvitation({
      code: "SEND-1234",
    });
    rsvpData = await createTestRsvp(invitation.id, {
      email: "test@example.com",
    });
    session = await createTestInvitationSession(invitation.id);
  });

  it("should send verification code successfully", async () => {
    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.cooldownEndsAt).toBeDefined();
    expect(new Date(data.cooldownEndsAt).getTime()).toBeGreaterThan(Date.now());

    // Verify code was created in database
    const codes = await db
      .select()
      .from(emailVerificationCode)
      .where(eq(emailVerificationCode.invitationId, invitation.id));
    expect(codes).toHaveLength(1);
  });

  it("should return 429 when cooldown is active", async () => {
    // First send - should succeed
    const req1 = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response1 = await sendVerificationPost(req1);
    expect(response1.status).toBe(200);

    // Second send immediately - should hit cooldown
    const req2 = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response2 = await sendVerificationPost(req2);
    const data2 = await response2.json();

    expect(response2.status).toBe(429);
    expect(data2.error).toBe("Odota hetki ennen kuin pyydät uutta koodia");
    expect(data2.cooldownEndsAt).toBeDefined();
    expect(new Date(data2.cooldownEndsAt).getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  it("should allow resend after cooldown period expires", async () => {
    // Create an old verification code (65 seconds ago)
    const oldDate = new Date(Date.now() - 65 * 1000);
    await db.insert(emailVerificationCode).values({
      invitationId: invitation.id,
      email: rsvpData.email,
      code: "old-hashed-code",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      createdAt: oldDate,
    });

    // Should succeed since cooldown expired
    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.cooldownEndsAt).toBeDefined();
  });

  it("should return 400 when rate limit is exceeded", async () => {
    // Create 10 verification codes within the last hour (rate limit)
    const oneHourAgo = new Date(Date.now() - 59 * 60 * 1000); // 59 minutes ago
    const promises = [];

    for (let i = 0; i < 10; i++) {
      const createdAt = new Date(oneHourAgo.getTime() + i * 60 * 1000);
      promises.push(
        db.insert(emailVerificationCode).values({
          invitationId: invitation.id,
          email: rsvpData.email,
          code: `hashed-code-${i}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          attempts: 0,
          createdAt,
        }),
      );
    }

    await Promise.all(promises);

    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Liian monta yritystä. Yritä myöhemmin uudelleen.");
  });

  it("should return 404 when no RSVP exists", async () => {
    // Create invitation without RSVP
    const invitationNoRsvp = await createTestInvitation({
      code: "NORSVP-12",
    });
    const sessionNoRsvp = await createTestInvitationSession(
      invitationNoRsvp.id,
    );

    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${sessionNoRsvp.token}`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("No RSVP found for this invitation");
  });

  it("should return 401 when no session cookie", async () => {
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

  it("should return 401 when session token is invalid", async () => {
    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=invalid-token`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid session");
  });

  it("should keep old codes for cooldown calculation", async () => {
    // Create multiple old unverified codes (past cooldown period)
    await db.insert(emailVerificationCode).values([
      {
        invitationId: invitation.id,
        email: rsvpData.email,
        code: "old-code-1",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(Date.now() - 120 * 1000), // 2 minutes ago
      },
      {
        invitationId: invitation.id,
        email: rsvpData.email,
        code: "old-code-2",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(Date.now() - 180 * 1000), // 3 minutes ago
      },
    ]);

    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await sendVerificationPost(req);
    expect(response.status).toBe(200);

    // Should have all codes (2 old + 1 new) for progressive cooldown calculation
    const codes = await db
      .select()
      .from(emailVerificationCode)
      .where(eq(emailVerificationCode.invitationId, invitation.id));
    expect(codes).toHaveLength(3);
  });

  it("should have progressive cooldown on consecutive sends", async () => {
    // Manually create a first code 65s ago (already expired)
    await db.insert(emailVerificationCode).values({
      invitationId: invitation.id,
      email: rsvpData.email,
      code: "old-hashed-code",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      createdAt: new Date(Date.now() - 65 * 1000), // 65 seconds ago
    });

    // First send (actually second code overall) - should get 90s cooldown
    const req1 = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "POST",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );
    const response1 = await sendVerificationPost(req1);
    const data1 = await response1.json();
    expect(response1.status).toBe(200);
    const cooldown1 = new Date(data1.cooldownEndsAt).getTime() - Date.now();
    expect(cooldown1).toBeGreaterThanOrEqual(88 * 1000); // ~90s with some tolerance
    expect(cooldown1).toBeLessThanOrEqual(92 * 1000);
  });
});

describe("GET /api/invitation/send-verification", () => {
  let invitation: Awaited<ReturnType<typeof createTestInvitation>>;
  let session: Awaited<ReturnType<typeof createTestInvitationSession>>;

  beforeEach(async () => {
    invitation = await createTestInvitation({
      code: "CHECK-123",
    });
    session = await createTestInvitationSession(invitation.id);
  });

  it("should return cooldownActive: false when no codes exist", async () => {
    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await getCooldownStatus(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cooldownActive).toBe(false);
  });

  it("should return cooldownActive: true when recent code exists", async () => {
    // Create a code sent 30 seconds ago (within 60 second cooldown)
    const recentDate = new Date(Date.now() - 30 * 1000);
    await db.insert(emailVerificationCode).values({
      invitationId: invitation.id,
      email: "test@example.com",
      code: "hashed-code",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      createdAt: recentDate,
    });

    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await getCooldownStatus(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cooldownActive).toBe(true);
    expect(data.cooldownEndsAt).toBeDefined();
    expect(new Date(data.cooldownEndsAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("should return cooldownActive: false when cooldown has expired", async () => {
    // Create a code sent 65 seconds ago (past 60 second cooldown)
    const oldDate = new Date(Date.now() - 65 * 1000);
    await db.insert(emailVerificationCode).values({
      invitationId: invitation.id,
      email: "test@example.com",
      code: "hashed-code",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      createdAt: oldDate,
    });

    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "GET",
        headers: {
          Cookie: `${getSessionCookieName()}=${session.token}`,
        },
      },
    );

    const response = await getCooldownStatus(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cooldownActive).toBe(false);
  });

  it("should return 401 when no session cookie", async () => {
    const req = new NextRequest(
      "http://test/api/invitation/send-verification",
      {
        method: "GET",
      },
    );

    const response = await getCooldownStatus(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});
