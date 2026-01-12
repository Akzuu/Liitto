import { Card, CardContent } from "@heroui/react";
import { InvitationHeader } from "./invitation-header";
import { EventDetails } from "./event-details";
import { ScheduleSection } from "./schedule-section";
import { RsvpSection } from "./rsvp-section";
import { LogoutSection } from "./logout-section";

type InvitationContentProps = {
  code: string;
  onLogout: () => void;
};

export const InvitationContent = ({
  code,
  onLogout,
}: InvitationContentProps) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl">
          <InvitationHeader code={code} />
          <CardContent className="gap-6 pb-8">
            <EventDetails className="space-y-4" />
            <ScheduleSection className="space-y-4" />
            <RsvpSection className="space-y-4" />
            <LogoutSection onLogout={onLogout} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
