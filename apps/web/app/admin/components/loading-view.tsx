import { Spinner } from "@heroui/react";

export const LoadingView = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
};
