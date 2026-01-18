"use client";

import { Alert, Button, Card, Spinner } from "@heroui/react";
import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Guest = {
  id: string;
  primaryGuestName: string;
  maxGuests: number;
  notes: string | null;
  code: string | null;
  createdAt: Date;
};

type GuestsListProps = {
  onEdit: (guest: Guest) => void;
  onDelete: () => void;
};

export const GuestsList = ({ onEdit, onDelete }: GuestsListProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGuests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/guests");

      if (!response.ok) {
        throw new Error("Failed to fetch guests");
      }

      const data = await response.json();
      setGuests(data.guests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/guests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }

      onDelete();
      await fetchGuests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete guest");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (guests.length === 0) {
    return (
      <Card>
        <Card.Content>
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">No guests yet</p>
            <p className="mt-2 text-sm">
              Click "Add Guest" to create your first guest entry
            </p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {guests.map((guest) => (
        <Card key={guest.id}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">
                    {guest.primaryGuestName}
                  </h3>
                  {guest.code && (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Invitation Generated
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-6 text-sm text-gray-600">
                  <span>
                    Max Guests: <strong>{guest.maxGuests}</strong>
                  </span>
                  {guest.code && (
                    <span>
                      Code: <strong className="font-mono">{guest.code}</strong>
                    </span>
                  )}
                </div>
                {guest.notes && (
                  <p className="mt-2 text-sm text-gray-500">{guest.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onPress={() => onEdit(guest)}
                  variant="secondary"
                  size="sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onPress={() => handleDelete(guest.id)}
                  variant="danger"
                  size="sm"
                  isPending={deletingId === guest.id}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
};
