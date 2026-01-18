import { verifySession } from "@/lib/dal";
import { PasskeysContent } from "./components/passkeys-content";
import { loadPasskeys } from "./lib/passkey-actions";

const PasskeysPage = async () => {
  const session = await verifySession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const passkeys = await loadPasskeys();

  return <PasskeysContent email={session.user.email} passkeys={passkeys} />;
};

export default PasskeysPage;
