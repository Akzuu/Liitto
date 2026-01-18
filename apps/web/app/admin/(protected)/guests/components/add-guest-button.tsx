"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

type AddGuestButtonProps = {
  onPress: () => void;
};

export const AddGuestButton = ({ onPress }: AddGuestButtonProps) => {
  return (
    <Button onPress={onPress} variant="primary">
      <Plus className="h-4 w-4" />
      Add Guest
    </Button>
  );
};
