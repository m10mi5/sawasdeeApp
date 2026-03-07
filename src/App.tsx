import { useState } from 'react';
import { Consonant, CONSONANTS } from './consonants';
import { TonalRule, TONAL_RULES } from './tonalRules';
import { Vowel, VOWELS } from './vowels';
import { VocabItem, VOCABULARY } from './vocabulary';
import { SpeakingChallenge, SPEAKING_CHALLENGES } from './speakingChallenges';
import { shuffleArray } from './utils';
import { speakThai } from './speech';

// ─── Shared type ─────────────────────────────────────────────────────────────

export type FlashcardItem = Consonant | TonalRule | Vowel;

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
    const [showDetails, setShowDetails] = useState(true);

    const isDeckComplete = currentIndex >= deck.length;

    function handleRestart() {
        setDeck(shuffleArray(data));
        setCurrentIndex(0);
    }

    function handleShuffle() {
        setDeck(shuffleArray(data));
        setCurrentIndex(0);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
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
                    <button className="button" onClick={handleRestart}>
                        Start Again
                    </button>
                    <button className="button back-button" onClick={onBack}>
                        Back to Menu
                    </button>
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
                            onClick={() => setCurrentIndex(i => i - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="button"
                            onClick={() => setCurrentIndex(i => i + 1)}
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
    showEnglish: boolean;
}

function VocabCard({ item, showEnglish }: VocabCardProps) {
    return (
        <div className="card vocab-card">
            <div className="vocab-latinised">{item.latinised}</div>
            <div className="vocab-thai">{item.thai}</div>
            <div
                data-testid="vocab-english"
                className={`vocab-english ${!showEnglish ? 'hidden' : ''}`}
            >
                {item.english}
            </div>
            <div
                data-testid="vocab-grammar"
                className={`vocab-grammar ${!showEnglish ? 'hidden' : ''}`}
            >
                {item.grammar}
            </div>
        </div>
    );
}

// ─── VocabularyDeck component ────────────────────────────────────────────────

export function VocabularyDeck({ onBack }: { onBack: () => void }) {
    const [deck, setDeck] = useState<VocabItem[]>(() => shuffleArray(VOCABULARY));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showEnglish, setShowEnglish] = useState(false);

    const isDeckComplete = currentIndex >= deck.length;

    function handleRestart() {
        setDeck(shuffleArray(VOCABULARY));
        setCurrentIndex(0);
    }

    function handleShuffle() {
        setDeck(shuffleArray(VOCABULARY));
        setCurrentIndex(0);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
    }

    function handleSpeak() {
        speakThai(deck[currentIndex].thai);
    }

    return (
        <div className="container">
            {isDeckComplete ? (
                <div className="centred">
                    <div className="complete-text">Deck Complete!</div>
                    <button className="button" onClick={handleRestart}>
                        Start Again
                    </button>
                    <button className="button back-button" onClick={onBack}>
                        Back to Menu
                    </button>
                </div>
            ) : (
                <div className="centred">
                    <VocabCard item={deck[currentIndex]} showEnglish={showEnglish} />
                    <button
                        data-testid="play-btn"
                        className="play-button"
                        onClick={handleSpeak}
                    >
                        ▶  Listen
                    </button>
                    <button
                        data-testid="toggle-english-btn"
                        className="toggle-button"
                        onClick={() => setShowEnglish(v => !v)}
                    >
                        {showEnglish ? 'Hide English' : 'Show English'}
                    </button>
                    <div className="button-row">
                        <button
                            data-testid="prev-btn"
                            className="button"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(i => i - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="button"
                            onClick={() => setCurrentIndex(i => i + 1)}
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

// ─── Speaking card ────────────────────────────────────────────────────────────

interface SpeakingCardProps {
    item: SpeakingChallenge;
    showAnswer: boolean;
}

function SpeakingCard({ item, showAnswer }: SpeakingCardProps) {
    const categoryLabel =
        item.category === 'food-ordering' ? 'Food Ordering'
        : item.category === 'modals' ? 'Modal Verbs'
        : 'Directions';

    return (
        <div className="card speaking-card">
            <div className="speaking-category" data-testid="speaking-category">
                {categoryLabel}
            </div>
            <div className="speaking-prompt">{item.prompt}</div>
            <div
                data-testid="speaking-thai"
                className={`speaking-thai ${!showAnswer ? 'hidden' : ''}`}
            >
                {item.thai}
            </div>
            <div
                data-testid="speaking-latinised"
                className={`speaking-latinised ${!showAnswer ? 'hidden' : ''}`}
            >
                {item.latinised}
            </div>
        </div>
    );
}

// ─── SpeakingDeck component ──────────────────────────────────────────────────

export function SpeakingDeck({ onBack }: { onBack: () => void }) {
    const [deck, setDeck] = useState<SpeakingChallenge[]>(() => shuffleArray(SPEAKING_CHALLENGES));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const isDeckComplete = currentIndex >= deck.length;

    function handleRestart() {
        setDeck(shuffleArray(SPEAKING_CHALLENGES));
        setCurrentIndex(0);
        setShowAnswer(false);
    }

    function handleShuffle() {
        setDeck(shuffleArray(SPEAKING_CHALLENGES));
        setCurrentIndex(0);
        setShowAnswer(false);
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

    return (
        <div className="container">
            {isDeckComplete ? (
                <div className="centred">
                    <div className="complete-text">Deck Complete!</div>
                    <button className="button" onClick={handleRestart}>
                        Start Again
                    </button>
                    <button className="button back-button" onClick={onBack}>
                        Back to Menu
                    </button>
                </div>
            ) : (
                <div className="centred">
                    <SpeakingCard item={deck[currentIndex]} showAnswer={showAnswer} />
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
                        onClick={onBack}
                    >
                        Back to Menu
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
        return <SpeakingDeck onBack={() => setMode('HOME')} />;
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
                    Speaking
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
