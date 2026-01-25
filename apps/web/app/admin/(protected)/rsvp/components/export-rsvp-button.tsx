"use client";

import { Button } from "@heroui/react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { guest, invitation, rsvp } from "@/db/schema";

type ExportRsvpButtonProps = {
  invitations: Array<{
    invitation: typeof invitation.$inferSelect;
    rsvp: typeof rsvp.$inferSelect | null;
  }>;
  guests: Array<typeof guest.$inferSelect>;
};

export const ExportRsvpButton = ({
  invitations,
  guests,
}: ExportRsvpButtonProps) => {
  const handleExport = () => {
    // Prepare data for export
    const exportData = invitations.flatMap((inv) => {
      const invitationGuests = guests.filter(
        (g) => g.invitationId === inv.invitation.id,
      );

      // If no RSVP, return single row with invitation info
      if (!inv.rsvp) {
        return [
          {
            "Primary Guest": inv.invitation.primaryGuestName,
            "Max Guests": inv.invitation.maxGuests,
            Status: "No Response",
            Email: "",
            "Guest Count": "",
            "Bus Ride": "",
            "Guest Name": "",
            Attending: "",
            "Dietary Restrictions": "",
            "Photography Consent": "",
            Message: "",
            "Submitted At": "",
          },
        ];
      }

      // At this point, we know inv.rsvp is not null
      const rsvpData = inv.rsvp;

      // If RSVP exists but no guests, return RSVP info only
      if (invitationGuests.length === 0) {
        return [
          {
            "Primary Guest": inv.invitation.primaryGuestName,
            "Max Guests": inv.invitation.maxGuests,
            Status: rsvpData.attending ? "Attending" : "Not Attending",
            Email: rsvpData.email,
            "Guest Count": rsvpData.guestCount,
            "Bus Ride": rsvpData.needsBusRide ? "Yes" : "No",
            "Guest Name": "",
            Attending: "",
            "Dietary Restrictions": "",
            "Photography Consent": "",
            Message: rsvpData.message || "",
            "Submitted At": new Date(rsvpData.submittedAt).toLocaleString(
              "en-GB",
            ),
          },
        ];
      }

      // Return one row per guest with RSVP info
      return invitationGuests.map((g, index) => ({
        "Primary Guest": inv.invitation.primaryGuestName,
        "Max Guests": inv.invitation.maxGuests,
        Status: rsvpData.attending ? "Attending" : "Not Attending",
        Email: index === 0 ? rsvpData.email : "",
        "Guest Count": index === 0 ? rsvpData.guestCount : "",
        "Bus Ride": index === 0 ? (rsvpData.needsBusRide ? "Yes" : "No") : "",
        "Guest Name": g.name,
        Attending: g.attending === null ? "" : g.attending ? "Yes" : "No",
        "Dietary Restrictions": g.dietaryRestrictions || "",
        "Photography Consent": g.photographyConsent
          ? "Yes"
          : "Wants to be blurred",
        Message: index === 0 ? rsvpData.message || "" : "",
        "Submitted At":
          index === 0
            ? new Date(rsvpData.submittedAt).toLocaleString("en-GB")
            : "",
      }));
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RSVPs");

    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Primary Guest
      { wch: 12 }, // Max Guests
      { wch: 15 }, // Status
      { wch: 25 }, // Email
      { wch: 12 }, // Guest Count
      { wch: 10 }, // Bus Ride
      { wch: 20 }, // Guest Name
      { wch: 10 }, // Attending
      { wch: 30 }, // Dietary Restrictions
      { wch: 20 }, // Photography Consent
      { wch: 40 }, // Message
      { wch: 20 }, // Submitted At
    ];

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `rsvp-export-${date}.xlsx`);
  };

  return (
    <Button onPress={handleExport} variant="secondary">
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
};
