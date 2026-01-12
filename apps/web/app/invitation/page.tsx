"use client";

import { Card, CardHeader, CardContent, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";

export default function InvitationPage() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const storedCode = sessionStorage.getItem("invitationCode");
    if (!storedCode) {
      router.push("/");
    } else {
      setCode(storedCode);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("invitationCode");
    router.push("/");
  };

  if (!code) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-col gap-4 items-center pb-6 pt-8">
            <h1 className="text-4xl font-bold text-center text-gray-900">
              Tervetuloa häihimme!
            </h1>
            <p className="text-sm text-gray-500">Kutsukoodisi: {code}</p>
          </CardHeader>
          <CardContent className="gap-6 pb-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Hääjuhlat
              </h2>
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

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Ohjelma</h2>
              <div className="space-y-2 text-gray-700">
                <p>14:00 - Vihkiminen</p>
                <p>15:00 - Kuvailu ja vastaanotto</p>
                <p>16:00 - Hääjuhla alkaa</p>
                <p>17:00 - Illallinen</p>
                <p>19:00 - Puheet ja kakun leikkaus</p>
                <p>20:00 - Ensimmäinen tanssi</p>
                <p>20:30 - ???</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Vahvista osallistumisesi
              </h2>
              <p className="text-gray-700">
                Ole hyvä ja vahvista osallistumisesi 1.5.2026 mennessä.
              </p>
              <Button variant="primary" size="lg" className="w-full">
                Vahvista osallistuminen (RSVP)
              </Button>
            </section>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="md"
                onClick={handleLogout}
                className="w-full"
              >
                Kirjaudu ulos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
