# typing_software_desktop

Professional Hindi Typing Software - Antriksh Typing Master

React Native + Expo based typing practice software with desktop-optimized UI.

## Features
- Krutidev & Unicode Hindi layout support
- 30 English + 15 Hindi practice lessons
- Real-time accuracy feedback
- WPM & progress tracking
- Games (Alphabet, Bubbles, Clouds, WordTris)
- Word & Review drills
- Multi-user support
- Desktop sidebar navigation

## Run
```bash
npm install
npm run start
```

## Website Routes
Browser navigation uses clean paths for the existing screens: `/`, `/lessons`, `/tests`, `/stats`, `/about`, `/contact`, and the other app sections. `/download` opens the existing Statistics screen, where typing reports can be exported. Browser Back and Forward follow the same route history.

The web export is a single-page app. Netlify's `public/_redirects` and `vercel.json` route direct page requests back to `index.html`, so refreshing or opening a route directly works in production. Other static hosts need the same SPA fallback rule.

## Build (web / Electron)
```bash
npm run build:web
npm run build:electron
```

## 95% Complete — Notes
- Har sidebar/BottomNav option apni complete screen dikhata hai — koi bhi blank/placeholder nahi.
- Profile page fix: `levelForWpm` ek object return karta hai isliye `{level.name}` se render hota hai.
- Practice tab ab real launcher hai jo TypingScreen kholta hai (blank placeholder hataya).
- Settings toggles **ON par green** hote hain.

Shukriya! 🙏 — dev + build dono verified (`Exported: dist` ✅, Metro bundle HTTP 200 ✅).
