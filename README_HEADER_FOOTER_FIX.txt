NutriFitora — single greeting and consistent header/footer

Changes:
1. HomeScreen.tsx: removes the duplicate greeting in the header; retains one time-based greeting in the dashboard content.
2. DemoWellnessScreen.tsx: adds the shared branded header (logo, tagline, theme toggle, logout, customer greeting) to Plan, Log, Charts, Track, Team, Events. Existing footer is retained.
3. PrivacyPolicyScreen.tsx: accepts optional customerName/onLogout for the post-login header. The footer is already present.
4. App.tsx: supplies the header callbacks and customer name to demo tabs and post-login privacy.
5. Assessment and Programs already use NutriPageHeader and NutriPageFooter, and are unchanged.
6. Existing Login and Registration UI is unchanged.

INSTALL:
Extract this ZIP over your frontend directory, preserving folders. Back up your current files first.
If you have customized screens after the last ZIP, merge the changes rather than overwrite blindly.
Run: npx expo start --web --clear
Test Home, Plan, Log, Charts, Track, Team, Events, Assessment, Programs and Privacy in light and dark themes.

Git:
git add App.tsx src/screens/HomeScreen.tsx src/screens/DemoWellnessScreen.tsx src/screens/PrivacyPolicyScreen.tsx
git commit -m "Fix duplicate greeting and unify headers across navigation"
git push origin HEAD

Note: This code has not been executed against your local Expo project.
