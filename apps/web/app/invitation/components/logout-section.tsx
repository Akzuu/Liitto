import { Button } from "@heroui/react";

type LogoutSectionProps = {
  onLogout: () => void;
};

export const LogoutSection = ({ onLogout }: LogoutSectionProps) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <Button variant="ghost" size="md" onClick={onLogout} className="w-full">
        Kirjaudu ulos
      </Button>
    </div>
  );
};
