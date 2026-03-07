import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CONSONANTS } from './consonants';
import { TONAL_RULES } from './tonalRules';
import { VOWELS } from './vowels';
import { shuffleArray } from './utils';
import App, { FlashcardDeck } from './App';

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

// ── 2. <App /> home screen ────────────────────────────────────────────────────

describe('<App /> home screen', () => {
    it('shows the four practice buttons on first render', () => {
        const { getByText } = render(<App />);
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Vocabulary')).toBeTruthy();
        expect(getByText('Speaking')).toBeTruthy();
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

    it('shows placeholder for Vocabulary', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Vocabulary'));
        expect(getByText('Coming soon')).toBeTruthy();
    });

    it('shows placeholder for Speaking', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Speaking'));
        expect(getByText('Coming soon')).toBeTruthy();
    });

    it('shows placeholder for Pronunciation', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Pronunciation'));
        expect(getByText('Coming soon')).toBeTruthy();
    });

    it('returns from placeholder to home via Back', () => {
        const { getByText } = render(<App />);
        fireEvent.click(getByText('Vocabulary'));
        fireEvent.click(getByText('Back'));
        expect(getByText('Script')).toBeTruthy();
        expect(getByText('Pronunciation')).toBeTruthy();
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
        expect(getByText(/^(Mid|High|Low)$/)).toBeTruthy();
    });

    it('class label colour matches the class-to-hex mapping', () => {
        const { getByTestId } = renderDeck();
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
        const { getByTestId } = renderVowelDeck();
        const label = getByTestId('vowel-length-label');
        expect(['Short', 'Long', 'Diphthong']).toContain(label.textContent);
    });

    it('shows the vowel name label', () => {
        const { getByTestId } = renderVowelDeck();
        expect(getByTestId('vowel-name-label')).toBeTruthy();
    });

    it('length label colour matches the length-to-hex mapping', () => {
        const { getByTestId } = renderVowelDeck();
        const el = getByTestId('vowel-length-label');
        const length = el.textContent as keyof typeof LENGTH_COLORS;
        expect(el.style.color).toBe(LENGTH_COLORS[length]);
    });

    it('hides vowel detail labels after pressing "Hide Details"', () => {
        const { getByText, getByTestId } = renderVowelDeck();
        fireEvent.click(getByText('Hide Details'));
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
    it('shows the class label by default', () => {
        const { getByTestId } = renderDeck();
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(false);
    });

    it('hides the class, name and meaning labels after pressing "Hide Details"', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Hide Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('name-label').classList.contains('hidden')).toBe(true);
        expect(getByTestId('meaning-label').classList.contains('hidden')).toBe(true);
    });

    it('shows "Show Details" button label while hidden and "Hide Details" while shown', () => {
        const { getByText } = renderDeck();
        expect(getByText('Hide Details')).toBeTruthy();
        fireEvent.click(getByText('Hide Details'));
        expect(getByText('Show Details')).toBeTruthy();
        fireEvent.click(getByText('Show Details'));
        expect(getByText('Hide Details')).toBeTruthy();
    });

    it('restores all detail labels after toggling back to "Hide Details"', () => {
        const { getByText, getByTestId } = renderDeck();
        fireEvent.click(getByText('Hide Details'));
        fireEvent.click(getByText('Show Details'));
        expect(getByTestId('class-label').classList.contains('hidden')).toBe(false);
        expect(getByTestId('name-label').classList.contains('hidden')).toBe(false);
        expect(getByTestId('meaning-label').classList.contains('hidden')).toBe(false);
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
