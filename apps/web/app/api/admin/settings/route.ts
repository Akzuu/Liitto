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

    // Get or create settings (should only be one row)
    let [settings] = await db.select().from(weddingSettings).limit(1);

    if (!settings) {
      // Create default settings if none exist
      [settings] = await db
        .insert(weddingSettings)
        .values({
          rsvpDeadline: "15.3.2026",
          weddingDate: "",
          brideName: "",
          groomName: "",
          venue: "",
          ceremonyTime: "",
          receptionTime: "",
        })
        .returning();
    }

    if (!settings) {
      throw new Error("Failed to create default settings");
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
};

// PUT update wedding settings
const updateSettingsSchema = z.object({
  rsvpDeadline: z.string().min(1, "RSVP deadline is required"),
  weddingDate: z.string().optional(),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  venue: z.string().optional(),
  ceremonyTime: z.string().optional(),
  receptionTime: z.string().optional(),
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
        { status: 400 }
      );
    }

    // Get existing settings
    const [existing] = await db.select().from(weddingSettings).limit(1);

    let updated: typeof weddingSettings.$inferSelect | undefined;
    if (existing) {
      // Update existing settings
      [updated] = await db
        .update(weddingSettings)
        .set({
          ...result.data,
          updatedAt: new Date(),
        })
        .where(eq(weddingSettings.id, existing.id))
        .returning();
    } else {
      // Create new settings
      [updated] = await db
        .insert(weddingSettings)
        .values(result.data)
        .returning();
    }

    if (!updated) {
      throw new Error("Failed to update settings");
    }

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
};
