"use client";

import {
  Button,
  Description,
  Input,
  Label,
  Modal,
  NumberField,
  TextArea,
  TextField,
} from "@heroui/react";
import { useState } from "react";

type Guest = {
  id: string;
  primaryGuestName: string;
  maxGuests: number;
  notes: string | null;
  code: string;
};

type GuestFormProps = {
  guest?: Guest;
  onClose: () => void;
  onSuccess: () => void;
};

export const GuestForm = ({ guest, onClose, onSuccess }: GuestFormProps) => {
  const [name, setName] = useState(guest?.primaryGuestName || "");
  const [maxGuests, setMaxGuests] = useState(guest?.maxGuests || 2);
  const [notes, setNotes] = useState(guest?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Guest name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = guest ? `/api/admin/guests/${guest.id}` : "/api/admin/guests";

      const method = guest ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGuestName: name.trim(),
          maxGuests,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save guest");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>
                {guest ? "Edit Guest" : "Add New Guest"}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="space-y-4">
                <TextField
                  isRequired
                  name="primaryGuestName"
                  value={name}
                  onChange={setName}
                >
                  <Label>Guest Name</Label>
                  <Input placeholder="John Doe" />
                </TextField>

                <NumberField
                  minValue={1}
                  maxValue={20}
                  name="maxGuests"
                  value={maxGuests}
                  onChange={setMaxGuests}
                >
                  <Label>Maximum Guests</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <Description>
                    Total number of people this guest may bring (including
                    themselves)
                  </Description>
                </NumberField>

                <div className="flex flex-col gap-2">
                  <Label>Internal Notes</Label>
                  <TextArea
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Private notes for organizers (family side, special requirements, etc.)"
                    rows={4}
                  />
                  <Description>
                    Private notes for organizers (family side, special
                    requirements, etc.)
                  </Description>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button type="button" onPress={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isPending={isSubmitting}>
                {guest ? "Save Changes" : "Add Guest"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
