# Liitto

Wedding invitation platform built with Next.js and PostgreSQL.

Around 90 % of the code has been vibe coded. While this project serves an actual purpose, it is also a testing ground for AI assisted development.

## Features

- **Guest Invitations**: Code-based authentication (XXXX-XXXX format) with server-side sessions
- **Email Verification**: 6-digit codes for accessing RSVP details
- **Admin Dashboard**: Better Auth with passkeys
- **RSVP Management**: Submit and edit responses with email verification
- **PostgreSQL + Drizzle ORM** for type-safe database access

## Authentication

**Guest:** 8-character invitation codes create secure sessions (30-day expiry). Email verification required to view/edit existing RSVPs.

**Admin:** Better Auth with passkeys. Three-layer protection: proxy middleware, protected layouts, and data access layer (DAL). Routes under `(protected)` group get automatic session context.
