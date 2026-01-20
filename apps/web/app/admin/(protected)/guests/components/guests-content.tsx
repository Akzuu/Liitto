"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin-layout";
import { AddGuestButton } from "./add-guest-button";
import { GuestForm } from "./guest-form";
import { GuestsList } from "./guests-list";
import { ImportGuestsButton } from "./import-guests-button";
import { QRCodePrint } from "./qr-code-print";

type Guest = {
  id: string;
  primaryGuestName: string;
  maxGuests: number;
  notes: string | null;
  code: string;
  createdAt: Date;
};

export const GuestsContent = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpDeadline, setRsvpDeadline] = useState("15.3.2026");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setRsvpDeadline(data.settings.rsvpDeadline || "15.3.2026");
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGuest(undefined);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    handleCloseForm();
  };

  return (
    <AdminLayout
      title="Guests"
      description="Manage your wedding guest list. Add guests and their details before generating invitation codes."
    >
      <div className="mb-6 flex justify-end gap-3">
        {guests.length > 0 && (
          <QRCodePrint guests={guests} rsvpDeadline={rsvpDeadline} />
        )}
        <ImportGuestsButton onSuccess={handleSuccess} />
        <AddGuestButton onPress={() => setIsFormOpen(true)} />
      </div>

      <GuestsList
        key={refreshKey}
        onEdit={handleEdit}
        onDelete={handleSuccess}
        onGuestsLoaded={setGuests}
      />

      {isFormOpen && (
        <GuestForm
          guest={editingGuest}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </AdminLayout>
  );
};
