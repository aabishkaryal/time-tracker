# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time Tracker is a desktop time-tracking application built with Tauri, SvelteKit, and SQLite. It allows users to create categories, track time for activities, and manage their productivity data with archiving and history features.

## Architecture

**Frontend (SvelteKit + TypeScript):**
- `src/routes/` - SvelteKit routes (main app, archives, history pages)
- `src/lib/components/` - Reusable Svelte components including UI library components
- `src/lib/types/` - TypeScript type definitions for Category and Timer
- `src/lib/store.ts` - Svelte stores for state management
- `src/lib/events.ts` - Custom event system for component communication

**Backend (Rust + Tauri):**
- `src-tauri/src/main.rs` - Tauri app initialization with system tray support
- `src-tauri/src/commands.rs` - Tauri command functions exposed to frontend
- `src-tauri/src/db.rs` - SQLite database operations and queries
- `src-tauri/src/init.rs` - Database initialization and schema migrations
- `src-tauri/src/model.rs` - Rust data structures
- `src-tauri/src/error.rs` - Error handling types

**Database Schema:**
- `category` table: uuid (PK), name, icon_name, archived, current
- `timer` table: category_uuid (FK), start_time, duration
- `version` table: tracks schema migrations (current version: 2)

## Development Commands

**Frontend Development:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type check with svelte-check
npm run lint         # Run ESLint and Prettier checks
npm run format       # Format code with Prettier
```

**Testing:**
```bash
npm run test                # Run all tests
npm run test:unit          # Run unit tests with Vitest
npm run test:integration   # Run integration tests with Playwright
```

**Tauri/Desktop:**
```bash
# From project root
cargo tauri dev        # Start Tauri development mode
cargo tauri build      # Build desktop application

# macOS specific build (uses Makefile)
make build-macos       # Build universal macOS binary with certificate
```

## Key Technical Details

**State Management:**
- Uses custom event system (`src/lib/events.ts`) with pub/sub pattern
- Svelte stores in `src/lib/store.ts` for reactive state
- Events: `EVENT_CATEGORY_LIST_UPDATED`, `EVENT_CURRENT_CATEGORY_UPDATED`

**Database Operations:**
- All database functions are in `src-tauri/src/db.rs`
- Uses SQLite with rusqlite crate
- Schema versioning with automatic migrations
- UUID v7 for category identifiers

**Tauri Integration:**
- Commands exposed via `#[command]` macro in `commands.rs`
- Frontend calls backend using `invoke()` from `@tauri-apps/api/tauri`
- System tray support with hide-to-tray functionality

**UI Components:**
- Custom UI library in `src/lib/components/ui/` based on shadcn-svelte
- Uses Tailwind CSS for styling
- Lucide icons via `lucide-svelte`
- Toast notifications with `svelte-sonner`

## Current Features

- **Time Tracking:** Start/stop timers for different categories
- **Category Management:** Create, archive, restore categories with custom icons
- **History:** View time tracking history with calendar navigation
- **Archives:** Manage archived categories separately
- **System Tray:** Hide to system tray instead of closing

## File Structure Notes

- `src/routes/+page.svelte` - Main timer interface (SideBar + Timer components)
- `src/lib/components/timer.svelte` - Core timer functionality
- `src/lib/components/sideBar.svelte` - Category management sidebar
- UI components follow shadcn-svelte patterns with TypeScript
- All Tauri commands are prefixed with `_command` in the Rust code