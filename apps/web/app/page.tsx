import { Card, CardHeader } from "@heroui/react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInvitationSession } from "@/lib/invitation-data";
import { PinInput } from "../components/pin-input";

export default async function HomePage() {
  // If user already has a valid session, redirect to invitation page
  const session = await getInvitationSession();
  if (session) {
    redirect("/invitation");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-blue-50 relative">
      <Card className="w-full max-w-lg shadow-xl pt-4">
        <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Tervetuloa häihimme!
          </h1>
          <p className="text-sm text-center text-gray-700">
            Ole hyvä ja syötä kutsukoodisi (esim. ABCD-1234)
          </p>
        </CardHeader>
        <PinInput />
      </Card>
      <Link
        href="/admin"
        className="absolute bottom-4 right-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <LogIn />
      </Link>
    </main>
  );
}
