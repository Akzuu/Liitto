import type { CollectionConfig } from 'payload'

export const WeddingInfo: CollectionConfig = {
	slug: 'wedding-info',
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'ceremonyDateTime', 'venueName'],
	},
	access: {
		read: () => true, // Public - anyone can view
		create: ({ req }) => req.user?.role === 'admin',
		update: ({ req }) => req.user?.role === 'admin',
		delete: ({ req }) => req.user?.role === 'admin',
	},
	fields: [
		{
			name: 'tenant',
			type: 'relationship',
			relationTo: 'tenants',
			required: true,
			hasMany: false,
			admin: {
				description: 'The wedding this information belongs to',
			},
		},
		{
			name: 'title',
			type: 'text',
			required: true,
			defaultValue: 'Our Wedding',
			label: 'Page Title',
		},
		{
			name: 'ceremonyDateTime',
			type: 'date',
			required: true,
			label: 'Ceremony Date & Time',
			admin: {
				date: {
					pickerAppearance: 'dayAndTime',
				},
			},
		},
		{
			name: 'venueName',
			type: 'text',
			required: true,
			label: 'Venue Name',
		},
		{
			name: 'venueAddress',
			type: 'textarea',
			required: true,
			label: 'Venue Address',
		},
		{
			name: 'venueCoordinates',
			type: 'group',
			label: 'Venue Coordinates',
			admin: {
				description: 'For map display',
			},
			fields: [
				{
					name: 'latitude',
					type: 'number',
					required: true,
					label: 'Latitude',
					admin: {
						step: 0.000001,
					},
				},
				{
					name: 'longitude',
					type: 'number',
					required: true,
					label: 'Longitude',
					admin: {
						step: 0.000001,
					},
				},
			],
		},
		{
			name: 'storyTitle',
			type: 'text',
			label: 'Story Section Title',
			admin: {
				description: 'e.g., "Our Story" or "How We Met"',
			},
		},
		{
			name: 'storyContent',
			type: 'richText',
			label: 'Story Content',
			admin: {
				description: 'Your love story or how you met',
			},
		},
		{
			name: 'additionalInfo',
			type: 'richText',
			label: 'Additional Information',
			admin: {
				description: 'Any extra details for guests',
			},
		},
		{
			name: 'dresscode',
			type: 'text',
			label: 'Dress Code',
			admin: {
				description: 'e.g., "Formal", "Cocktail", "Beach Casual"',
			},
		},
		{
			name: 'schedule',
			type: 'richText',
			label: 'Event Schedule',
			admin: {
				description: 'Timeline of events during the wedding day',
			},
		},
	],
}
