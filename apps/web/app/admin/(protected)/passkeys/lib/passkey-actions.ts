"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { passkey } from "@/db/schema";
import { verifySession } from "@/lib/dal";

type PasskeyResponse = {
  success: boolean;
  message?: string;
};

export type PasskeyListItem = {
  id: string;
  name: string | null;
  createdAt: Date | null;
};

export const loadPasskeys = async (): Promise<PasskeyListItem[]> => {
  const session = await verifySession();

  const passkeys = await db
    .select({
      id: passkey.id,
      name: passkey.name,
      createdAt: passkey.createdAt,
    })
    .from(passkey)
    .where(eq(passkey.userId, session?.user.id ?? ""));

  return passkeys;
};

export const deletePasskey = async (id: string): Promise<PasskeyResponse> => {
  try {
    await auth.api.deletePasskey({
      body: { id },
      headers: await headers(),
    });

    revalidatePath("/admin/passkeys");

    return {
      success: true,
      message: "Passkey removed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete passkey",
    };
  }
};
