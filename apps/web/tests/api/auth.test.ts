import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/auth/validate/route";
import {
  createTestInvitation,
  createTestGuest,
  createTestRsvp,
} from "../helpers/db";
import { NextRequest } from "next/server";

describe("POST /api/auth/validate", () => {
  it("should return 400 for missing code", async () => {
    const req = new NextRequest("http://test/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid code format");
  });

  it("should return 400 for non-existent code", async () => {
    const req = new NextRequest("http://test/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({ code: "FAKE-9999" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid code format");
  });

  it("should return invitation data for valid code", async () => {
    // Setup test data
    const testInvitation = await createTestInvitation({
      code: "ABCD-1234",
      primaryGuestName: "John Smith",
      maxGuests: 2,
    });

    await createTestGuest(testInvitation.id, {
      name: "John Smith",
      isPrimary: true,
    });

    // Make request
    const req = new NextRequest("http://test/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({ code: "ABCD-1234" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invitation).toMatchObject({
      code: "ABCD-1234",
      primaryGuestName: "John Smith",
      maxGuests: 2,
    });
    expect(data.guests).toHaveLength(1);
    expect(data.guests[0].name).toBe("John Smith");
    expect(data.guests[0].isPrimary).toBe(true);
    expect(data.rsvp).toBeNull();
  });

  it("should return RSVP data if already submitted", async () => {
    // Setup test data
    const testInvitation = await createTestInvitation({
      code: "EFGH-5678",
    });

    await createTestGuest(testInvitation.id, { isPrimary: true });

    await createTestRsvp(testInvitation.id, {
      email: "test@example.com",
      attending: true,
      guestCount: 2,
    });

    // Make request
    const req = new NextRequest("http://test/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({ code: "EFGH-5678" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.rsvp).toBeDefined();
    expect(data.rsvp.email).toBe("test@example.com");
    expect(data.rsvp.attending).toBe(true);
    expect(data.rsvp.guestCount).toBe(2);
  });

  it("should handle case-insensitive codes", async () => {
    const testInvitation = await createTestInvitation({
      code: "WXYZ-1111",
    });

    await createTestGuest(testInvitation.id, { isPrimary: true });

    // Test with lowercase
    const req = new NextRequest("http://test/api/auth/validate", {
      method: "POST",
      body: JSON.stringify({ code: "wxyz-1111" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invitation.code).toBe("WXYZ-1111");
  });
});
