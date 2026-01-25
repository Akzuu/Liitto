import { redirect } from "next/navigation";
import { getInvitationDetails } from "@/lib/invitation-data";
import { getWeddingSettings } from "@/lib/wedding-settings";
import { InvitationPageClient } from "./components/invitation-page-client";

export default async function InvitationPage() {
  const details = await getInvitationDetails();

  // Redirect to home if no valid session
  if (!details) {
    redirect("/");
  }

  // Fetch wedding settings for event details and schedule
  const weddingSettings = await getWeddingSettings();

  return (
    <InvitationPageClient details={details} weddingSettings={weddingSettings} />
  );
}
