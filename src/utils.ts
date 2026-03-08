import type React from 'react';

/**
 * Returns an inline style that shrinks the font when `text` is too long to
 * fit a single line inside the card.  The usable width is derived from the
 * viewport so it works on small screens (card = 100vw − 32px, max 400px,
 * minus 2 × 16px padding).  Returns `undefined` when the default CSS
 * font-size is sufficient.
 */
export function autoFitStyle(
    text: string,
    basePx: number,
): React.CSSProperties | undefined {
    const cardWidth = Math.min(window.innerWidth - 32, 400);
    const cardInner = cardWidth - 32;          // 2 × 16 px padding
    const CHAR_RATIO = 0.55;
    const MIN_FONT = 11;
    const maxChars = Math.floor(cardInner / (basePx * CHAR_RATIO));
    if (text.length <= maxChars) return undefined;
    const size = Math.max(Math.floor(cardInner / (text.length * CHAR_RATIO)), MIN_FONT);
    return { fontSize: size, lineHeight: `${size + 8}px` };
}

/**
 * Returns a shuffled copy of the input array using the Fisher-Yates (Knuth)
 * algorithm. The original array is never mutated.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
