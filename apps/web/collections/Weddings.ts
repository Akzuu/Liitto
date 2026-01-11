import type { CollectionConfig } from "payload";

export const Weddings: CollectionConfig = {
  slug: "weddings",
  admin: {
    useAsTitle: "coupleName",
    defaultColumns: ["coupleName", "weddingDate", "isActive"],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "coupleName",
      type: "text",
      required: true,
      label: "Couple Name",
      admin: {
        description: 'e.g., "Emma & John"',
      },
    },
    {
      name: "subdomain",
      type: "text",
      unique: true,
      label: "Subdomain",
      admin: {
        description: "For SaaS: emma-john (leave empty for single wedding)",
      },
    },
    {
      name: "customDomain",
      type: "text",
      label: "Custom Domain",
      admin: {
        description: "Optional custom domain for this wedding",
      },
    },
    {
      name: "weddingDate",
      type: "date",
      required: true,
      label: "Wedding Date",
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      label: "Active",
      admin: {
        description: "Deactivate to disable this wedding site",
      },
    },
    {
      name: "venueName",
      type: "text",
      required: true,
      label: "Venue Name",
    },
    {
      name: "venueAddress",
      type: "textarea",
      required: true,
      label: "Venue Address",
    },
    {
      name: "venueCoordinates",
      type: "group",
      label: "Venue Coordinates",
      admin: {
        description: "For map display",
      },
      fields: [
        {
          name: "latitude",
          type: "number",
          required: true,
          label: "Latitude",
          admin: {
            step: 0.000001,
          },
        },
        {
          name: "longitude",
          type: "number",
          required: true,
          label: "Longitude",
          admin: {
            step: 0.000001,
          },
        },
      ],
    },
    {
      name: "schedule",
      type: "richText",
      label: "Event Schedule",
      admin: {
        description: "Timeline of events during the wedding day",
      },
    },
  ],
};
