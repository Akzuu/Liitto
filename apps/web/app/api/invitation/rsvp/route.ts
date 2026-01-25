import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { guest, invitation, rsvp } from "@/db/schema";
import { getInvitationSession } from "@/lib/invitation-data";

const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  isPrimary: z.boolean(),
  dietaryRestrictions: z.string().nullable(),
  photographyConsent: z.boolean(),
});

const rsvpSubmissionSchema = z.object({
  email: z.string().email("Invalid email address"),
  attending: z.boolean(),
  guestCount: z.number().min(0),
  needsBusRide: z.boolean().optional(),
  message: z.string().optional(),
  guests: z.array(guestSchema),
});

export const POST = async (req: NextRequest) => {
  try {
    // Verify invitation session
    const session = await getInvitationSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - no valid invitation session" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const result = rsvpSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 },
      );
    }

    const data = result.data;

    // Verify invitation exists and get maxGuests
    const [invitationData] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.id, session.invitationId))
      .limit(1);

    if (!invitationData) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    // Validate guest count doesn't exceed maxGuests
    if (data.attending && data.guestCount > invitationData.maxGuests) {
      return NextResponse.json(
        {
          error: `Guest count (${data.guestCount}) exceeds maximum allowed (${invitationData.maxGuests})`,
        },
        { status: 400 },
      );
    }

    // Validate that if attending, we have guest details
    if (data.attending && data.guests.length !== data.guestCount) {
      return NextResponse.json(
        {
          error: `Number of guest details (${data.guests.length}) must match guest count (${data.guestCount})`,
        },
        { status: 400 },
      );
    }

    // Check if RSVP already exists
    const [existingRsvp] = await db
      .select()
      .from(rsvp)
      .where(eq(rsvp.invitationId, session.invitationId))
      .limit(1);

    // Create or update RSVP
    const rsvpData = {
      invitationId: session.invitationId,
      email: data.email,
      attending: data.attending,
      guestCount: data.attending ? data.guestCount : 0,
      needsBusRide: data.needsBusRide ?? false,
      message: data.message || null,
    };

    let rsvpId: string;

    if (existingRsvp) {
      // Update existing RSVP
      const [updated] = await db
        .update(rsvp)
        .set({
          ...rsvpData,
          updatedAt: new Date(),
        })
        .where(eq(rsvp.id, existingRsvp.id))
        .returning();

      if (!updated) {
        throw new Error("Failed to update RSVP");
      }

      rsvpId = updated.id;

      // Delete existing guests and recreate them
      await db
        .delete(guest)
        .where(eq(guest.invitationId, session.invitationId));
    } else {
      // Create new RSVP
      const [created] = await db.insert(rsvp).values(rsvpData).returning();

      if (!created) {
        throw new Error("Failed to create RSVP");
      }

      rsvpId = created.id;
    }

    // Create guest entries if attending
    if (data.attending && data.guests.length > 0) {
      const guestEntries = data.guests.map((g) => ({
        invitationId: session.invitationId,
        name: g.name,
        isPrimary: g.isPrimary,
        attending: true,
        dietaryRestrictions: g.dietaryRestrictions,
        photographyConsent: g.photographyConsent,
      }));

      await db.insert(guest).values(guestEntries);
    }

    return NextResponse.json({
      success: true,
      rsvpId,
      message: "RSVP submitted successfully",
    });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 },
    );
  }
};
