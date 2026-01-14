# Liitto - Copilot Instructions

## AI Development Workflow

### Making Changes: Keep It Minimal & Reviewable

**CRITICAL PRINCIPLE**: Make changes in small, reviewable increments. The human needs to understand and approve each step.

**When implementing multi-file changes:**

1. **Show new abstractions FIRST** - Before using them everywhere
   - Create the new component/utility/abstraction
   - Show it to the user for review
   - Example: When creating `AuthProvider`, show its implementation before refactoring all pages to use it

2. **Explain the plan** - Before executing
   - List what files will change
   - Describe the pattern being introduced
   - Ask clarifying questions if unsure

3. **Incremental rollout** - Don't change everything at once
   - Implement the foundation (1-2 files)
   - Wait for feedback
   - Then propagate the pattern to remaining files

4. **Avoid large parallel changes** - Makes review harder
   - ❌ Creating 5 new files + updating 10 existing files simultaneously
   - ✅ Create 1-2 core abstractions → get feedback → update consumers

**Why this matters:**

- Easier to review and understand changes
- Catches issues early before they propagate
- User can provide feedback on approach before full implementation
- Reduces cognitive load during code review

## Project Overview

Liitto is a wedding invitation platform built as a **pnpm + Turborepo monorepo** with Next.js apps. The platform uses:

- **Next.js 16** (App Router) with React 19
- **HeroUI** for UI components
- **Biome** for linting/formatting (not ESLint/Prettier)
- **Session-based authentication** with invitation codes (format: XX-12345)

## Architecture

### Monorepo Structure

- **apps/web** - Main wedding platform (Next.js, port 3000)
- **packages/typescript-config** - Shared TypeScript configs
- **packages/biome-config** - Shared Biome linting/formatting configs

### Wedding Platform Stack

- **Frontend**: Next.js 16 with App Router, React 19
- **UI Library**: HeroUI (`@heroui/react`)
  - **IMPORTANT**: Always consult the HeroUI MCP server (configured in `.vscode/mcp.json`) before using HeroUI components to verify correct API, props, and available exports
- **Authentication**: Code-based authentication (XXXX-XXXX format: 8 alphanumeric characters)
  - Format: 4 characters, dash, 4 characters (e.g., ABCD-1234)
  - All characters can be A-Z or 0-9
  - Codes stored in sessionStorage (frontend only, will be replaced with backend auth)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest with separate test database

### Application Structure

```
apps/web/
├── app/
│   ├── fonts/              # Local font files (Geist)
│   ├── invitation/         # Protected invitation page (post-login)
│   │   └── page.tsx
│   ├── globals.css         # Global styles with Tailwind imports
│   ├── layout.tsx          # Root layout with fonts and metadata
│   └── page.tsx            # Login page (home)
├── components/             # Shared React components
│   └── pin-input.tsx       # Code input component (XX-12345)
├── public/
│   └── uploads/            # Static file uploads
└── package.json
```

### Authentication & Route Protection

**Admin Authentication** (Better Auth with passkeys):

The platform uses a **three-layer protection system** following Next.js 16 best practices:

1. **Proxy (`proxy.ts`)** - First line of defense
   - Intercepts ALL requests to routes containing `(protected)` folder
   - Checks session from Better Auth
   - Redirects to `/admin?error=unauthorized` if no valid session
   - Runs before any page renders

2. **Data Access Layer (`lib/dal.ts`)** - Centralized auth logic
   - `verifySession()` - Fetches and validates session using React cache
   - `getUser()` - Helper to get current authenticated user
   - Use in Server Components for auth checks
   - Follows Next.js recommended security patterns

3. **Auth Context (`components/auth-provider.tsx`)** - For Client Components
   - Server Component wrapper that fetches session via DAL
   - Client Component provider that exposes `useAuth()` hook
   - Used in `(protected)` layouts to provide session to all descendants
   - Access session in Client Components: `const { session } = useAuth()`

**How to protect routes:**

- Place routes under `(protected)` route group (e.g., `/app/admin/(protected)/dashboard/`)
- Layout automatically wraps with `<AuthProvider>`
- Pages can use `useAuth()` in Client Components or call DAL functions in Server Components
- **Never manually check auth in pages** - proxy and layout handle it

**Example usage:**

```tsx
// Client Component under (protected)
"use client";
import { useAuth } from "@/components/auth-provider-client";

export const MyComponent = () => {
  const { session } = useAuth();
  const user = session.user;
  // ...
};

// Server Component (if needed)
import { verifySession } from "@/lib/dal";

export const MyServerComponent = async () => {
  const session = await verifySession();
  // ...
};
```

**Guest Invitation Authentication** (Legacy - to be migrated):

1. User enters 8-character code (alphanumeric: e.g., ABCD-1234)
2. Code validated via `POST /api/auth/validate`
3. Returns minimal metadata (id, code, maxGuests, hasRsvp flag)
4. **Security**: No personal information (names, emails) returned to prevent info leakage
5. Frontend stores validation state
6. User can then access invitation details and submit RSVP

## Development Workflows

### Running Commands

Use Turborepo for all build/dev/lint operations:

```bash
pnpm dev           # Start all apps in dev mode (uses turbo run dev)
pnpm build         # Build all apps and packages
pnpm lint          # Run Biome checks across workspace
pnpm check-types   # TypeScript type checking
```

Individual app commands:

```bash
cd apps/web
pnpm dev          # Starts Next.js on port 3000
pnpm check-types  # Runs `next typegen && tsc --noEmit`
pnpm build        # Build for production
```

## Code Conventions

### Formatting & Linting

- **Use Biome, not ESLint/Prettier** - All lint commands run `biome check --write`
- Formatting: **tabs** (indent width 2), line width 120
- Root biome.json provides base config; apps/packages extend from `@repo/biome-config/base` and `@repo/biome-config/next-js`

### TypeScript Configuration

- Apps extend `@repo/typescript-config/nextjs.json`
- All Next.js apps use `next typegen` for type generation before type checking
- **CRITICAL: NEVER use `!` (non-null assertion operator)** - It bypasses type safety and leads to runtime errors
  - Instead: Use proper type guards, optional chaining, or throw errors in helpers
  - Example:

    ```tsx
    // ❌ BAD - Using !
    const value = maybeUndefined!.property;

    // ✅ GOOD - Proper error handling
    if (!maybeUndefined) {
      throw new Error("Value is required");
    }
    const value = maybeUndefined.property;

    // ✅ GOOD - Optional chaining
    const value = maybeUndefined?.property;
    ```

### Component Patterns

- Use `"use client"` directive for interactive components
- Export named components with explicit TypeScript types (not interfaces)
- Components accept `className` prop for styling flexibility
- **Use HeroUI components for UI elements** - Consult HeroUI MCP before implementation
  - Examples: Use `<Spinner />` instead of plain "Loading..." text
  - Always verify correct props: `variant`, `isPending`, `onPress` (not `color`, `isLoading`, `onClick`)
- Shared components live in root-level `components/` directory
- Route-specific components can be co-located with routes in a `components/` subfolder
- **Components with more than 10 lines of JSX should be extracted to their own files**

### Coding Style & Best Practices

**TypeScript:**

- **Prefer `type` over `interface`** for component props and data structures
- **Prefer arrow functions over function declarations**
- Example:

  ```tsx
  // ✅ Good
  type UserProps = {
    name: string;
    age: number;
  };

  const UserProfile = ({ name, age }: UserProps) => {
    return (
      <div>
        {name}, {age}
      </div>
    );
  };

  // ❌ Avoid
  interface UserProps {
    name: string;
    age: number;
  }

  function UserProfile({ name, age }: UserProps) {
    return (
      <div>
        {name}, {age}
      </div>
    );
  }
  ```

**Control Flow:**

- **Prefer early returns over if-else** - Avoid `else` blocks when you can return from the first `if`
- Example:

  ```tsx
  // ✅ Good - Early return
  if (!isValid) {
    return null;
  }
  return <Component />;

  // ❌ Avoid - if-else
  if (!isValid) {
    return null;
  } else {
    return <Component />;
  }
  ```

**Functional Programming:**

- Use functional programming paradigms as a guiding principle (but don't overdo it)
- Prefer `map`, `filter`, `reduce` over imperative loops where it improves readability
- Favor immutability and pure functions

**Component Architecture:**

- **Don't return large amounts of JSX from inside conditional blocks** - Extract view states into separate components
- **Balance component splitting** - Split for clear separation of concerns, but don't over-split every small piece
  - ✅ Split: Different view states (loading, authenticated, error), reusable UI elements
  - ❌ Don't split: Simple nav bars, card grids, or tightly coupled sections that don't provide reusability
- Each component should have one clear responsibility
- **Separation of concerns:**
  - **Presentation Layer**: Components that only handle UI/display, receive all data via props
  - **Data Layer**: Handles queries, API calls, state management, data fetching
  - Presentation components should be agnostic to where data comes from

Example structure - Conditional rendering without large JSX blocks:

```tsx
// ❌ AVOID - Large JSX returned from conditional blocks
function AdminPage() {
  const { isPending, data } = useSession();

  if (isPending) {
    return (
      <div className="...">
        <nav>...</nav>
        <main>...</main>
        {/* 50+ lines of JSX */}
      </div>
    );
  }

  if (data?.user) {
    return <div className="...">{/* Another 50+ lines of JSX */}</div>;
  }

  return <div className="...">{/* More large JSX blocks */}</div>;
}

// ✅ GOOD - Separate view components, clean conditional rendering
function AdminPage() {
  const { isPending, data } = useSession();

  if (isPending) {
    return <LoadingView />;
  }

  if (data?.user) {
    return <AuthenticatedView user={data.user} />;
  }

  return <LoginView />;
}

// Each view in its own file
function LoadingView() {
  return (
    <div className="...">
      <Spinner />
    </div>
  );
}

function LoginView() {
  // Login form logic and JSX
}

function AuthenticatedView({ user }: { user: User }) {
  // Authenticated UI with nav, cards, etc. inline
  // Don't split nav/cards into separate files unless reused elsewhere
}
```

Separation of concerns example:

```tsx
// ❌ Avoid - Mixed concerns
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user").then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// ✅ Good - Separated concerns
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

function UserProfileContainer() {
  const user = useUserData();
  return <UserProfile user={user} />;
}
```

### Next.js App Structure

- Uses App Router with app directory
- Local fonts loaded via `next/font/local` (Geist Sans & Mono) in `app/fonts/`
- Metadata exported from layout.tsx
- Global styles in app/globals.css with Tailwind CSS imports
- Client components use `"use client"` directive
- Navigation via `useRouter` from `next/navigation`
- SessionStorage used for auth state management

## Key Files & Patterns

### Configuration Hierarchy

1. Root configs: [biome.json](biome.json), [turbo.json](turbo.json), [pnpm-workspace.yaml](pnpm-workspace.yaml)
2. Shared configs: `packages/{biome-config,typescript-config}/`
3. App configs extend shared configs via `extends` field

### Turbo Pipeline

[turbo.json](turbo.json) defines task dependencies:

- `build` depends on `^build` (dependencies built first)
- `build` outputs to `.next/**` (excludes cache)
- `dev` runs with `cache: false` and `persistent: true` (long-running)
- All tasks inherit dependency order from `dependsOn: ["^{task}"]`

## Important Notes

- Package manager: **pnpm 9.0.0** (enforced via packageManager field)
- Node version: **>=18** required
- React version: **19.2.0** (latest)
- TypeScript: **5.9.2** (shared across all packages)
- When adding dependencies to apps, use `workspace:*` for internal packages

## Backend & Database

### Database Setup

- **PostgreSQL** running in Docker (port 5432)
- **Drizzle ORM** for type-safe database access
- Separate test database: `liitto_test`

### Database Schema Conventions

- **Table names are SINGULAR** (not plural): `invitation`, `guest`, `rsvp`
- Use `snake_case` for column names: `primary_guest_name`, `created_at`
- All tables use UUID primary keys
- Foreign keys use `onDelete: "cascade"`
- Always define Drizzle relations for type-safe joins

### Database Commands

```bash
pnpm db:generate   # Generate migrations from schema
pnpm db:push       # Push schema to database
pnpm db:studio     # Open Drizzle Studio
pnpm db:seed       # Seed test data
```

### Database Schema

**`invitation` table:**

- `id` (uuid) - Primary key
- `code` (varchar) - Unique invitation code (XXXX-XXXX format)
- `primary_guest_name` (varchar) - Main guest name (for reference)
- `max_guests` (integer) - Total capacity
- `notes` (text) - Internal notes
- Timestamps: `created_at`, `updated_at`

**`rsvp` table:**

- `id` (uuid) - Primary key
- `invitation_id` (uuid) - FK to invitation (unique, one RSVP per invitation)
- `email` (varchar) - Guest email for confirmations
- `attending` (boolean)
- `guest_count` (integer) - Actual number attending
- `message` (text) - Optional message to bride/groom
- Timestamps: `submitted_at`, `updated_at`

**`guest` table:**

- `id` (uuid) - Primary key
- `invitation_id` (uuid) - FK to invitation
- `name` (varchar)
- `is_primary` (boolean) - Is this the main guest?
- `attending` (boolean, nullable) - null until RSVP submitted
- `dietary_restrictions` (text)
- `photography_consent` (boolean) - Consent for photos
- Timestamps: `created_at`, `updated_at`

## Testing

### Testing Setup

- **Vitest** for unit and integration tests
- **Test database**: `liitto_test` (separate from development)
- Tests run against real PostgreSQL database
- Database cleaned between tests via `beforeEach` hooks

### Testing Commands

```bash
pnpm test           # Run all tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:ui        # Open Vitest UI
pnpm test:coverage  # Generate coverage report
```

### Testing Best Practices

1. **Test helpers must throw on failure** - Never return `undefined`

   ```tsx
   // ✅ GOOD - Throws if creation fails
   export const createTestInvitation = async (overrides) => {
     const [inv] = await db.insert(invitation).values({...}).returning();
     if (!inv) throw new Error("Failed to create test invitation");
     return inv;
   };

   // ❌ BAD - Can return undefined
   export const createTestInvitation = async (overrides) => {
     const [inv] = await db.insert(invitation).values({...}).returning();
     return inv; // TypeScript infers this as possibly undefined
   };
   ```

2. **Use dummy URLs in tests** - Route handlers are tested directly, not via HTTP

   ```tsx
   // ✅ GOOD - Simple dummy URL
   const req = new NextRequest("http://test/api/auth/validate", {...});

   // ❌ BAD - Unnecessary environment-dependent URL
   const req = new NextRequest(`${process.env.BASE_URL}/api/auth/validate`, {...});
   ```

3. **Security in tests** - Verify that sensitive data is NOT returned

   ```tsx
   expect(data.invitation.primaryGuestName).toBeUndefined();
   expect(data.guests).toBeUndefined();
   ```

4. **Database cleanup** - `beforeEach` in `tests/setup.ts` cleans all tables

### API Testing Patterns

- Import route handlers directly: `import { POST } from "@/app/api/auth/validate/route"`
- Create `NextRequest` objects with test data
- Test both success and error cases
- Always verify that personal information is NOT leaked in error responses

## API Security Conventions

### Authentication Endpoints

1. **Never return 404 for invalid codes** - Always return 400 to prevent code enumeration
2. **Minimal data on validation** - Only return non-personal metadata:
   - ✅ `invitation.id`, `invitation.code`, `invitation.maxGuests`
   - ✅ `hasRsvp` (boolean flag)
   - ❌ NO guest names, emails, or RSVP details
3. **Personal data requires authentication** - Guest info only via authenticated endpoints

### Error Responses

- Invalid/missing input: `400 Bad Request`
- Unauthorized: `401 Unauthorized`
- Server errors: `500 Internal Server Error`
- **Never** use `404` for authentication to prevent enumeration attacks
