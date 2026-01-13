import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout for protected admin routes.
 * Any page nested under (protected) route group requires authentication.
 * Unauthenticated users are redirected to /admin login page.
 */
const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/admin");
  }

  return <>{children}</>;
};

export default ProtectedLayout;
