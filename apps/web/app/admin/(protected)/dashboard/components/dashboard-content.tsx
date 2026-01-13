"use client";

import { Button } from "@heroui/react";
import { signOut } from "@/lib/auth-client";
import { DashboardCard } from "./dashboard-card";

type DashboardContentProps = {
  user: {
    email: string;
    name?: string;
  };
};

export const DashboardContent = ({ user }: DashboardContentProps) => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onPress={handleSignOut} variant="secondary" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Welcome, {user.name || user.email}
          </h2>
          <p className="text-gray-600">Manage your wedding platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  );
};
