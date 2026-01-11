import type { CollectionConfig } from 'payload'

export const RSVPResponses: CollectionConfig = {
	slug: 'rsvp-responses',
	admin: {
		useAsTitle: 'guestName',
		defaultColumns: ['guestName', 'isAttending', 'guestCount', 'submittedAt'],
	},
	access: {
		read: ({ req }) => {
			if (req.user?.role === 'admin') return true
			// Guests can only read their own RSVP
			return {
				guest: {
					equals: req.user?.id,
				},
			}
		},
		create: ({ req }) => {
			// Guests can create their own RSVP
			return req.user !== undefined
		},
		update: ({ req }) => {
			if (req.user?.role === 'admin') return true
			// Guests can update their own RSVP
			return {
				guest: {
					equals: req.user?.id,
				},
			}
		},
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
				description: 'The wedding this RSVP is for',
			},
		},
		{
			name: 'guest',
			type: 'relationship',
			relationTo: 'guests',
			required: true,
			hasMany: false,
			admin: {
				description: 'The guest who submitted this RSVP',
			},
		},
		{
			name: 'guestName',
			type: 'text',
			required: true,
			label: 'Guest Name',
			admin: {
				description: 'Name of the person who submitted (for easy reference)',
			},
		},
		{
			name: 'isAttending',
			type: 'checkbox',
			required: true,
			label: 'Attending',
			defaultValue: false,
			admin: {
				description: 'Is the guest attending the wedding?',
			},
		},
		{
			name: 'guestCount',
			type: 'number',
			required: true,
			label: 'Total Guest Count',
			min: 0,
			admin: {
				description: 'Total number of people attending (including +1s)',
			},
		},
		{
			name: 'email',
			type: 'email',
			required: true,
			label: 'Email',
			admin: {
				description: 'Contact email for future communication',
			},
		},
		{
			name: 'dietaryRestrictions',
			type: 'textarea',
			label: 'Dietary Restrictions',
			admin: {
				description: 'Overall dietary restrictions for the group',
			},
		},
		{
			name: 'attendees',
			type: 'array',
			label: 'Attendee Details',
			admin: {
				description: 'Details for each person attending',
			},
			fields: [
				{
					name: 'name',
					type: 'text',
					required: true,
					label: 'Attendee Name',
				},
				{
					name: 'dietaryRestrictions',
					type: 'text',
					label: 'Dietary Restrictions',
					admin: {
						description: 'Specific restrictions for this person',
					},
				},
			],
		},
		{
			name: 'additionalNotes',
			type: 'textarea',
			label: 'Additional Notes',
			admin: {
				description: 'Any additional comments or questions from the guest',
			},
		},
		{
			name: 'submittedAt',
			type: 'date',
			label: 'Submitted At',
			admin: {
				date: {
					pickerAppearance: 'dayAndTime',
				},
				readOnly: true,
			},
			hooks: {
				beforeChange: [
					({ value, operation }) => {
						// Set timestamp on creation if not provided
						if (operation === 'create' && !value) {
							return new Date()
						}
						return value
					},
				],
			},
		},
	],
}
