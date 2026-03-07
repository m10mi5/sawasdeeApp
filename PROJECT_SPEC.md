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
    └── utils.ts        # shuffleArray<T>() pure function
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

### Content — 163 vocabulary items

Sourced from `book/vocabulary.csv`. Covers greetings, pronouns, particles, places, food, travel, numbers, colours, body parts, time, weather, and common expressions.

| Grammar | Approximate count |
|---|---|
| noun | ~40 |
| verb | ~15 |
| adjective | ~20 |
| phrase | ~25 |
| pronoun | ~5 |
| particle | ~5 |
| adverb | ~5 |

---

## Data — `speakingChallenges.ts`

### Interface

```ts
export interface SpeakingChallenge {
  prompt: string;                             // English prompt, e.g. 'I want to eat pad thai'
  thai: string;                               // Thai script answer, e.g. 'อยากกินผัดไทย'
  latinised: string;                          // Romanised answer, e.g. 'yàak gin phàt thai'
  category: 'modals' | 'directions' | 'food-ordering';
}
```

### Content — 46 speaking challenges

| Category | Count | Examples |
|---|---|---|
| modals | 15 | "I want to eat pad thai", "Can you speak Thai?", "I must go now" |
| directions | 15 | "Where is the train station?", "Turn left at the market", "Is it far?" |
| food-ordering | 16 | "I'd like fried rice, please", "Not too spicy", "Check, please" |

---

## Shared Type

```ts
// Defined and exported from App.tsx
export type FlashcardItem = Consonant | TonalRule | Vowel;
```

Discriminant chain in `Card`:

1. `'character' in item` → `Consonant`
2. `item.type === 'vowel'` → `Vowel`
3. else (`item.type === 'rule'`) → `TonalRule`

---

## Shuffle Logic — `utils.ts`

```ts
export function shuffleArray<T>(array: T[]): T[]
```

- Implements the **Fisher-Yates (Knuth)** algorithm.
- Operates on a **copy** of the input — the original array is never mutated.
- Returns the shuffled copy.
- Exported as a standalone pure function so it can be unit-tested in isolation.

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
| `showAnswer` | `boolean` | Whether the Thai + latinised answer is visible (default `false`) |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- `<SpeakingCard item={deck[currentIndex]} showAnswer={showAnswer} />`
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

**Props**: `{ item: SpeakingChallenge; showAnswer: boolean }`

| Element | Detail | data-testid | Always visible |
|---|---|---|---|
| Category label | Uppercase, blue (#1565c0), `font-size: 12px`; fixed `height: 18px`, `overflow: hidden` | `speaking-category` | yes |
| English prompt | `font-size: clamp(20px, 5vw, 28px)`, bold; fixed `height: 36px`, `overflow: hidden` — main card face | — | yes |
| Thai answer | `font-size: clamp(22px, 5vw, 32px)`, bold blue (#1a237e); fixed `height: 40px`, `overflow: hidden`; hidden via CSS class `hidden` when `!showAnswer` | `speaking-thai` | no |
| Latinised answer | `font-size: 16px`, italic grey (#555); fixed `height: 22px`, `overflow: hidden`; hidden via CSS class `hidden` when `!showAnswer` | `speaking-latinised` | no |

The speaking card uses CSS classes `.card .speaking-card`. Every row has a fixed `height` and `overflow: hidden`, so card dimensions are identical regardless of text length. The card uses `flex: 1` (inherited from `.card`) to fill available vertical space, same as all other card types.

### `VocabularyDeck`

**Props**: `{ onBack: () => void }`

**State**

| Variable | Type | Description |
|---|---|---|
| `deck` | `VocabItem[]` | `shuffleArray(VOCABULARY)` — reshuffled on mount and on restart/shuffle |
| `currentIndex` | `number` | Zero-based index of the card being shown |
| `showEnglish` | `boolean` | Whether the English translation and grammar are visible (default `false`) |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- `<VocabCard item={deck[currentIndex]} showEnglish={showEnglish} />`
- **▶ Listen** button — calls `speakThai(item.thai)`; `data-testid="play-btn"`
- **Show/Hide English** toggle — label reads "Hide English" when visible, "Show English" when hidden; `data-testid="toggle-english-btn"`
- **Previous / Next** row — Previous disabled at index 0
- **Back to Start / Shuffle Deck** row — Back to Start disabled at index 0
- **Back to Menu** button — calls `onBack`

*Deck Complete screen* (shown when `isDeckComplete`):

- Text: "Deck Complete!"
- "Start Again" button — reshuffles and resets index
- "Back to Menu" button — calls `onBack`

### `VocabCard`

**Props**: `{ item: VocabItem; showEnglish: boolean }`

| Element | Detail | data-testid | Always visible |
|---|---|---|---|
| Latinised text | `font-size: clamp(22px, 5vw, 32px)`, bold; fixed `height: 40px`, `overflow: hidden` — main card face | — | yes |
| Thai script | `font-size: 16px`, grey (#555); fixed `height: 22px`, `overflow: hidden` — below latinised | — | yes |
| English translation | `font-size: 16px`, blue (#1a237e); fixed `height: 22px`, `overflow: hidden`; hidden via CSS class `hidden` when `!showEnglish` | `vocab-english` | no |
| Grammar label | `font-size: 13px`, italic grey (#888); fixed `height: 18px`, `overflow: hidden`; hidden via CSS class `hidden` when `!showEnglish` | `vocab-grammar` | no |

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
| `showDetails` | `boolean` | Whether the detail fields are visible (default `true`) |

**Derived**

```ts
const isDeckComplete = currentIndex >= deck.length;
```

**Screens**

*Flashcard screen* (shown while `!isDeckComplete`):

- `<Card item={deck[currentIndex]} showDetails={showDetails} />`
- **▶ Listen** button — calls `speakThai(text)` where `text` is `item.thaiName` for consonants, `item.symbol` for vowels, or `item.thaiWord` for tonal rules; `data-testid="play-btn"`
- **Show/Hide Details** toggle — label reads "Hide Details" when visible, "Show Details" when hidden
- **Previous / Next** row — Previous disabled at index 0
- **Back to Start / Shuffle Deck** row — Back to Start disabled at index 0
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
| Shows vocabulary deck | After clicking "Vocabulary", "Show English" toggle is visible |
| Navigates to vocabulary deck and back | After Vocabulary → Back to Menu, home buttons are visible |
| Navigates to speaking deck | After clicking "Speaking", "Show Answer" toggle is visible |
| Navigates to speaking deck and back | After Speaking → Back to Menu, home buttons are visible |
| Shows placeholder for Pronunciation | After clicking "Pronunciation", "Coming soon" is visible |
| Returns from placeholder to home | After Pronunciation → Back, home buttons are visible |

#### 2b. `<VocabularyDeck />` (8 tests)

| Test | Assertion |
|---|---|
| Shows latinised text | `.vocab-latinised` contains a value from `VOCABULARY` |
| Shows Thai script | `.vocab-thai` contains a value from `VOCABULARY` |
| Hides english by default | `vocab-english` and `vocab-grammar` have CSS class `hidden` |
| Shows english after toggle | After "Show English", `vocab-english` loses `hidden` class |
| Hides english on re-toggle | After show then "Hide English", `vocab-english` regains `hidden` class |
| Advances to next card | After Next, `.vocab-latinised` text changes |
| Speaks Thai on play | `speakThai` called with a value from `VOCABULARY.map(v => v.thai)` |
| Deck Complete after all cards | After clicking Next `VOCABULARY.length` times, "Deck Complete!" is visible |

#### 2c. `<SpeakingDeck />` (8 tests)

| Test | Assertion |
|---|---|
| Shows English prompt | `.speaking-prompt` contains a value from `SPEAKING_CHALLENGES` |
| Shows a category label | `speaking-category` contains one of "Modal Verbs", "Directions", "Food Ordering" |
| Hides Thai and latinised by default | `speaking-thai` and `speaking-latinised` have CSS class `hidden` |
| Shows answer after toggle | After "Show Answer", `speaking-thai` loses `hidden` class |
| Hides answer on re-toggle | After show then "Hide Answer", `speaking-thai` regains `hidden` class |
| Advances to next card and hides answer | After Show Answer + Next, prompt changes and answer is hidden again |
| Speaks Thai on play | `speakThai` called with a value from `SPEAKING_CHALLENGES.map(c => c.thai)` |
| Deck Complete after all cards | After clicking Next `SPEAKING_CHALLENGES.length` times, "Deck Complete!" is visible |

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
| Hides vowel detail labels | After "Hide Details", `vowel-length-label`, `vowel-name-label`, `vowel-romanisation-label` all have CSS class `hidden` |

#### 5. Play button (3 tests)

| Test | Assertion |
|---|---|
| Speaks consonant thai name | `speakThai` called with a value from `CONSONANTS.map(c => c.thaiName)` |
| Speaks tonal rule thai word | `speakThai` called with a value from `TONAL_RULES.map(r => r.thaiWord)` |
| Speaks vowel symbol | `speakThai` called with a value from `VOWELS.map(v => v.symbol)` |

#### 6. Next button (2 tests)

| Test | Assertion |
|---|---|
| Advances the card | After one click the displayed character changes |
| Reaches completion | After 44 clicks "Deck Complete!" is visible |

#### 7. Previous button (2 tests)

| Test | Assertion |
|---|---|
| Disabled on first card | `prev-btn` button is `disabled` at index 0 |
| Goes back | After Next then Previous, the displayed character matches the original first card |

#### 8. Show/Hide Details toggle (4 tests)

| Test | Assertion |
|---|---|
| Visible by default | `class-label` does not have CSS class `hidden` on first render |
| Hides all detail labels | After "Hide Details", `class-label`, `name-label`, `meaning-label` all have class `hidden` |
| Button label flips | Reads "Show Details" while hidden, "Hide Details" while shown |
| Restores on re-click | After hide then show, all three labels no longer have class `hidden` |

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
