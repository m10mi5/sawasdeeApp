/**
 * Speak Thai text using the browser's Web Speech API.
 * Falls back silently if SpeechSynthesis is unavailable.
 */
export function speakThai(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th';
    window.speechSynthesis.speak(utterance);
}
