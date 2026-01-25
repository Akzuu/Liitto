import { redirect } from "next/navigation";
import { db } from "@/db";
import { weddingSettings } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { SettingsContent } from "./components/settings-content";

export default async function SettingsPage() {
  const session = await verifySession();

  if (!session?.user) {
    redirect("/admin?error=unauthorized");
  }

  const [settings] = await db
    .select()
    .from(weddingSettings)
    .orderBy(weddingSettings.createdAt)
    .limit(1);

  if (!settings) {
    return (
      <div className="py-12 text-center">
        <p className="text-foreground-muted">
          No settings found. Please create settings record in the database.
        </p>
      </div>
    );
  }

  return <SettingsContent initialSettings={settings} />;
}
