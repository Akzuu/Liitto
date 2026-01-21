"use client";

import { useRouter } from "next/navigation";
import type { InvitationDetails } from "@/lib/invitation-data";
import { EmailVerification } from "./email-verification";
import { InvitationContent } from "./invitation-content";

type InvitationPageClientProps = {
  details: InvitationDetails;
};

export const InvitationPageClient = ({
  details,
}: InvitationPageClientProps) => {
  const router = useRouter();

  const sendVerificationCode = async () => {
    try {
      await fetch("/api/invitation/send-verification", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

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
      <EmailVerification
        onVerified={handleVerified}
        onResend={sendVerificationCode}
      />
    );
  }

  return (
    <InvitationContent code={details.invitation.code} onLogout={handleLogout} />
  );
};
