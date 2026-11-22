NutriFitora time-based greeting update

Updated: src/screens/HomeScreen.tsx, src/screens/NutriPageHeader.tsx
New: src/screens/useTimeGreeting.ts

Extract into frontend, keeping directory structure. Login and registration are unchanged.

Greeting by DEVICE LOCAL TIME:
05:00–11:59 Good Morning
12:00–16:59 Good Afternoon
17:00–20:59 Good Evening
21:00–04:59 Good Night

Refreshes every 60 seconds and when the app becomes active.
Run: npx expo start --web --clear
Git: git add src/screens/HomeScreen.tsx src/screens/NutriPageHeader.tsx src/screens/useTimeGreeting.ts
