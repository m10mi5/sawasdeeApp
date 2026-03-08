# Sawasdee App — Project Specification

## Overview

**Sawasdee App** — a web-only flashcard application for studying Thai script. Supports multiple **decks**: Thai consonants, vowels, and tonal rules. Hosted on **GitHub Pages** as a static single-page app, built and deployed via **GitHub Actions** on merge to `main`. All state is in-memory; there is no login, no database, and no persistence between sessions.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Build tool | Vite |
| Language | TypeScript |
| UI library | React (plain DOM) |
| Styling | CSS (src/styles.css) |
| State management | React Hooks (`useState`) |
| TTS | Web Speech API (`SpeechSynthesisUtterance`, language `'th'`) |
| Test runner | Vitest |
| Component testing | @testing-library/react |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## File Structure

```
thaiscript/
├── index.html          # Vite HTML entry point
├── vite.config.ts      # Vite config (React plugin, base path)
├── vitest.config.ts    # Vitest config (jsdom environment, setup file)
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies and scripts
├── PROJECT_SPEC.md     # This file
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── deploy.yml  # GHA: build + deploy to GitHub Pages on merge
├── book/
│   ├── vocabulary.csv          # 263 vocabulary entries (latinised, thai, type, english, grammar)
│   ├── vocabulary_old.csv      # Previous vocabulary extraction (archived)
│   ├── exercises.csv           # 44 translation exercises (english, latinised, thai, category)
│   ├── ocr_extract.py          # OCR extraction script (pymupdf + tesseract)
│   ├── 1.pdf                   # Book pages: Places, Daily Activities, Numbers, Food & Drink
│   ├── 2.pdf                   # Book pages: Introduction, Greeting, Places
│   └── 3.pdf                   # Book pages: Thai Food reference
└── src/
    ├── main.tsx        # React DOM entry point
    ├── App.tsx         # Deck Selector root + FlashcardDeck + Card components
    ├── App.test.tsx    # Full test suite
    ├── styles.css      # All styles
    ├── speech.ts       # speakThai() — Web Speech API wrapper
    ├── setupTests.ts   # Vitest setup (cleanup after each test)
    ├── consonants.ts   # CONSONANTS array + Consonant interface
    ├── tonalRules.ts   # TONAL_RULES array + TonalRule interface
    ├── vowels.ts       # VOWELS array + Vowel interface
    ├── vocabulary.ts   # VOCABULARY array + VocabItem interface
    ├── speakingChallenges.ts  # SPEAKING_CHALLENGES array + SpeakingChallenge interface
    └── utils.ts        # shuffleArray<T>(), autoFitStyle() pure functions
```

---

## Data — `consonants.ts`

### Interface

```ts
export interface Consonant {
  character: string;       // Thai glyph, e.g. 'ก'
  thaiName: string;        // Full Thai name, e.g. 'กอ ไก่'
  name: string;            // Romanised name, e.g. 'Ko Kai'
  englishMeaning: string;  // Meaning of the acrophonic word, e.g. 'Chicken'
  class: 'Mid' | 'High' | 'Low';
  pair?: string | null;    // Low-class only: paired High-class character, or null if unpaired
}
```

### Content — all 44 consonants

| Class | Count | Characters |
|---|---|---|
| Mid | 9 | ก จ ด ต ฎ ฏ บ ป อ |
| High | 11 | ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห |
| Low | 24 | ค ฅ ฆ ง ช ซ ฌ ญ ณ ฑ ฒ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ |

---

## Data — `tonalRules.ts`

### Interface

```ts
export interface TonalRule {
  ruleLabel:      string;   // e.g. 'Mid Class + Long Vowel' — shown on card front
  thaiWord:       string;   // Thai example word, e.g. 'กา'
  romanisation:   string;   // Latinised with tonal diacritic: à low · â falling · á high · ǎ rising · unmarked = mid
  meaning:        string;   // English gloss, e.g. 'crow'
  tone:           string;   // Resulting tone name, e.g. 'Mid Tone (Flat)'
  consonantThai:  string;   // Consonant name in Thai, e.g. 'กอ ไก่'
  consonantLatin: string;   // Consonant name romanised, e.g. 'Ko Kai'
  toneMarkThai?:  string;   // Tone mark name in Thai, e.g. 'ไม้เอก' — omitted for unmarked syllables
  toneMarkLatin?: string;   // Tone mark name romanised, e.g. 'Mai Ek' — omitted for unmarked syllables
  type: 'rule';
}
```

### Content — 14 tonal rules

Tonal diacritic key: `à` low · `â` falling · `á` high · `ǎ` rising · *(unmarked)* mid

| Rule | Thai | Romanisation | Meaning | Tone |
|---|---|---|---|---|
| Mid Class + Long Vowel | กา | gaa | crow | Mid Tone |
| Mid Class + Short Vowel | จับ | jàp | to catch | Low Tone |
| Mid Class + Mai Ek (่) | จ่า | jàa | sergeant | Low Tone |
| Mid Class + Mai Tho (้) | จ้า | jâa | yes! (emphatic) | Falling Tone |
| Mid Class + Mai Tri (๊) | โต๊ะ | dtó | table | High Tone |
| Mid Class + Mai Chattawa (๋) | ก๋วยเตี๋ยว | gǔai dtǐao | noodles | Rising Tone |
| High Class + Long Vowel | ขา | khǎa | leg | Rising Tone |
| High Class + Short Vowel | ขับ | khàp | to drive | Low Tone |
| High Class + Mai Ek (่) | ข่า | khàa | galangal | Low Tone |
| High Class + Mai Tho (้) | ข้าว | khâao | rice | Falling Tone |
| Low Class + Long Vowel | คา | khaa | to be stuck | Mid Tone |
| Low Class + Short Vowel | คะ | khá | polite particle (f.) | High Tone |
| Low Class + Mai Ek (่) | ค่า | khâa | value / cost | Falling Tone |
| Low Class + Mai Tho (้) | ค้า | kháa | to trade | High Tone |

---

## Data — `vowels.ts`

### Interface

```ts
export interface Vowel {
  symbol:          string;               // Vowel placed on ก, e.g. 'กา', 'กิ', 'เก'
  thaiName:        string;               // Thai name, e.g. 'สระ อา'
  name:            string;               // Romanised name, e.g. 'Sara Aa'
  romanisation:    string;               // Phonetic value, e.g. 'aa'
  length:          'Short' | 'Long' | 'Diphthong';
  exampleWord:     string;               // Real Thai word demonstrating the vowel
  exampleMeaning:  string;               // English meaning of example word
  type: 'vowel';
}
```

### Content — 23 vowels

| # | Symbol | Thai Name | Name | Sound | Length | Example | Meaning |
|---|---|---|---|---|---|---|---|
| 1 | กะ | สระ อะ | Sara A | a | Short | กะทิ | coconut milk |
| 2 | กิ | สระ อิ | Sara I | i | Short | กิน | to eat |
| 3 | กึ | สระ อึ | Sara Ue | ue | Short | กึก | thud |
| 4 | กุ | สระ อุ | Sara U | u | Short | กุ้ง | shrimp |
| 5 | เกะ | สระ เอะ | Sara E | e | Short | เก็บ | to collect |
| 6 | แกะ | สระ แอะ | Sara Ae | ae | Short | แกะ | lamb |
| 7 | โกะ | สระ โอะ | Sara O | o | Short | โต๊ะ | table |
| 8 | เกาะ | สระ เอาะ | Sara Aw | aw | Short | เกาะ | island |
| 9 | กา | สระ อา | Sara Aa | aa | Long | กา | crow |
| 10 | กี | สระ อี | Sara Ii | ii | Long | กีตาร์ | guitar |
| 11 | กือ | สระ อือ | Sara Uue | uue | Long | คือ | to be / is |
| 12 | กู | สระ อู | Sara Uu | uu | Long | ดู | to watch |
| 13 | เก | สระ เอ | Sara Ee | ee | Long | เก่า | old |
| 14 | แก | สระ แอ | Sara Aae | aae | Long | แมว | cat |
| 15 | โก | สระ โอ | Sara Oo | oo | Long | โต | big |
| 16 | กอ | สระ ออ | Sara Aaw | aaw | Long | พอ | enough |
| 17 | เกีย | สระ เอีย | Sara Ia | ia | Diphthong | เบียร์ | beer |
| 18 | เกือ | สระ เอือ | Sara Uea | uea | Diphthong | เดือน | month |
| 19 | กัว | สระ อัว | Sara Ua | ua | Diphthong | วัว | cow |
| 20 | ไก | ไม้มลาย | Mai Malai | ai | Diphthong | ไก่ | chicken |
| 21 | ใก | ไม้ม้วน | Mai Muan | ai | Diphthong | ใจ | heart / mind |
| 22 | เกา | สระ เอา | Sara Ao | ao | Diphthong | เกา | to scratch |
| 23 | กำ | สระ อำ | Sara Am | am | Diphthong | ทำ | to do |

---

## Data — `vocabulary.ts`

### Interface

```ts
export interface VocabItem {
  latinised: string;            // Romanised pronunciation, e.g. 'sà baai'
  thai: string;                 // Thai script, e.g. 'สบาย'
  type: 'word' | 'expression';  // Single word or multi-word phrase
  english: string;              // English translation, e.g. 'well / comfortable'
  grammar: string;              // Part of speech: noun, verb, adjective, pronoun, particle, adverb, phrase
}
```

### Content — 263 vocabulary items

Sourced from `book/vocabulary.csv`, extracted via OCR from "Speak Thai in 15 Days" textbook PDFs. Covers greeting, places, daily activities, numbers, shopping, clothing, food & drink, and common expressions.

| Grammar | Count |
|---|---|
| noun | 114 |
| phrase | 43 |
| verb | 35 |
| adjective | 19 |
| number | 18 |
| adverb | 14 |
| pronoun | 10 |
| preposition | 4 |
| particle | 3 |
| conjunction | 2 |
| interjection | 1 |

---

## Data — `book/exercises.csv`

### Format

```
english exercise,latinised thai solution,thai script solution,category
```

### Content — 44 translation exercises

Sourced from `book/exercises.csv`, extracted from exercise sections of the textbook. Users are given an English sentence and must produce the Thai translation.

| Category | Count |
|---|---|
| places | 15 |
| numbers | 15 |
| daily-activities | 14 |

---

## Data — `speakingChallenges.ts`

### Interface

```ts
export interface SpeakingChallenge {
  prompt: string;                             // English prompt, e.g. 'I want to eat pad thai'
  thai: string;                               // Thai script answer, e.g. 'อยากกินผัดไทย'
  latinised: string;                          // Romanised answer, e.g. 'yàak gin phàt thai'
  category: 'modals' | 'directions' | 'food-ordering' | 'places' | 'daily-activities' | 'numbers';
}
```

### Content — 89 speaking challenges

| Category | Count | Examples |
|---|---|---|
| modals | 15 | "I want to eat pad thai", "Can you speak Thai?", "I must go now" |
| directions | 15 | "Where is the train station?", "Turn left at the market", "Is it far?" |
| food-ordering | 15 | "I'd like fried rice, please", "Not too spicy", "Check, please" |
| places | 15 | "Where is the bathroom?", "The restaurant is near the hotel.", "Go straight then turn left." |
| daily-activities | 14 | "Where are you going?", "We go to work.", "I like to see movie." |
| numbers | 15 | "How many baht is that one?", "Can you reduce the price?", "How old are you?" |

---

## Shared Type

```ts
// Defined and exported from App.tsx
export type FlashcardItem = Consonant | TonalRule | Vowel;
export type QuizDirection = 'th-to-en' | 'en-to-th';
```

`QuizDirection` controls which side of a vocabulary or speaking card is the "question" and which is the "answer":

| Direction | Question (visible) | Answer (hidden until revealed) |
|---|---|---|
| `'th-to-en'` | Thai / latinised | English |
| `'en-to-th'` | English | Thai / latinised |

Discriminant chain in `Card`:

1. `'character' in item` → `Consonant`
2. `item.type === 'vowel'` → `Vowel`
3. else (`item.type === 'rule'`) → `TonalRule`

---

## Utilities — `utils.ts`

```ts
export function shuffleArray<T>(array: T[]): T[]
```

- Implements the **Fisher-Yates (Knuth)** algorithm.
- Operates on a **copy** of the input — the original array is never mutated.
- Returns the shuffled copy.
- Exported as a standalone pure function so it can be unit-tested in isolation.

```ts
export function autoFitStyle(text: string, basePx: number): React.CSSProperties | undefined
```

- Returns an inline style (`{ fontSize, lineHeight }`) when `text` is too long to fit a single line at `basePx` inside the 368 px usable card width.
- Returns `undefined` for short text (CSS defaults apply).
- Uses character-count heuristic with `CHAR_RATIO = 0.55` and `MIN_FONT = 11`.
- Applied in `VocabCard` and `SpeakingCard` to every text field.

---

## Speech — `speech.ts`

```ts
export function speakThai(text: string): void
```

- Wraps the browser's **Web Speech API** (`SpeechSynthesisUtterance`).
- Sets `utterance.lang = 'th'` for Thai pronunciation.
- Calls `window.speechSynthesis.cancel()` before each `speak()` to prevent Chrome's speech queue from getting stuck.
- Falls back silently if `window.speechSynthesis` is unavailable.
- Thai TTS availability depends on the user's OS/browser having a Thai voice installed (works on Chrome/macOS/Windows; may be limited on Firefox/Linux).

---

## Application Logic — `App.tsx`

### Architecture

Three components live in `App.tsx`:

| Component | Role |
|---|---|
| `App` (default export) | Home screen — routes to practice modes via `mode` state |
| `ScriptScreen` | Script deck selector — consonants, vowels, tonal rules sub-menu |
| `PlaceholderScreen` | Generic "Coming soon" screen used by Pronunciation |
| `FlashcardDeck` (named export) | Stateful deck player; receives a `data` array and an `onBack` callback |
| `Card` | Stateless card renderer; dispatches between consonant, vowel, and rule layouts |
| `VocabularyDeck` (named export) | Stateful vocabulary deck player; uses `VOCABULARY` data directly |
| `VocabCard` | Stateless vocabulary card renderer |
| `SpeakingDeck` (named export) | Stateful speaking challenge deck player; uses `SPEAKING_CHALLENGES` data directly |
| `SpeakingCard` | Stateless speaking card renderer |

### `App` — Home Screen

**State**

| Variable | Type | Initial | Description |
|---|---|---|---|
| `mode` | `'HOME' \| 'SCRIPT' \| 'VOCABULARY' \| 'SPEAKING' \| 'PRONUNCIATION'` | `'HOME'` | Controls which practice mode is shown |

**Rendering**

| `mode` | Renders |
|---|---|
| `'HOME'` | Title ("Sawasdee App"), subtitle "Choose what to practice", four buttons: Script, Vocabulary, Speaking, Pronunciation |
| `'SCRIPT'` | `<ScriptScreen onBack={() => setMode('HOME')} />` |
| `'VOCABULARY'` | `<VocabularyDeck onBack={() => setMode('HOME')} />` |
| `'SPEAKING'` | `<SpeakingDeck onBack={() => setMode('HOME')} />` |
| `'PRONUNCIATION'` | `<PlaceholderScreen title="Pronunciation" onBack={() => setMode('HOME')} />` |

### `ScriptScreen` — Deck Selector

**Props**: `{ onBack: () => void }`

**State**

| Variable | Type | Initial | Description |
|---|---|---|---|
| `mode` | `'MENU' \| 'CONSONANTS' \| 'TONAL' \| 'VOWELS'` | `'MENU'` | Controls which deck is shown |

**Rendering**

| `mode` | Renders |
|---|---|
| `'MENU'` | Title ("Script"), subtitle, "Practice Consonants", "Practice Vowels", "Practice Tone Rules", "Back" buttons |
| `'CONSONANTS'` | `<FlashcardDeck data={CONSONANTS} onBack={() => setMode('MENU')} />` |
| `'VOWELS'` | `<FlashcardDeck data={VOWELS} onBack={() => setMode('MENU')} />` |
| `'TONAL'` | `<FlashcardDeck data={TONAL_RULES} onBack={() => setMode('MENU')} />` |

### `PlaceholderScreen`

**Props**: `{ title: string; onBack: () => void }`

Renders the title, "Coming soon" subtitle, and a "Back" button. Used only by Pronunciation mode.

### `SpeakingDeck`

**Props**: `{ onBack: () => void }`

**State**

| Variable | Type | Description |
|---|---|---|
| `deck` | `SpeakingChallenge[]` | `shuffleArray(SPEAKING_CHALLENGES)` — reshuffled on mount and on restart/shuffle |
| `currentIndex` | `number` | Zero-based index of the card being shown |
| `showAnswer` | `boolean` | Whether the answer side is visible (default `false`) |
| `direction` | `QuizDirection` | Quiz direction: `'en-to-th'` (default) or `'th-to-en'` |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- **Direction toggle** — pill button reading "EN → TH" or "TH → EN"; toggles `direction` state and resets `showAnswer` to `false`; `data-testid="toggle-direction-btn"`
- `<SpeakingCard item={deck[currentIndex]} showAnswer={showAnswer} direction={direction} />`
- **▶ Listen** button — calls `speakThai(item.thai)`; `data-testid="play-btn"`
- **Show/Hide Answer** toggle — label reads "Hide Answer" when visible, "Show Answer" when hidden; `data-testid="toggle-answer-btn"`
- **Previous / Next** row — Previous disabled at index 0; navigating resets `showAnswer` to `false`
- **Back to Start / Shuffle Deck** row — Back to Start disabled at index 0; both reset `showAnswer` to `false`
- **Back to Menu** button — calls `onBack`

*Deck Complete screen* (shown when `isDeckComplete`):

- Text: "Deck Complete!"
- "Start Again" button — reshuffles and resets index
- "Back to Menu" button — calls `onBack`

### `SpeakingCard`

**Props**: `{ item: SpeakingChallenge; showAnswer: boolean; direction: QuizDirection }`

Uses **role-based rendering**: content is assigned to question/solution slots based on `direction`, so the visual layout (CSS, position) is always the same regardless of direction. Secondary lines are conditionally rendered (not just hidden).

| Direction | Question | Question secondary | Solution | Solution secondary |
|---|---|---|---|---|
| `'en-to-th'` | `item.prompt` | *(none)* | `item.latinised` | `item.thai` |
| `'th-to-en'` | `item.thai` | `item.latinised` | `item.prompt` | *(none)* |

| Element | CSS class | Detail | data-testid | Hidden when |
|---|---|---|---|---|
| Category label | `.speaking-category` | Uppercase, blue (#1565c0), `font-size: 12px`; fixed `height: 18px` | `speaking-category` | never |
| Question | `.speaking-question` | `font-size: clamp(20px, 5vw, 28px)`, bold #111; fixed `height: 36px` | `speaking-question` | never |
| Question secondary | `.speaking-question-secondary` | `font-size: 16px`, italic #555; fixed `height: 22px` | `speaking-question-secondary` | never (conditionally rendered only in TH→EN) |
| Solution | `.speaking-solution` | `font-size: clamp(22px, 5vw, 32px)`, bold #1a237e; fixed `height: 40px` | `speaking-solution` | `!showAnswer` |
| Solution secondary | `.speaking-solution-secondary` | `font-size: 16px`, italic #555; fixed `height: 22px` | `speaking-solution-secondary` | `!showAnswer` (conditionally rendered only in EN→TH) |

The speaking card uses CSS classes `.card .speaking-card`. Every row has a fixed `height` and `overflow: hidden`, so card dimensions are identical regardless of text length. The card uses `flex: 1` (inherited from `.card`) to fill available vertical space, same as all other card types.

### `VocabularyDeck`

**Props**: `{ onBack: () => void }`

**State**

| Variable | Type | Description |
|---|---|---|
| `deck` | `VocabItem[]` | `shuffleArray(VOCABULARY)` — reshuffled on mount and on restart/shuffle |
| `currentIndex` | `number` | Zero-based index of the card being shown |
| `showAnswer` | `boolean` | Whether the answer side is visible (default `false`) |
| `direction` | `QuizDirection` | Quiz direction: `'th-to-en'` (default) or `'en-to-th'` |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- **Direction toggle** — pill button reading "TH → EN" or "EN → TH"; toggles `direction` state and resets `showAnswer` to `false`; `data-testid="toggle-direction-btn"`
- `<VocabCard item={deck[currentIndex]} showAnswer={showAnswer} direction={direction} />`
- **▶ Listen** button — calls `speakThai(item.thai)`; `data-testid="play-btn"`
- **Show/Hide solution** toggle — label reads "Hide Solution" / "Show Solution" regardless of direction; `data-testid="toggle-answer-btn"`
- **Previous / Next** row — Previous disabled at index 0; navigating resets `showAnswer` to `false`
- **Back to Start / Shuffle Deck** row — Back to Start disabled at index 0; both reset `showAnswer` to `false`
- **Back to Menu** button — calls `onBack`

*Deck Complete screen* (shown when `isDeckComplete`):

- Text: "Deck Complete!"
- "Start Again" button — reshuffles and resets index
- "Back to Menu" button — calls `onBack`

### `VocabCard`

**Props**: `{ item: VocabItem; showAnswer: boolean; direction: QuizDirection }`

Uses **role-based rendering**: content is assigned to question/solution slots based on `direction`, so the visual layout (CSS, position) is always the same regardless of direction.

| Direction | Question primary | Question secondary | Solution primary | Solution secondary |
|---|---|---|---|---|
| `'th-to-en'` | `item.latinised` | `item.thai` | `item.english` | `item.grammar` |
| `'en-to-th'` | `item.english` | `item.grammar` | `item.latinised` | `item.thai` |

| Element | CSS class | Detail | data-testid | Hidden when |
|---|---|---|---|---|
| Question primary | `.vocab-question-primary` | `font-size: clamp(22px, 5vw, 32px)`, bold #111; fixed `height: 40px` | `vocab-question-primary` | never |
| Question secondary | `.vocab-question-secondary` | `font-size: 16px`, #555; fixed `height: 22px` | `vocab-question-secondary` | never |
| Solution primary | `.vocab-solution-primary` | `font-size: 16px`, #1a237e; fixed `height: 22px` | `vocab-solution-primary` | `!showAnswer` |
| Solution secondary | `.vocab-solution-secondary` | `font-size: 13px`, italic #888; fixed `height: 18px` | `vocab-solution-secondary` | `!showAnswer` |

The vocab card uses CSS classes `.card .vocab-card`. Every row has a fixed `height` and `overflow: hidden`, so card dimensions are identical regardless of text length. The card uses `flex: 1` (inherited from `.card`) to fill available vertical space, same as all other card types.

### `FlashcardDeck` — Props

```ts
interface FlashcardDeckProps {
  data: FlashcardItem[];
  onBack: () => void;
}
```

**State**

| Variable | Type | Description |
|---|---|---|
| `deck` | `FlashcardItem[]` | `shuffleArray(data)` — reshuffled on mount and on restart/shuffle |
| `currentIndex` | `number` | Zero-based index of the card being shown |
| `showDetails` | `boolean` | Whether the detail fields are visible (default `false`) |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- `<Card item={deck[currentIndex]} showDetails={showDetails} />`
- **▶ Listen** button — calls `speakThai(text)` where `text` is `item.thaiName` for consonants, `item.symbol` for vowels, or `item.thaiWord` for tonal rules; `data-testid="play-btn"`
- **Show/Hide Details** toggle — label reads "Hide Details" when visible, "Show Details" when hidden
- **Previous / Next** row — Previous disabled at index 0; navigating resets `showDetails` to `false`
- **Back to Start / Shuffle Deck** row — Back to Start disabled at index 0; Back to Start resets `showDetails` to `false`
- **Back to Menu** button — calls `onBack`

*Deck Complete screen* (shown when `isDeckComplete`):

- Text: "Deck Complete!"
- "Start Again" button — reshuffles and resets index
- "Back to Menu" button — calls `onBack`

### `Card` — Consonant layout

Rendered when `'character' in item`:

| Element | Detail |
|---|---|
| Thai glyph | `font-size: clamp(48px, 10dvh, 72px)`, bold, centered |
| Thai name | `font-size: 20px`, centered |
| Romanised name | `data-testid="name-label"`, hidden via CSS class `hidden` (opacity: 0) when `!showDetails` |
| English meaning | `data-testid="meaning-label"`, hidden via `hidden` class when `!showDetails` |
| Class label | `data-testid="class-label"`, color-coded, hidden via `hidden` class when `!showDetails` |
| Pair label | `data-testid="pair-label"`, Low-class only; hidden when `!showDetails` or class ≠ Low |

### `Card` — Vowel layout

Rendered when `item.type === 'vowel'` (after ruling out Consonant):

| Element | Detail | data-testid |
|---|---|---|
| Symbol | `symbol` on ก, `font-size: clamp(48px, 10dvh, 72px)`, bold | — |
| Thai name | e.g. สระ อา, `font-size: 20px` | — |
| Romanised name | e.g. Sara Aa; hidden when `!showDetails` | `vowel-name-label` |
| Phonetic | e.g. aa; hidden when `!showDetails` | `vowel-romanisation-label` |
| Length label | Short / Long / Diphthong, color-coded; hidden when `!showDetails` | `vowel-length-label` |
| Example | `exampleWord = exampleMeaning`; hidden when `!showDetails` | `vowel-example-label` |

### Length Colors

| Length | Color | Hex |
|---|---|---|
| Short | Blue | `#1565c0` |
| Long | Green | `#2e7d32` |
| Diphthong | Orange | `#e65100` |

### `Card` — Tonal rule layout

Rendered when `item.type === 'rule'` (fallthrough after Consonant and Vowel checks):

All elements are always mounted; visibility is controlled exclusively via CSS class `hidden` (opacity: 0) so the card height never changes when toggling details or switching between cards with/without a tone mark.

| Element | Detail | data-testid | Always visible |
|---|---|---|---|
| Thai word | `font-size: 64px`, bold — main card face | — | yes |
| Romanisation | With tonal diacritic; hidden when `!showDetails` | `rule-romanisation` | no |
| English meaning | Italic grey; hidden when `!showDetails` | `rule-meaning` | no |
| Rule label | e.g. "Mid Class + Long Vowel"; hidden when `!showDetails` | `rule-label` | no |
| Consonant name | Thai · Latin; hidden when `!showDetails` | `rule-consonant` | no |
| Tone mark name | Thai · Latin; hidden when `!showDetails` **or** `!item.toneMarkThai` | `rule-tone-mark` | no |
| Resulting tone | Bold green; hidden when `!showDetails` | `rule-tone` | no |

The rule card uses CSS classes `card rule-card` where `rule-card` sets `height: 380px` and `justify-content: space-between`. Every row also has a fixed `height` and `overflow: hidden`, so field positions are exact and never shift between cards regardless of text length.

### Class Colors

| Class | Color | Hex |
|---|---|---|
| Mid | Green | `#2e7d32` |
| High | Red | `#c62828` |
| Low | Blue | `#1565c0` |

---

## Test Suite — `App.test.tsx`

### Test environment

- **Vitest** with **jsdom** environment
- **@testing-library/react** for rendering and querying
- `src/setupTests.ts` runs `cleanup()` after each test
- `src/speech.ts` is mocked via `vi.mock()`

### Key imports

```ts
import App, { FlashcardDeck, VocabularyDeck, SpeakingDeck } from './App';
```

`FlashcardDeck`, `VocabularyDeck`, and `SpeakingDeck` are tested directly (bypassing the menu) via helpers:

```ts
function renderDeck() {
  return render(<FlashcardDeck data={CONSONANTS} onBack={vi.fn()} />);
}
function renderVowelDeck() {
  return render(<FlashcardDeck data={VOWELS} onBack={vi.fn()} />);
}
function renderVocabDeck() {
  return render(<VocabularyDeck onBack={vi.fn()} />);
}
function renderSpeakingDeck() {
  return render(<SpeakingDeck onBack={vi.fn()} />);
}
```

### Test Groups

#### 1. `shuffleArray()` — logic unit tests (3 tests)

| Test | Assertion |
|---|---|
| Preserves length | `result.length === 44` |
| Preserves all items | Every original item is present in the result |
| Changes order | After N runs at least one result differs from the original order |

#### 2. `<App />` home screen (13 tests)

| Test | Assertion |
|---|---|
| Shows all four practice buttons on first render | "Script", "Vocabulary", "Speaking", "Pronunciation" are visible |
| Navigates to script deck menu | After clicking "Script", deck buttons are visible |
| Navigates to consonant deck via Script | After Script → Practice Consonants, a Thai glyph is visible |
| Navigates to tonal rules deck via Script | After Script → Practice Tone Rules, `/Class \+/` text is visible |
| Navigates to vowels deck via Script | After Script → Practice Vowels, `vowel-length-label` is present |
| Returns from script menu to home | After Script → Back, home buttons are visible |
| Returns from deck to script menu | After Script → deck → Back to Menu, script deck buttons visible |
| Shows vocabulary deck | After clicking "Vocabulary", "Show Answer" toggle is visible |
| Navigates to vocabulary deck and back | After Vocabulary → Back to Menu, home buttons are visible |
| Navigates to speaking deck | After clicking "Speaking", "Show Answer" toggle is visible |
| Navigates to speaking deck and back | After Speaking → Back to Menu, home buttons are visible |
| Shows placeholder for Pronunciation | After clicking "Pronunciation", "Coming soon" is visible |
| Returns from placeholder to home | After Pronunciation → Back, home buttons are visible |

#### 2b. `<VocabularyDeck />` (14 tests)

| Test | Assertion |
|---|---|
| Shows question text | `vocab-question-primary` contains a value from `VOCABULARY` |
| Shows secondary question text | `vocab-question-secondary` is present |
| Hides solution by default | `vocab-solution-primary` and `vocab-solution-secondary` have CSS class `hidden` |
| Shows solution after toggle | After "Show Answer", `vocab-solution-primary` loses `hidden` class |
| Hides solution on re-toggle | After show then "Hide Answer", `vocab-solution-primary` regains `hidden` class |
| Advances to next card and hides solution | After Show Answer + Next, question changes and solution is hidden again |
| Hides solution after pressing Previous | After Next + Show Answer + Previous, solution is hidden |
| Speaks Thai on play | `speakThai` called with a value from `VOCABULARY.map(v => v.thai)` |
| Deck Complete after all cards | After clicking Next `VOCABULARY.length` times, "Deck Complete!" is visible |
| Direction toggle defaults to TH → EN | `toggle-direction-btn` reads "TH → EN" on first render |
| Switches to EN → TH and swaps content | After toggle, question/solution swap content |
| Reveals solution in EN → TH | After toggle + "Show Answer", solution loses `hidden` class |
| Resets answer on direction change | After showing answer then toggling direction, solution is hidden again |

#### 2c. `<SpeakingDeck />` (12 tests)

| Test | Assertion |
|---|---|
| Shows question text | `speaking-question` contains a value from `SPEAKING_CHALLENGES` |
| Shows a category label | `speaking-category` contains one of "Modal Verbs", "Directions", "Food Ordering", "Places", "Daily Activities", "Numbers" |
| Hides solution by default | `speaking-solution` has CSS class `hidden` |
| Shows solution after toggle | After "Show Answer", `speaking-solution` loses `hidden` class |
| Hides answer on re-toggle | After show then "Hide Answer", `speaking-solution` regains `hidden` class |
| Advances to next card and hides answer | After Show Answer + Next, question changes and solution is hidden again |
| Speaks Thai on play | `speakThai` called with a value from `SPEAKING_CHALLENGES.map(c => c.thai)` |
| Deck Complete after all cards | After clicking Next `SPEAKING_CHALLENGES.length` times, "Deck Complete!" is visible |
| Direction toggle defaults to EN → TH | `toggle-direction-btn` reads "EN → TH" on first render |
| Switches to TH → EN and swaps content | After toggle, question shows thai, solution is hidden |
| Reveals solution in TH → EN | After toggle + "Show Answer", `speaking-solution` loses `hidden` class |
| Resets answer on direction change | After showing answer then toggling direction, solution is hidden again |

#### 2-fixed. Card text fields have fixed layout (4 tests)

| Test | Assertion |
|---|---|
| VocabularyDeck text fields render full content | All four text fields have non-empty content matching a real `VOCABULARY` item |
| SpeakingDeck text fields render full content | Question and solution text match a real `SPEAKING_CHALLENGES` item |
| autoFitStyle returns undefined for short text | Short text gets no inline style override |
| autoFitStyle returns reduced fontSize for long text | Long text gets a fontSize < basePx and >= 11 |
| autoFitStyle never goes below 11px | Very long text clamps at fontSize 11 |

#### 3. `<FlashcardDeck />` rendering (4 tests)

| Test | Assertion |
|---|---|
| Shows a Thai character | A Thai glyph text node is present on first render |
| Shows a class label | One of "Mid", "High", or "Low" is visible |
| Class label colour correct | `style.color` matches the class-to-rgb mapping |
| Shows a play button | `play-btn` element is present |

#### 4. Vowel deck rendering (4 tests)

| Test | Assertion |
|---|---|
| Shows a length label | `vowel-length-label` contains one of Short / Long / Diphthong |
| Shows the vowel name label | `vowel-name-label` is present |
| Length label colour correct | `style.color` matches the length-to-rgb mapping |
| Shows vowel detail labels | After "Show Details", `vowel-length-label`, `vowel-name-label`, `vowel-romanisation-label` all lose CSS class `hidden` |

#### 5. Play button (3 tests)

| Test | Assertion |
|---|---|
| Speaks consonant thai name | `speakThai` called with a value from `CONSONANTS.map(c => c.thaiName)` |
| Speaks tonal rule thai word | `speakThai` called with a value from `TONAL_RULES.map(r => r.thaiWord)` |
| Speaks vowel symbol | `speakThai` called with a value from `VOWELS.map(v => v.symbol)` |

#### 6. Next button (4 tests)

| Test | Assertion |
|---|---|
| Advances the card | After one click the displayed character changes |
| Resets details after Next | After Show Details + Next, `class-label` gains `hidden` class |
| Resets details after Previous | After Next + Show Details + Previous, `class-label` gains `hidden` class |
| Reaches completion | After 44 clicks "Deck Complete!" is visible |

#### 7. Previous button (2 tests)

| Test | Assertion |
|---|---|
| Disabled on first card | `prev-btn` button is `disabled` at index 0 |
| Goes back | After Next then Previous, the displayed character matches the original first card |

#### 8. Show/Hide Details toggle (4 tests)

| Test | Assertion |
|---|---|
| Hidden by default | `class-label` has CSS class `hidden` on first render |
| Shows all detail labels | After "Show Details", `class-label`, `name-label`, `meaning-label` all lose class `hidden` |
| Button label flips | Reads "Show Details" while hidden, "Hide Details" while shown |
| Hides on re-click | After show then hide, all three labels have class `hidden` again |

#### 9. Back to Start button (3 tests)

| Test | Assertion |
|---|---|
| Disabled on first card | `back-to-start-btn` disabled at index 0 |
| Returns to first card | After advancing and clicking Back to Start, the first character reappears |
| Enabled after advance | After clicking Next once, button is no longer disabled |

#### 10. Shuffle Deck button (2 tests)

| Test | Assertion |
|---|---|
| Resets position | After advancing and shuffling, `prev-btn` is disabled again |
| Stays on flashcard screen | After shuffling, "Deck Complete!" is absent; a Thai glyph is visible |

#### 11. Restart flow (3 tests)

| Test | Assertion |
|---|---|
| Hides completion screen | After completion, "Start Again" removes "Deck Complete!" |
| Shows a card again | After restart a Thai glyph is visible |
| `onBack` called on Complete screen | Clicking "Back to Menu" on the Complete screen calls `onBack` once |

---

## Deployment

The app is deployed as a static site to **GitHub Pages**.

### GitHub Actions workflow (`.github/workflows/deploy.yml`)

Triggered on push to `main`:

1. Checkout code
2. Install Node 20 + `npm ci`
3. Run `npm run ci` (typecheck + tests)
4. Run `npm run build` (Vite production build → `dist/`)
5. Upload `dist/` as a Pages artifact
6. Deploy to GitHub Pages

### Vite base path

`vite.config.ts` sets `base: '/sawasdee-app/'` to match the GitHub Pages URL pattern `https://<user>.github.io/sawasdee-app/`.

---

## Commands

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Full CI (typecheck + tests)
npm run ci

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Design Decisions

1. **TypeScript** — preferred per spec; all files use `.ts` / `.tsx` extensions.
2. **Web-only** — no native (iOS/Android) builds. The app is a static SPA hosted on GitHub Pages.
3. **Vite + React** — minimal build tooling; no framework overhead (no Next.js, no Expo).
4. **Plain CSS** — `src/styles.css` mirrors the original React Native `StyleSheet` values. No CSS-in-JS, no Tailwind.
5. **Non-mutating shuffle** — `shuffleArray` copies its input, making it safe to call with the constant data arrays.
6. **Union discriminant** — `FlashcardItem = Consonant | TonalRule | Vowel` is narrowed with `'character' in item`; no `type` tag required on `Consonant`.
7. **Exported `FlashcardDeck`** — named export allows tests to render the deck directly without going through the menu, keeping tests focused.
8. **No navigation library** — views are rendered conditionally via `mode` state; the app has no routing needs.
9. **No persistence** — restarting the app or refreshing the browser starts a fresh shuffled deck.
10. **Full-height cards** — all card types use `flex: 1` to fill the available vertical space, giving a uniform, modern full-screen feel. Cards use `width: calc(100vw - 32px); max-width: 400px` for near-full-width on mobile. Content is vertically centered via `justify-content: center`.
11. **Opacity-based hide** — detail labels use CSS class `hidden` (opacity: 0) rather than conditional rendering, keeping card height stable when toggling visibility.
12. **Tonal diacritic romanisation** — romanisations use vowel diacritics to encode tone (`à` low, `â` falling, `á` high, `ǎ` rising, unmarked = mid), matching common Thai-learning conventions. `toneMarkThai`/`toneMarkLatin` are optional fields; the tone-mark row in `Card` is **always rendered** but hidden via `hidden` CSS class when either `!showDetails` or `!item.toneMarkThai`, keeping card height fixed across all rule cards.
13. **Web Speech API TTS** — `speakThai()` wraps `SpeechSynthesisUtterance` with `lang = 'th'`; no audio asset files are needed. Thai voice availability depends on the user's OS/browser.
14. **Vowel deck mirrors consonant card** — `Vowel` cards reuse the same CSS classes as consonant cards; `LENGTH_COLORS` maps Short/Long/Diphthong to the same blue/green/orange palette as CLASS_COLORS. The `symbol` field always includes ก as the base consonant so the vowel form is visible and immediately pronounceable by TTS.
15. **GitHub Actions CI/CD** — every push to `main` runs typecheck + tests, then builds and deploys to GitHub Pages. No manual deployment step.
16. **Fixed card text field layout** — card text rows (`.vocab-question-primary`, `.speaking-question`, etc.) use a fixed CSS `height` with `overflow: hidden`. Long text is auto-shrunk via the `autoFitStyle()` utility, which reduces font size (and line-height) based on character count so text always fits in a single line. Minimum font is 11 px. This keeps card structure stable — positions of all fields are fixed regardless of content length. This invariant is enforced by CI tests in the "Card text fields have fixed layout" test group.
