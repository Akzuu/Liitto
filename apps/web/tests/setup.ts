// Set test database URL BEFORE any imports
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://liitto:liitto_dev_password@localhost:5432/liitto_test";

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { db } from "@/db";
import { guest, invitation, rsvp } from "@/db/schema";

beforeAll(async () => {
  // Create test database if it doesn't exist (optional - can be done manually)
  console.log("Setting up test database...");
});

afterAll(async () => {
  console.log("Test suite completed");
});

// Clean up database before each test
beforeEach(async () => {
  await db.delete(rsvp);
  await db.delete(guest);
  await db.delete(invitation);
});

afterEach(async () => {
  // Additional cleanup if needed
});
