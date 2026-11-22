NutriFitora seven-tab colorful icon integration

1. BACK UP your frontend App.tsx and src/screens files.
2. Extract this ZIP into your existing frontend directory, preserving folders.
   The archive includes the full seven-tab demo version of App.tsx and its related screens.
3. If you already have the seven-tab demo running, you only need to copy:
   src/screens/NutriBottomNav.tsx and assets/navigation/*.png
   (the SVG files are editable source assets and optional at runtime).
4. From frontend run: npx expo start --web --clear
5. Sign in, switch theme, and test all seven tabs.

Icons are custom transparent PNG assets in two palettes (light/dark).
The nav stays interactive; each tab calls the existing onChange callback.
Login/registration UI is unchanged from the seven-tab demo baseline.
No API/database change is required. Demo data remains demo data.
