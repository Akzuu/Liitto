import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const invitation = pgTable("invitation", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 9 }).notNull().unique(),
  primaryGuestName: varchar("primary_guest_name", { length: 255 }).notNull(),
  maxGuests: integer("max_guests").notNull().default(2),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitationRelations = relations(invitation, ({ many, one }) => ({
  guests: many(guest),
  rsvp: one(rsvp),
  sessions: many(invitationSession),
  verificationCodes: many(emailVerificationCode),
}));

export const rsvp = pgTable("rsvp", {
  id: uuid("id").defaultRandom().primaryKey(),
  invitationId: uuid("invitation_id")
    .notNull()
    .unique()
    .references(() => invitation.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  attending: boolean("attending").notNull(),
  guestCount: integer("guest_count").notNull().default(0),
  message: text("message"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rsvpRelations = relations(rsvp, ({ one }) => ({
  invitation: one(invitation, {
    fields: [rsvp.invitationId],
    references: [invitation.id],
  }),
}));

export const guest = pgTable("guest", {
  id: uuid("id").defaultRandom().primaryKey(),
  invitationId: uuid("invitation_id")
    .notNull()
    .references(() => invitation.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  attending: boolean("attending"),
  dietaryRestrictions: text("dietary_restrictions"),
  photographyConsent: boolean("photography_consent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guestRelations = relations(guest, ({ one }) => ({
  invitation: one(invitation, {
    fields: [guest.invitationId],
    references: [invitation.id],
  }),
}));

// Invitation session table - for guest authentication
export const invitationSession = pgTable(
  "invitation_session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitation.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    lastAccessedAt: timestamp("last_accessed_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("invitation_session_token_idx").on(table.token),
    index("invitation_session_invitationId_idx").on(table.invitationId),
  ],
);

export const invitationSessionRelations = relations(
  invitationSession,
  ({ one }) => ({
    invitation: one(invitation, {
      fields: [invitationSession.invitationId],
      references: [invitation.id],
    }),
  }),
);

// Email verification code table - for RSVP editing
export const emailVerificationCode = pgTable(
  "email_verification_code",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitation.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).notNull(), // Hashed 6-digit code
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at").notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_verification_code_invitationId_idx").on(table.invitationId),
  ],
);

export const emailVerificationCodeRelations = relations(
  emailVerificationCode,
  ({ one }) => ({
    invitation: one(invitation, {
      fields: [emailVerificationCode.invitationId],
      references: [invitation.id],
    }),
  }),
);

// Type for schedule items
export type ScheduleItem = {
  time: string;
  event: string;
};

// Wedding settings table (single row)
export const weddingSettings = pgTable("wedding_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  rsvpDeadline: varchar("rsvp_deadline", { length: 20 }).notNull(),
  weddingDate: varchar("wedding_date", { length: 20 }),
  ceremonyTime: varchar("ceremony_time", { length: 50 }),
  venueName: varchar("venue_name", { length: 255 }),
  venueAddress: text("venue_address"),
  schedule: json("schedule").$type<ScheduleItem[]>(),
  brideName: varchar("bride_name", { length: 255 }),
  groomName: varchar("groom_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("pending"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));
