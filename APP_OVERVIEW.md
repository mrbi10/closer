# Closer App Overview

This document describes what the app currently does based on the code in this workspace.

## What the app is

Closer is a React Native app for signing in, creating or joining shared spaces, viewing the members in a space, and chatting inside a selected space.

The app uses:

- React Native for the UI
- React Navigation for screen routing
- Zustand for app state
- AsyncStorage for session persistence
- Axios for backend requests

## Main user flows

### 1. Authentication

The app supports:

- User registration with name, email, and password
- User login with email and password
- Session restoration on app launch from stored token and user data
- Logout

Authentication state is stored in Zustand and persisted in AsyncStorage under the keys `closer_auth_token` and `closer_auth_user`.

If a token exists, the app goes straight to the main authenticated flow. If not, it shows the login/register flow.

### 2. Spaces

From the home screen, the user can:

- View their current spaces
- Pull to refresh the space list
- Create a new space
- Join an existing space by space ID
- Open a selected space
- Logout from the account

The home screen creates spaces with the name the user enters and uses `type: 'group'` by default.

### 3. Space details

When a space is opened, the app:

- Shows the space name
- Loads and displays space members
- Lets the user open the chat for that space

Member data is normalized so the screen can handle different backend response shapes.

### 4. Chat

Inside a space chat, the app can:

- Load existing messages for the selected space
- Show message sender names and timestamps when available
- Distinguish the current user’s messages when sender IDs match
- Send a new message
- Auto-scroll to the latest message

If sending fails, the typed message is restored so the user does not lose their draft.

## Screens and navigation

The real app entry is [App.js](App.js), which hydrates auth state and then renders the navigator.

Navigation is split into two flows:

- Auth flow: Login and Register
- Main flow: Home, Space, and Chat

### Auth flow

Files:

- [src/screens/auth/LoginScreen.js](src/screens/auth/LoginScreen.js)
- [src/screens/auth/RegisterScreen.js](src/screens/auth/RegisterScreen.js)
- [src/navigation/AuthNavigator.js](src/navigation/AuthNavigator.js)

### Main flow

Files:

- [src/screens/home/HomeScreen.js](src/screens/home/HomeScreen.js)
- [src/screens/space/SpaceScreen.js](src/screens/space/SpaceScreen.js)
- [src/screens/chat/ChatScreen.js](src/screens/chat/ChatScreen.js)
- [src/navigation/AppNavigator.js](src/navigation/AppNavigator.js)

## State management

### Auth store

[src/store/useAuthStore.js](src/store/useAuthStore.js) handles:

- Login
- Logout
- Session hydration from AsyncStorage
- Persisting token and user data
- Global loading and error state for auth actions

### Space store

[src/store/useSpaceStore.js](src/store/useSpaceStore.js) handles:

- Fetching the user’s spaces
- Creating a new space
- Joining an existing space
- Storing the currently selected space
- Global loading and error state for space actions

## Backend services

The app talks to a backend through the files in [src/services](src/services).

### API base URL

[src/services/api.js](src/services/api.js) currently points to a local network backend:

```text
http://192.168.29.235:5000/api
```

There is also a commented production URL in that file.

### Auth endpoints

[src/services/authService.js](src/services/authService.js)

- `POST /auth/register`
- `POST /auth/login`

### Space endpoints

[src/services/spaceService.js](src/services/spaceService.js)

- `GET /spaces/my`
- `POST /spaces/create`
- `POST /spaces/join`
- `GET /space-members/:spaceId`

### Message endpoints

[src/services/messageService.js](src/services/messageService.js)

- `GET /messages/:spaceId`
- `POST /messages/send`

## Known backend contract details

These are reflected in the service code and repository notes:

- `POST /api/spaces/create` requires both `name` and `type`
- Allowed space types are `personal`, `couple`, and `group`
- `POST /api/messages/send` expects the body key `message`, not `text`
- Message rows commonly use snake_case fields such as `message`, `sender_name`, and `created_at`
- `POST /api/spaces/join` uses `spaceId`
- `GET /api/space-members/:spaceId` returns the members for a space

## UI and layout

The app uses a shared dark theme:

- Background: deep navy
- Text: light blue-white
- Accent: bright blue
- Inputs/cards: darker navy panels with borders and shadows

Shared layout is handled by [src/components/ScreenContainer.js](src/components/ScreenContainer.js), which wraps screens in a safe area and applies consistent padding.

Theme values live in [src/utils/theme.js](src/utils/theme.js).

## Error handling

[src/utils/errorHandler.js](src/utils/errorHandler.js) normalizes error messages from API responses so the screens can show readable failures.

## Current limitations and notes

- The app currently depends on the backend being reachable at the configured IP address.
- `App.tsx` still contains the default React Native template screen, but it is not the actual runtime entry point.
- The existing automated test files are only basic render smoke tests.
- Some service and store code accepts multiple backend response shapes, which suggests the API responses may not be fully consistent yet.

## Quick feature summary

In its current form, the app can:

- Register a new account
- Log in and persist the session
- Restore a saved session on launch
- Log out
- Fetch and list the user’s spaces
- Create a new space
- Join a space by ID
- Open a space and view members
- Open a space chat
- Load and send messages in that chat
