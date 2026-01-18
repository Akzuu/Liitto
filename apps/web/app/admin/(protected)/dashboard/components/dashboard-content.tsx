"use client";

import { useAuth } from "@/components/auth-provider-client";
import { AdminLayout } from "../../components/admin-layout";
import { DashboardCard } from "./dashboard-card";

export const DashboardContent = () => {
  const { session } = useAuth();
  const user = session.user;

  return (
    <AdminLayout
      title="Admin Dashboard"
      description={`Welcome, ${user.name || user.email}`}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Users"
          description="Manage admin users and approvals"
          href="/admin/users"
        />
        <DashboardCard
          title="RSVPs"
          description="View and manage guest responses"
          href="/admin/rsvps"
          count="Coming soon"
        />
        <DashboardCard
          title="Guests"
          description="Manage guest list before generating invitations"
          href="/admin/guests"
        />
      </div>
    </AdminLayout>
  );
};
