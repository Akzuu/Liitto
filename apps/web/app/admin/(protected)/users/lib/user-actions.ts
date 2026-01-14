"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { handleAsync } from "@/lib/error-handler";

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: Date;
};

export type UsersData = {
  users: User[];
  error: string | null;
};

export const loadUsers = async (): Promise<UsersData> => {
  const [err, response] = await handleAsync(async () => {
    const headersList = await headers();
    return auth.api.listUsers({
      query: {
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers: headersList,
    });
  });

  if (err) {
    return { users: [], error: err.message };
  }

  if (!response) {
    return { users: [], error: "No data returned" };
  }

  return { users: response.users || [], error: null };
};

export const approveUser = async (userId: string): Promise<string | null> => {
  const [err] = await handleAsync(async () => {
    const headersList = await headers();
    return auth.api.setRole({
      body: {
        userId,
        role: "admin",
      },
      headers: headersList,
    });
  });

  if (err) {
    return err.message;
  }

  revalidatePath("/admin/users");
  return null;
};

export const rejectUser = async (userId: string): Promise<string | null> => {
  const [err] = await handleAsync(async () => {
    const headersList = await headers();
    return auth.api.removeUser({
      body: {
        userId,
      },
      headers: headersList,
    });
  });

  if (err) {
    return err.message;
  }

  revalidatePath("/admin/users");
  return null;
};
