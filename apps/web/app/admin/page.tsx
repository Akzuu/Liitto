"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { LoadingView } from "./components/loading-view";
import { LoginView } from "./components/login-view";

const AdminLoginPage = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  if (isPending) {
    return <LoadingView />;
  }

  if (session) {
    return <LoadingView />;
  }

  return <LoginView />;
};

export default AdminLoginPage;
