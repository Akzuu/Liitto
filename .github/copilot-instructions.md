# Liitto - Copilot Instructions

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
- **Authentication**: Code-based authentication (XX-12345 format: 2 letters + 5 digits)
  - Codes stored in sessionStorage
  - No backend authentication yet implemented
- **Styling**: Tailwind CSS v4 with PostCSS

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

### Authentication Flow

1. User enters 7-character code (2 letters + 5 digits: e.g., XX-12345)
2. Code validated client-side (format check only)
3. Code stored in sessionStorage
4. User redirected to `/invitation` page
5. Protected routes check sessionStorage for code
6. Logout clears sessionStorage and redirects to home

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

### Component Patterns

- Use `"use client"` directive for interactive components
- Export named components with explicit TypeScript types (not interfaces)
- Components accept `className` prop for styling flexibility
- Use HeroUI components for UI elements
- Shared components live in root-level `components/` directory
- Route-specific components can be co-located with routes
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

- **Split JSX heavily into small, single-purpose components**
- Each component should have one clear responsibility
- **Separation of concerns:**
  - **Presentation Layer**: Components that only handle UI/display, receive all data via props
  - **Data Layer**: Handles queries, API calls, state management, data fetching
  - Presentation components should be agnostic to where data comes from

Example structure:

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
