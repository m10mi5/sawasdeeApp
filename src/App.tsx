import { useState } from 'react';
import { Consonant, CONSONANTS } from './consonants';
import { TonalRule, TONAL_RULES } from './tonalRules';
import { Vowel, VOWELS } from './vowels';
import { VocabItem, VocabularyCategory, VOCABULARY, VOCABULARY_CATEGORIES } from './vocabulary';
import { Exercise, ExerciseCategory, EXERCISES, EXERCISE_CATEGORIES } from './speakingChallenges';
import { autoFitStyle, shuffleArray } from './utils';
import { speakThai } from './speech';

// ─── Shared type ─────────────────────────────────────────────────────────────

export type FlashcardItem = Consonant | TonalRule | Vowel;
export type QuizDirection = 'th-to-en' | 'en-to-th';

// ─── Class colour map ────────────────────────────────────────────────────────

const CLASS_COLORS: Record<Consonant['class'], string> = {
    Mid: '#2e7d32',
    High: '#c62828',
    Low: '#1565c0',
};

const LENGTH_COLORS: Record<Vowel['length'], string> = {
    Short: '#1565c0',
    Long: '#2e7d32',
    Diphthong: '#e65100',
};

// ─── Card sub-component ──────────────────────────────────────────────────────

interface CardProps {
    item: FlashcardItem;
    showDetails: boolean;
}

function Card({ item, showDetails }: CardProps) {
    if ('character' in item) {
        // ── Consonant card ────────────────────────────────────────────────────
        return (
            <div className="card">
                <div className="character">{item.character}</div>
                <div className="thai-name">{item.thaiName}</div>
                <div
                    data-testid="name-label"
                    className={`name-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.name}
                </div>
                <div
                    data-testid="meaning-label"
                    className={`meaning-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.englishMeaning}
                </div>
                <div
                    data-testid="class-label"
                    className={`class-label ${!showDetails ? 'hidden' : ''}`}
                    style={{ color: CLASS_COLORS[item.class] }}
                >
                    {item.class}
                </div>
                <div
                    data-testid="pair-label"
                    className={`pair-label ${item.class !== 'Low' || !showDetails ? 'hidden' : ''}`}
                >
                    {item.class === 'Low'
                        ? (item.pair
                            ? `Pair\u00a0\u2192\u00a0${item.pair}`
                            : 'Unpaired')
                        : ' '}
                </div>
            </div>
        );
    }

    // ── Vowel card ────────────────────────────────────────────────────────────
    if (item.type === 'vowel') {
        return (
            <div className="card">
                <div className="character">{item.symbol}</div>
                <div className="thai-name">{item.thaiName}</div>
                <div
                    data-testid="vowel-name-label"
                    className={`name-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.name}
                </div>
                <div
                    data-testid="vowel-romanisation-label"
                    className={`meaning-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.romanisation}
                </div>
                <div
                    data-testid="vowel-length-label"
                    className={`class-label ${!showDetails ? 'hidden' : ''}`}
                    style={{ color: LENGTH_COLORS[item.length] }}
                >
                    {item.length}
                </div>
                <div
                    data-testid="vowel-example-label"
                    className={`pair-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.exampleWord} = {item.exampleMeaning}
                </div>
            </div>
        );
    }

    // ── Tonal rule card ───────────────────────────────────────────────────────
    return (
        <div className="card rule-card">
            <div className="rule-word">{item.thaiWord}</div>
            <div
                data-testid="rule-romanisation"
                className={`rule-romanisation ${!showDetails ? 'hidden' : ''}`}
            >
                {item.romanisation}
            </div>
            <div
                data-testid="rule-meaning"
                className={`rule-meaning ${!showDetails ? 'hidden' : ''}`}
            >
                {item.meaning}
            </div>
            <div
                data-testid="rule-label"
                className={`rule-label ${!showDetails ? 'hidden' : ''}`}
            >
                {item.ruleLabel}
            </div>
            <div
                data-testid="rule-consonant"
                className={`rule-consonant ${!showDetails ? 'hidden' : ''}`}
            >
                {item.consonantThai} · {item.consonantLatin}
            </div>
            <div
                data-testid="rule-tone-mark"
                className={`rule-tone-mark ${!showDetails ? 'hidden' : ''}`}
            >
                {item.toneMarkThai ? `${item.toneMarkThai} · ${item.toneMarkLatin}` : '\u00a0'}
            </div>
            <div
                data-testid="rule-tone"
                className={`rule-tone ${!showDetails ? 'hidden' : ''}`}
            >
                {item.tone}
            </div>
        </div>
    );
}

// ─── FlashcardDeck component ─────────────────────────────────────────────────

interface FlashcardDeckProps {
    data: FlashcardItem[];
    onBack: () => void;
}

export function FlashcardDeck({ data, onBack }: FlashcardDeckProps) {
    const [deck, setDeck] = useState<FlashcardItem[]>(() => shuffleArray(data));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    const isDeckComplete = currentIndex >= deck.length;

    function handleRestart() {
        setDeck(shuffleArray(data));
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleShuffle() {
        setDeck(shuffleArray(data));
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleSpeak() {
        const item = deck[currentIndex];
        let text: string;
        if ('character' in item) {
            text = item.thaiName;
        } else if (item.type === 'vowel') {
            text = item.symbol;
        } else {
            text = item.thaiWord;
        }
        speakThai(text);
    }

    return (
        <div className="container">
            {isDeckComplete ? (
                <div className="centred">
                    <div className="complete-text">Deck Complete!</div>
                    <div className="complete-buttons">
                        <button className="button" onClick={handleRestart}>
                            Start Again
                        </button>
                        <button className="button back-button" onClick={onBack}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            ) : (
                <div className="centred">
                    <Card item={deck[currentIndex]} showDetails={showDetails} />
                    <button
                        data-testid="play-btn"
                        className="play-button"
                        onClick={handleSpeak}
                    >
                        ▶  Listen
                    </button>
                    <button
                        data-testid="toggle-details-btn"
                        className="toggle-button"
                        onClick={() => setShowDetails(v => !v)}
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                    <div className="button-row">
                        <button
                            data-testid="prev-btn"
                            className="button"
                            disabled={currentIndex === 0}
                            onClick={() => { setCurrentIndex(i => i - 1); setShowDetails(false); }}
                        >
                            Previous
                        </button>
                        <button
                            className="button"
                            onClick={() => { setCurrentIndex(i => i + 1); setShowDetails(false); }}
                        >
                            Next
                        </button>
                    </div>
                    <div className="util-row">
                        <button
                            data-testid="back-to-start-btn"
                            className="util-button"
                            disabled={currentIndex === 0}
                            onClick={handleBackToStart}
                        >
                            Back to Start
                        </button>
                        <button
                            data-testid="shuffle-btn"
                            className="util-button"
                            onClick={handleShuffle}
                        >
                            Shuffle Deck
                        </button>
                    </div>
                    <button
                        className="util-button util-button-back"
                        onClick={onBack}
                    >
                        Back to Menu
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Vocabulary card ─────────────────────────────────────────────────────────

interface VocabCardProps {
    item: VocabItem;
    showAnswer: boolean;
    direction: QuizDirection;
}

function VocabCard({ item, showAnswer, direction }: VocabCardProps) {
    const thToEn = direction === 'th-to-en';
    const questionLine1 = thToEn ? item.latinised : item.english;
    const questionLine2 = thToEn ? item.thai : item.grammar;
    const solutionLine1 = thToEn ? item.english : item.latinised;
    const solutionLine2 = thToEn ? item.grammar : item.thai;

    return (
        <div className="card vocab-card">
            <div
                data-testid="vocab-question-primary"
                className="vocab-question-primary"
                style={autoFitStyle(questionLine1, 28)}
            >
                {questionLine1}
            </div>
            <div
                data-testid="vocab-question-secondary"
                className="vocab-question-secondary"
                style={autoFitStyle(questionLine2, 16)}
            >
                {questionLine2}
            </div>
            <div
                data-testid="vocab-solution-primary"
                className={`vocab-solution-primary ${!showAnswer ? 'hidden' : ''}`}
                style={autoFitStyle(solutionLine1, 28)}
            >
                {solutionLine1}
            </div>
            <div
                data-testid="vocab-solution-secondary"
                className={`vocab-solution-secondary ${!showAnswer ? 'hidden' : ''}`}
                style={autoFitStyle(solutionLine2, 16)}
            >
                {solutionLine2}
            </div>
        </div>
    );
}

// ─── VocabularyDeck component ────────────────────────────────────────────────

export function VocabularyDeck({ onBack }: { onBack: () => void }) {
    const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | null>(null);
    const [deck, setDeck] = useState<VocabItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [direction, setDirection] = useState<QuizDirection>('en-to-th');

    const isDeckComplete = deck.length > 0 && currentIndex >= deck.length;

    function startDeck(cat: VocabularyCategory | null) {
        const items = cat
            ? VOCABULARY.filter(v => v.category === cat)
            : VOCABULARY;
        setSelectedCategory(cat);
        setDeck(shuffleArray(items));
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    function handleRestart() {
        startDeck(selectedCategory);
    }

    function handleShuffle() {
        startDeck(selectedCategory);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    function handleSpeak() {
        speakThai(deck[currentIndex].thai);
    }

    function handleToggleDirection() {
        setDirection(d => d === 'th-to-en' ? 'en-to-th' : 'th-to-en');
        setShowAnswer(false);
    }

    function handleBackToCategories() {
        setSelectedCategory(null);
        setDeck([]);
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    // ── Category selection screen ──
    if (deck.length === 0) {
        return (
            <div className="container">
                <div className="centred">
                    <div className="menu-title">Vocabulary</div>
                    <div className="menu-subtitle">Choose a category</div>
                    <div className="category-grid">
                        {VOCABULARY_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className="button category-button"
                                onClick={() => startDeck(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                        {VOCABULARY_CATEGORIES.length % 2 === 1 && (
                            <button
                                className="button category-button"
                                onClick={() => startDeck(null)}
                            >
                                All
                            </button>
                        )}
                    </div>
                    {VOCABULARY_CATEGORIES.length % 2 === 0 && (
                        <button
                            className="button menu-button"
                            onClick={() => startDeck(null)}
                        >
                            All
                        </button>
                    )}
                    <button className="button menu-button back-button" onClick={onBack}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {isDeckComplete ? (
                <div className="centred">
                    <div className="complete-text">Deck Complete!</div>
                    <div className="complete-buttons">
                        <button className="button" onClick={handleRestart}>
                            Start Again
                        </button>
                        <button className="button" onClick={handleBackToCategories}>
                            Choose Category
                        </button>
                        <button className="button back-button" onClick={onBack}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            ) : (
                <div className="centred">
                    <button
                        data-testid="toggle-direction-btn"
                        className="direction-toggle"
                        onClick={handleToggleDirection}
                    >
                        {direction === 'en-to-th' ? 'EN → TH' : 'TH → EN'}
                    </button>
                    <VocabCard item={deck[currentIndex]} showAnswer={showAnswer} direction={direction} />
                    <button
                        data-testid="play-btn"
                        className="play-button"
                        onClick={handleSpeak}
                    >
                        ▶  Listen
                    </button>
                    <button
                        data-testid="toggle-answer-btn"
                        className="toggle-button"
                        onClick={() => setShowAnswer(v => !v)}
                    >
                        {showAnswer ? 'Hide Solution' : 'Show Solution'}
                    </button>
                    <div className="button-row">
                        <button
                            data-testid="prev-btn"
                            className="button"
                            disabled={currentIndex === 0}
                            onClick={() => { setCurrentIndex(i => i - 1); setShowAnswer(false); }}
                        >
                            Previous
                        </button>
                        <button
                            className="button"
                            onClick={() => { setCurrentIndex(i => i + 1); setShowAnswer(false); }}
                        >
                            Next
                        </button>
                    </div>
                    <div className="util-row">
                        <button
                            data-testid="back-to-start-btn"
                            className="util-button"
                            disabled={currentIndex === 0}
                            onClick={handleBackToStart}
                        >
                            Back to Start
                        </button>
                        <button
                            data-testid="shuffle-btn"
                            className="util-button"
                            onClick={handleShuffle}
                        >
                            Shuffle Deck
                        </button>
                    </div>
                    <button
                        className="util-button util-button-back"
                        onClick={handleBackToCategories}
                    >
                        Back to Categories
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Speaking card ────────────────────────────────────────────────────────────

interface ExerciseCardProps {
    item: Exercise;
    showAnswer: boolean;
    direction: QuizDirection;
}

function ExerciseCard({ item, showAnswer, direction }: ExerciseCardProps) {
    const categoryLabel = EXERCISE_CATEGORIES.find(c => c.id === item.category)?.label ?? item.category;

    const enToTh = direction === 'en-to-th';
    const questionText = enToTh ? item.prompt : item.thai;
    const solutionLine1 = enToTh ? item.latinised : item.prompt;
    const solutionLine2 = enToTh ? item.thai : null;
    const questionLine2 = enToTh ? null : item.latinised;

    return (
        <div className="card speaking-card">
            <div className="speaking-category" data-testid="speaking-category">
                {categoryLabel}
            </div>
            <div
                data-testid="speaking-question"
                className="speaking-question"
                style={autoFitStyle(questionText, 24)}
            >
                {questionText}
            </div>
            {questionLine2 && (
                <div
                    data-testid="speaking-question-secondary"
                    className="speaking-question-secondary"
                    style={autoFitStyle(questionLine2, 16)}
                >
                    {questionLine2}
                </div>
            )}
            <div
                data-testid="speaking-solution"
                className={`speaking-solution ${!showAnswer ? 'hidden' : ''}`}
                style={autoFitStyle(solutionLine1, 28)}
            >
                {solutionLine1}
            </div>
            {solutionLine2 && (
                <div
                    data-testid="speaking-solution-secondary"
                    className={`speaking-solution-secondary ${!showAnswer ? 'hidden' : ''}`}
                    style={autoFitStyle(solutionLine2, 16)}
                >
                    {solutionLine2}
                </div>
            )}
        </div>
    );
}

// ─── ExerciseDeck component ──────────────────────────────────────────────────

export function ExerciseDeck({ onBack }: { onBack: () => void }) {
    const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
    const [deck, setDeck] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [direction, setDirection] = useState<QuizDirection>('en-to-th');

    const isDeckComplete = deck.length > 0 && currentIndex >= deck.length;

    function startDeck(cat: ExerciseCategory | null) {
        const items = cat
            ? EXERCISES.filter(c => c.category === cat)
            : EXERCISES;
        setSelectedCategory(cat);
        setDeck(shuffleArray(items));
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    function handleRestart() {
        startDeck(selectedCategory);
    }

    function handleShuffle() {
        startDeck(selectedCategory);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    function handleSpeak() {
        speakThai(deck[currentIndex].thai);
    }

    function handleNext() {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
    }

    function handlePrev() {
        setCurrentIndex(i => i - 1);
        setShowAnswer(false);
    }

    function handleToggleDirection() {
        setDirection(d => d === 'en-to-th' ? 'th-to-en' : 'en-to-th');
        setShowAnswer(false);
    }

    function handleBackToCategories() {
        setSelectedCategory(null);
        setDeck([]);
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    // ── Category selection screen ──
    if (deck.length === 0) {
        return (
            <div className="container">
                <div className="centred">
                    <div className="menu-title">Exercises</div>
                    <div className="menu-subtitle">Choose a category</div>
                    <div className="category-grid">
                        {EXERCISE_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className="button category-button"
                                onClick={() => startDeck(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                        {EXERCISE_CATEGORIES.length % 2 === 1 && (
                            <button
                                className="button category-button"
                                onClick={() => startDeck(null)}
                            >
                                All
                            </button>
                        )}
                    </div>
                    {EXERCISE_CATEGORIES.length % 2 === 0 && (
                        <button
                            className="button menu-button"
                            onClick={() => startDeck(null)}
                        >
                            All
                        </button>
                    )}
                    <button className="button menu-button back-button" onClick={onBack}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {isDeckComplete ? (
                <div className="centred">
                    <div className="complete-text">Deck Complete!</div>
                    <div className="complete-buttons">
                        <button className="button" onClick={handleRestart}>
                            Start Again
                        </button>
                        <button className="button" onClick={handleBackToCategories}>
                            Choose Category
                        </button>
                        <button className="button back-button" onClick={onBack}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            ) : (
                <div className="centred">
                    <button
                        data-testid="toggle-direction-btn"
                        className="direction-toggle"
                        onClick={handleToggleDirection}
                    >
                        {direction === 'en-to-th' ? 'EN → TH' : 'TH → EN'}
                    </button>
                    <ExerciseCard item={deck[currentIndex]} showAnswer={showAnswer} direction={direction} />
                    <button
                        data-testid="play-btn"
                        className="play-button"
                        onClick={handleSpeak}
                    >
                        ▶  Listen
                    </button>
                    <button
                        data-testid="toggle-answer-btn"
                        className="toggle-button"
                        onClick={() => setShowAnswer(v => !v)}
                    >
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    <div className="button-row">
                        <button
                            data-testid="prev-btn"
                            className="button"
                            disabled={currentIndex === 0}
                            onClick={handlePrev}
                        >
                            Previous
                        </button>
                        <button
                            className="button"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                    <div className="util-row">
                        <button
                            data-testid="back-to-start-btn"
                            className="util-button"
                            disabled={currentIndex === 0}
                            onClick={handleBackToStart}
                        >
                            Back to Start
                        </button>
                        <button
                            data-testid="shuffle-btn"
                            className="util-button"
                            onClick={handleShuffle}
                        >
                            Shuffle Deck
                        </button>
                    </div>
                    <button
                        className="util-button util-button-back"
                        onClick={handleBackToCategories}
                    >
                        Back to Categories
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Placeholder screen ──────────────────────────────────────────────────────

function PlaceholderScreen({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="container">
            <div className="centred">
                <div className="menu-title">{title}</div>
                <div className="menu-subtitle">Coming soon</div>
                <button className="button menu-button" onClick={onBack}>
                    Back
                </button>
            </div>
        </div>
    );
}

// ─── Script deck selector ────────────────────────────────────────────────────

type ScriptMode = 'MENU' | 'CONSONANTS' | 'TONAL' | 'VOWELS';

function ScriptScreen({ onBack }: { onBack: () => void }) {
    const [mode, setMode] = useState<ScriptMode>('MENU');

    if (mode === 'CONSONANTS') {
        return <FlashcardDeck data={CONSONANTS} onBack={() => setMode('MENU')} />;
    }

    if (mode === 'TONAL') {
        return <FlashcardDeck data={TONAL_RULES} onBack={() => setMode('MENU')} />;
    }

    if (mode === 'VOWELS') {
        return <FlashcardDeck data={VOWELS} onBack={() => setMode('MENU')} />;
    }

    return (
        <div className="container">
            <div className="centred">
                <div className="menu-title">Script</div>
                <div className="menu-subtitle">Choose a deck to practice</div>
                <button
                    className="button menu-button"
                    onClick={() => setMode('CONSONANTS')}
                >
                    Practice Consonants
                </button>
                <button
                    className="button menu-button"
                    onClick={() => setMode('VOWELS')}
                >
                    Practice Vowels
                </button>
                <button
                    className="button menu-button"
                    onClick={() => setMode('TONAL')}
                >
                    Practice Tone Rules
                </button>
                <button className="button menu-button back-button" onClick={onBack}>
                    Back
                </button>
            </div>
        </div>
    );
}

// ─── Root component (Home) ───────────────────────────────────────────────────

type AppMode = 'HOME' | 'SCRIPT' | 'VOCABULARY' | 'SPEAKING' | 'PRONUNCIATION';

export default function App() {
    const [mode, setMode] = useState<AppMode>('HOME');

    if (mode === 'SCRIPT') {
        return <ScriptScreen onBack={() => setMode('HOME')} />;
    }

    if (mode === 'VOCABULARY') {
        return <VocabularyDeck onBack={() => setMode('HOME')} />;
    }

    if (mode === 'SPEAKING') {
        return <ExerciseDeck onBack={() => setMode('HOME')} />;
    }

    if (mode === 'PRONUNCIATION') {
        return <PlaceholderScreen title="Pronunciation" onBack={() => setMode('HOME')} />;
    }

    return (
        <div className="container">
            <div className="centred">
                <div className="menu-title">Sawasdee App</div>
                <div className="menu-subtitle">Choose what to practice</div>
                <button
                    className="button menu-button"
                    onClick={() => setMode('SCRIPT')}
                >
                    Script
                </button>
                <button
                    className="button menu-button"
                    onClick={() => setMode('VOCABULARY')}
                >
                    Vocabulary
                </button>
                <button
                    className="button menu-button"
                    onClick={() => setMode('SPEAKING')}
                >
                    Exercises
                </button>
                <button
                    className="button menu-button"
                    onClick={() => setMode('PRONUNCIATION')}
                >
                    Pronunciation
                </button>
            </div>
        </div>
    );
}
