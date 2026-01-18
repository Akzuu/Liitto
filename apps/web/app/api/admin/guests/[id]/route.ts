import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { verifySession } from "@/lib/dal";

// PUT update guest
const updateGuestSchema = z.object({
  primaryGuestName: z.string().min(1, "Name is required").optional(),
  maxGuests: z.number().int().min(1).max(20).optional(),
  notes: z.string().optional(),
});

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const result = updateGuestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const [updatedGuest] = await db
      .update(invitation)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(invitation.id, id))
      .returning();

    if (!updatedGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest: updatedGuest });
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
};

// DELETE guest
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedGuest] = await db
      .delete(invitation)
      .where(eq(invitation.id, id))
      .returning();

    if (!deletedGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
};
