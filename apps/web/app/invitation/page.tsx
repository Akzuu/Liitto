import { redirect } from "next/navigation";
import { getInvitationDetails } from "@/lib/invitation-data";
import { InvitationPageClient } from "./components/invitation-page-client";

export default async function InvitationPage() {
  const details = await getInvitationDetails();

  // Redirect to home if no valid session
  if (!details) {
    redirect("/");
  }

  return <InvitationPageClient details={details} />;
}
