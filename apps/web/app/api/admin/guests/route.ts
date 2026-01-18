import { eq, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { verifySession } from "@/lib/dal";

// GET all guests (invitations without codes yet)
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

    const [newGuest] = await db
      .insert(invitation)
      .values({
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
