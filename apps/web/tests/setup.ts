// Set test database URL BEFORE any imports
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://liitto:liitto_dev_password@localhost:5432/liitto_test";

import { afterAll, beforeEach } from "vitest";
import { db } from "@/db";
import { guest, invitation, rsvp } from "@/db/schema";

afterAll(async () => {
  console.log("Test suite completed");
});

// Clean up database before each test
beforeEach(async () => {
  // Clean wedding-related tables
  await db.delete(rsvp);
  await db.delete(guest);
  await db.delete(invitation);

  // Note: Better Auth tables will be cleaned when they're used in tests
  // For now, we only clean the wedding-related tables
});
