import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Next.js functions
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProtectedLayout from "@/app/admin/(protected)/layout";
import { auth } from "@/auth";

describe("Protected Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /admin when user is not authenticated", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers());
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    await ProtectedLayout({ children: <div>Protected content</div> });

    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("should render children when user is authenticated", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers());
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: {
        id: "test-session-id",
        userId: "test-user-id",
        expiresAt: new Date(Date.now() + 86400000),
        token: "test-token",
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
      user: {
        id: "test-user-id",
        email: "admin@test.com",
        name: "Test Admin",
        image: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const result = await ProtectedLayout({
      children: <div>Protected content</div>,
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
