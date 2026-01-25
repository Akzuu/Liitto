import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { guest, invitation, rsvp } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { RsvpContent } from "./components/rsvp-content";

export default async function RsvpPage() {
  const session = await verifySession();

  if (!session?.user) {
    redirect("/admin?error=unauthorized");
  }

  // Fetch all invitations with their RSVPs and guest details
  const invitations = await db
    .select({
      invitation: invitation,
      rsvp: rsvp,
    })
    .from(invitation)
    .leftJoin(rsvp, eq(rsvp.invitationId, invitation.id))
    .orderBy(invitation.createdAt);

  // Fetch all guests
  const guests = await db.select().from(guest);

  return <RsvpContent invitations={invitations} guests={guests} />;
}
