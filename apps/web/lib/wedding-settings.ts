import { db } from "@/db";
import { weddingSettings } from "@/db/schema";

/**
 * Fetches wedding settings from the database.
 * Returns null if no settings exist.
 */
export const getWeddingSettings = async () => {
  const [settings] = await db.select().from(weddingSettings).limit(1);

  return settings || null;
};
