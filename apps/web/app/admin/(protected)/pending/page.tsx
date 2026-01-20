import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { loadPasskeys } from "../passkeys/lib/passkey-actions";
import { PendingView } from "./components/pending-view";

const PendingApprovalPage = async () => {
  const session = await verifySession();

  if (!session) {
    throw new Error("Session not found");
  }

  // Redirect admin users to dashboard
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Load user's passkeys to check if setup button should be shown
  const passkeys = await loadPasskeys();
  const hasPasskeys = passkeys.length > 0;

  return <PendingView email={session.user.email} hasPasskeys={hasPasskeys} />;
};

export default PendingApprovalPage;
