# Recipe Wildcard

A mobile app for recipe discovery with AI-powered "wildcard" ingredient suggestions that add unique flavors to recipes.

## Tech Stack

- **Frontend**: React Native + Expo Go
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini API
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand

## Features

- Browse and discover recipes
- Create recipes manually or with AI generation
- Get AI-powered "Wildcard" ingredient suggestions
- Save/bookmark favorite recipes
- Share recipes
- Email authentication with guest mode support

## Setup

### Prerequisites

- Node.js 18+
- Expo Go app on your phone
- Supabase account
- Google AI Studio account (for Gemini API)

### 1. Install Dependencies

```bash
cd recipe-wildcard
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Go to Settings > API and copy your project URL and anon key
4. Create a storage bucket called `recipe-images` (public)

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key

### 4. Configure Environment Variables

Edit `.env` with your credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_APP_SCHEME=recipewildcard
```

### 5. Start the App

```bash
npm start
```

Scan the QR code with Expo Go on your phone.

## Project Structure

```
recipe-wildcard/
├── app/                    # Expo Router navigation
│   ├── (auth)/             # Auth screens
│   ├── (tabs)/             # Main tab screens
│   └── (modals)/           # Modal screens
├── src/
│   ├── components/
│   │   ├── ui/             # Base UI components
│   │   ├── recipe/         # Recipe-specific components
│   │   ├── wildcard/       # Wildcard feature components
│   │   └── auth/           # Auth components
│   ├── lib/                # Core libraries (supabase, gemini)
│   ├── stores/             # Zustand stores
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   └── theme/              # Theme configuration
├── supabase-schema.sql     # Database schema
└── tailwind.config.js      # Tailwind/NativeWind config
```

## Color Palette

- **Primary** (Coral): `#FF6B6B` - Main actions
- **Secondary** (Teal): `#20C997` - Secondary actions
- **Accent** (Golden): `#FFD43B` - Highlights
- **Wildcard** (Purple): `#9775FA` - Wildcard features

## Wildcard Feature

The signature feature that suggests unexpected but scientifically-sound ingredients:

- AI analyzes your recipe ingredients
- Suggests uncommon additions (fish sauce, miso, espresso, etc.)
- Explains the food science behind why it works
- Provides usage tips and quantity suggestions

## Guest Mode

The app works without authentication:
- Browse all public recipes
- Create recipes (marked as anonymous)
- Use AI generation and Wildcard features
- Cannot save recipes or share with attribution

## License

MIT
