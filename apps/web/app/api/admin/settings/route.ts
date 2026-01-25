import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { weddingSettings } from "@/db/schema";
import { verifySession } from "@/lib/dal";

// GET wedding settings
export const GET = async () => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [settings] = await db
      .select()
      .from(weddingSettings)
      .orderBy(weddingSettings.createdAt)
      .limit(1);

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
};

// PUT update wedding settings
const scheduleItemSchema = z.object({
  time: z.string(),
  event: z.string(),
});

const updateSettingsSchema = z.object({
  id: z.string().uuid(),
  rsvpDeadline: z.string().min(1, "RSVP deadline is required"),
  weddingDate: z.string().optional(),
  ceremonyTime: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  schedule: z.array(scheduleItemSchema).optional(),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  busTransportEnabled: z.boolean().optional(),
  busTransportDescription: z.string().optional(),
});

export const PUT = async (req: NextRequest) => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 },
      );
    }

    // Get existing settings by ID
    const [existing] = await db
      .select()
      .from(weddingSettings)
      .where(eq(weddingSettings.id, result.data.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 },
      );
    }

    // Update existing settings - explicitly set each field
    const updateData = {
      rsvpDeadline: result.data.rsvpDeadline,
      weddingDate: result.data.weddingDate ?? existing.weddingDate,
      ceremonyTime: result.data.ceremonyTime ?? existing.ceremonyTime,
      venueName: result.data.venueName ?? existing.venueName,
      venueAddress: result.data.venueAddress ?? existing.venueAddress,
      schedule: result.data.schedule ?? existing.schedule,
      brideName: result.data.brideName ?? existing.brideName,
      groomName: result.data.groomName ?? existing.groomName,
      busTransportEnabled:
        result.data.busTransportEnabled ?? existing.busTransportEnabled,
      busTransportDescription:
        result.data.busTransportDescription ?? existing.busTransportDescription,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(weddingSettings)
      .set(updateData)
      .where(eq(weddingSettings.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update settings");
    }

    return NextResponse.json({ settings: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
};
