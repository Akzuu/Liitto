import { parseDate } from "@internationalized/date";

type EventDetailsProps = {
  weddingDate?: string | null;
  ceremonyTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  className?: string;
};

export const EventDetails = ({
  weddingDate,
  ceremonyTime,
  venueName,
  venueAddress,
  className,
}: EventDetailsProps) => {
  // Format wedding date for display (YYYY-MM-DD -> readable Finnish format)
  // Using @internationalized/date for consistent server/client rendering
  const formattedDate = weddingDate
    ? (() => {
        const calendarDate = parseDate(weddingDate);

        const weekdays = [
          "Sunnuntai",
          "Maanantai",
          "Tiistai",
          "Keskiviikko",
          "Torstai",
          "Perjantai",
          "Lauantai",
        ];

        // Convert to JS Date for getDay()
        const jsDate = calendarDate.toDate("UTC");
        const weekday = weekdays[jsDate.getUTCDay()];

        return `${weekday} ${calendarDate.day}.${calendarDate.month}.${calendarDate.year}`;
      })()
    : "Lauantai 15.6.2026";

  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold text-gray-900">Hääjuhlat</h2>
      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Päivämäärä:</strong> {formattedDate}
        </p>
        <p>
          <strong>Aika:</strong> Vihkiminen klo {ceremonyTime || "14:00"}
        </p>
        <p>
          <strong>Paikka:</strong> {venueName || "[Paikan nimi]"}
        </p>
        <p>
          <strong>Osoite:</strong> {venueAddress || "[Osoite]"}
        </p>
      </div>
    </section>
  );
};
