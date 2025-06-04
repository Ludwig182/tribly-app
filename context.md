# Tribly – Context File for AI Assistants

🧠 Purpose: Provide Claude (or any future AI agent) with full context to assist with clean, modular code generation for the Tribly app.

## 1 · General Info

- **Project Name**: Tribly (Tribute + Family)
- **Type**: Mobile app (iOS & Android)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router + React Navigation
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Architecture**: Modular (components < 200 lines)
- **Alias base**: `@` → `./src`
- **Version**: v0.4.1
- **Premium Model**: Freemium with €4.99/month family-wide premium tier

## 2 · Users & Roles

- Members: parents (admin/parent), teens (13–17), kids (6–12)
- Auth system: Firebase Auth + Test Mode
- Each user has:
  - `role`: admin / parent / child
  - `avatar`: real photo or emoji fallback
  - `tribs`: reward points system
  - `color`: personalized theme color

## 3 · Theming System

- Role-based themes:
  - `theme.adult.ts`, `theme.teen.ts`, `theme.child.ts`
- Injected via `ThemeProvider` in `app/_layout.tsx`
- Style access via `useTheme()` hook (from `src/theme/`)
- ESLint custom rule blocks raw hex colors outside the theme

## 4 · Features Completed

- ✅ Auth System (multi-mode: Google, Email, Test)
- ✅ Family Management with real-time sync
- ✅ Profile Modal with dynamic role/status/tribs
- ✅ Task system with CRUD, real-time updates, swipe gestures
- ✅ Collaborative Shopping list with category system
- ✅ HomeScreen with personalized data ("Bonjour Ludwig!")
- ✅ Avatar system with Firebase Storage & optimization
- ✅ Real-time Tribs attribution & penalties (-50% on "non faite")
- ✅ Firebase Services: `authService`, `familyService`, `tasksService`, `shoppingService`, `storageService`, `imageOptimizationService`

## 5 · Key Project Structure

tribly-app/
├── app/
│ └── _layout.tsx (auth check, ThemeProvider)
│ └── (tabs)/[calendar|tasks|shopping|family|index].tsx
├── src/
│ ├── components/
│ │ ├── tasks/, shopping/, home/, family/, auth/, common/
│ ├── hooks/
│ │ ├── useAuth.ts, useFamily.ts
│ ├── services/
│ │ ├── authService.ts, familyService.ts, tasksService.ts, etc.
│ ├── theme/
│ │ ├── theme.adult.ts, ThemeProvider.tsx, useTheme.ts
│ ├── config/
│ │ └── firebase.ts
│ ├── constants/, types/, utils/

## 6 · Firebase Schema Highlights

- `families/{familyId}/members[]`: name, role, email, firebaseUid, tribs, permissions, etc.
- `tasks/`: title, assignee, tribs, dueDate, status
- `shopping/`: item, category, addedBy, checked
- Role-based permissions enforced client + service side

## 7 · What the AI Should Respect

When generating code:
- Use React Native functional components with hooks
- All code should be in TypeScript, clean, and under 200 lines
- Imports must use `@/` alias (no `../../`)
- No hex colors → use `useTheme()` instead
- All feature logic must connect to Firebase services
- Role-based behavior (admin/parent/child) must be respected
- Prefer `FlatList` or `ScrollView` with responsiveness
- Default UI to adult theme unless context overrides

## 8 · Next Priorities (v0.4.2+)

- 🆕 AddTaskModal – task creation with Firebase write + validation
- 🆕 Push notifications for collaborative events
- 🆕 Full theming support across all screens
- 🧠 AI Assistant integration (Groq, Llama 3) for planning/menu/reminders
- 🎨 Finalize dynamic calendar view

---

🧩 Tip for Claude:
> "Read context.md, then generate a `TaskStatsCard.tsx` component showing real-time tribs earned this week per user, with color gradients by role and data from `useFamily`."

---

## 🔄 Collaboration avec l’IA (Claude)

Lorsque nous validons ensemble une **nouvelle fonctionnalité ou tâche** :

➡️ Tu dois **automatiquement me demander** :  
**“Souhaites-tu que je mette à jour le fichier `context.md` avec cette nouvelle information ?”**

Si je réponds oui :
- Tu mets à jour `context.md` à la racine.
- Tu ajoutes la fonctionnalité à la bonne section (Features, Architecture, Firebase, etc.).
- Tu respectes le formatage Markdown propre, modulaire et à jour.

🎯 Objectif : garder une documentation technique fiable, évolutive, et toujours alignée sur la réalité du projet.
