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
npx expo start --web
```

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
- Virtual keyboard bottom-docked (ScrollView ke bahar), upar **Next Key + finger guide** bar ke saath — typing session me hamesha dikhta hai.

Shukriya! 🙏 — dev + build dono verified (`Exported: dist` ✅, Metro bundle HTTP 200 ✅).
