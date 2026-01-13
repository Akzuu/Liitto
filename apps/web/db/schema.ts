import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
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
