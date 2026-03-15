import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
    type TouchEvent as ReactTouchEvent,
} from 'react';
import { Consonant, CONSONANTS } from './consonants';
import { TonalRule, TONAL_RULES } from './tonalRules';
import { Vowel, VOWELS } from './vowels';
import { VocabItem, VocabularyCategory, VOCABULARY, VOCABULARY_CATEGORIES } from './vocabulary';
import { Exercise, ExerciseCategory, EXERCISES, EXERCISE_CATEGORIES } from './excercices';
import { autoFitStyle, shuffleArray } from './utils';
import { speakThai } from './speech';

// ─── Shared type ─────────────────────────────────────────────────────────────

export type FlashcardItem = Consonant | TonalRule | Vowel;
export type QuizDirection = 'th-to-en' | 'en-to-th';

type ImprovementCard =
    | { kind: 'script'; id: string; item: FlashcardItem }
    | { kind: 'vocabulary'; id: string; item: VocabItem }
    | { kind: 'exercise'; id: string; item: Exercise };

interface ImprovementCachePayload {
    version: number;
    ids: string[];
}

const IMPROVEMENT_CACHE_KEY = 'sawasdee-improvement-needed-cache';
const IMPROVEMENT_CACHE_VERSION = 1;
const SWIPE_THRESHOLD_PX = 48;
const DOUBLE_TAP_WINDOW_MS = 360;
const LONG_PRESS_WINDOW_MS = 450;
const TAP_CANCEL_THRESHOLD_PX = 14;
const IGNORE_MOUSE_AFTER_TOUCH_MS = 800;
const EDGE_TAP_ZONE_RATIO = 0.3;

type TapZone = 'left' | 'middle' | 'right';

function resolveTapZone(clientX: number, rect: DOMRect): TapZone {
    if (rect.width <= 0) {
        return 'middle';
    }

    const relativeX = (clientX - rect.left) / rect.width;
    if (relativeX < EDGE_TAP_ZONE_RATIO) {
        return 'left';
    }
    if (relativeX > 1 - EDGE_TAP_ZONE_RATIO) {
        return 'right';
    }
    return 'middle';
}

function toKeySegment(value: string): string {
    return value
        .replace(/\|/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase();
}

function getFlashcardId(item: FlashcardItem): string {
    if ('character' in item) {
        return `script|consonant|${toKeySegment(item.character)}`;
    }
    if (item.type === 'vowel') {
        return `script|vowel|${toKeySegment(item.symbol)}|${toKeySegment(item.name)}`;
    }
    return `script|rule|${toKeySegment(item.thaiWord)}|${toKeySegment(item.ruleLabel)}`;
}

function getVocabularyId(item: VocabItem): string {
    return [
        'vocabulary',
        toKeySegment(item.category),
        toKeySegment(item.audio ?? ''),
        toKeySegment(item.thai),
        toKeySegment(item.english),
    ].join('|');
}

function getExerciseId(item: Exercise): string {
    return [
        'exercise',
        toKeySegment(item.category),
        toKeySegment(item.audio ?? ''),
        toKeySegment(item.thai),
        toKeySegment(item.prompt),
    ].join('|');
}

function getFlashcardLabel(item: FlashcardItem): string {
    if ('character' in item) {
        return item.thaiName;
    }
    if (item.type === 'vowel') {
        return item.thaiName;
    }
    return item.ruleLabel;
}

function getFlashcardSpeechText(item: FlashcardItem): string {
    if ('character' in item) {
        return item.thaiName;
    }
    if (item.type === 'vowel') {
        return item.symbol;
    }
    return item.thaiWord;
}

function getImprovementCardLabel(card: ImprovementCard): string {
    if (card.kind === 'script') {
        return getFlashcardLabel(card.item);
    }
    if (card.kind === 'vocabulary') {
        return card.item.english;
    }
    return card.item.prompt;
}

function loadImprovementCache(): Set<string> {
    if (typeof window === 'undefined') {
        return new Set();
    }

    try {
        const raw = window.localStorage.getItem(IMPROVEMENT_CACHE_KEY);
        if (!raw) {
            return new Set();
        }
        const parsed = JSON.parse(raw) as ImprovementCachePayload;
        if (parsed.version !== IMPROVEMENT_CACHE_VERSION || !Array.isArray(parsed.ids)) {
            return new Set();
        }
        return new Set(parsed.ids.filter((id): id is string => typeof id === 'string'));
    } catch {
        return new Set();
    }
}

function saveImprovementCache(ids: Set<string>): void {
    if (typeof window === 'undefined') {
        return;
    }

    const payload: ImprovementCachePayload = {
        version: IMPROVEMENT_CACHE_VERSION,
        ids: [...ids],
    };

    try {
        window.localStorage.setItem(IMPROVEMENT_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore storage errors in private mode or strict environments.
    }
}

function stopGesturePropagation(event: ReactMouseEvent<HTMLElement> | ReactTouchEvent<HTMLElement>) {
    event.stopPropagation();
}

function useCardGestures(
    options: {
        onSwipeNext: () => void;
        onSwipePrev: () => void;
        onDoubleTap: () => void;
        onSingleTapMiddle?: () => void;
        onSingleTapLeft?: () => void;
        onSingleTapRight?: () => void;
        onLongPressMiddle?: () => void;
    },
) {
    const startRef = useRef<{ x: number; y: number; zone: TapZone; startedAt: number } | null>(null);
    const lastTapRef = useRef(0);
    const singleTapTimeoutRef = useRef<number | null>(null);
    const longPressTimeoutRef = useRef<number | null>(null);
    const longPressTriggeredRef = useRef(false);
    const ignoreMouseUntilRef = useRef(0);

    function shouldIgnoreMouseEvent() {
        return Date.now() < ignoreMouseUntilRef.current;
    }

    function markTouchInteraction() {
        ignoreMouseUntilRef.current = Date.now() + IGNORE_MOUSE_AFTER_TOUCH_MS;
    }

    function clearSingleTapTimeout() {
        if (singleTapTimeoutRef.current === null) {
            return;
        }
        window.clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
    }

    function clearLongPressTimeout() {
        if (longPressTimeoutRef.current === null) {
            return;
        }
        window.clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
    }

    function clearTimers() {
        clearSingleTapTimeout();
        clearLongPressTimeout();
    }

    function cancelLongPressIfMoved(x: number, y: number) {
        if (!startRef.current || longPressTimeoutRef.current === null) {
            return;
        }

        const dx = Math.abs(x - startRef.current.x);
        const dy = Math.abs(y - startRef.current.y);

        if (dx > TAP_CANCEL_THRESHOLD_PX || dy > TAP_CANCEL_THRESHOLD_PX) {
            clearLongPressTimeout();
        }
    }

    function startGesture(x: number, y: number, zone: TapZone) {
        startRef.current = { x, y, zone, startedAt: Date.now() };
        longPressTriggeredRef.current = false;
        clearLongPressTimeout();

        if (zone !== 'middle') {
            return;
        }

        longPressTimeoutRef.current = window.setTimeout(() => {
            longPressTriggeredRef.current = true;
            clearSingleTapTimeout();
            lastTapRef.current = 0;
            options.onLongPressMiddle?.();
        }, LONG_PRESS_WINDOW_MS);
    }

    function finishGesture(x: number, y: number) {
        clearLongPressTimeout();

        if (!startRef.current) {
            return;
        }

        const dx = x - startRef.current.x;
        const dy = y - startRef.current.y;
        const zone = startRef.current.zone;
        const pressDurationMs = Date.now() - startRef.current.startedAt;
        startRef.current = null;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
        }

        if (absX >= SWIPE_THRESHOLD_PX && absX > absY) {
            if (dx < 0) {
                options.onSwipeNext();
            } else {
                options.onSwipePrev();
            }
            clearSingleTapTimeout();
            lastTapRef.current = 0;
            return;
        }

        if (absX > TAP_CANCEL_THRESHOLD_PX || absY > TAP_CANCEL_THRESHOLD_PX) {
            return;
        }

        if (zone !== 'middle') {
            clearSingleTapTimeout();
            lastTapRef.current = 0;

            // Side zones are reserved for quick single-tap navigation only.
            if (pressDurationMs > LONG_PRESS_WINDOW_MS) {
                return;
            }

            if (zone === 'left') {
                options.onSingleTapLeft?.();
            } else {
                options.onSingleTapRight?.();
            }
            return;
        }

        const now = Date.now();
        if (now - lastTapRef.current <= DOUBLE_TAP_WINDOW_MS) {
            clearSingleTapTimeout();
            options.onDoubleTap();
            lastTapRef.current = 0;
            return;
        }

        lastTapRef.current = now;
        clearSingleTapTimeout();
        singleTapTimeoutRef.current = window.setTimeout(() => {
            options.onSingleTapMiddle?.();
            singleTapTimeoutRef.current = null;
            lastTapRef.current = 0;
        }, DOUBLE_TAP_WINDOW_MS);
    }

    function handleMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
        if (shouldIgnoreMouseEvent()) {
            return;
        }
        const zone = resolveTapZone(event.clientX, event.currentTarget.getBoundingClientRect());
        startGesture(event.clientX, event.clientY, zone);
    }

    function handleMouseUp(event: ReactMouseEvent<HTMLDivElement>) {
        if (shouldIgnoreMouseEvent()) {
            return;
        }
        finishGesture(event.clientX, event.clientY);
    }

    function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
        markTouchInteraction();
        const touch = event.touches[0];
        if (!touch) {
            return;
        }
        const zone = resolveTapZone(touch.clientX, event.currentTarget.getBoundingClientRect());
        startGesture(touch.clientX, touch.clientY, zone);
    }

    function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
        markTouchInteraction();
        const touch = event.changedTouches[0];
        if (!touch) {
            return;
        }
        finishGesture(touch.clientX, touch.clientY);
    }

    function handleMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
        if (shouldIgnoreMouseEvent()) {
            return;
        }
        cancelLongPressIfMoved(event.clientX, event.clientY);
    }

    function handleTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
        markTouchInteraction();
        const touch = event.touches[0];
        if (!touch) {
            return;
        }
        cancelLongPressIfMoved(touch.clientX, touch.clientY);
    }

    function handleCancel() {
        startRef.current = null;
        longPressTriggeredRef.current = false;
        clearLongPressTimeout();
    }

    useEffect(() => {
        function handleWindowMouseUp(event: MouseEvent) {
            if (shouldIgnoreMouseEvent()) {
                return;
            }
            finishGesture(event.clientX, event.clientY);
        }

        function handleWindowTouchEnd(event: TouchEvent) {
            markTouchInteraction();
            const touch = event.changedTouches[0];
            if (!touch) {
                handleCancel();
                return;
            }
            finishGesture(touch.clientX, touch.clientY);
        }

        function handleWindowTouchCancel() {
            markTouchInteraction();
            handleCancel();
        }

        window.addEventListener('mouseup', handleWindowMouseUp);
        window.addEventListener('touchend', handleWindowTouchEnd);
        window.addEventListener('touchcancel', handleWindowTouchCancel);

        return () => {
            window.removeEventListener('mouseup', handleWindowMouseUp);
            window.removeEventListener('touchend', handleWindowTouchEnd);
            window.removeEventListener('touchcancel', handleWindowTouchCancel);
            clearTimers();
        };
    }, []);

    return {
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleCancel,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleCancel,
    };
}

const IMPROVEMENT_LIBRARY: ImprovementCard[] = [
    ...CONSONANTS.map(item => ({ kind: 'script', id: getFlashcardId(item), item }) as const),
    ...TONAL_RULES.map(item => ({ kind: 'script', id: getFlashcardId(item), item }) as const),
    ...VOWELS.map(item => ({ kind: 'script', id: getFlashcardId(item), item }) as const),
    ...VOCABULARY.map(item => ({ kind: 'vocabulary', id: getVocabularyId(item), item }) as const),
    ...EXERCISES.map(item => ({ kind: 'exercise', id: getExerciseId(item), item }) as const),
];

const IMPROVEMENT_LIBRARY_BY_ID = new Map(IMPROVEMENT_LIBRARY.map(card => [card.id, card]));

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
    footerControls?: React.ReactNode;
}

function Card({ item, showDetails, footerControls }: CardProps) {
    if ('character' in item) {
        // ── Consonant card ────────────────────────────────────────────────────
        return (
            <div className={`card ${footerControls ? 'with-inline-controls' : ''}`}>
                <div className="card-content-area">
                    <div className="character">{item.character}</div>
                    <div className="thai-name">{item.thaiName}</div>
                    <div
                        data-testid="name-label"
                        className={`name-label ${!showDetails ? 'hidden' : ''}`}
                    >
                        {item.name.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="meaning-label"
                        className={`meaning-label ${!showDetails ? 'hidden' : ''}`}
                    >
                        {item.englishMeaning.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="class-label"
                        className={`class-label ${!showDetails ? 'hidden' : ''}`}
                        style={{ color: CLASS_COLORS[item.class] }}
                    >
                        {item.class.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="pair-label"
                        className={`pair-label ${item.class !== 'Low' || !showDetails ? 'hidden' : ''}`}
                    >
                        {item.class === 'Low'
                            ? (item.pair
                                ? `pair\u00a0\u2192\u00a0${item.pair}`
                                : 'unpaired')
                            : ' '}
                    </div>
                </div>
                {footerControls}
            </div>
        );
    }

    // ── Vowel card ────────────────────────────────────────────────────────────
    if (item.type === 'vowel') {
        return (
            <div className={`card ${footerControls ? 'with-inline-controls' : ''}`}>
                <div className="card-content-area">
                    <div className="character">{item.symbol}</div>
                    <div className="thai-name">{item.thaiName}</div>
                    <div
                        data-testid="vowel-name-label"
                        className={`name-label ${!showDetails ? 'hidden' : ''}`}
                    >
                        {item.name.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="vowel-romanisation-label"
                        className={`meaning-label ${!showDetails ? 'hidden' : ''}`}
                    >
                        {item.romanisation.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="vowel-length-label"
                        className={`class-label ${!showDetails ? 'hidden' : ''}`}
                        style={{ color: LENGTH_COLORS[item.length] }}
                    >
                        {item.length.toLocaleLowerCase()}
                    </div>
                    <div
                        data-testid="vowel-example-label"
                        className={`pair-label ${!showDetails ? 'hidden' : ''}`}
                    >
                        {item.exampleWord} = {item.exampleMeaning.toLocaleLowerCase()}
                    </div>
                </div>
                {footerControls}
            </div>
        );
    }

    // ── Tonal rule card ───────────────────────────────────────────────────────
    return (
        <div className={`card rule-card ${footerControls ? 'with-inline-controls' : ''}`}>
            <div className="card-content-area">
                <div className="rule-word">{item.thaiWord}</div>
                <div
                    data-testid="rule-romanisation"
                    className={`rule-romanisation ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.romanisation.toLocaleLowerCase()}
                </div>
                <div
                    data-testid="rule-meaning"
                    className={`rule-meaning ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.meaning.toLocaleLowerCase()}
                </div>
                <div
                    data-testid="rule-label"
                    className={`rule-label ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.ruleLabel.toLocaleLowerCase()}
                </div>
                <div
                    data-testid="rule-consonant"
                    className={`rule-consonant ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.consonantThai} · {item.consonantLatin.toLocaleLowerCase()}
                </div>
                <div
                    data-testid="rule-tone-mark"
                    className={`rule-tone-mark ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.toneMarkThai
                        ? `${item.toneMarkThai} · ${(item.toneMarkLatin ?? '').toLocaleLowerCase()}`
                        : '\u00a0'}
                </div>
                <div
                    data-testid="rule-tone"
                    className={`rule-tone ${!showDetails ? 'hidden' : ''}`}
                >
                    {item.tone.toLocaleLowerCase()}
                </div>
            </div>
            {footerControls}
        </div>
    );
}

// ─── FlashcardDeck component ─────────────────────────────────────────────────

interface FlashcardDeckProps {
    data: FlashcardItem[];
    onBack: () => void;
    isImprovementSelected?: (cardId: string) => boolean;
    onToggleImprovement?: (cardId: string, label: string) => void;
}

export function FlashcardDeck({
    data,
    onBack,
    isImprovementSelected,
    onToggleImprovement,
}: FlashcardDeckProps) {
    const [deck, setDeck] = useState<FlashcardItem[]>(() => shuffleArray(data));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    const isDeckComplete = currentIndex >= deck.length;
    const currentCard = !isDeckComplete ? deck[currentIndex] : null;
    const currentCardId = currentCard ? getFlashcardId(currentCard) : null;

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
        if (!currentCard) {
            return;
        }
        speakThai(getFlashcardSpeechText(currentCard));
    }

    function handleNext() {
        setCurrentIndex(i => i + 1);
        setShowDetails(false);
    }

    function handlePrev() {
        setCurrentIndex(i => Math.max(0, i - 1));
        setShowDetails(false);
    }

    function handleToggleImprovement() {
        if (!currentCard || !currentCardId || !onToggleImprovement) {
            return;
        }
        onToggleImprovement(currentCardId, getFlashcardLabel(currentCard));
    }

    function handleLongPressReveal() {
        setShowDetails(v => !v);
    }

    const gestureHandlers = useCardGestures({
        onSwipeNext: handleNext,
        onSwipePrev: handlePrev,
        onDoubleTap: handleToggleImprovement,
        onSingleTapMiddle: handleSpeak,
        onSingleTapLeft: handlePrev,
        onSingleTapRight: handleNext,
        onLongPressMiddle: handleLongPressReveal,
    });

    const inlineControls = (
        <div className="card-inline-controls">
            <button
                data-testid="play-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={handleSpeak}
            >
                ▶ Listen
            </button>
            <button
                data-testid="toggle-details-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={() => setShowDetails(v => !v)}
            >
                {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
        </div>
    );

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
                    <div
                        className="gesture-surface"
                        data-testid="card-gesture-surface"
                        {...gestureHandlers}
                    >
                        <Card item={deck[currentIndex]} showDetails={showDetails} footerControls={inlineControls} />
                    </div>
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

// ─── Vocabulary card ─────────────────────────────────────────────────────────

interface VocabCardProps {
    item: VocabItem;
    showAnswer: boolean;
    direction: QuizDirection;
    footerControls?: React.ReactNode;
}

function VocabCard({ item, showAnswer, direction, footerControls }: VocabCardProps) {
    const thToEn = direction === 'th-to-en';
    const latinised = item.latinised;
    const english = item.english;
    const questionLine1 = thToEn ? latinised : english;
    const questionLine2 = thToEn ? item.thai : item.grammar;
    const solutionLine1 = thToEn ? english : latinised;
    const solutionLine2 = thToEn ? item.grammar : item.thai;

    return (
        <div className={`card vocab-card ${footerControls ? 'with-inline-controls' : ''}`}>
            <div className="card-content-area">
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
            {footerControls}
        </div>
    );
}

// ─── VocabularyDeck component ────────────────────────────────────────────────

interface VocabularyDeckProps {
    onBack: () => void;
    isImprovementSelected?: (cardId: string) => boolean;
    onToggleImprovement?: (cardId: string, label: string) => void;
}

export function VocabularyDeck({
    onBack,
    isImprovementSelected,
    onToggleImprovement,
}: VocabularyDeckProps) {
    const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | null>(null);
    const [deck, setDeck] = useState<VocabItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [direction, setDirection] = useState<QuizDirection>('en-to-th');

    const isDeckComplete = deck.length > 0 && currentIndex >= deck.length;
    const currentCard = !isDeckComplete ? deck[currentIndex] : null;
    const currentCardId = currentCard ? getVocabularyId(currentCard) : null;

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
        if (!currentCard) {
            return;
        }
        speakThai(currentCard.thai, currentCard.audio);
    }

    function handleNext() {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
    }

    function handlePrev() {
        setCurrentIndex(i => Math.max(0, i - 1));
        setShowAnswer(false);
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

    function handleToggleImprovement() {
        if (!currentCard || !currentCardId || !onToggleImprovement) {
            return;
        }
        onToggleImprovement(currentCardId, currentCard.english);
    }

    function handleLongPressReveal() {
        setShowAnswer(v => !v);
    }

    const gestureHandlers = useCardGestures({
        onSwipeNext: handleNext,
        onSwipePrev: handlePrev,
        onDoubleTap: handleToggleImprovement,
        onSingleTapMiddle: handleSpeak,
        onSingleTapLeft: handlePrev,
        onSingleTapRight: handleNext,
        onLongPressMiddle: handleLongPressReveal,
    });

    const inlineControls = (
        <div className="card-inline-controls">
            <button
                data-testid="play-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={handleSpeak}
            >
                ▶ Listen
            </button>
            <button
                data-testid="toggle-answer-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={() => setShowAnswer(v => !v)}
            >
                {showAnswer ? 'Hide Solution' : 'Show Solution'}
            </button>
        </div>
    );

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
                    <div
                        className="gesture-surface"
                        data-testid="card-gesture-surface"
                        {...gestureHandlers}
                    >
                        <VocabCard
                            item={deck[currentIndex]}
                            showAnswer={showAnswer}
                            direction={direction}
                            footerControls={inlineControls}
                        />
                    </div>
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

// ─── Speaking card ────────────────────────────────────────────────────────────

interface ExerciseCardProps {
    item: Exercise;
    showAnswer: boolean;
    direction: QuizDirection;
    footerControls?: React.ReactNode;
}

function ExerciseCard({ item, showAnswer, direction, footerControls }: ExerciseCardProps) {
    const categoryLabelRaw = EXERCISE_CATEGORIES.find(c => c.id === item.category)?.label ?? item.category;
    const categoryLabel = categoryLabelRaw.toLocaleLowerCase();

    const enToTh = direction === 'en-to-th';
    const prompt = item.prompt;
    const latinised = item.latinised;
    const questionText = enToTh ? prompt : latinised;
    const solutionLine1 = enToTh ? latinised : prompt;
    const solutionLine2 = enToTh ? item.thai : null;
    const questionLine2 = enToTh ? null : item.thai;

    return (
        <div className={`card speaking-card ${footerControls ? 'with-inline-controls' : ''}`}>
            <div className="card-content-area">
                <div
                    className="speaking-category"
                    data-testid="speaking-category"
                >
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
            {footerControls}
        </div>
    );
}

// ─── ExerciseDeck component ──────────────────────────────────────────────────

interface ExerciseDeckProps {
    onBack: () => void;
    isImprovementSelected?: (cardId: string) => boolean;
    onToggleImprovement?: (cardId: string, label: string) => void;
}

export function ExerciseDeck({
    onBack,
    isImprovementSelected,
    onToggleImprovement,
}: ExerciseDeckProps) {
    const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
    const [deck, setDeck] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [direction, setDirection] = useState<QuizDirection>('en-to-th');

    const isDeckComplete = deck.length > 0 && currentIndex >= deck.length;
    const currentCard = !isDeckComplete ? deck[currentIndex] : null;
    const currentCardId = currentCard ? getExerciseId(currentCard) : null;

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
        if (!currentCard) {
            return;
        }
        speakThai(currentCard.thai, currentCard.audio);
    }

    function handleNext() {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
    }

    function handlePrev() {
        setCurrentIndex(i => Math.max(0, i - 1));
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

    function handleToggleImprovement() {
        if (!currentCard || !currentCardId || !onToggleImprovement) {
            return;
        }
        onToggleImprovement(currentCardId, currentCard.prompt);
    }

    function handleLongPressReveal() {
        setShowAnswer(v => !v);
    }

    const gestureHandlers = useCardGestures({
        onSwipeNext: handleNext,
        onSwipePrev: handlePrev,
        onDoubleTap: handleToggleImprovement,
        onSingleTapMiddle: handleSpeak,
        onSingleTapLeft: handlePrev,
        onSingleTapRight: handleNext,
        onLongPressMiddle: handleLongPressReveal,
    });

    const inlineControls = (
        <div className="card-inline-controls">
            <button
                data-testid="play-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={handleSpeak}
            >
                ▶ Listen
            </button>
            <button
                data-testid="toggle-answer-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={() => setShowAnswer(v => !v)}
            >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
        </div>
    );

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
                    <div
                        className="gesture-surface"
                        data-testid="card-gesture-surface"
                        {...gestureHandlers}
                    >
                        <ExerciseCard
                            item={deck[currentIndex]}
                            showAnswer={showAnswer}
                            direction={direction}
                            footerControls={inlineControls}
                        />
                    </div>
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

// ─── ImprovementNeeded deck ──────────────────────────────────────────────────

interface ImprovementDeckProps {
    cards: ImprovementCard[];
    onBack: () => void;
    onClear: () => void;
    isImprovementSelected: (cardId: string) => boolean;
    onToggleImprovement: (cardId: string, label: string) => void;
}

function ImprovementDeck({
    cards,
    onBack,
    onClear,
    isImprovementSelected,
    onToggleImprovement,
}: ImprovementDeckProps) {
    const [deck, setDeck] = useState<ImprovementCard[]>(() => shuffleArray(cards));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [direction, setDirection] = useState<QuizDirection>('en-to-th');

    useEffect(() => {
        setDeck(shuffleArray(cards));
        setCurrentIndex(0);
        setShowDetails(false);
    }, [cards]);

    const isDeckComplete = deck.length > 0 && currentIndex >= deck.length;
    const currentCard = !isDeckComplete ? deck[currentIndex] : null;
    const isScriptCard = currentCard?.kind === 'script';

    function handleRestart() {
        setDeck(shuffleArray(cards));
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleShuffle() {
        setDeck(shuffleArray(cards));
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleBackToStart() {
        setCurrentIndex(0);
        setShowDetails(false);
    }

    function handleSpeak() {
        if (!currentCard) {
            return;
        }

        if (currentCard.kind === 'script') {
            speakThai(getFlashcardSpeechText(currentCard.item));
            return;
        }

        speakThai(currentCard.item.thai, currentCard.item.audio);
    }

    function handleNext() {
        setCurrentIndex(i => i + 1);
        setShowDetails(false);
    }

    function handlePrev() {
        setCurrentIndex(i => Math.max(0, i - 1));
        setShowDetails(false);
    }

    function handleToggleDirection() {
        setDirection(d => d === 'en-to-th' ? 'th-to-en' : 'en-to-th');
        setShowDetails(false);
    }

    function handleToggleImprovement() {
        if (!currentCard) {
            return;
        }
        onToggleImprovement(currentCard.id, getImprovementCardLabel(currentCard));
    }

    function handleLongPressReveal() {
        setShowDetails(v => !v);
    }

    const gestureHandlers = useCardGestures({
        onSwipeNext: handleNext,
        onSwipePrev: handlePrev,
        onDoubleTap: handleToggleImprovement,
        onSingleTapMiddle: handleSpeak,
        onSingleTapLeft: handlePrev,
        onSingleTapRight: handleNext,
        onLongPressMiddle: handleLongPressReveal,
    });

    const inlineControls = (
        <div className="card-inline-controls">
            <button
                data-testid="play-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={handleSpeak}
            >
                ▶ Listen
            </button>
            <button
                data-testid="toggle-details-btn"
                type="button"
                className="card-inline-button"
                onMouseDown={stopGesturePropagation}
                onMouseUp={stopGesturePropagation}
                onTouchStart={stopGesturePropagation}
                onTouchEnd={stopGesturePropagation}
                onClick={() => setShowDetails(v => !v)}
            >
                {showDetails
                    ? (isScriptCard ? 'Hide Details' : 'Hide Solution')
                    : (isScriptCard ? 'Show Details' : 'Show Solution')}
            </button>
        </div>
    );

    function renderCurrentCard() {
        if (!currentCard) {
            return null;
        }

        if (currentCard.kind === 'script') {
            return <Card item={currentCard.item} showDetails={showDetails} footerControls={inlineControls} />;
        }

        if (currentCard.kind === 'vocabulary') {
            return (
                <VocabCard
                    item={currentCard.item}
                    showAnswer={showDetails}
                    direction={direction}
                    footerControls={inlineControls}
                />
            );
        }

        return (
            <ExerciseCard
                item={currentCard.item}
                showAnswer={showDetails}
                direction={direction}
                footerControls={inlineControls}
            />
        );
    }

    if (deck.length === 0) {
        return (
            <div className="container">
                <div className="centred">
                    <div className="menu-title">Improvement Needed</div>
                    <div className="menu-subtitle">No cards yet. Double tap any card to add it here.</div>
                    <button className="button menu-button" onClick={onBack}>
                        Back
                    </button>
                    <button className="button menu-button back-button" onClick={onClear}>
                        Clear Cache
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
                        <button className="button" onClick={onClear}>
                            Clear List
                        </button>
                        <button className="button back-button" onClick={onBack}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            ) : (
                <div className="centred">
                    {!isScriptCard && (
                        <button
                            data-testid="toggle-direction-btn"
                            className="direction-toggle"
                            onClick={handleToggleDirection}
                        >
                            {direction === 'en-to-th' ? 'EN → TH' : 'TH → EN'}
                        </button>
                    )}
                    <div
                        className="gesture-surface"
                        data-testid="card-gesture-surface"
                        {...gestureHandlers}
                    >
                        {renderCurrentCard()}
                    </div>
                    <div className="button-row">
                        <button
                            data-testid="prev-btn"
                            className="button"
                            disabled={currentIndex === 0}
                            onClick={handlePrev}
                        >
                            Previous
                        </button>
                        <button className="button" onClick={handleNext}>
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
                    <button className="util-button" onClick={onClear}>
                        Clear List
                    </button>
                    <button className="util-button util-button-back" onClick={onBack}>
                        Back to Menu
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Script deck selector ────────────────────────────────────────────────────

type ScriptMode = 'MENU' | 'CONSONANTS' | 'TONAL' | 'VOWELS';

interface ScriptScreenProps {
    onBack: () => void;
    isImprovementSelected: (cardId: string) => boolean;
    onToggleImprovement: (cardId: string, label: string) => void;
}

function ScriptScreen({
    onBack,
    isImprovementSelected,
    onToggleImprovement,
}: ScriptScreenProps) {
    const [mode, setMode] = useState<ScriptMode>('MENU');

    if (mode === 'CONSONANTS') {
        return (
            <FlashcardDeck
                data={CONSONANTS}
                onBack={() => setMode('MENU')}
                isImprovementSelected={isImprovementSelected}
                onToggleImprovement={onToggleImprovement}
            />
        );
    }

    if (mode === 'TONAL') {
        return (
            <FlashcardDeck
                data={TONAL_RULES}
                onBack={() => setMode('MENU')}
                isImprovementSelected={isImprovementSelected}
                onToggleImprovement={onToggleImprovement}
            />
        );
    }

    if (mode === 'VOWELS') {
        return (
            <FlashcardDeck
                data={VOWELS}
                onBack={() => setMode('MENU')}
                isImprovementSelected={isImprovementSelected}
                onToggleImprovement={onToggleImprovement}
            />
        );
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

type AppMode = 'HOME' | 'SCRIPT' | 'VOCABULARY' | 'SPEAKING' | 'IMPROVEMENT';

export default function App() {
    const [mode, setMode] = useState<AppMode>('HOME');
    const [improvementIds, setImprovementIds] = useState<Set<string>>(() => {
        const loaded = loadImprovementCache();
        return new Set([...loaded].filter(id => IMPROVEMENT_LIBRARY_BY_ID.has(id)));
    });
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        saveImprovementCache(improvementIds);
    }, [improvementIds]);

    useEffect(() => {
        if (!notification) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setNotification(null);
        }, 1000);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [notification]);

    const improvementCards = useMemo(() => {
        if (improvementIds.size === 0) {
            return [];
        }
        return IMPROVEMENT_LIBRARY.filter(card => improvementIds.has(card.id));
    }, [improvementIds]);

    function isImprovementSelected(cardId: string): boolean {
        return improvementIds.has(cardId);
    }

    function handleToggleImprovement(cardId: string, label: string) {
        setImprovementIds(prev => {
            const next = new Set(prev);
            const added = !next.has(cardId);
            if (added) {
                next.add(cardId);
            } else {
                next.delete(cardId);
            }

            setNotification(added ? 'added to improvement needed deck' : 'removed from improvement needed deck');

            return next;
        });
    }

    function handleClearImprovementCache() {
        setImprovementIds(new Set());
        setNotification('improvement needed cache cleared');
    }

    const screen = (() => {
        if (mode === 'SCRIPT') {
            return (
                <ScriptScreen
                    onBack={() => setMode('HOME')}
                    isImprovementSelected={isImprovementSelected}
                    onToggleImprovement={handleToggleImprovement}
                />
            );
        }

        if (mode === 'VOCABULARY') {
            return (
                <VocabularyDeck
                    onBack={() => setMode('HOME')}
                    isImprovementSelected={isImprovementSelected}
                    onToggleImprovement={handleToggleImprovement}
                />
            );
        }

        if (mode === 'SPEAKING') {
            return (
                <ExerciseDeck
                    onBack={() => setMode('HOME')}
                    isImprovementSelected={isImprovementSelected}
                    onToggleImprovement={handleToggleImprovement}
                />
            );
        }

        if (mode === 'IMPROVEMENT') {
            return (
                <ImprovementDeck
                    cards={improvementCards}
                    onBack={() => setMode('HOME')}
                    onClear={handleClearImprovementCache}
                    isImprovementSelected={isImprovementSelected}
                    onToggleImprovement={handleToggleImprovement}
                />
            );
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
                        onClick={() => setMode('IMPROVEMENT')}
                    >
                        Improvement Needed
                    </button>
                </div>
            </div>
        );
    })();

    return (
        <>
            {screen}
            {notification && (
                <div className="toast-notification" data-testid="improvement-toast" role="status">
                    {notification}
                </div>
            )}
        </>
    );
}
