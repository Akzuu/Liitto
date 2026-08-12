import { Temv1alpha1 } from "@scaleway/sdk";
import { createClient } from "@scaleway/sdk-client";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export const sendEmail = async ({
  to,
  subject,
  text,
}: EmailMessage): Promise<void> => {
  const accessKey = process.env.SCW_ACCESS_KEY;
  const secretKey = process.env.SCW_SECRET_KEY;
  const defaultOrganizationId = process.env.SCW_DEFAULT_ORGANIZATION_ID;
  const defaultProjectId = process.env.SCW_DEFAULT_PROJECT_ID;
  const fromEmail = process.env.TRANSACTIONAL_FROM_EMAIL;

  if (
    !accessKey ||
    !secretKey ||
    !defaultOrganizationId ||
    !defaultProjectId ||
    !fromEmail
  ) {
    throw new Error(
      "sendEmail is missing required Scaleway credentials or TRANSACTIONAL_FROM_EMAIL",
    );
  }

  const client = createClient({
    accessKey,
    secretKey,
    defaultProjectId,
    defaultOrganizationId,
    defaultRegion: "fr-par",
  });

  const emailApi = new Temv1alpha1.API(client);

  await emailApi.createEmail({
    subject,
    to: [{ email: to }],
    text,
    html: "",
    from: {
      email: fromEmail,
      name: process.env.TRANSACTIONAL_FROM_NAME || "Liitto",
    },
  });
};
