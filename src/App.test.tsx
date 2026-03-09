import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CONSONANTS } from './consonants';
import { TONAL_RULES } from './tonalRules';
import { VOWELS } from './vowels';
import { VOCABULARY } from './vocabulary';
import { EXERCISES, EXERCISE_CATEGORIES } from './speakingChallenges';
import { VOCABULARY_CATEGORIES } from './vocabulary';
import { autoFitStyle, shuffleArray } from './utils';
import App, { FlashcardDeck, VocabularyDeck, ExerciseDeck } from './App';

vi.mock('./speech', () => ({
    speakThai: vi.fn(),
}));

import { speakThai } from './speech';

// jsdom normalises inline style hex values to rgb()
const CLASS_COLORS = { Mid: 'rgb(46, 125, 50)', High: 'rgb(198, 40, 40)', Low: 'rgb(21, 101, 192)' } as const;
const LENGTH_COLORS = { Short: 'rgb(21, 101, 192)', Long: 'rgb(46, 125, 50)', Diphthong: 'rgb(230, 81, 0)' } as const;

/** Render a consonant deck (convenience wrapper). */
function renderDeck() {
    return render(<FlashcardDeck data={CONSONANTS} onBack={vi.fn()} />);
}

/** Render a vowel deck (convenience wrapper). */
function renderVowelDeck() {
    return render(<FlashcardDeck data={VOWELS} onBack={vi.fn()} />);
}

// ── 1. shuffleArray() ─────────────────────────────────────────────────────────

describe('shuffleArray()', () => {
    it('preserves length', () => {
        expect(shuffleArray(CONSONANTS)).toHaveLength(44);
    });

    it('preserves all items', () => {
        const result = shuffleArray(CONSONANTS);
        CONSONANTS.forEach(item => {
            expect(result).toContainEqual(item);
        });
    });

    it('changes order after multiple runs', () => {
        const original = CONSONANTS.map(c => c.character).join('');
        let different = false;
        for (let i = 0; i < 10; i++) {
            const shuffled = shuffleArray(CONSONANTS).map(c => c.character).join('');
            if (shuffled !== original) {
                different = true;
                break;
            }
        }
        expect(different).toBe(true);
    });
});

// ── 1b. autoFitStyle() ────────────────────────────────────────────────────────

describe('autoFitStyle()', () => {
    it('returns undefined for short text', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        expect(autoFitStyle('hello', 28)).toBeUndefined();
    });

    it('returns a smaller fontSize for long text', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        const style = autoFitStyle('Chiang Mai University is opposite the mountain.', 28);
        expect(style).toBeDefined();
        expect(style!.fontSize).toBeLessThan(28);
        expect(style!.fontSize).toBeGreaterThanOrEqual(11);
    });
});

// ── 2. <App /> home screen ────────────────────────────────────────────────────

describe('<App /> home screen', () => {
    it('shows the four practice buttons on first render', () => {
        const { getByText } = render(<App />);
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Vocabulary')).toBeTruthy();
        expect(getByText('Exercises')).toBeTruthy();
        expect(getByText('Pronunciation')).toBeTruthy();
    });

    it('navigates to the script deck menu when "Script" is pressed', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Script'));
        expect(getByText('Practice Consonants')).toBeTruthy();
        expect(getByText('Practice Vowels')).toBeTruthy();
        expect(getByText('Practice Tone Rules')).toBeTruthy();
    });

    it('navigates to the consonant deck via Script', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Script'));
        fireEvent.click(getByText('Practice Consonants'));
        expect(getByText(/^[\u0E00-\u0E7F]$/)).toBeTruthy();
    });

    it('navigates to the tonal rules deck via Script', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Script'));
        fireEvent.click(getByText('Practice Tone Rules'));
        expect(getByText(/Class \+/)).toBeTruthy();
    });

    it('navigates to the vowels deck via Script', () => {
        const { getByText, getByTestId } = render(<App />);
        fireEvent.click(getByText('Script'));
        fireEvent.click(getByText('Practice Vowels'));
        expect(getByTestId('vowel-length-label')).toBeTruthy();
    });

    it('returns from script deck menu to home via Back', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Script'));
        fireEvent.click(getByText('Back'));
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Vocabulary')).toBeTruthy();
    });

    it('returns from deck to script menu via Back to Menu', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Script'));
        fireEvent.click(getByText('Practice Consonants'));
        fireEvent.click(getByText('Back to Menu'));
        expect(getByText('Practice Consonants')).toBeTruthy();
        expect(getByText('Practice Tone Rules')).toBeTruthy();
    });

    it('navigates to vocabulary category screen', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Vocabulary'));
        expect(getByText('Choose a category')).toBeTruthy();
        expect(getByText('All Vocabulary')).toBeTruthy();
    });

    it('navigates to vocabulary deck via All Vocabulary and back', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Vocabulary'));
        fireEvent.click(getByText('All Vocabulary'));
        expect(getByText('Show Solution')).toBeTruthy();
        fireEvent.click(getByText('Back to Categories'));
        fireEvent.click(getByText('Back'));
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Vocabulary')).toBeTruthy();
    });

    it('navigates to exercises category screen', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Exercises'));
        expect(getByText('Choose a category')).toBeTruthy();
        expect(getByText('All Exercises')).toBeTruthy();
    });

    it('navigates to exercises deck via All Exercises and back', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Exercises'));
        fireEvent.click(getByText('All Exercises'));
        expect(getByText('Show Answer')).toBeTruthy();
        fireEvent.click(getByText('Back to Categories'));
        fireEvent.click(getByText('Back'));
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Exercises')).toBeTruthy();
    });

    it('shows placeholder for Pronunciation', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Pronunciation'));
        expect(getByText('Coming soon')).toBeTruthy();
    });

    it('returns from placeholder to home via Back', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Pronunciation'));
        fireEvent.click(getByText('Back'));
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Pronunciation')).toBeTruthy();
    });
});

// ── 2b. <VocabularyDeck /> ────────────────────────────────────────────────────

function renderVocabDeck() {
    const utils = render(<VocabularyDeck onBack={vi.fn()} />);
    // Enter deck via "All Vocabulary" on category selection screen
    fireEvent.click(utils.getByText('All Vocabulary'));
    return utils;
}

describe('<VocabularyDeck />', () => {
    it('shows category selection screen on first render', () => {
        const { getByText } = render(<VocabularyDeck onBack={vi.fn()} />);
        expect(getByText('Choose a category')).toBeTruthy();
        VOCABULARY_CATEGORIES.forEach(cat => {
            expect(getByText(cat.label)).toBeTruthy();
        });
        expect(getByText('All Vocabulary')).toBeTruthy();
    });

    it('shows question text after entering deck', () => {
        const { getByTestId } = renderVocabDeck();
        const q = getByTestId('vocab-question-primary');
        expect(q).toBeTruthy();
        // Default direction is en-to-th, so question shows english
        expect(VOCABULARY.map(v => v.english)).toContain(q.textContent);
    });

    it('shows secondary question text', () => {
        const { getByTestId } = renderVocabDeck();
        const q2 = getByTestId('vocab-question-secondary');
        expect(q2).toBeTruthy();
        // Default direction is en-to-th, so secondary shows grammar
        expect(VOCABULARY.map(v => v.grammar)).toContain(q2.textContent);
    });

    it('hides solution by default', () => {
        const { getByTestId } = renderVocabDeck();
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(true);
        expect(getByTestId('vocab-solution-secondary').classList.contains('hidden')).toBe(true);
    });

    it('shows solution after pressing "Show Solution"', () => {
        const { getByText, getByTestId } = renderVocabDeck();
        fireEvent.click(getByText('Show Solution'));
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(false);
        expect(getByTestId('vocab-solution-secondary').classList.contains('hidden')).toBe(false);
    });

    it('hides solution again after pressing "Hide Solution"', () => {
        const { getByText, getByTestId } = renderVocabDeck();
        fireEvent.click(getByText('Show Solution'));
        fireEvent.click(getByText('Hide Solution'));
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(true);
    });

    it('advances to next card', () => {
        const { getByText, getByTestId } = renderVocabDeck();
        const first = getByTestId('vocab-question-primary').textContent;
        fireEvent.click(getByText('Next'));
        const second = getByTestId('vocab-question-primary').textContent;
        expect(second).not.toBe(first);
    });

    it('speaks the Thai text when play is pressed', () => {
        (speakThai as ReturnType<typeof vi.fn>).mockClear();
        const { getByTestId } = renderVocabDeck();
        fireEvent.click(getByTestId('play-btn'));
        const text = (speakThai as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(VOCABULARY.map(v => v.thai)).toContain(text);
    });

    it('shows Deck Complete after going through all cards', () => {
        const { getByText } = renderVocabDeck();
        for (let i = 0; i < VOCABULARY.length; i++) {
            fireEvent.click(getByText('Next'));
        }
        expect(getByText('Deck Complete!')).toBeTruthy();
    });

    it('shows direction toggle defaulting to EN → TH', () => {
        const { getByTestId } = renderVocabDeck();
        expect(getByTestId('toggle-direction-btn').textContent).toBe('EN → TH');
    });

    it('switches to TH → EN and swaps question/solution content', () => {
        const { getByTestId } = renderVocabDeck();
        fireEvent.click(getByTestId('toggle-direction-btn'));
        expect(getByTestId('toggle-direction-btn').textContent).toBe('TH → EN');
        // Question now shows latinised
        expect(VOCABULARY.map(v => v.latinised)).toContain(getByTestId('vocab-question-primary').textContent);
        // Solution is hidden
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(true);
        expect(getByTestId('vocab-solution-secondary').classList.contains('hidden')).toBe(true);
    });

    it('reveals solution after pressing Show Solution in TH → EN direction', () => {
        const { getByTestId, getByText } = renderVocabDeck();
        fireEvent.click(getByTestId('toggle-direction-btn'));
        fireEvent.click(getByText('Show Solution'));
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(false);
        expect(getByTestId('vocab-solution-secondary').classList.contains('hidden')).toBe(false);
    });

    it('resets answer visibility when toggling direction', () => {
        const { getByTestId, getByText } = renderVocabDeck();
        // Show answer in en-to-th
        fireEvent.click(getByText('Show Solution'));
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(false);
        // Switch direction — answer should reset to hidden
        fireEvent.click(getByTestId('toggle-direction-btn'));
        expect(getByTestId('vocab-solution-primary').classList.contains('hidden')).toBe(true);
    });

    it('filters vocabulary by category', () => {
        const { getByText, getByTestId } = render(<VocabularyDeck onBack={vi.fn()} />);
        fireEvent.click(getByText('Food'));
        const q = getByTestId('vocab-question-primary');
        const foodItems = VOCABULARY.filter(v => v.category === 'food');
        expect(foodItems.map(v => v.english)).toContain(q.textContent);
    });

    it('applies autoFitStyle on long text to prevent clipping', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        // Toggle to TH→EN so question-primary shows latinised (can be long)
        const { getByTestId, getByText } = render(<VocabularyDeck onBack={vi.fn()} />);
        fireEvent.click(getByText('All Vocabulary'));
        fireEvent.click(getByTestId('toggle-direction-btn'));
        // The card should have inline font-size style if text is long
        const el = getByTestId('vocab-question-primary');
        const text = el.textContent ?? '';
        if (text.length > 20) {
            expect(el.style.fontSize).not.toBe('');
        }
    });
});
// ── 2c. <ExerciseDeck /> ────────────────────────────────────────────────────────────

function renderExerciseDeck() {
    const utils = render(<ExerciseDeck onBack={vi.fn()} />);
    // Enter deck via "All Exercises" on category selection screen
    fireEvent.click(utils.getByText('All Exercises'));
    return utils;
}

describe('<ExerciseDeck />', () => {
    it('shows category selection screen on first render', () => {
        const { getByText } = render(<ExerciseDeck onBack={vi.fn()} />);
        expect(getByText('Choose a category')).toBeTruthy();
        EXERCISE_CATEGORIES.forEach(cat => {
            expect(getByText(cat.label)).toBeTruthy();
        });
        expect(getByText('All Exercises')).toBeTruthy();
    });

    it('shows question text after entering deck', () => {
        const { getByTestId } = renderExerciseDeck();
        const q = getByTestId('speaking-question');
        expect(q).toBeTruthy();
        // Default direction is en-to-th, so question shows English prompt
        expect(EXERCISES.map(c => c.prompt)).toContain(q.textContent);
    });

    it('shows a category label', () => {
        const { getByTestId } = renderExerciseDeck();
        const cat = getByTestId('speaking-category');
        const allLabels = EXERCISE_CATEGORIES.map(c => c.label);
        expect(allLabels).toContain(cat.textContent);
    });

    it('hides solution by default', () => {
        const { getByTestId } = renderExerciseDeck();
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(true);
    });

    it('shows solution after pressing "Show Answer"', () => {
        const { getByText, getByTestId } = renderExerciseDeck();
        fireEvent.click(getByText('Show Answer'));
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(false);
    });

    it('shows latinised text as primary solution in en-to-th', () => {
        const { getByText, getByTestId } = renderExerciseDeck();
        fireEvent.click(getByText('Show Answer'));
        const sol = getByTestId('speaking-solution').textContent;
        expect(EXERCISES.map(c => c.latinised)).toContain(sol);
    });

    it('shows Thai script as secondary solution in en-to-th', () => {
        const { getByText, getByTestId } = renderExerciseDeck();
        fireEvent.click(getByText('Show Answer'));
        const sec = getByTestId('speaking-solution-secondary').textContent;
        expect(EXERCISES.map(c => c.thai)).toContain(sec);
    });

    it('hides answer again after pressing "Hide Answer"', () => {
        const { getByText, getByTestId } = renderExerciseDeck();
        fireEvent.click(getByText('Show Answer'));
        fireEvent.click(getByText('Hide Answer'));
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(true);
    });

    it('advances to next card and hides answer', () => {
        const { getByText, getByTestId } = renderExerciseDeck();
        fireEvent.click(getByText('Show Answer'));
        const first = getByTestId('speaking-question').textContent;
        fireEvent.click(getByText('Next'));
        const second = getByTestId('speaking-question').textContent;
        expect(second).not.toBe(first);
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(true);
    });

    it('speaks the Thai text when play is pressed', () => {
        (speakThai as ReturnType<typeof vi.fn>).mockClear();
        const { getByTestId } = renderExerciseDeck();
        fireEvent.click(getByTestId('play-btn'));
        const text = (speakThai as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(EXERCISES.map(c => c.thai)).toContain(text);
    });

    it('shows Deck Complete after going through all cards', () => {
        const { getByText } = renderExerciseDeck();
        for (let i = 0; i < EXERCISES.length; i++) {
            fireEvent.click(getByText('Next'));
        }
        expect(getByText('Deck Complete!')).toBeTruthy();
    });

    it('shows direction toggle defaulting to EN → TH', () => {
        const { getByTestId } = renderExerciseDeck();
        expect(getByTestId('toggle-direction-btn').textContent).toBe('EN → TH');
    });

    it('switches to TH → EN and swaps question/solution content', () => {
        const { getByTestId } = renderExerciseDeck();
        fireEvent.click(getByTestId('toggle-direction-btn'));
        expect(getByTestId('toggle-direction-btn').textContent).toBe('TH → EN');
        // Question now shows thai
        expect(EXERCISES.map(c => c.thai)).toContain(getByTestId('speaking-question').textContent);
        // Solution is hidden
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(true);
    });

    it('reveals solution after pressing Show Answer in TH → EN direction', () => {
        const { getByTestId, getByText } = renderExerciseDeck();
        fireEvent.click(getByTestId('toggle-direction-btn'));
        fireEvent.click(getByText('Show Answer'));
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(false);
    });

    it('resets answer visibility when toggling direction', () => {
        const { getByTestId, getByText } = renderExerciseDeck();
        // Show answer in en-to-th
        fireEvent.click(getByText('Show Answer'));
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(false);
        // Switch direction — answer should reset to hidden
        fireEvent.click(getByTestId('toggle-direction-btn'));
        expect(getByTestId('speaking-solution').classList.contains('hidden')).toBe(true);
    });

    it('filters exercises by category', () => {
        const { getByText, getByTestId } = render(<ExerciseDeck onBack={vi.fn()} />);
        fireEvent.click(getByText('Modal Verbs'));
        const q = getByTestId('speaking-question');
        const modalItems = EXERCISES.filter(c => c.category === 'modals');
        expect(modalItems.map(c => c.prompt)).toContain(q.textContent);
    });

    it('applies autoFitStyle on long prompts to prevent clipping', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        const { getByTestId, getByText } = render(<ExerciseDeck onBack={vi.fn()} />);
        fireEvent.click(getByText('All Exercises'));
        // The question element should have an inline font-size if text is long
        const el = getByTestId('speaking-question');
        const text = el.textContent ?? '';
        // autoFitStyle(text, 24) at 375px triggers when text.length > 23
        if (text.length > 23) {
            expect(el.style.fontSize).not.toBe('');
        }
    });
});
// ── 3. <FlashcardDeck /> rendering ───────────────────────────────────────────

describe('<FlashcardDeck /> rendering', () => {
    it('shows a Thai character on first render', () => {
        const { getByText } = renderDeck();
        expect(getByText(/^[\u0E00-\u0E7F]$/)).toBeTruthy();
    });

    it('shows a class label (Mid, High, or Low)', () => {
        const { getByText } = renderDeck();
        fireEvent.click(getByText('Show Details'));
        expect(getByText(/^(Mid|High|Low)$/)).toBeTruthy();
    });

    it('class label colour matches the class-to-hex mapping', () => {
        const { getByTestId, getByText } = renderDeck();
        fireEvent.click(getByText('Show Details'));
        const classEl = getByTestId('class-label');
        const cls = classEl.textContent as keyof typeof CLASS_COLORS;
        expect(classEl.style.color).toBe(CLASS_COLORS[cls]);
    });

    it('shows a play button', () => {
        const { getByTestId } = renderDeck();
        expect(getByTestId('play-btn')).toBeTruthy();
    });
});

// ── 3b. Vowel deck rendering ───────────────────────────────────────────────────────────

describe('Vowel deck rendering', () => {
    it('shows a length label (Short, Long, or Diphthong)', () => {
        const { getByTestId, getByText } = renderVowelDeck();
        fireEvent.click(getByText('Show Details'));
        const label = getByTestId('vowel-length-label');
        expect(['Short', 'Long', 'Diphthong']).toContain(label.textContent);
    });

    it('shows the vowel name label', () => {
        const { getByTestId, getByText } = renderVowelDeck();
        fireEvent.click(getByText('Show Details'));
        expect(getByTestId('vowel-name-label')).toBeTruthy();
    });

    it('length label colour matches the length-to-hex mapping', () => {
        const { getByTestId, getByText } = renderVowelDeck();
        fireEvent.click(getByText('Show Details'));
        const el = getByTestId('vowel-length-label');
        const length = el.textContent as keyof typeof LENGTH_COLORS;
        expect(el.style.color).toBe(LENGTH_COLORS[length]);
    });

    it('hides vowel detail labels by default', () => {
        const { getByTestId } = renderVowelDeck();
        expect(getByTestId('vowel-length-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('vowel-name-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('vowel-romanisation-label').classList.contains('hidden')).toBe(true);
    });
});

// ── 4. Play button ────────────────────────────────────────────────────────────────────────

describe('Play button', () => {
    beforeEach(() => (speakThai as ReturnType<typeof vi.fn>).mockClear());

    it('speaks the thai name of the current consonant', () => {
        const { getByTestId } = renderDeck();
        fireEvent.click(getByTestId('play-btn'));
        const text = (speakThai as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(CONSONANTS.map(c => c.thaiName)).toContain(text);
    });

    it('speaks the thai word of the current tonal rule', () => {
        const { getByTestId } = render(<FlashcardDeck data={TONAL_RULES} onBack={vi.fn()} />);
        fireEvent.click(getByTestId('play-btn'));
        const text = (speakThai as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(TONAL_RULES.map(r => r.thaiWord)).toContain(text);
    });

    it('speaks the symbol of the current vowel', () => {
        const { getByTestId } = renderVowelDeck();
        fireEvent.click(getByTestId('play-btn'));
        const text = (speakThai as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(VOWELS.map(v => v.symbol)).toContain(text);
    });
});

// ── 5. Next button ───────────────────────────────────────────────────────────

describe('Next button', () => {
    it('advances the card (character changes)', () => {
        const { getByText } = renderDeck();
        const before = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        fireEvent.click(getByText('Next'));
        const after = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        expect(after).not.toBe(before);
    });

    it('shows "Deck Complete!" after pressing Next 44 times', () => {
        const { getByText } = renderDeck();
        for (let i = 0; i < 44; i++) {
            fireEvent.click(getByText('Next'));
        }
        expect(getByText('Deck Complete!')).toBeTruthy();
    });
});

// ── 6. Previous button ───────────────────────────────────────────────────────

describe('Previous button', () => {
    it('is disabled on the first card', () => {
        const { getByTestId } = renderDeck();
        expect((getByTestId('prev-btn') as HTMLButtonElement).disabled).toBe(true);
    });

    it('goes back to the previous card after pressing Next then Previous', () => {
        const { getByText } = renderDeck();
        const first = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        fireEvent.click(getByText('Next'));
        const second = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        expect(second).not.toBe(first);
        fireEvent.click(getByText('Previous'));
        const back = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        expect(back).toBe(first);
    });
});

// ── 7. Show/Hide Details toggle ──────────────────────────────────────────────

describe('Show/Hide Details toggle', () => {
    it('hides the class label by default', () => {
        const { getByTestId } = renderDeck();
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(true);
    });

    it('shows the class, name and meaning labels after pressing "Show Details"', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Show Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(false);
        expect(getByTestId('name-label').classList.contains('hidden')).toBe(false);
        expect(getByTestId('meaning-label').classList.contains('hidden')).toBe(false);
    });

    it('shows "Show Details" button label while hidden and "Hide Details" while shown', () => {
        const { getByText } = renderDeck();
        expect(getByText('Show Details')).toBeTruthy();
        fireEvent.click(getByText('Show Details'));
        expect(getByText('Hide Details')).toBeTruthy();
        fireEvent.click(getByText('Hide Details'));
        expect(getByText('Show Details')).toBeTruthy();
    });

    it('restores all detail labels after toggling back to "Show Details"', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Show Details'));
        fireEvent.click(getByText('Hide Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('name-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('meaning-label').classList.contains('hidden')).toBe(true);
    });

    it('hides details when navigating to next card', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Show Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(false);
        fireEvent.click(getByText('Next'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(true);
    });

    it('hides details when navigating to previous card', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Next'));
        fireEvent.click(getByText('Show Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(false);
        fireEvent.click(getByText('Previous'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(true);
    });
});

// ── 8. Back to Start button ───────────────────────────────────────────────────

describe('Back to Start button', () => {
    it('is disabled on the first card', () => {
        const { getByTestId } = renderDeck();
        expect((getByTestId('back-to-start-btn') as HTMLButtonElement).disabled).toBe(true);
    });

    it('returns to the first card without reshuffling', () => {
        const { getByText, getByTestId } = renderDeck();
        const first = getByText(/^[\u0E00-\u0E7F]$/).textContent;
        fireEvent.click(getByText('Next'));
        fireEvent.click(getByText('Next'));
        fireEvent.click(getByTestId('back-to-start-btn'));
        expect(getByText(/^[\u0E00-\u0E7F]$/).textContent).toBe(first);
    });

    it('is enabled after advancing at least one card', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Next'));
        expect((getByTestId('back-to-start-btn') as HTMLButtonElement).disabled).toBe(false);
    });
});

// ── 9. Shuffle Deck button ────────────────────────────────────────────────────

describe('Shuffle Deck button', () => {
    it('resets to the first card position', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Next'));
        fireEvent.click(getByText('Next'));
        fireEvent.click(getByText('Shuffle Deck'));
        expect((getByTestId('prev-btn') as HTMLButtonElement).disabled).toBe(true);
    });

    it('keeps the flashcard screen visible (does not show Deck Complete)', () => {
        const { getByText, queryByText } = renderDeck();
        for (let i = 0; i < 10; i++) fireEvent.click(getByText('Next'));
        fireEvent.click(getByText('Shuffle Deck'));
        expect(queryByText('Deck Complete!')).toBeNull();
        expect(getByText(/^[\u0E00-\u0E7F]$/)).toBeTruthy();
    });
});

// ── 10. Restart flow ──────────────────────────────────────────────────────────

describe('Restart flow', () => {
    function renderAndComplete() {
        const utils = renderDeck();
        for (let i = 0; i < 44; i++) {
            fireEvent.click(utils.getByText('Next'));
        }
        return utils;
    }

    it('hides "Deck Complete!" after pressing "Start Again"', () => {
        const { getByText, queryByText } = renderAndComplete();
        expect(getByText('Deck Complete!')).toBeTruthy();
        fireEvent.click(getByText('Start Again'));
        expect(queryByText('Deck Complete!')).toBeNull();
    });

    it('shows a Thai character again after restart', () => {
        const { getByText } = renderAndComplete();
        fireEvent.click(getByText('Start Again'));
        expect(getByText(/^[\u0E00-\u0E7F]$/)).toBeTruthy();
    });

    it('calls onBack when "Back to Menu" is pressed on the Complete screen', () => {
        const onBack = vi.fn();
        const utils = render(<FlashcardDeck data={CONSONANTS} onBack={onBack} />);
        for (let i = 0; i < 44; i++) fireEvent.click(utils.getByText('Next'));
        fireEvent.click(utils.getByText('Back to Menu'));
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
