# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe Wildcard is a React Native mobile app built with Expo SDK 54 that helps users discover recipes with AI-powered "wildcard" ingredient suggestions. It uses Gemini 2.5 Flash for AI features and Supabase for backend/auth/storage.

## Commands

- `npm start` — Start Expo dev server
- `npm run ios` — Start on iOS simulator
- `npm run android` — Start on Android emulator
- `npm run web` — Start web version
- `npm run reset` — Clear cache and restart (`expo start --clear`)

No test runner is configured.

## Architecture

**Routing:** Expo Router with file-based routing in `app/`. Route groups: `(auth)` for login/register, `(tabs)` for main tab navigation, `(modals)` for modal screens.

**State Management:** Zustand stores in `src/stores/` — `authStore`, `recipeStore`, `wildcardStore`. Stores call services directly.

**Services Layer:** `src/services/` handles Supabase CRUD operations (auth, recipes, images, wildcard catalog).

**AI Integration:** `src/lib/gemini.ts` is the main AI module (~600 lines). Key functions: `generateRecipe()`, `parseRecipeFromUrl()`, `parseRecipeFromText()`, `suggestWildcardIngredient()`, `addWildcardToRecipe()`. Uses Zod schemas for response validation.

**Custom Hooks:** `src/hooks/` wraps store actions with React lifecycle (useAuth, useRecipes, useWildcard, etc.).

**UI Components:** `src/components/ui/` for base components (Button, Card, Input, Badge, Modal). Feature components in `src/components/recipe/` and `src/components/wildcard/`.

## Styling

Uses NativeWind v4 (Tailwind CSS for React Native) with `className` props. Custom color palette defined in `tailwind.config.js`:
- `primary` — Tropical Coral (#FF6F61)
- `secondary` — Tropical Teal (#00C9B7)
- `accent` — Mango (#FFB347)
- `wildcard` — Purple/Orchid (#A855F7)

Babel is configured with `jsxImportSource: "nativewind"` and `nativewind/babel` preset. The `react-native-reanimated/plugin` must remain last in the plugins array.

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@/components/*`, `@/lib/*`, `@/stores/*`, `@/services/*`, `@/hooks/*`, `@/types/*`, `@/theme/*`

## Environment Variables

Required in `.env` (see `.env.example`):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY`

All must be prefixed with `EXPO_PUBLIC_` to be accessible in the Expo app.

## Database

Supabase PostgreSQL. Schema defined in `supabase-schema.sql`. Key tables: `profiles`, `recipes`, `ingredients`, `instructions`, `saved_recipes`, `wildcard_catalog`. Ingredients have `is_wildcard` and `wildcard_reason` fields for the wildcard feature. Cascading deletes are configured on foreign keys.

## Key Patterns

- **Guest mode:** Anonymous users can create recipes but not save favorites. Recipes created anonymously are marked with `is_anonymous: true`.
- **Recipe sources:** Tracked via `source` field — `user_uploaded`, `ai_generated`, `wildcard_modified`, `template`.
- **Recipe import:** URL import tries JSON-LD structured data first, then falls back to Gemini for intelligent extraction.
- **Types:** Defined in `src/types/` — always use these for Recipe, Ingredient, Instruction, User, WildcardIngredient interfaces.
