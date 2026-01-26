type AlertMessageProps = {
  children: React.ReactNode;
  variant: "error" | "success";
};

export const AlertMessage = ({ children, variant }: AlertMessageProps) => {
  const styles =
    variant === "error"
      ? "mb-4 rounded bg-red-50 p-3 text-sm text-red-600"
      : "mb-4 rounded bg-green-50 p-3 text-sm text-green-600";

  return <div className={styles}>{children}</div>;
};
