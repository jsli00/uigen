# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Development server in background (logs to logs.txt)
npm run dev:daemon

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Database reset
npm run db:reset
```

## Architecture Overview

UIGen is a Next.js 15 (App Router) application where users chat with Claude AI to generate React components and see them live in a preview panel.

### Key Data Flow

1. **User sends message** → `ChatContext` (wraps Vercel AI SDK's `useChat`) → `POST /api/chat`
2. **API route** deserializes the virtual file system, calls Claude with two tools (`str_replace_editor`, `file_manager`), and streams the response
3. **Tool calls arrive client-side** → `FileSystemContext.handleToolCall()` updates the in-memory `VirtualFileSystem`
4. **FileSystemContext `refreshTrigger`** increments → `PreviewFrame` re-renders the preview
5. **Preview rendering**: `createImportMap()` transpiles all VFS files via Babel standalone, creates blob URLs, builds an import map, then injects a full HTML page into a sandboxed `<iframe>`

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` class that stores all generated component files **in-memory only** (no disk writes). Files are serialized/deserialized as plain objects for API transport and database storage.

### Context Providers

Both providers wrap the main layout (`main-content.tsx`):
- **`FileSystemProvider`** (`src/lib/contexts/file-system-context.tsx`) — owns the VFS instance, `selectedFile` state, and `handleToolCall` that processes AI tool calls into VFS mutations
- **`ChatProvider`** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK `useChat`, passes serialized VFS state in every request body, and triggers `handleToolCall` on each incoming tool call

### AI Tools (Server-Side)

Defined in `src/lib/tools/`:
- `str_replace_editor` — creates files (`create`), replaces text (`str_replace`), inserts lines (`insert`), views files (`view`)
- `file_manager` — renames and deletes files

The AI prompt is in `src/lib/prompts/generation.tsx` with Anthropic prompt caching (`cacheControl: ephemeral`).

### Preview Pipeline (`src/lib/transform/jsx-transformer.ts`)

- `transformJSX()` — compiles JSX/TSX via `@babel/standalone` (handles TS, removes CSS imports)
- `createImportMap()` — transforms all VFS files to blob URLs, maps third-party imports to `esm.sh`, creates placeholder modules for missing local imports
- `createPreviewHTML()` — injects Tailwind CDN, the import map, user CSS, and an error boundary into the iframe's `srcdoc`

### Auth

JWT-based sessions stored in HttpOnly cookies (`auth-token`). `src/lib/auth.ts` is server-only. Middleware at `src/middleware.ts` protects `/api/projects` and `/api/filesystem` routes. Passwords hashed with bcrypt.

### Database

Prisma with SQLite (`prisma/dev.db`). Prisma client is generated into `src/generated/prisma/`. Refer to `prisma/schema.prisma` for the authoritative database structure.

### Mock Provider

When `ANTHROPIC_API_KEY` is absent, `getLanguageModel()` in `src/lib/provider.ts` returns `MockLanguageModel` — a fake LLM that simulates multi-step tool calls to create Counter/Card/Form components without an API key.

### Anonymous vs Authenticated Users

- Anonymous users work without signing in; their VFS state is tracked in `src/lib/anon-work-tracker.ts`
- On sign-in/sign-up, anonymous work can be migrated to a new project
- Authenticated users get projects persisted to SQLite; routing redirects to the most recent project (`/[projectId]`)

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`).

### Test Setup

Vitest with jsdom environment. Test files live alongside source in `__tests__/` subdirectories. `@testing-library/react` is used for component tests.

## Code Style

Use comments sparingly — only for logic that isn't self-evident from reading the code.
