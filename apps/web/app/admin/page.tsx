"use client";

import { useSession } from "@/lib/auth-client";
import { AuthenticatedView } from "./components/authenticated-view";
import { LoadingView } from "./components/loading-view";
import { LoginView } from "./components/login-view";

const AdminLoginPage = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingView />;
  }

  if (session?.user) {
    return <AuthenticatedView user={session.user} />;
  }

  return <LoginView />;
};

export default AdminLoginPage;
