import type { ScheduleItem } from "@/db/schema";

type ScheduleSectionProps = {
  schedule?: ScheduleItem[] | null;
  ceremonyTime?: string | null;
  className?: string;
};

export const ScheduleSection = ({
  schedule,
  ceremonyTime,
  className,
}: ScheduleSectionProps) => {
  const ceremonyItem: ScheduleItem | null = ceremonyTime
    ? { time: ceremonyTime, event: "Vihkiminen" }
    : null;

  const allItems = [
    ...(ceremonyItem ? [ceremonyItem] : []),
    ...(schedule || []),
  ];

  if (allItems.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold text-gray-900">Ohjelma</h2>
      <div className="space-y-2 text-gray-700">
        {allItems.map((item, index) => (
          <p key={`${item.time}-${index}`}>
            {item.time} - {item.event}
          </p>
        ))}
      </div>
    </section>
  );
};
