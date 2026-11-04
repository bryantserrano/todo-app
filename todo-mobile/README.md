# Todo Mobile App

A native iOS/Android todo application built with Expo Router, featuring:

- **NativeTabs** - iOS and Android native tab navigation
- **Modal Screens** - Beautiful modal presentation for creating todos
- **Reanimated** - Smooth animations and transitions
- **Haptics** - Tactile feedback for user interactions
- **Supabase Integration** - Todos are stored in the Supabase `public.tasks` table

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS/Android simulator or Expo Go app for testing

### Installation

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

### Supabase sign-in setup

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's Connect panel.
These are client keys; never put a Supabase secret or service-role key in this app.
Restart Expo after changing environment variables. Email/password sign-up and sign-in
are enabled in the app. If email confirmation is enabled in Supabase Auth, confirm
the signup email before signing in.

After signing in, the app checks the session's MFA assurance level. Users without
an authenticator factor are guided through TOTP setup; users with a verified
factor must enter a current six-digit code before accessing todos. Enable TOTP
enrollment and verification in Supabase Auth settings when the database's MFA
policy is enabled.

### Running on Different Platforms

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web (development)
npm run web

# With dev client
npm run dev
```

## Project Structure

```
todo-mobile/
├── app/
│   ├── _layout.tsx          # Root layout with navigation stack
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tabs layout with NativeTabs
│   │   ├── index.tsx        # Todo list screen
│   │   └── completed.tsx    # Completed todos screen
│   └── create-todo.tsx      # Create todo modal
├── src/
│   ├── api.ts               # API client (axios)
│   └── types.ts             # TypeScript types
└── package.json
```

## Features

### Todos Tab
- View all active todos
- Tap to mark as completed
- Swipe to delete
- Tap + button to create new todo
- Loading states and empty states

### Completed Tab
- View all completed todos
- Delete completed todos
- Strikethrough styling

### Create Modal
- Beautiful modal presentation
- Title and description inputs
- Character counters
- Haptic feedback on success/error
- Keyboard handling

## Todo storage

The mobile app reads and writes todos through Supabase; it does not need the
FastAPI backend or MongoDB running. The `public.tasks` table needs `id`,
`created_at`, `user_id`, `title`, `description`, and `completed` columns, with
Row Level Security policies that restrict each operation to
`user_id = auth.uid()`.

## Development

### Testing with the web frontend

**Terminal 1 - Web Frontend:**
```bash
cd ../todo-frontend
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd todo-mobile
npm start
# Then press 'i' for iOS or 'a' for Android
```

### Using Expo Go (No Simulator)
```bash
npm start

# Scan QR code with:
# - iPhone: Camera app, tap notification
# - Android: Expo Go app
```

## Animations & Interactions

- **Tab Switches** - No animation (UI guideline: tabs are peers)
- **Todo Creation** - Scale + opacity fade-in
- **Deletions** - Fade-out with layout animation
- **Press Feedback** - Scale transform (CSS transition, no worklet needed)
- **Modal Entry** - Platform default presentation

## Styling

- **Dark Theme** - #1a1a1a background with #2a2a2a cards
- **Accent Color** - Blue (#3b82f6) for interactive elements
- **Typography** - System fonts, responsive sizing
- **Safe Area** - Respects device notches and home indicators

## Deployment

See [EAS Build Documentation](https://docs.expo.dev/build/introduction/) for building and submitting to app stores.

```bash
# Login to EAS
eas login

# Configure app
eas build:configure

# Build for production
eas build --platform ios
eas build --platform android

# Submit to App Store / Google Play
eas submit
```

## Troubleshooting

### Can't load todos
- Confirm `todo-mobile/.env.local` has the Supabase project URL and publishable key.
- Confirm the `public.tasks` table exists and has owner-based Row Level Security policies.
- Confirm you are signed in to the same Supabase project configured in the env file.

### Animations stuttering
- Test on a release build: `eas build --platform ios --auto-submit=false`
- Profile with React Native's built-in profiler

### Modal won't dismiss
- Ensure `router.back()` is being called in your modal screen

## Next Steps

- Add task filtering by category/tags
- Add due dates and reminders
- Implement task search
- Add sync status indicator
- Add offline support with local storage
