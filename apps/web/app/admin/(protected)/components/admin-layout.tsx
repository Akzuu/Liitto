"use client";

import { Button, Dropdown } from "@heroui/react";
import { ChevronDown, House } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider-client";
import { signOut } from "@/lib/auth-client";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export const AdminLayout = ({
  children,
  title,
  description,
}: AdminLayoutProps) => {
  const router = useRouter();
  const { session } = useAuth();
  const user = session.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <House />
              </Link>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Dropdown>
                <Button variant="secondary" size="sm">
                  <span>{user.email}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    onAction={(key) => {
                      if (key === "passkeys") {
                        router.push("/admin/passkeys");
                      }
                    }}
                  >
                    <Dropdown.Item id="passkeys">Manage Passkeys</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
              <Button onPress={handleSignOut} variant="secondary" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {description && (
          <div className="mb-6">
            <p className="text-gray-600">{description}</p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
