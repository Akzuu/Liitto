import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardContent } from "./components/dashboard-content";

const AdminDashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/admin");
  }

  return <DashboardContent user={session.user} />;
};

export default AdminDashboard;
