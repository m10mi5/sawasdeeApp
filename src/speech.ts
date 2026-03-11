/// <reference types="vite/client" />

/**
 * Play an audio file from public/audio/.
 * Falls back to browser TTS if no audio file is provided.
 */
export function speakThai(text: string, audioFile?: string): void {
    if (audioFile) {
        const audio = new Audio(`${import.meta.env.BASE_URL}audio/${audioFile}`);
        audio.play();
        return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th';
    window.speechSynthesis.speak(utterance);
}
