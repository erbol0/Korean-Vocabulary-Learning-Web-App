# 🇰🇷 Korean TOPIK 1 Vocabulary Learning App

A modern web app for learning **Korean TOPIK Level 1 vocabulary** through flashcards, quizzes, games, and progress tracking.

## ✨ Features

* 📚 **Vocabulary Library** — Import, search, filter, and organize words
* 🃏 **Flashcards** — Learn with spaced repetition
* 🎮 **Mini Games**

  * Multiple Choice Quiz
  * Listening Practice
  * Typing Practice
  * Matching Pairs
  * Speed Run
* 🔊 **Korean Pronunciation** — Text-to-speech using the Web Speech API
* 📊 **Progress Tracking** — Track learning progress and achievements
* 🌙 **Dark / Light Mode**
* 📱 **Responsive & Accessible** — Works on desktop and mobile
* 📦 **PWA Support** — Installable with offline capabilities

## 🛠️ Tech Stack

* **Next.js 14+** — App Router
* **TypeScript** — Strict mode
* **TailwindCSS + shadcn/ui** — UI
* **Zustand** — State management
* **Dexie + IndexedDB** — Local database
* **Web Speech API** — Korean TTS
* **Lucide React** — Icons
* **Vercel** — Deployment

## 🚀 Getting Started

### Requirements

* Node.js 18+
* npm or yarn

### Installation

```bash
git clone <repository-url>
cd topik_learn
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

## 📚 Sample Vocabulary

The app includes **50 sample Korean words**, covering:

* Greetings
* Family
* Common verbs
* Question words
* Basic adjectives

Use **Load Sample Data** on the Import page to get started.

## 📥 Import Data

Supported formats:

* `.tsv`
* `.csv`
* Copy/paste from Excel or Google Sheets

Each word can include:

| Field         | Description             |
| ------------- | ----------------------- |
| STT           | Word number             |
| Korean        | Korean word or phrase   |
| Meaning       | English translation     |
| Level         | TOPIK level             |
| Tags          | Vocabulary categories   |
| Pronunciation | Romanized pronunciation |

## 📁 Project Structure

```text
/app          # Pages and routes
/components   # Reusable UI components
/lib          # Types, database, and utilities
/stores       # Zustand stores
/utils        # Speech, romanization, SRS, import tools
/data         # Sample vocabulary
```

## 🧠 Learning System

The app uses **spaced repetition based on the SM-2 algorithm** to schedule reviews according to your performance.

It also provides:

* Korean audio playback
* Adjustable playback speed
* Learning statistics
* Category performance
* Achievements and milestones

## 🌐 Deployment

### Vercel

```bash
npx vercel
```

Or build locally:

```bash
npm run build
npm start
```

No environment variables are required for basic functionality.

## 📌 Current Status

**v1.0.0**

* ✅ Next.js + TypeScript setup
* ✅ Vocabulary import and management
* ✅ Korean text-to-speech
* ✅ Responsive UI
* ✅ Dark/light mode
* ✅ IndexedDB storage
* ✅ 50 sample words
* 🔄 Flashcards
* 🔄 Learning games
* 🔄 PWA features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests when needed
5. Submit a pull request

---

**Happy Learning! 🇰🇷 화이팅!**
