"use client";

import { Card } from "@heroui/react";
import { Bus, CheckCircle2, Users, XCircle } from "lucide-react";
import type { guest, invitation, rsvp } from "@/db/schema";
import { AdminLayout } from "../../components/admin-layout";
import { ExportRsvpButton } from "./export-rsvp-button";
import { RsvpList } from "./rsvp-list";
import { StatCard } from "./stat-card";

type RsvpContentProps = {
  invitations: Array<{
    invitation: typeof invitation.$inferSelect;
    rsvp: typeof rsvp.$inferSelect | null;
  }>;
  guests: Array<typeof guest.$inferSelect>;
};

export const RsvpContent = ({ invitations, guests }: RsvpContentProps) => {
  // Calculate statistics
  const totalInvitations = invitations.length;
  const respondedCount = invitations.filter((inv) => inv.rsvp !== null).length;
  const responseRate =
    totalInvitations > 0
      ? Math.round((respondedCount / totalInvitations) * 100)
      : 0;

  const attendingCount = invitations.filter(
    (inv) => inv.rsvp?.attending === true,
  ).length;
  const notAttendingCount = invitations.filter(
    (inv) => inv.rsvp?.attending === false,
  ).length;

  const busRideCount = invitations.filter(
    (inv) => inv.rsvp?.needsBusRide === true,
  ).length;

  const totalGuestsCount = invitations.reduce((sum, inv) => {
    if (inv.rsvp?.attending) {
      return sum + (inv.rsvp.guestCount || 0);
    }
    return sum;
  }, 0);

  return (
    <AdminLayout
      title="RSVPs"
      description="View and manage guest responses to wedding invitations"
    >
      {/* Statistics Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Response Rate"
          value={`${responseRate}%`}
          subtitle={`${respondedCount} of ${totalInvitations} responded`}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Attending"
          value={attendingCount.toString()}
          subtitle={`${totalGuestsCount} guests total`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Not Attending"
          value={notAttendingCount.toString()}
          subtitle="Declined invitations"
          icon={<XCircle className="h-5 w-5" />}
          variant="danger"
        />
        <StatCard
          title="Bus Ride"
          value={busRideCount.toString()}
          subtitle="Requesting transportation"
          icon={<Bus className="h-5 w-5" />}
          variant="primary"
        />
      </div>

      {/* Export Button */}
      <div className="mb-6 flex justify-end">
        <ExportRsvpButton invitations={invitations} guests={guests} />
      </div>

      {/* RSVPs List */}
      <Card className="p-6">
        <RsvpList invitations={invitations} guests={guests} />
      </Card>
    </AdminLayout>
  );
};
