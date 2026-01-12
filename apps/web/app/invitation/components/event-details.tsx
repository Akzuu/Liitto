type EventDetailsProps = {
  className?: string;
};

export const EventDetails = ({ className }: EventDetailsProps) => {
  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold text-gray-900">Hääjuhlat</h2>
      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Päivämäärä:</strong> Lauantai, 15. kesäkuuta 2026
        </p>
        <p>
          <strong>Aika:</strong> Vihkiminen klo 14:00
        </p>
        <p>
          <strong>Paikka:</strong> [Paikan nimi]
        </p>
        <p>
          <strong>Osoite:</strong> [Osoite]
        </p>
      </div>
    </section>
  );
};
