import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useInvitationAuth = () => {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const storedCode = sessionStorage.getItem("invitationCode");
    if (!storedCode) {
      router.push("/");
      return;
    }
    setCode(storedCode);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("invitationCode");
    router.push("/");
  };

  return { code, handleLogout };
};
