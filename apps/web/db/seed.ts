import { db } from "./index";
import { guest, invitation } from "./schema";

const seedData = async () => {
  console.log("🌱 Seeding database...");

  // Create test invitations
  const invitations = await db
    .insert(invitation)
    .values([
      {
        code: "ABCD-1234",
        primaryGuestName: "John Smith",
        maxGuests: 2,
        notes: "Family friends",
      },
      {
        code: "EFGH-5678",
        primaryGuestName: "Jane Doe",
        maxGuests: 4,
        notes: "Cousin with family",
      },
      {
        code: "TEST-0000",
        primaryGuestName: "Test User",
        maxGuests: 1,
        notes: "Testing account",
      },
    ])
    .returning();

  console.log(`✓ Created ${invitations.length} invitations`);

  // Create primary guests for each invitation
  const guests = await db
    .insert(guest)
    .values(
      invitations.map((inv) => ({
        invitationId: inv.id,
        name: inv.primaryGuestName,
        isPrimary: true,
        attending: null,
        photographyConsent: false,
      }))
    )
    .returning();

  console.log(`✓ Created ${guests.length} primary guests`);
  console.log("✅ Database seeded successfully!");
  process.exit(0);
};

seedData().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
