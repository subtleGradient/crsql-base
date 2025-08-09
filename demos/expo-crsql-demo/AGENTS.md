# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo demo application for cr-sqlite (Conflict-free Replicated SQLite) that demonstrates cross-platform database synchronization. The app is built with Expo SDK 53 and uses file-based routing with expo-router.

## Development Commands

```bash
# Install dependencies (uses bun from parent monorepo)
bun install

# Start Expo development server
bun run start

# Platform-specific development
bun run ios      # Start iOS simulator
bun run android  # Start Android emulator
bun run web      # Start web development server

# Linting
bun run lint

# Reset project to fresh state
bun run reset-project
```

## Architecture

### Routing Structure
- Uses expo-router with file-based routing
- Main app structure in `/app` directory:
  - `(tabs)/` - Tab navigation screens (Home and Explore)
  - `_layout.tsx` - Root layout with theme provider
  - `+not-found.tsx` - 404 screen

### Key Components
- `/components` - Reusable UI components with theme support
  - `ui/` - Platform-specific UI components (iOS/generic)
  - Themed components (`ThemedText`, `ThemedView`) for dark/light mode
- `/hooks` - Custom React hooks for color scheme and theming
- `/constants/Colors.ts` - Color definitions for themes

### Configuration
- `app.json` - Expo configuration with typed routes enabled
- TypeScript with strict mode and path alias `@/*` for root imports
- ESLint with expo config

## CR-SQLite Integration Status

According to TODO.md, the following cr-sqlite features are planned:
- Client implementations for web, iOS, and Android platforms
- Server implementation using Bun
- Production deployment with Docker and Kamal

## Development Notes

- The app uses React Native's New Architecture (`newArchEnabled: true`)
- Supports automatic dark/light mode switching
- Uses platform-specific implementations for certain UI components (e.g., IconSymbol, TabBarBackground)
- Fonts are loaded asynchronously (SpaceMono font family)