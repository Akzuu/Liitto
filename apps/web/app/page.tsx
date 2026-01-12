import { Card, CardHeader } from "@heroui/react";
import { PinInput } from "./components/pin-input";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-blue-50">
      <Card className="w-full max-w-lg shadow-xl pt-4">
        <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Tervetuloa häihimme!
          </h1>
          <p className="text-sm text-center text-gray-700">
            Ole hyvä ja syötä kutsukoodisi (esim. XX-12345)
          </p>
        </CardHeader>
        <PinInput />
      </Card>
    </main>
  );
}
