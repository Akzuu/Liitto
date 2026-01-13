import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invitation } from "@/db/schema";

type ValidateRequest = {
  code: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as ValidateRequest;

    // Validate input
    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 },
      );
    }

    // Normalize code (uppercase, ensure format)
    const normalizedCode = body.code.toUpperCase().trim();

    // Query invitation
    const invitationData = await db.query.invitation.findFirst({
      where: eq(invitation.code, normalizedCode),
      with: {
        rsvp: true,
      },
    });

    if (!invitationData) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 },
      );
    }

    // Return only non-personal metadata
    return NextResponse.json({
      invitation: {
        id: invitationData.id,
        code: invitationData.code,
        maxGuests: invitationData.maxGuests,
      },
      hasRsvp: !!invitationData.rsvp,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
