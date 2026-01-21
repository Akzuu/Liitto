import { type NextRequest, NextResponse } from "next/server";
import {
  deleteSession,
  getSessionCookieName,
  validateSessionFromRequest,
} from "@/lib/invitation-session";

export const POST = async (req: NextRequest) => {
  try {
    // Validate session (optional for logout, will throw if invalid)
    try {
      const session = await validateSessionFromRequest(req);
      await deleteSession(session.id);
    } catch {
      // Ignore session validation errors - logout should always succeed
    }

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete(getSessionCookieName());

    return response;
  } catch (error) {
    console.log("Error during logout:", error);
    // Even if error, clear the cookie
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
    response.cookies.delete(getSessionCookieName());
    return response;
  }
};
