"use client";

import { useRouter } from "next/navigation";
import type { weddingSettings } from "@/db/schema";
import type { InvitationDetails } from "@/lib/invitation-data";
import { EmailVerification } from "./email-verification";
import { InvitationContent } from "./invitation-content";

type InvitationPageClientProps = {
  details: InvitationDetails;
  weddingSettings: typeof weddingSettings.$inferSelect | null;
};

export const InvitationPageClient = ({
  details,
  weddingSettings,
}: InvitationPageClientProps) => {
  const router = useRouter();

  const handleVerified = () => {
    // Refresh the page to get updated data from server
    router.refresh();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout-invitation", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      // Always redirect to home, even if logout fails
      router.push("/");
    }
  };

  if (details.requiresEmailVerification) {
    return (
      <EmailVerification onVerified={handleVerified} onLogout={handleLogout} />
    );
  }

  return (
    <InvitationContent
      code={details.invitation.code}
      maxGuests={details.invitation.maxGuests}
      weddingSettings={weddingSettings}
      existingRsvp={details.rsvp}
      existingGuests={details.guests}
      onLogout={handleLogout}
    />
  );
};
