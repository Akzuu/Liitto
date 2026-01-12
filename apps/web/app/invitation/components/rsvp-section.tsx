import { Button } from "@heroui/react";

type RsvpSectionProps = {
  className?: string;
};

export const RsvpSection = ({ className }: RsvpSectionProps) => {
  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold text-gray-900">
        Vahvista osallistumisesi
      </h2>
      <p className="text-gray-700">
        Ole hyvä ja vahvista osallistumisesi 1.5.2026 mennessä.
      </p>
      <Button variant="primary" size="lg" className="w-full">
        Vahvista osallistuminen (RSVP)
      </Button>
    </section>
  );
};
