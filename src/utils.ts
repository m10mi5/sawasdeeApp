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
