"use client";

import { Chip } from "@heroui/react";
import {
  AlertCircle,
  Bus,
  Calendar,
  Check,
  Mail,
  MessageSquare,
  Users,
  Utensils,
} from "lucide-react";
import type { guest, invitation, rsvp } from "@/db/schema";

type RsvpListProps = {
  invitations: Array<{
    invitation: typeof invitation.$inferSelect;
    rsvp: typeof rsvp.$inferSelect | null;
  }>;
  guests: Array<typeof guest.$inferSelect>;
};

export const RsvpList = ({ invitations, guests }: RsvpListProps) => {
  const getInvitationGuests = (invitationId: string) => {
    return guests.filter((g) => g.invitationId === invitationId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Sort invitations: responded first, then by submission date
  const sortedInvitations = [...invitations].sort((a, b) => {
    if (a.rsvp && !b.rsvp) return -1;
    if (!a.rsvp && b.rsvp) return 1;
    if (a.rsvp && b.rsvp) {
      return (
        new Date(b.rsvp.submittedAt).getTime() -
        new Date(a.rsvp.submittedAt).getTime()
      );
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Guest Responses</h2>
      {sortedInvitations.length === 0 ? (
        <p className="py-8 text-center text-foreground-muted">
          No invitations found
        </p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedInvitations.map((inv) => {
            const invitationGuests = getInvitationGuests(inv.invitation.id);
            const hasResponse = inv.rsvp !== null;
            const hasDietaryRestrictions = invitationGuests.some(
              (g) =>
                g.dietaryRestrictions && g.dietaryRestrictions.trim() !== "",
            );
            return (
              <div
                key={inv.invitation.id}
                className="py-4 first:pt-0 last:pb-0"
              >
                {/* Header */}
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {inv.invitation.primaryGuestName}
                  </h3>
                  {hasResponse ? (
                    <Chip
                      color={inv.rsvp?.attending ? "success" : "danger"}
                      variant="soft"
                    >
                      {inv.rsvp?.attending ? "Attending" : "Not Attending"}
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="soft">
                      No Response
                    </Chip>
                  )}
                  {inv.rsvp?.needsBusRide && (
                    <Chip color="accent" variant="soft">
                      <Bus className="h-3 w-3" />
                      Bus
                    </Chip>
                  )}
                  {hasDietaryRestrictions && (
                    <Chip color="warning" variant="soft">
                      <Utensils className="h-3 w-3" />
                      Dietary
                    </Chip>
                  )}
                </div>

                {/* RSVP Info */}
                {hasResponse && inv.rsvp && (
                  <div className="mb-3 grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-foreground-muted" />
                      <span>{inv.rsvp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-foreground-muted" />
                      <span>
                        {inv.rsvp.attending
                          ? `${inv.rsvp.guestCount} of ${inv.invitation.maxGuests} guests`
                          : `${inv.invitation.maxGuests} invited`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-foreground-muted" />
                      <span>{formatDate(inv.rsvp.submittedAt)}</span>
                    </div>
                  </div>
                )}

                {!hasResponse && (
                  <div className="mb-3 text-sm text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{inv.invitation.maxGuests} guests invited</span>
                    </div>
                  </div>
                )}

                {/* Message */}
                {hasResponse && inv.rsvp?.message && (
                  <div className="mb-3 rounded-lg bg-default-100 p-2.5">
                    <div className="mb-1 flex items-center gap-1 text-xs font-medium text-foreground-muted">
                      <MessageSquare className="h-3 w-3" />
                      Message:
                    </div>
                    <p className="text-sm">{inv.rsvp.message}</p>
                  </div>
                )}

                {/* Guest Details */}
                {invitationGuests.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground-muted">
                      Guests:
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {invitationGuests.map((guest) => (
                        <div
                          key={guest.id}
                          className="rounded-lg border border-default-200 bg-default-50 p-3"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium">{guest.name}</span>
                            {guest.isPrimary && (
                              <Chip size="sm" variant="secondary">
                                Primary
                              </Chip>
                            )}
                          </div>
                          {guest.dietaryRestrictions && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-foreground-muted">
                              <Utensils className="mt-0.5 h-3 w-3 shrink-0" />
                              <span>{guest.dietaryRestrictions}</span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground-muted">
                            {guest.photographyConsent ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                <span>Wants to be blurred in photos</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Photography consent given</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
