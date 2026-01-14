"use client";

import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { PendingView } from "./components/pending-view";

const PendingApprovalPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.push("/admin");
      return;
    }

    if (session.user.role === "admin") {
      router.push("/admin/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user || session.user.role === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <PendingView email={session.user.email} />;
};

export default PendingApprovalPage;
