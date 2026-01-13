"use client";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  count?: string;
};

export const DashboardCard = ({
  title,
  description,
  href,
  count,
}: DashboardCardProps) => {
  return (
    <a
      href={href}
      className="block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {count && (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            {count}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
};
