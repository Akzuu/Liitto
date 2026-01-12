import { CardHeader } from "@heroui/react";

type InvitationHeaderProps = {
  code: string;
};

export const InvitationHeader = ({ code }: InvitationHeaderProps) => {
  return (
    <CardHeader className="flex flex-col gap-4 items-center pb-6 pt-8">
      <h1 className="text-4xl font-bold text-center text-gray-900">
        Tervetuloa häihimme!
      </h1>
      <p className="text-sm text-gray-500">Kutsukoodisi: {code}</p>
    </CardHeader>
  );
};
