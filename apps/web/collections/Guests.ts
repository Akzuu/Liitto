import type { CollectionConfig } from 'payload'

export const Guests: CollectionConfig = {
	slug: 'guests',
	admin: {
		useAsTitle: 'fullName',
		defaultColumns: ['fullName', 'familyGroup', 'allowedPlusOnes', 'invitationSentDate'],
	},
	access: {
		read: ({ req }) => {
			if (req.user?.role === 'admin') return true
			// Guests can only read their own record
			return {
				user: {
					equals: req.user?.id,
				},
			}
		},
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
				description: 'The wedding this guest is invited to',
			},
		},
		{
			name: 'user',
			type: 'relationship',
			relationTo: 'users',
			required: true,
			hasMany: false,
			admin: {
				description: 'Link to the user account for this guest',
			},
		},
		{
			name: 'fullName',
			type: 'text',
			required: true,
			label: 'Full Name',
		},
		{
			name: 'familyGroup',
			type: 'text',
			required: true,
			label: 'Family Group',
			admin: {
				description: 'Group name for family members (e.g., "Smith Family")',
			},
		},
		{
			name: 'isPrimaryContact',
			type: 'checkbox',
			label: 'Primary Contact',
			defaultValue: false,
			admin: {
				description: 'Is this person the main contact who will fill RSVP?',
			},
		},
		{
			name: 'allowedPlusOnes',
			type: 'number',
			label: 'Allowed Plus Ones',
			defaultValue: 0,
			min: 0,
			admin: {
				description: 'Number of additional guests this person can bring (0 = just them)',
			},
		},
		{
			name: 'invitationSentDate',
			type: 'date',
			label: 'Invitation Sent Date',
			admin: {
				date: {
					pickerAppearance: 'dayOnly',
				},
				description: 'When the invitation was sent to this guest',
			},
		},
		{
			name: 'qrCode',
			type: 'textarea',
			label: 'QR Code Data',
			admin: {
				description: 'Generated QR code data URL or identifier',
				readOnly: true,
			},
		},
		{
			name: 'notes',
			type: 'textarea',
			label: 'Internal Notes',
			admin: {
				description: 'Private notes about this guest (not visible to guest)',
			},
		},
	],
}
