import { Card, CardContent } from "@heroui/react";
import type { guest, rsvp, weddingSettings } from "@/db/schema";
import { EventDetails } from "./event-details";
import { InvitationHeader } from "./invitation-header";
import { LogoutSection } from "./logout-section";
import { RsvpSection } from "./rsvp-section";
import { ScheduleSection } from "./schedule-section";

type InvitationContentProps = {
  code: string;
  maxGuests: number;
  weddingSettings: typeof weddingSettings.$inferSelect | null;
  existingRsvp: typeof rsvp.$inferSelect | null;
  existingGuests: Array<typeof guest.$inferSelect> | null;
  onLogout: () => void;
};

export const InvitationContent = ({
  code,
  maxGuests,
  weddingSettings,
  existingRsvp,
  existingGuests,
  onLogout,
}: InvitationContentProps) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl">
          <InvitationHeader code={code} />
          <CardContent className="gap-6 pb-8">
            <EventDetails
              weddingDate={weddingSettings?.weddingDate}
              ceremonyTime={weddingSettings?.ceremonyTime}
              venueName={weddingSettings?.venueName}
              venueAddress={weddingSettings?.venueAddress}
              className="space-y-4"
            />
            <ScheduleSection
              schedule={weddingSettings?.schedule}
              ceremonyTime={weddingSettings?.ceremonyTime}
              className="space-y-4"
            />
            <RsvpSection
              className="space-y-4"
              maxGuests={maxGuests}
              weddingSettings={weddingSettings}
              existingRsvp={existingRsvp}
              existingGuests={existingGuests}
            />
            <LogoutSection onLogout={onLogout} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
