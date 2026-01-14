import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    passkey(),
    admin({
      defaultRole: "pending",
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userToCreate) => {
          // Check if this is the first user
          const [result] = await db.select({ count: count() }).from(user);
          if (!result) {
            throw new Error("Failed to query user count");
          }
          const userCount = result.count;

          // If this is the first user, assign admin role
          if (userCount === 0) {
            return {
              data: {
                ...userToCreate,
                role: "admin",
              },
            };
          }

          // Otherwise, keep the default "pending" role
          return {
            data: userToCreate,
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
