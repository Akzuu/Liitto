import { AuthProvider } from "@/components/auth-provider";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout for protected admin routes.
 * Any page nested under (protected) route group requires authentication.
 */
const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default ProtectedLayout;
