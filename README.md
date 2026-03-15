<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c6ff,100:0072ff&height=220&section=header&text=Sawasdee%20App&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Thai%20Flashcards%20for%20Script%2C%20Vocabulary%2C%20and%20Exercises&descSize=16&descAlignY=62" alt="Sawasdee App banner" />

<p>
	<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111" alt="React 19" />
	<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=ffffff" alt="TypeScript 5.8" />
	<img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=ffffff" alt="Vite 6" />
	<img src="https://img.shields.io/badge/Vitest-3-6E9F18?style=for-the-badge&logo=vitest&logoColor=ffffff" alt="Vitest 3" />
</p>

<p>
	<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=20&pause=1200&color=0EA5E9&center=true&vCenter=true&width=700&lines=Swipe.+Tap.+Listen.+Repeat.;Build+your+Improvement+Needed+deck+as+you+learn." alt="Animated title text" />
</p>

</div>

---

```text
+----------------------------------------------------------------------------------+
| SWIPE LEFT -> NEXT | SWIPE RIGHT -> PREVIOUS                                     |
| TAP LEFT -> PREVIOUS | TAP RIGHT -> NEXT                                         |
| TAP CENTER -> LISTEN | LONG PRESS CENTER -> SHOW/HIDE                            |
| DOUBLE TAP CENTER -> IMPROVEMENT NEEDED                                          |
+----------------------------------------------------------------------------------+
```

## Live Vibe

<div align="center">
	<img src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif" alt="Animated visual accent" width="180" />
</div>

## What You Can Practice

- Script: consonants, vowels, and tone rules
- Vocabulary: category-based cards with direction toggle
- Exercises: sentence practice with direction toggle
- Improvement Needed: your personal review deck built from marked cards

## Requirements

- Node.js 20+
- npm

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Run the dev server.

```bash
npm run dev
```

3. Open the URL shown by Vite (usually http://localhost:5173).

## How To Use The App

1. Pick a mode from the home screen.
- Script
- Vocabulary
- Exercises
- Improvement Needed

2. Interact with cards using gestures.
- Swipe left: next card
- Swipe right: previous card
- Single tap left side: previous card
- Single tap right side: next card
- Single tap center: play audio
- Long press center: show or hide details/answer
- Double tap center: add/remove from Improvement Needed

3. Use in-card controls below the centered text block.
- First button: ▶ Listen
- Second button: show/hide details or solution

4. Use deck controls below the card.
- Previous / Next
- Back to Start / Shuffle Deck
- Back to Menu or Back to Categories

## Improvement Needed Mode

- Double tap any card in Script, Vocabulary, or Exercises to add it.
- Open Improvement Needed from home to review marked cards.
- Double tap a marked card again to remove it.
- The marked list is cached in browser local storage.

## Audio Behavior

- If a card has an MP3 file, the app plays that recording.
- If no MP3 is available, the app falls back to browser Thai TTS.

## Development Commands

```bash
npm run dev       # start development server
npm run build     # typecheck + production build
npm run preview   # preview production build
npm run test      # run tests
npm run typecheck # run TypeScript checks
npm run ci        # typecheck + tests
```

## Deployment

Deployment is automated with GitHub Actions and published to GitHub Pages on pushes to main.