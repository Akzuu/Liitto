import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { generateInvitationCode } from "@/lib/invitation-code";
import { db } from "./index";
import { guest, invitation, rsvp } from "./schema";

const TOTAL_INVITATIONS = 60;
const TARGET_TOTAL_GUESTS = 110;

// Helper to distribute guests across invitations naturally
const generateGuestDistribution = (
  totalInvitations: number,
  targetTotal: number,
): number[] => {
  const distribution: number[] = [];
  let remaining = targetTotal;

  // Create a mix of invitation sizes: mostly 1-2 guests, some 3-4, rare 5-6
  const weights = [
    { size: 1, weight: 35 }, // 35% solo guests
    { size: 2, weight: 45 }, // 45% couples
    { size: 3, weight: 12 }, // 12% small families
    { size: 4, weight: 6 }, // 6% families
    { size: 5, weight: 1.5 }, // 1.5% large families
    { size: 6, weight: 0.5 }, // 0.5% very large families
  ];

  for (let i = 0; i < totalInvitations; i++) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    let guestCount = 2; // default

    for (const { size, weight } of weights) {
      cumulative += weight;
      if (rand < cumulative) {
        guestCount = size;
        break;
      }
    }

    distribution.push(guestCount);
    remaining -= guestCount;
  }

  // Adjust distribution to hit target exactly
  while (remaining !== 0) {
    const idx = Math.floor(Math.random() * distribution.length);
    const current = distribution[idx];
    if (!current) continue;

    if (remaining > 0 && current < 6) {
      distribution[idx] = current + 1;
      remaining--;
    } else if (remaining < 0 && current > 1) {
      distribution[idx] = current - 1;
      remaining++;
    }
  }

  return distribution;
};

// Generate realistic dietary restrictions
const generateDietaryRestrictions = (): string | null => {
  const rand = Math.random();
  if (rand < 0.7) return null; // 70% no restrictions

  const restrictions = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Lactose intolerant",
    "Nut allergy",
    "Shellfish allergy",
    "Pescatarian",
    "Halal",
    "Kosher",
    "No pork",
    "Low sodium",
  ];

  return faker.helpers.arrayElement(restrictions);
};

const seed = async () => {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(guest);
  await db.delete(rsvp);
  await db.delete(invitation);

  // Generate guest distribution
  const guestDistribution = generateGuestDistribution(
    TOTAL_INVITATIONS,
    TARGET_TOTAL_GUESTS,
  );
  console.log(`📊 Distribution: ${guestDistribution.join(", ")}`);
  console.log(
    `📊 Total guests: ${guestDistribution.reduce((sum, count) => sum + count, 0)}`,
  );

  const allInvitations: Array<{
    id: string;
    code: string;
    primaryGuestName: string;
    maxGuests: number;
  }> = [];

  console.log(`📨 Creating ${TOTAL_INVITATIONS} invitations...`);

  // Create invitations
  for (let i = 0; i < TOTAL_INVITATIONS; i++) {
    const maxGuests = guestDistribution[i];
    const primaryGuestName = faker.person.fullName();
    const code = generateInvitationCode();

    const [inv] = await db
      .insert(invitation)
      .values({
        code,
        primaryGuestName,
        maxGuests,
        notes: Math.random() < 0.2 ? faker.lorem.sentence() : null,
      })
      .returning();

    if (!inv) throw new Error("Failed to create invitation");
    allInvitations.push(inv);
  }

  console.log(`👥 Creating guests for ${TOTAL_INVITATIONS} invitations...`);

  // Create guests for each invitation
  for (const inv of allInvitations) {
    const guestNames: string[] = [];

    // First guest is the primary guest
    guestNames.push(inv.primaryGuestName);

    // Generate additional guest names
    for (let i = 1; i < inv.maxGuests; i++) {
      // 70% chance family members share last name
      const shareLastName = Math.random() < 0.7;
      if (shareLastName) {
        const lastName = inv.primaryGuestName.split(" ").pop() || "";
        guestNames.push(`${faker.person.firstName()} ${lastName}`);
      } else {
        guestNames.push(faker.person.fullName());
      }
    }

    // Insert all guests for this invitation
    for (let i = 0; i < guestNames.length; i++) {
      const guestName = guestNames[i];
      if (!guestName) continue;

      await db.insert(guest).values({
        invitationId: inv.id,
        name: guestName,
        isPrimary: i === 0,
        attending: null, // Will be set when RSVP is submitted
        dietaryRestrictions: generateDietaryRestrictions(),
        photographyConsent: Math.random() < 0.9, // 90% consent
      });
    }
  }

  console.log(`📝 Creating RSVPs for some invitations...`);

  // Create RSVPs for ~60% of invitations with various statuses
  const invitationsWithRsvp = faker.helpers
    .shuffle(allInvitations)
    .slice(0, Math.floor(TOTAL_INVITATIONS * 0.6));

  for (const inv of invitationsWithRsvp) {
    const attending = Math.random() < 0.85; // 85% attendance rate
    const guestCount = attending
      ? faker.number.int({ min: 1, max: inv.maxGuests })
      : 0;
    const needsBusRide = attending ? Math.random() < 0.3 : false; // 30% need bus

    await db.insert(rsvp).values({
      invitationId: inv.id,
      email: faker.internet.email({
        firstName: inv.primaryGuestName.split(" ")[0],
      }),
      attending,
      guestCount,
      needsBusRide,
      message: Math.random() < 0.3 ? faker.lorem.paragraph() : null,
    });

    // Update guests' attending status based on RSVP
    const invitationGuests = await db.query.guest.findMany({
      where: (guests, { eq }) => eq(guests.invitationId, inv.id),
    });

    // Mark guests as attending/not attending based on guestCount
    for (let i = 0; i < invitationGuests.length; i++) {
      const currentGuest = invitationGuests[i];
      if (!currentGuest) continue;

      const guestAttending = attending && i < guestCount;
      await db
        .update(guest)
        .set({ attending: guestAttending })
        .where(eq(guest.id, currentGuest.id));
    }
  }

  console.log("✅ Seed completed!");
  console.log(`📨 Created ${TOTAL_INVITATIONS} invitations`);
  console.log(`👥 Created ~${TARGET_TOTAL_GUESTS} guests`);
  console.log(`📝 Created ${invitationsWithRsvp.length} RSVPs`);

  const stats = await db.query.rsvp.findMany();
  const attendingCount = stats.filter((r) => r.attending).length;
  const totalConfirmedGuests = stats
    .filter((r) => r.attending)
    .reduce((sum, r) => sum + r.guestCount, 0);

  console.log(
    `✅ ${attendingCount} attending, ${stats.length - attendingCount} declined`,
  );
  console.log(`👥 ${totalConfirmedGuests} confirmed guests total`);

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
