"use client";

import { Alert, Button, DateField, DateInputGroup, Label } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { Calendar, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin-layout";

export const SettingsContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [rsvpDeadline, setRsvpDeadline] = useState<DateValue | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/settings");

        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await response.json();
        setRsvpDeadline(
          data.settings.rsvpDeadline
            ? parseDate(data.settings.rsvpDeadline)
            : null,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!rsvpDeadline) {
      setError("RSVP deadline is required");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpDeadline: rsvpDeadline.toString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title="Wedding Settings"
        description="Configure wedding details and RSVP deadline"
      >
        <div className="py-12 text-center">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Wedding Settings"
      description="Configure wedding details and RSVP deadline"
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        {success && (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Success</Alert.Title>
              <Alert.Description>
                Settings saved successfully!
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">RSVP Information</h3>

          <DateField
            isRequired
            name="rsvpDeadline"
            value={rsvpDeadline}
            onChange={setRsvpDeadline}
          >
            <Label>RSVP Deadline</Label>
            <DateInputGroup>
              <DateInputGroup.Prefix>
                <Calendar className="size-4 text-muted" />
              </DateInputGroup.Prefix>
              <DateInputGroup.Input>
                {(segment) => <DateInputGroup.Segment segment={segment} />}
              </DateInputGroup.Input>
            </DateInputGroup>
          </DateField>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isPending={isSaving}>
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};
