# PocketBill — Product Requirements Document

## Overview
PocketBill is a local-first, Android-first Expo mobile app that helps users track bills, due dates, and recurring payments. The frontend is fully functional without any backend; a minimal FastAPI scaffold exists only for future expansion and is not consumed by the app.

## User Choices (captured from human-in-the-loop)
- Theme: system-based (light + dark both fully supported)
- Currency picker in Settings: USD ($), INR (₹), EUR (€)
- Local due-date reminders: enabled
- Accent palette: Indigo/blue
- Seed data: 4 deletable sample bills on first launch

## Screens
1. **Home** – Total due, upcoming/overdue chips, unpaid bill list (sorted by due date), FAB to add.
2. **Bills** – Full list with `All / Unpaid / Paid` filter and date sort asc/desc toggle.
3. **Add / Edit Bill** (modal route `bill/[id]`) – name, amount, due-date picker, recurrence (`none`, `weekly`, `monthly`, `custom days`), notes, save + delete (edit only).
4. **Stats** – Bills-paid count, spent-this-month, progress ratio, outstanding vs paid totals.
5. **Settings** – Theme segmented control, currency picker, reminders switch, Google / Facebook UI-only placeholders, About.

## Core Functionality
- CRUD on bills, mark paid/unpaid.
- Recurring bills auto-advance the due date when marked paid (weekly / monthly / custom days).
- Overdue highlighting (red border + badge) with semantic colors.
- Local notification scheduled at 09:00 on each bill's due date (when reminders enabled).

## Data
- Persistence via AsyncStorage keys: `@pocketbill/bills/v1`, `@pocketbill/settings/v1`, `@pocketbill/seeded/v1`.
- No network calls; data never leaves the device.

## Architecture
- Expo Router with `(tabs)` group (Home / Bills / Stats / Settings) + modal route `bill/[id]`.
- Context providers: `SettingsProvider` → `ThemeProvider` → `BillsProvider`.
- Typography: Manrope via `@expo-google-fonts/manrope`.
- Icons: `@expo/vector-icons` (Ionicons).

## Auth
- Google / Facebook buttons are **UI placeholders only**. They display a "Coming soon" alert.
- No forced login. No real authentication.

## Backend (scaffold only)
- FastAPI at `/app/backend/server.py` with unchanged `/api/status` sample endpoints. Not required by the app.

## Future Enhancements
- Cloud sync with the existing FastAPI backend (opt-in after real auth is added).
- Smart categorisation + CSV export for budgeting insights.
- Per-bill reminder customization (e.g., remind 3 days before due).
