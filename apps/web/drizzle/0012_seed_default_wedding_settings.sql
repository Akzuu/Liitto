-- Ensure a single settings row always exists; the app never creates one itself,
-- it only reads/updates the first row. Skips the insert if a row is already present.
INSERT INTO "wedding_settings" ("rsvp_deadline")
SELECT '2026-09-01'
WHERE NOT EXISTS (SELECT 1 FROM "wedding_settings");
