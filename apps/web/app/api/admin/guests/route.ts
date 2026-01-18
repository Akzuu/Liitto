import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { generateInvitationCode } from "@/lib/invitation-code";

// GET all guests
export const GET = async () => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all invitations
    const guests = await db
      .select({
        id: invitation.id,
        primaryGuestName: invitation.primaryGuestName,
        maxGuests: invitation.maxGuests,
        notes: invitation.notes,
        code: invitation.code,
        createdAt: invitation.createdAt,
      })
      .from(invitation)
      .orderBy(invitation.createdAt);

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
};

// POST create new guest
const createGuestSchema = z.object({
  primaryGuestName: z.string().min(1, "Name is required"),
  maxGuests: z.number().int().min(1).max(20),
  notes: z.string().optional(),
});

export const POST = async (req: NextRequest) => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createGuestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    // Generate unique invitation code
    let code: string | undefined;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = generateInvitationCode();
      const existing = await db
        .select()
        .from(invitation)
        .where(eq(invitation.code, code))
        .limit(1);

      if (existing.length === 0) {
        break;
      }
      attempts++;
    }

    if (!code) {
      throw new Error("Failed to generate unique invitation code");
    }

    const [newGuest] = await db
      .insert(invitation)
      .values({
        code,
        primaryGuestName: result.data.primaryGuestName,
        maxGuests: result.data.maxGuests,
        notes: result.data.notes || null,
      })
      .returning();

    if (!newGuest) {
      throw new Error("Failed to create guest");
    }

    return NextResponse.json({ guest: newGuest }, { status: 201 });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
};
