"use client";

import {
  Alert,
  Button,
  Checkbox,
  DateField,
  DateInputGroup,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { Calendar, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ScheduleItem, weddingSettings } from "@/db/schema";
import { AdminLayout } from "../../components/admin-layout";

type SettingsContentProps = {
  initialSettings: typeof weddingSettings.$inferSelect;
};

export const SettingsContent = ({ initialSettings }: SettingsContentProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId] = useState(initialSettings.id);
  const [rsvpDeadline, setRsvpDeadline] = useState<DateValue | null>(
    initialSettings.rsvpDeadline
      ? parseDate(initialSettings.rsvpDeadline)
      : null,
  );
  const [weddingDate, setWeddingDate] = useState<DateValue | null>(
    initialSettings.weddingDate ? parseDate(initialSettings.weddingDate) : null,
  );
  const [ceremonyTime, setCeremonyTime] = useState(
    initialSettings.ceremonyTime || "",
  );
  const [venueName, setVenueName] = useState(initialSettings.venueName || "");
  const [venueAddress, setVenueAddress] = useState(
    initialSettings.venueAddress || "",
  );
  const [schedule, setSchedule] = useState<
    Array<ScheduleItem & { id: string }>
  >([]);
  const [brideName, setBrideName] = useState(initialSettings.brideName || "");
  const [groomName, setGroomName] = useState(initialSettings.groomName || "");
  const [busTransportEnabled, setBusTransportEnabled] = useState(
    initialSettings.busTransportEnabled || false,
  );
  const [busTransportDescription, setBusTransportDescription] = useState(
    initialSettings.busTransportDescription || "",
  );
  const [photographyConsentEnabled, setPhotographyConsentEnabled] = useState(
    initialSettings.photographyConsentEnabled || false,
  );

  // Generate IDs on client-side only to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSchedule(
      (initialSettings.schedule || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    );
  }, [initialSettings.schedule]);

  if (!isClient) {
    return null;
  }

  const addScheduleItem = () => {
    setSchedule((prev) => [
      ...prev,
      { time: "", event: "", id: crypto.randomUUID() },
    ]);
  };

  const removeScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const updateScheduleItem = (
    id: string,
    field: "time" | "event",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!settingsId) {
      setError(
        "Settings not loaded. Please refresh the page or seed the database.",
      );
      return;
    }

    if (!rsvpDeadline) {
      setError("RSVP deadline is required");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        id: settingsId,
        rsvpDeadline: rsvpDeadline.toString(),
        weddingDate: weddingDate?.toString(),
        ceremonyTime,
        venueName,
        venueAddress,
        schedule: schedule.map(({ id, ...item }) => item),
        brideName,
        groomName,
        busTransportEnabled,
        busTransportDescription,
        photographyConsentEnabled,
      };

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      router.refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Wedding Details</h3>

          <DateField
            name="weddingDate"
            value={weddingDate}
            onChange={setWeddingDate}
          >
            <Label>Wedding Date</Label>
            <DateInputGroup>
              <DateInputGroup.Prefix>
                <Calendar className="size-4 text-muted" />
              </DateInputGroup.Prefix>
              <DateInputGroup.Input>
                {(segment) => <DateInputGroup.Segment segment={segment} />}
              </DateInputGroup.Input>
            </DateInputGroup>
          </DateField>

          <TextField
            name="ceremonyTime"
            value={ceremonyTime}
            onChange={setCeremonyTime}
          >
            <Label>Ceremony Time</Label>
            <Input placeholder="e.g., 14:00" />
          </TextField>

          <TextField name="venueName" value={venueName} onChange={setVenueName}>
            <Label>Venue Name</Label>
            <Input placeholder="e.g., Häävilla Romanttinen" />
          </TextField>

          <TextField
            name="venueAddress"
            value={venueAddress}
            onChange={setVenueAddress}
          >
            <Label>Venue Address</Label>
            <Input placeholder="e.g., Rantatie 123, Helsinki" />
          </TextField>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <Button type="button" variant="secondary" onPress={addScheduleItem}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {ceremonyTime && (
              <div className="flex gap-2 items-start">
                <TextField
                  name="schedule-ceremony-time"
                  value={ceremonyTime}
                  isDisabled
                  className="w-32"
                >
                  <Label>Time</Label>
                  <Input />
                </TextField>

                <TextField
                  name="schedule-ceremony-event"
                  value="Vihkiminen"
                  isDisabled
                  className="flex-1"
                >
                  <Label>Event</Label>
                  <Input />
                </TextField>

                <div className="mt-6 w-10" />
              </div>
            )}

            {schedule.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <TextField
                  name={`schedule-time-${item.id}`}
                  value={item.time}
                  onChange={(value) =>
                    updateScheduleItem(item.id, "time", value)
                  }
                  className="w-32"
                >
                  <Label>Time</Label>
                  <Input placeholder="14:00" />
                </TextField>

                <TextField
                  name={`schedule-event-${item.id}`}
                  value={item.event}
                  onChange={(value) =>
                    updateScheduleItem(item.id, "event", value)
                  }
                  className="flex-1"
                >
                  <Label>Event</Label>
                  <Input placeholder="Vihkiminen" />
                </TextField>

                <Button
                  type="button"
                  variant="danger"
                  onPress={() => removeScheduleItem(item.id)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {schedule.length === 0 && (
              <p className="text-sm text-gray-500">
                No schedule items yet. Click "Add Item" to create one.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bus Transportation</h3>

          <div className="flex items-start gap-3">
            <Checkbox
              id="busTransportEnabled"
              isSelected={busTransportEnabled}
              onChange={setBusTransportEnabled}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox>
            <div className="flex flex-col gap-1">
              <Label htmlFor="busTransportEnabled">
                Enable bus transportation question
              </Label>
            </div>
          </div>

          {busTransportEnabled && (
            <TextField
              name="busTransportDescription"
              value={busTransportDescription}
              onChange={setBusTransportDescription}
            >
              <Label>Bus Transportation Description</Label>
              <TextArea placeholder="" rows={3} />
            </TextField>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Photography Consent</h3>

          <div className="flex items-start gap-3">
            <Checkbox
              id="photographyConsentEnabled"
              isSelected={photographyConsentEnabled}
              onChange={setPhotographyConsentEnabled}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox>
            <div className="flex flex-col gap-1">
              <Label htmlFor="photographyConsentEnabled">
                Ask photography consent question
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Couple Information</h3>

          <TextField name="brideName" value={brideName} onChange={setBrideName}>
            <Label>Bride Name</Label>
            <Input />
          </TextField>

          <TextField name="groomName" value={groomName} onChange={setGroomName}>
            <Label>Groom Name</Label>
            <Input />
          </TextField>
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
