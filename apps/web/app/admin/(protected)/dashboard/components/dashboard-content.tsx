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
          title="Invitations"
          description="Manage wedding invitations and codes"
          href="/admin/invitations"
          count="Coming soon"
        />
        <DashboardCard
          title="RSVPs"
          description="View and manage guest responses"
          href="/admin/rsvps"
          count="Coming soon"
        />
        <DashboardCard
          title="Guests"
          description="Manage guest information"
          href="/admin/guests"
          count="Coming soon"
        />
      </div>
    </AdminLayout>
  );
};
