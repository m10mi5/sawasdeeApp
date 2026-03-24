# Sawasdee App — Project Specification

## Overview

**Sawasdee App** — a web-only flashcard application for studying Thai script, vocabulary, and exercises. Hosted on **GitHub Pages** as a static single-page app, built and deployed via **GitHub Actions** on merge to `main`. Core progression state is client-side only (React state), and the user-curated **Improvement Needed** list is cached in localStorage with versioned invalidation.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Build tool | Vite |
| Language | TypeScript |
| UI library | React (plain DOM) |
| Styling | CSS (src/styles.css) |
| State management | React Hooks (`useState`) |
| Audio | MP3 files from school website, Web Speech API fallback |
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
├── README.md           # User-facing setup and usage instructions
├── PROJECT_SPEC.md     # This file
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── deploy.yml  # GHA: build + deploy to GitHub Pages on merge
├── public/
│   └── audio/              # 913 MP3 audio files scraped from school website
├── book/
│   ├── scraped_vocab.json      # Raw scraped data (946 items across 16 categories)
│   ├── scrape_vocab.py         # Python scraper for poc.li.cmu.ac.th/vocab/
│   ├── download_audio.py       # Audio file downloader
│   ├── generate_ts.py          # TypeScript data file generator
│   ├── classify_grammar.py     # Grammar (part-of-speech) classifier for vocab items
│   ├── grammar_map.json        # Generated grammar labels per category
│   ├── speaking_challenges_and_vocabulary.csv # Combined export (175 speaking challenges + 770 vocabulary items)
│   ├── vocabulary.csv          # 263 vocabulary entries (archived, replaced by scraped data)
│   ├── vocabulary_old.csv      # Previous vocabulary extraction (archived)
│   ├── exercises.csv           # 73 translation exercises (archived, replaced by scraped data)
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
    ├── excercices.ts   # EXERCISES array + Exercise interface
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
  rare?: boolean;          // Archaic or rarely-used consonant, hidden by default in FlashcardDeck
}
```

9 consonants are marked `rare: true`: ฃ (Kho Khuat), ฅ (Kho Khon), ฆ (Kho Rakhang), ฌ (Cho Choe), ฎ (Do Chada), ฏ (To Patak), ฑ (Tho Montho), ฒ (Tho Phuthao), ฬ (Lo Chula). The remaining 35 are shown by default.

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
  ruleLabel:      string;   // e.g. 'Mid Class + Live + Long Vowel' — shown on card front
  thaiWord:       string;   // Thai example word, e.g. 'ตา'
  romanisation:   string;   // Latinised with tonal diacritic: à low · â falling · á high · ǎ rising · unmarked = mid
  meaning:        string;   // English gloss, e.g. 'eye'
  tone:           string;   // Resulting tone name, e.g. 'Mid Tone'
  consonantThai:  string;   // Consonant name in Thai, e.g. 'กอ ไก่'
  consonantLatin: string;   // Consonant name romanised, e.g. 'Ko Kai'
  toneMarkThai?:  string;   // Tone mark name in Thai, e.g. 'ไม้เอก' — omitted for unmarked syllables
  toneMarkLatin?: string;   // Tone mark name romanised, e.g. 'Mai Ek' — omitted for unmarked syllables
  audio?:         string;   // Audio filename in public/audio/ for the example word
  type: 'rule';
}
```

### Content — 17 tonal rules

All example words are sourced from `vocabulary.ts` and have matching MP3 recordings in `public/audio/`. Rule labels distinguish live syllables (ending in a sonorant or long vowel) from dead syllables (ending in a stop consonant like ก, บ, ด, or a short vowel).

Tonal diacritic key: `à` low · `â` falling · `á` high · `ǎ` rising · *(unmarked)* mid

| Rule | Thai | Romanisation | Meaning | Tone | Audio |
|---|---|---|---|---|---|
| Mid Class + Live + Long Vowel | ตา | dtaa | eye | Mid Tone | ✓ |
| Mid Class + Dead + Short Vowel | กับ | gàp | with | Low Tone | ✓ |
| Mid Class + Dead + Long Vowel | ปาก | bpàak | mouth | Low Tone | ✓ |
| Mid Class + Mai Ek (่) | เก่า | gào | old (things) | Low Tone | ✓ |
| Mid Class + Mai Tho (้) | บ้าน | bâan | house | Falling Tone | ✓ |
| Mid Class + Mai Tri (๊) | ตุ๊กตุ๊ก | dtúk dtúk | tricycle taxi | High Tone | ✓ |
| Mid Class + Mai Chattawa (๋) | ตั๋ว | dtǔa | ticket | Rising Tone | ✓ |
| High Class + Live + Long Vowel | สาม | sǎam | 3 | Rising Tone | ✓ |
| High Class + Dead + Short Vowel | สิบ | sìp | 10 | Low Tone | ✓ |
| High Class + Dead + Long Vowel | ถูก | tùuk | cheap | Low Tone | ✓ |
| High Class + Mai Ek (่) | สี่ | sìi | 4 | Low Tone | ✓ |
| High Class + Mai Tho (้) | ข้าว | kâow | rice | Falling Tone | ✓ |
| Low Class + Live + Long Vowel | มา | maa | to come | Mid Tone | ✓ |
| Low Class + Dead + Short Vowel | คะ | ká | polite particle (f.) | High Tone | ✓ |
| Low Class + Dead + Long Vowel | มาก | mâak | very / a lot | Falling Tone | ✓ |
| Low Class + Mai Ek (่) | แม่ | mâe | mother | Falling Tone | ✓ |
| Low Class + Mai Tho (้) | น้ำ | naám | water | High Tone | ✓ |

---

## Data — `vowels.ts`

### Interface

```ts
export interface Vowel {
  symbol:          string;               // Vowel placed on ก, e.g. 'กา', 'กิ', 'เก'
  thaiName:        string;               // Thai name, e.g. 'สระ อา'
  name:            string;               // Romanised name, e.g. 'Sara Aa'
  romanisation:    string;               // Phonetic value, e.g. 'aa'
  length:          'Short' | 'Long' | 'Diphthong' | 'Special';
  exampleWord:     string;               // Real Thai word demonstrating the vowel
  exampleMeaning:  string;               // English meaning of example word
  exampleRomanisation?: string;           // Romanised pronunciation from vocabulary.ts
  audio?:          string;               // Audio filename in public/audio/ for the example word
  closedSymbol?:   string;               // Vowel form in a closed syllable (with final consonant)
  rare?:           boolean;              // Rare vowel form, hidden by default in FlashcardDeck
  type: 'vowel';
}
```

4 vowels are marked `rare: true`: เกอะ (Sara Oe short), เกียะ (Sara Ia short), เกือะ (Sara Uea short), กัวะ (Sara Ua short). These are the short forms of diphthong vowels that are extremely uncommon in modern Thai. The remaining 24 vowels are shown by default.

### Content — 28 vowels (12 short + 12 long + 4 special)

Most vowels have an `audio` field pointing to a recorded MP3 in `public/audio/`. When pressed, the play button speaks the example word using the recording (falls back to TTS when no audio is available).

Vowels whose written form changes in closed syllables (vowel + final consonant) have a `closedSymbol` field. The card renders both forms: `กะ / กัก`. These are Sara A (อะ→อั), Sara E (เอะ→เ-็), Sara Ae (แอะ→แ-็), Sara O (โอะ→implicit), Sara Uue (อือ→อื-), Sara Oe (เออ→เ-ิ-), and Sara Ua (อัว→-ว-).

| # | Symbol | Closed | Thai Name | Name | Sound | Length | Example | Meaning | Audio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | กะ | กัก | สระ อะ | Sara A | a | Short | คะ | polite particle (female) | ✓ |
| 2 | กิ | – | สระ อิ | Sara I | i | Short | กิน | to eat | ✓ |
| 3 | กึ | – | สระ อึ | Sara Ue | ue | Short | คิดถึง | to miss | ✓ |
| 4 | กุ | – | สระ อุ | Sara U | u | Short | คุณ | you | ✓ |
| 5 | เกะ | เก็ก | สระ เอะ | Sara E | e | Short | เจ็บ | hurt / injured | ✓ |
| 6 | แกะ | แก็ก | สระ แอะ | Sara Ae | ae | Short | น้ำแข็ง | ice | ✓ |
| 7 | โกะ | กก | สระ โอะ | Sara O | o | Short | น้ำตก | waterfall | ✓ |
| 8 | เกาะ | – | สระ เอาะ | Sara Aw | aw | Short | เพราะว่า | because | ✓ |
| 9 | เกอะ | – | สระ เออะ | Sara Oe (short) | oe | Short | เลอะ | messy / smeared | – |
| 10 | เกียะ | – | สระ เอียะ | Sara Ia (short) | ia | Short | เกียะ | wooden clog | – |
| 11 | เกือะ | – | สระ เอือะ | Sara Uea (short) | uea | Short | เกือะ | (rare vowel) | – |
| 12 | กัวะ | – | สระ อัวะ | Sara Ua (short) | ua | Short | ผัวะ | sound of bursting | – |
| 13 | กา | – | สระ อา | Sara Aa | aa | Long | มา | come | ✓ |
| 14 | กี | – | สระ อี | Sara Ii | ii | Long | ดี | good / well | ✓ |
| 15 | กือ | กืน | สระ อือ | Sara Uue | uue | Long | มือ | hand | ✓ |
| 16 | กู | – | สระ อู | Sara Uu | uu | Long | ดู | to watch | ✓ |
| 17 | เก | – | สระ เอ | Sara Ee | ee | Long | เก่า | old (things) | ✓ |
| 18 | แก | – | สระ แอ | Sara Aae | aae | Long | แม่ | mother | ✓ |
| 19 | โก | – | สระ โอ | Sara Oo | oo | Long | โรง | big building | ✓ |
| 20 | กอ | – | สระ ออ | Sara Aaw | aaw | Long | รอ | to wait | ✓ |
| 21 | เกอ | เกิน | สระ เออ | Sara Oe | oe | Long | เจอ | to meet | ✓ |
| 22 | เกีย | – | สระ เอีย | Sara Ia | ia | Long | เบียร์ | beer | ✓ |
| 23 | เกือ | – | สระ เอือ | Sara Uea | uea | Long | เดือน | month | ✓ |
| 24 | กัว | กวก | สระ อัว | Sara Ua | ua | Long | กลัว | afraid | ✓ |
| 25 | ไก | – | ไม้มลาย | Mai Malai | ai | Special | ไก่ | chicken | ✓ |
| 26 | ใก | – | ไม้ม้วน | Mai Muan | ai | Special | ใจ | heart | ✓ |
| 27 | เกา | – | สระ เอา | Sara Ao | ao | Special | เขา | he / she / they | ✓ |
| 28 | กำ | – | สระ อำ | Sara Am | am | Special | ทำ | to do / make | ✓ |

---

## Data — `vocabulary.ts`

### Type

```ts
export type VocabularyCategory = 'introduction' | 'greeting' | 'places' | 'daily-activities' | 'numbers' | 'food-and-drink' | 'days-and-months' | 'period-of-time' | 'family' | 'occupations' | 'fruits' | 'feeling-and-adjective' | 'color' | 'parts-of-body' | 'transportation';

export const VOCABULARY_CATEGORIES: { id: VocabularyCategory; label: string }[] = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'greeting', label: 'Greeting' },
    { id: 'places', label: 'Places' },
    { id: 'daily-activities', label: 'Daily Activities' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'food-and-drink', label: 'Food and Drink' },
    { id: 'days-and-months', label: 'Days and Months' },
    { id: 'period-of-time', label: 'Period of Time' },
    { id: 'family', label: 'Family' },
    { id: 'occupations', label: 'Occupations' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'feeling-and-adjective', label: 'Feeling and Adjective' },
    { id: 'color', label: 'Color' },
    { id: 'parts-of-body', label: 'Parts of Body' },
    { id: 'transportation', label: 'Transportation' },
];
```

### Interface

```ts
export type Grammar = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'particle' | 'number' | 'phrase';

export interface VocabItem {
  english: string;              // English translation, e.g. 'well / comfortable'
  thai: string;                 // Thai script, e.g. 'สบาย'
  latinised: string;            // Romanised pronunciation, e.g. 'sà baai'
  grammar: Grammar;             // Part-of-speech label, e.g. 'noun', 'verb'
  category: VocabularyCategory; // Vocabulary category for deck filtering
  audio?: string;               // Audio filename in public/audio/, e.g. '2023-05-16-11-30-50intro-session1_45.mp3'
}
```

### Content — 770 vocabulary items

Sourced from https://poc.li.cmu.ac.th/vocab/ (scraped via `book/scrape_vocab.py`). Each item has an associated MP3 audio recording. Items are classified as vocabulary when they are single words, simple phrases, common expressions, or definitions (vs full sentences which become exercises). Classification uses pattern-matching heuristics in `book/generate_ts.py`.

| Category | Count |
|---|---|
| food-and-drink | 84 |
| greeting | 78 |
| daily-activities | 78 |
| numbers | 78 |
| places | 60 |
| feeling-and-adjective | 50 |
| parts-of-body | 49 |
| period-of-time | 47 |
| occupations | 45 |
| days-and-months | 44 |
| family | 36 |
| transportation | 35 |
| introduction | 34 |
| fruits | 29 |
| color | 23 |

---



---

## Data — `excercices.ts`

### Type

```ts
export type ExerciseCategory = 'greeting' | 'places' | 'daily-activities' | 'numbers' | 'food-and-drink' | 'days-and-months' | 'period-of-time' | 'family' | 'occupations' | 'fruits' | 'feeling-and-adjective' | 'color' | 'parts-of-body' | 'transportation';

export const EXERCISE_CATEGORIES: { id: ExerciseCategory; label: string }[] = [
    { id: 'greeting', label: 'Greeting' },
    { id: 'places', label: 'Places' },
    { id: 'daily-activities', label: 'Daily Activities' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'food-and-drink', label: 'Food and Drink' },
    { id: 'days-and-months', label: 'Days and Months' },
    { id: 'period-of-time', label: 'Period of Time' },
    { id: 'family', label: 'Family' },
    { id: 'occupations', label: 'Occupations' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'feeling-and-adjective', label: 'Feeling and Adjective' },
    { id: 'color', label: 'Color' },
    { id: 'parts-of-body', label: 'Parts of Body' },
    { id: 'transportation', label: 'Transportation' },
];
```

Exercise categories match the school website lessons (14 of 15 categories have sentence-level items).

### Interface

```ts
export interface Exercise {
  prompt: string;                             // English prompt, e.g. 'How are you?'
  thai: string;                               // Thai script answer, e.g. 'สบายดีไหม'
  latinised: string;                          // Romanised answer, e.g. 'kun sa baai dii mái ká(?)'
  category: ExerciseCategory;                 // Exercise category for deck filtering
  audio?: string;                             // Audio filename in public/audio/
}
```

### Content — 175 exercises

Sentence-level translation exercises sourced from https://poc.li.cmu.ac.th/vocab/. Items are classified as exercises when they form complete sentences with subject-verb structure, questions, or imperative statements. Classification uses pattern-matching heuristics in `book/generate_ts.py`. Each has an associated MP3 audio recording.

| Category | Count |
|---|---|
| daily-activities | 35 |
| parts-of-body | 20 |
| days-and-months | 16 |
| greeting | 15 |
| family | 15 |
| numbers | 14 |
| transportation | 12 |
| period-of-time | 10 |
| food-and-drink | 9 |
| places | 8 |
| occupations | 8 |
| color | 6 |
| fruits | 5 |
| feeling-and-adjective | 2 |

---

## Shared Type

```ts
// Defined and exported from App.tsx
export type FlashcardItem = Consonant | TonalRule | Vowel;
export type QuizDirection = 'th-to-en' | 'en-to-th';
```

`QuizDirection` controls which side of a vocabulary or exercise card is the "question" and which is the "answer":

| Direction | Question (visible) | Answer (hidden until revealed) |
|---|---|---|
| `'th-to-en'` | Thai / latinised | English |
| `'en-to-th'` | English | Latinised (primary) / Thai script (secondary) |

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
export function speakThai(text: string, audioFile?: string): void
```

- If `audioFile` is provided, plays the corresponding MP3 from `public/audio/` using the HTML5 `Audio` API.
- Audio path is resolved relative to `import.meta.env.BASE_URL` for correct GitHub Pages deployment.
- Falls back to the browser's **Web Speech API** (`SpeechSynthesisUtterance`) if no audio file is provided.
- Sets `utterance.lang = 'th'` for Thai TTS pronunciation.
- Calls `window.speechSynthesis.cancel()` before each `speak()` to prevent Chrome's speech queue from getting stuck.
- Falls back silently if `window.speechSynthesis` is unavailable.

### Audio files

913 MP3 files stored in `public/audio/`, scraped from `https://poc.li.cmu.ac.th/vocab/pages/teacheradmin/soundmp3/`. Each vocabulary item and exercise references its audio file via the optional `audio` field. 2 items on the school website had broken audio URLs (404) and fall back to TTS.

---

## Application Logic — `App.tsx`

### Architecture

`App.tsx` now contains all deck orchestration plus improvement-list infrastructure:

| Component / Function | Role |
|---|---|
| `App` | Root screen router + cache-backed improvement selection state + toast notification rendering |
| `ScriptScreen` | Script menu and dispatch to consonant/vowel/tonal `FlashcardDeck` and `WritingDeck` |
| `FlashcardDeck` | Script card deck with swipe navigation, double-tap improvement toggle, audio, detail toggle, rare item filtering |
| `VocabularyDeck` | Category-first vocab deck with direction toggle, swipe, double-tap improvement toggle |
| `ExerciseDeck` | Category-first exercise deck with direction toggle, swipe, double-tap improvement toggle |
| `WritingDeck` | Category-first writing practice deck using vocabulary items; shows English, user types Thai, show/hide answer |
| `ImprovementDeck` | New replacement for Pronunciation mode; replays user-selected cards from all decks |
| `Card`, `VocabCard`, `ExerciseCard`, `WritingCard` | Stateless renderers for script, vocab, exercise, and writing card layouts |
| `useCardGestures` | Shared gesture hook (mouse/touch): swipe plus zone-aware tap detection |
| Deck key helpers | `getVocabularyDeckKey`, `getExerciseDeckKey`, and `uniqueByStableKey` ensure each deck run contains each logical card only once before shuffling |
| Cache helpers | `loadImprovementCache`, `saveImprovementCache` (versioned localStorage payload) |

### App Modes

```ts
type AppMode = 'HOME' | 'SCRIPT' | 'VOCABULARY' | 'SPEAKING' | 'IMPROVEMENT';
```

Pronunciation has been removed from the UI and replaced by **Improvement Needed**.

### Root State (`App`)

| Variable | Type | Description |
|---|---|---|
| `mode` | `AppMode` | Current active screen |
| `improvementIds` | `Set<string>` | Selected card IDs across script/vocab/exercise |
| `notification` | `string \| null` | Toast content for add/remove/clear actions |

### Improvement Cache

- Storage key: `sawasdee-improvement-needed-cache`
- Payload shape:

```ts
interface ImprovementCachePayload {
  version: number;
  ids: string[];
}
```

- Versioned invalidation via `IMPROVEMENT_CACHE_VERSION`
- On boot: load, parse, version-check, and filter unknown IDs
- On updates: persist through `saveImprovementCache`
- Manual invalidation: **Clear List** action in `ImprovementDeck`

### Gesture UX (All Decks)

Each active card is wrapped in `.gesture-surface` and supports:

- **Swipe left**: next card
- **Swipe right**: previous card
- **Single tap (left zone)**: previous card
- **Single tap (right zone)**: next card
- **Single tap (middle zone)**: play card audio / TTS
- **Long press (middle zone)**: show/hide answer/details
- **Double tap (middle zone)**: toggle membership in Improvement Needed

Swipe completion listens for release events globally (`mouseup` / `touchend`), so navigation still triggers even when the finger/mouse release occurs slightly outside the card.

The gesture surface is `flex: 1` so cards occupy the maximum remaining vertical space.

Deck controls are rendered inside the card area as stacked inline controls below the answer/details rows:

- First button: `▶ Listen`
- Second button: show/hide solution/details button
- Card text remains vertically centered as before; controls stay below the text block
- Inline controls are borderless and colorless (transparent background, inherited text color)

No persistent instruction text is shown below cards.

### Text Normalisation Rules

English/Latin text is normalised consistently across data and rendering:

- Lowercase conversion
- Full-stop removal (`.`)
- Thai Unicode block removal from English/Latin fields
- Whitespace collapse and trim

This is applied directly in the literal `english`/`latinised` values in `src/vocabulary.ts` and `prompt`/`latinised` values in `src/excercices.ts`.

### Deck-Specific Notes

- `FlashcardDeck`, `VocabularyDeck`, and `ExerciseDeck` accept optional improvement callbacks so direct test renders remain simple.
- `VocabularyDeck` and `ExerciseDeck` keep category-selection-first flow unchanged (`deck.length === 0` => chooser screen).
- Script, vocabulary, and exercise decks deduplicate by stable content keys before shuffling, so repeated source rows do not appear multiple times in a single run.
- `ImprovementDeck` can render mixed card types (`script`, `vocabulary`, `exercise`) in one shuffled deck and preserves listen/toggle/navigation controls.
- `WritingDeck` uses vocabulary items for writing practice. A prompt mode toggle switches between English and latinised Thai as the prompt text. The user types Thai in a text input, and can show/hide the correct Thai script plus the alternate text (latinised or English, whichever is not the prompt). Categories match vocabulary categories. Items are deduplicated by a stable `writing-deck` key before shuffling.
- A fixed bottom toast (`.toast-notification`) confirms add/remove/clear operations and auto-hides after 1 second.
- Add/remove toasts use generic copy (`added to improvement needed deck` / `removed from improvement needed deck`) rather than card titles.

---

## Test Suite — `App.test.tsx`

### Environment

- Vitest + jsdom
- Testing Library (`@testing-library/react`)
- `speakThai` mocked via `vi.mock`
- `localStorage` cleared in `beforeEach` to isolate cache tests

### Current Scope

`src/App.test.tsx` contains **130 passing tests**.

Main coverage areas:

1. Utility behavior (`shuffleArray`, `autoFitStyle`)
2. Data normalisation constraints (lowercase, no Thai chars in English/Latin fields, no trailing full stops)
3. Home navigation, including Improvement Needed mode entry/exit
4. Double-tap add/remove behavior with toast notifications
5. Cache persistence across remount for Improvement Needed selections
6. Vocabulary deck flow (category, direction toggle, reveal/hide, play audio, completion)
7. Exercise deck flow (category, direction toggle, reveal/hide, play audio, completion)
8. Script deck rendering and controls (details, colors, navigation, restart)
9. Swipe gesture navigation (left/right) in flashcard flow
10. Deck deduplication behavior (duplicate source rows are collapsed before deck completion)
11. Writing deck flow (category, show/hide answer, text input, play audio, navigation, completion)
12. Rare toggle (show/hide button for consonant/vowel decks, hidden for tonal rules, toggle updates deck, all items shown when enabled)

### Core Assertions Added In This Iteration

- Improvement Needed button replaces Pronunciation on home screen
- Double-tap toggles card inclusion and emits add/remove notification text
- Selected cards appear in Improvement Needed mode
- Improvement selection survives unmount/remount using cache
- Lowercased class/length rendering remains color-mapped correctly
- Deck completion reflects unique cards only (duplicates are removed before shuffle)
- Writing deck shows English text, accepts Thai input, reveals correct answer with show/hide toggle
- Writing deck accessible via Script menu, supports category filtering and navigation

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
9. **Selective persistence** — deck position/progress remains in React state only, while the Improvement Needed selection set is cached in localStorage with versioned invalidation.
10. **Full-height cards** — all card types use `flex: 1` to fill the available vertical space, giving a uniform, modern full-screen feel. Cards use `width: calc(100vw - 32px); max-width: 400px` for near-full-width on mobile. Content is vertically centered via `justify-content: center`.
11. **Opacity-based hide** — detail labels use CSS class `hidden` (opacity: 0) rather than conditional rendering, keeping card height stable when toggling visibility.
12. **Tonal diacritic romanisation** — romanisations use vowel diacritics to encode tone (`à` low, `â` falling, `á` high, `ǎ` rising, unmarked = mid), matching common Thai-learning conventions. `toneMarkThai`/`toneMarkLatin` are optional fields; the tone-mark row in `Card` is **always rendered** but hidden via `hidden` CSS class when either `!showDetails` or `!item.toneMarkThai`, keeping card height fixed across all rule cards.
13. **Audio playback** — `speakThai()` wraps `SpeechSynthesisUtterance` with `lang = 'th'`. When an `audioFile` string is provided, it plays the MP3 from `public/audio/` instead. Vocabulary and exercise cards pass `item.audio`; vowel cards pass their `audio` field (20 of 24 non-rare vowels have recordings); tonal rule cards pass their `audio` field (all 17 rules have recordings). `getFlashcardAudio(item)` returns the audio filename for vowels and tonal rules (or `undefined` otherwise) and is used by both `FlashcardDeck` and `ImprovementDeck`.
14. **Vowel deck mirrors consonant card** — `Vowel` cards reuse the same CSS classes as consonant cards; `LENGTH_COLORS` maps Short/Long/Diphthong to the same blue/green/orange palette as CLASS_COLORS. The `symbol` field always includes ก as the base consonant so the vowel form is visible. Play button speaks the `exampleWord` (with recorded audio when available) rather than the bare symbol. The example label shows `exampleWord (exampleRomanisation) = exampleMeaning` when romanisation is available, sourced from `vocabulary.ts` to ensure phonetic accuracy.
15. **GitHub Actions CI/CD** — every push to `main` runs typecheck + tests, then builds and deploys to GitHub Pages. No manual deployment step.
16. **Category selection pattern** — VocabularyDeck and ExerciseDeck both use the same category selection pattern: `selectedCategory` state starts `null`, `deck` starts empty, a category grid screen is shown first, `startDeck(cat)` filters the data array, deduplicates by stable display key, and shuffles the unique cards; "Back to Categories" returns to the selection screen. This keeps both deck components structurally identical while preventing repeated cards in a single run.
17. **CSS consistency for selection screens** — All category selection screens and the home menu use the same CSS classes: `.category-grid` + `.category-button` (width: 100%) for the grid, and `.menu-button` for full-width action buttons. Both `.menu-button` and `.category-grid` use `width: clamp(220px, 60vw, 320px)` for responsive sizing that is proportionally narrower than cards (`calc(100vw - 32px)`, max 400px).
18. **Deck Complete button wrapper** — All deck types (including Improvement Needed) wrap completion screen buttons in a `.complete-buttons` div (flex column, gap 10px) for consistent spacing.
19. **Gesture-first review flow** — active cards support swipe navigation plus zone-based taps (left/right single-tap navigation, middle single-tap audio, middle double-tap selection) to reduce button-only interaction friction on mobile.
20. **Pronunciation replaced by review mode** — the former placeholder mode was replaced with a functional Improvement Needed deck that can replay mixed card types.
21. **Text hygiene at source and render time** — English/Latin-facing text is normalized to lowercase, cleaned of trailing full stops, and stripped of accidental Thai-block characters.
22. **Rare item toggle** — `FlashcardDeck` defaults `showRare` to `false`, filtering out consonants and vowels with `rare: true` via a `filteredData` memo. A "Show Rare" / "Hide Rare" toggle button (`data-testid="toggle-rare-btn"`) appears at the top of the deck (before the card, styled as `direction-toggle`) only when the deck contains rare items (`hasRareItems`). When the filter changes, a `useEffect` re-shuffles the deck and resets the index to prevent stale positions. Tonal rules have no rare items, so the button never appears for that deck.
