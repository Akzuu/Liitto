"use client";

import { Card } from "@heroui/react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "danger" | "primary";
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) => {
  const variantClasses = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-danger",
    primary: "text-primary",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${variantClasses[variant]}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>
        </div>
        <div
          className={`rounded-lg bg-default-100 p-3 ${variantClasses[variant]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
