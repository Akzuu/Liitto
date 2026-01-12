"use client";

import { Spinner } from "@heroui/react";
import { InvitationContent } from "./components/invitation-content";
import { useInvitationAuth } from "./hooks/use-invitation-auth";

export default function InvitationPage() {
  const { code, handleLogout } = useInvitationAuth();

  if (!code) {
    return <Spinner />;
  }

  return <InvitationContent code={code} onLogout={handleLogout} />;
}
