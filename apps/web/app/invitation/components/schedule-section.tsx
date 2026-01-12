type ScheduleSectionProps = {
  className?: string;
};

export const ScheduleSection = ({ className }: ScheduleSectionProps) => {
  const schedule = [
    { time: "14:00", event: "Vihkiminen" },
    { time: "15:00", event: "Kuvailu ja vastaanotto" },
    { time: "16:00", event: "Hääjuhla alkaa" },
    { time: "17:00", event: "Illallinen" },
    { time: "19:00", event: "Puheet ja kakun leikkaus" },
    { time: "20:00", event: "Ensimmäinen tanssi" },
    { time: "20:30", event: "???" },
  ];

  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold text-gray-900">Ohjelma</h2>
      <div className="space-y-2 text-gray-700">
        {schedule.map((item) => (
          <p key={item.time}>
            {item.time} - {item.event}
          </p>
        ))}
      </div>
    </section>
  );
};
