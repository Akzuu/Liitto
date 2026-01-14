"use client";

import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { PendingView } from "./components/pending-view";

const PendingApprovalPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/admin");
    return null;
  }

  if (session.user.role === "admin") {
    router.push("/admin/dashboard");
    return null;
  }

  return <PendingView email={session.user.email} />;
};

export default PendingApprovalPage;
