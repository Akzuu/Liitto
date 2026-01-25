"use client";

import {
  Button,
  Checkbox,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type { guest, rsvp, weddingSettings } from "@/db/schema";

type GuestInfo = {
  id: string;
  name: string;
  dietaryRestrictions: string;
  photographyConsent: boolean;
};

type RsvpSectionProps = {
  className?: string;
  maxGuests: number;
  weddingSettings: typeof weddingSettings.$inferSelect | null;
  existingRsvp: typeof rsvp.$inferSelect | null;
  existingGuests: Array<typeof guest.$inferSelect> | null;
};

export const RsvpSection = ({
  className,
  maxGuests,
  weddingSettings,
  existingRsvp,
  existingGuests,
}: RsvpSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attending, setAttending] = useState<string>(
    existingRsvp ? (existingRsvp.attending ? "yes" : "no") : "",
  );
  const [guestCount, setGuestCount] = useState<string>(
    existingRsvp ? String(existingRsvp.guestCount) : "1",
  );
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [needsBusRide, setNeedsBusRide] = useState<string>(
    existingRsvp?.needsBusRide
      ? "yes"
      : existingRsvp?.needsBusRide === false
        ? "no"
        : "",
  );
  const [email, setEmail] = useState(existingRsvp?.email || "");
  const [message, setMessage] = useState(existingRsvp?.message || "");
  const [isClient, setIsClient] = useState(false);

  // Initialize guests array from existing data or when guest count changes
  useEffect(() => {
    setIsClient(true);
    const count = Number(guestCount);
    if (count > 0 && attending === "yes") {
      setGuests((prev) => {
        const newGuests: GuestInfo[] = [];
        for (let i = 0; i < count; i++) {
          // Try to use existing guest data first, then previous state, then new guest
          const existingGuest = existingGuests?.[i];
          newGuests.push(
            prev[i] || existingGuest
              ? {
                  id: existingGuest?.id || crypto.randomUUID(),
                  name: existingGuest?.name || "",
                  dietaryRestrictions: existingGuest?.dietaryRestrictions || "",
                  photographyConsent:
                    existingGuest?.photographyConsent || false,
                }
              : {
                  id: crypto.randomUUID(),
                  name: "",
                  dietaryRestrictions: "",
                  photographyConsent: false,
                },
          );
        }
        return newGuests;
      });
    }
  }, [guestCount, attending, existingGuests]);

  const updateGuest = (
    index: number,
    field: keyof GuestInfo,
    value: string | boolean,
  ) => {
    setGuests((prev) => {
      const updated = [...prev];
      const existingGuest = updated[index];
      if (!existingGuest) {
        return prev;
      }
      updated[index] = { ...existingGuest, [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert FormData to object
      const data = {
        email: formData.get("email")?.toString() || "",
        attending: formData.get("attending") === "yes",
        guestCount: Number(formData.get("guestCount") || 0),
        needsBusRide: formData.get("needsBusRide") === "yes",
        message: formData.get("message")?.toString() || "",
        guests: guests.map((guest, index) => ({
          name: guest.name,
          isPrimary: index === 0,
          dietaryRestrictions: guest.dietaryRestrictions || null,
          photographyConsent: guest.photographyConsent,
        })),
      };

      const response = await fetch("/api/invitation/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit RSVP");
      }

      // TODO: Show success message and refresh invitation details
      alert("RSVP submitted successfully!");
    } catch (error) {
      console.error("RSVP submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit RSVP");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="mb-2 text-2xl font-semibold text-gray-900">
        Vahvista osallistumisesi
      </h2>
      <p className="mb-6 text-gray-700">
        Ole hyvä ja vahvista osallistumisesi 1.5.2026 mennessä.
      </p>

      <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Email field */}
        <TextField
          isRequired
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          validate={(value) => {
            if (!value) {
              return "Sähköpostiosoite vaaditaan";
            }
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
              return "Anna kelvollinen sähköpostiosoite";
            }
            return null;
          }}
        >
          <Label>Sähköpostiosoite</Label>
          <Input placeholder="esimerkki@email.com" />
          <Description>
            Lähetämme vahvistuksen tähän sähköpostiosoitteeseen. Sähköposti on
            myös jatkossa vaatimus RSVP:n muokkaamiseen.
          </Description>
          <FieldError />
        </TextField>

        {/* Attending radio group */}
        <RadioGroup
          isRequired
          name="attending"
          value={attending}
          onChange={setAttending}
        >
          <Label>Osallistutko häihin?</Label>
          <Radio value="yes">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Kyllä, osallistun</Label>
              <Description>Odotan innolla juhlaanne!</Description>
            </Radio.Content>
          </Radio>
          <Radio value="no">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Valitettavasti en pääse</Label>
              <Description>Pahoittelut, en voi osallistua</Description>
            </Radio.Content>
          </Radio>
          <FieldError />
        </RadioGroup>

        {/* Guest count - only shown if attending */}
        {attending === "yes" && (
          <TextField
            isRequired
            name="guestCount"
            type="number"
            value={guestCount}
            onChange={setGuestCount}
            validate={(value) => {
              const num = Number(value);
              if (num < 1) {
                return "Vieraiden määrän on oltava vähintään 1";
              }
              if (num > maxGuests) {
                return `Voit tuoda enintään ${maxGuests} vierasta`;
              }
              return null;
            }}
          >
            <Label>Montako osallistuu?</Label>
            <Input min="1" max={maxGuests} placeholder="1" />
            <Description>
              Voit tuoda enintään {maxGuests} vierasta (itsesi mukaan lukien)
            </Description>
            <FieldError />
          </TextField>
        )}

        {/* Guest details - shown when attending and guest count is set */}
        {attending === "yes" &&
          guests.length > 0 &&
          guests.map((guest, index) => (
            <div
              key={guest.id}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Vieras {index + 1}
              </h3>

              {/* Guest name */}
              <TextField
                isRequired
                name={`guest-${index}-name`}
                value={guest.name}
                onChange={(value) => updateGuest(index, "name", value)}
                validate={(value) => {
                  if (!value || value.trim().length === 0) {
                    return "Nimi vaaditaan";
                  }
                  return null;
                }}
              >
                <Label>Nimi</Label>
                <Input placeholder="Etunimi Sukunimi" />
                <FieldError />
              </TextField>

              {/* Dietary restrictions */}
              <TextField
                name={`guest-${index}-dietary`}
                value={guest.dietaryRestrictions}
                onChange={(value) =>
                  updateGuest(index, "dietaryRestrictions", value)
                }
              >
                <Label>Ruokarajoitteet</Label>
                <TextArea rows={2} />
                <Description>
                  Kerro ruoka-aineallergioista tai erityisruokavalioista
                </Description>
              </TextField>

              {/* Photography consent */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`guest-${index}-photo`}
                  isSelected={guest.photographyConsent}
                  onChange={(selected) =>
                    updateGuest(index, "photographyConsent", selected)
                  }
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`guest-${index}-photo`}>
                    Haluan piilottaa kasvoni valokuvista
                  </Label>
                  <Description>
                    Haluamme kunnioittaa yksityisyyttäsi, joten voimme piilottaa
                    kasvosi jaettavista kuvista.
                  </Description>
                </div>
              </div>
            </div>
          ))}

        {/* Bus transportation - only shown if attending and enabled in settings */}
        {attending === "yes" &&
          weddingSettings?.busTransportEnabled &&
          weddingSettings?.busTransportDescription && (
            <RadioGroup
              name="needsBusRide"
              value={needsBusRide}
              onChange={setNeedsBusRide}
            >
              <Label>Bussikuljetus</Label>
              <Description>
                {weddingSettings.busTransportDescription}
              </Description>
              <Radio value="yes">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label>Kyllä, haluaisin bussikuljetuksen</Label>
                </Radio.Content>
              </Radio>
              <Radio value="no">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label>Ei kiitos, järjestän kuljetuksen itse</Label>
                </Radio.Content>
              </Radio>
            </RadioGroup>
          )}

        {/* Optional message */}
        <TextField name="message" value={message} onChange={setMessage}>
          <Label>Viesti morsiuspaarille</Label>
          <TextArea
            placeholder="Jätä tervehdys tai erityistoiveet..."
            rows={4}
          />
          <Description>
            Lähetä onnentoivotuksia tai erityistoiveita morsiusparille
          </Description>
        </TextField>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isPending={isSubmitting}
        >
          {({ isPending }) => (
            <>
              {isPending && <Spinner color="current" size="sm" />}
              {isPending ? "Lähetetään..." : "Lähetä vastaus"}
            </>
          )}
        </Button>
      </Form>
    </section>
  );
};
