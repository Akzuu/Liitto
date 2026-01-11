import type { CollectionConfig } from 'payload'

// Generate random 4-digit PIN
const generatePIN = (): string => {
	return Math.floor(1000 + Math.random() * 9000).toString()
}

export const Users: CollectionConfig = {
	slug: 'users',
	auth: {
		tokenExpiration: 7200, // 2 hours
		cookies: {
			secure: true,
			sameSite: 'Lax',
		},
	},
	admin: {
		useAsTitle: 'fullName',
		defaultColumns: ['fullName', 'email', 'role', 'wedding'],
	},
	access: {
		read: ({ req }) => {
			if (req.user?.role === 'admin') return true
			return {
				id: {
					equals: req.user?.id,
				},
			}
		},
		create: ({ req }) => req.user?.role === 'admin',
		update: ({ req }) => {
			if (req.user?.role === 'admin') return true
			return {
				id: {
					equals: req.user?.id,
				},
			}
		},
		delete: ({ req }) => req.user?.role === 'admin',
	},
	fields: [
		{
			name: 'wedding',
			type: 'relationship',
			relationTo: 'weddings',
			required: false, // Allow first super admin without wedding
			hasMany: false,
			admin: {
				description: 'The wedding this user belongs to (optional for super admin)',
			},
		},
		{
			name: 'role',
			type: 'select',
			options: [
				{
					label: 'Admin',
					value: 'admin',
				},
				{
					label: 'Guest',
					value: 'guest',
				},
			],
			required: true,
			defaultValue: 'guest',
			admin: {
				description: 'Admin: Super admin or wedding admin | Guest: Invited guest with PIN login',
			},
		},
		{
			name: 'fullName',
			type: 'text',
			required: true,
			label: 'Full Name',
			admin: {
				description: 'Used as username for guest login',
			},
		},
		{
			name: 'email',
			type: 'email',
			label: 'Email',
			required: false,
			admin: {
				description: 'Required for admins. Guests provide email when they RSVP.',
			},
		},
		{
			name: 'pin',
			type: 'text',
			label: '4-Digit PIN',
			admin: {
				description: 'Auto-generated PIN for guest login. Share this with the guest.',
				condition: (data) => data.role === 'guest',
				readOnly: true,
			},
			minLength: 4,
			maxLength: 4,
			hooks: {
				beforeChange: [
					({ data, operation, value }) => {
						// Auto-generate PIN for new guests
						if (operation === 'create' && data?.role === 'guest' && !value) {
							return generatePIN()
						}
						return value
					},
				],
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
				condition: (data) => data.role === 'guest',
			},
		},
		{
			name: 'isPrimaryContact',
			type: 'checkbox',
			label: 'Primary Contact',
			defaultValue: true,
			admin: {
				description: 'Is this person the main contact who will fill RSVP?',
				condition: (data) => data.role === 'guest',
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
				condition: (data) => data.role === 'guest',
			},
		},
		{
			name: 'qrCode',
			type: 'textarea',
			label: 'QR Code Data',
			admin: {
				description: 'Generated QR code data URL or identifier',
				readOnly: true,
				condition: (data) => data.role === 'guest',
			},
		},
		{
			name: 'notes',
			type: 'textarea',
			label: 'Internal Notes',
			admin: {
				description: 'Private notes about this guest (not visible to guest)',
				condition: (data) => data.role === 'guest',
			},
		},
	],
}
