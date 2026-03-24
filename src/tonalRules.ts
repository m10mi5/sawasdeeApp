export interface TonalRule {
    /** Short rule description shown on the card front, e.g. 'Mid Class + Long Vowel' */
    ruleLabel: string;
    /** Thai example word illustrating the rule */
    thaiWord: string;
    /** Latinised romanisation with tonal diacritic (à low · â falling · á high · ǎ rising · unmarked = mid) */
    romanisation: string;
    /** English meaning of the example word */
    meaning: string;
    /** Resulting tone name */
    tone: string;
    /** Consonant name in Thai script, e.g. 'กอ ไก่' */
    consonantThai: string;
    /** Consonant name romanised, e.g. 'Ko Kai' */
    consonantLatin: string;
    /** Tone mark name in Thai script, e.g. 'ไม้เอก' — omitted for unmarked syllables */
    toneMarkThai?: string;
    /** Tone mark name romanised, e.g. 'Mai Ek' — omitted for unmarked syllables */
    toneMarkLatin?: string;
    /** Audio filename in public/audio/ for the example word */
    audio?: string;
    type: 'rule';
}

export const TONAL_RULES: TonalRule[] = [
    // ── Mid Class ─────────────────────────────────────────────────────────────
    {
        ruleLabel: 'Mid Class + Live + Long Vowel',
        thaiWord: 'ตา',
        romanisation: 'dtaa',
        meaning: 'eye',
        tone: 'Mid Tone',
        consonantThai: 'ตอ เต่า',
        consonantLatin: 'To Tao',
        audio: '2023-05-16-10-46-55intro-session1_1.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Dead + Short Vowel',
        thaiWord: 'กับ',
        romanisation: 'gàp',
        meaning: 'with',
        tone: 'Low Tone',
        consonantThai: 'กอ ไก่',
        consonantLatin: 'Ko Kai',
        audio: '2023-05-16-11-20-13intro-session1_30.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Dead + Long Vowel',
        thaiWord: 'ปาก',
        romanisation: 'bpàak',
        meaning: 'mouth',
        tone: 'Low Tone',
        consonantThai: 'ปอ ปลา',
        consonantLatin: 'Po Pla',
        audio: '2023-09-12-11-02-48session13-5.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Ek (่)',
        thaiWord: 'เก่า',
        romanisation: 'gào',
        meaning: 'old (things)',
        tone: 'Low Tone',
        consonantThai: 'กอ ไก่',
        consonantLatin: 'Ko Kai',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        audio: '2023-08-31-09-31-57session11-9.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Tho (้)',
        thaiWord: 'บ้าน',
        romanisation: 'bâan',
        meaning: 'house',
        tone: 'Falling Tone',
        consonantThai: 'บอ ใบไม้',
        consonantLatin: 'Bo Baimai',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        audio: '2023-05-16-11-26-35session2_19.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Tri (๊)',
        thaiWord: 'ตุ๊กตุ๊ก',
        romanisation: 'dtúk dtúk',
        meaning: 'tricycle taxi',
        tone: 'High Tone',
        consonantThai: 'ตอ เต่า',
        consonantLatin: 'To Tao',
        toneMarkThai: 'ไม้ตรี',
        toneMarkLatin: 'Mai Tri',
        audio: '2023-09-12-16-41-17session14-29.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Chattawa (๋)',
        thaiWord: 'ตั๋ว',
        romanisation: 'dtǔa',
        meaning: 'ticket',
        tone: 'Rising Tone',
        consonantThai: 'ตอ เต่า',
        consonantLatin: 'To Tao',
        toneMarkThai: 'ไม้จัตวา',
        toneMarkLatin: 'Mai Chattawa',
        audio: '2023-09-12-16-59-45session14-38.mp3',
        type: 'rule',
    },

    // ── High Class ────────────────────────────────────────────────────────────
    {
        ruleLabel: 'High Class + Live + Long Vowel',
        thaiWord: 'สาม',
        romanisation: 'sǎam',
        meaning: '3',
        tone: 'Rising Tone',
        consonantThai: 'สอ เสือ',
        consonantLatin: 'So Suea',
        audio: '2023-05-24-09-38-58session4-3.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Dead + Short Vowel',
        thaiWord: 'สิบ',
        romanisation: 'sìp',
        meaning: '10',
        tone: 'Low Tone',
        consonantThai: 'สอ เสือ',
        consonantLatin: 'So Suea',
        audio: '2023-05-24-13-45-12session4-10.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Dead + Long Vowel',
        thaiWord: 'ถูก',
        romanisation: 'tùuk',
        meaning: 'cheap',
        tone: 'Low Tone',
        consonantThai: 'ถอ ถุง',
        consonantLatin: 'Tho Thung',
        audio: '2023-05-25-09-33-35session4-9.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Mai Ek (่)',
        thaiWord: 'สี่',
        romanisation: 'sìi',
        meaning: '4',
        tone: 'Low Tone',
        consonantThai: 'สอ เสือ',
        consonantLatin: 'So Suea',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        audio: '2023-05-24-13-20-04session4-4.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Mai Tho (้)',
        thaiWord: 'ข้าว',
        romanisation: 'kâow',
        meaning: 'rice',
        tone: 'Falling Tone',
        consonantThai: 'ขอ ไข่',
        consonantLatin: 'Kho Khai',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        audio: '2023-05-16-11-24-08intro-session1_35.mp3',
        type: 'rule',
    },

    // ── Low Class ─────────────────────────────────────────────────────────────
    {
        ruleLabel: 'Low Class + Live + Long Vowel',
        thaiWord: 'มา',
        romanisation: 'maa',
        meaning: 'to come',
        tone: 'Mid Tone',
        consonantThai: 'มอ ม้า',
        consonantLatin: 'Mo Ma',
        audio: '2023-05-16-11-13-50intro-session1_24.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Dead + Short Vowel',
        thaiWord: 'คะ',
        romanisation: 'ká',
        meaning: 'polite particle (f.)',
        tone: 'High Tone',
        consonantThai: 'คอ ควาย',
        consonantLatin: 'Kho Khwai',
        audio: '2023-05-16-15-59-30intro-session1_98.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Dead + Long Vowel',
        thaiWord: 'มาก',
        romanisation: 'mâak',
        meaning: 'very / a lot',
        tone: 'Falling Tone',
        consonantThai: 'มอ ม้า',
        consonantLatin: 'Mo Ma',
        audio: '2023-05-16-15-04-25intro-session1_78.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Mai Ek (่)',
        thaiWord: 'แม่',
        romanisation: 'mâe',
        meaning: 'mother',
        tone: 'Falling Tone',
        consonantThai: 'มอ ม้า',
        consonantLatin: 'Mo Ma',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        audio: '2023-05-16-11-10-30intro-session1_17.mp3',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Mai Tho (้)',
        thaiWord: 'น้ำ',
        romanisation: 'naám',
        meaning: 'water',
        tone: 'High Tone',
        consonantThai: 'นอ หนู',
        consonantLatin: 'No Nu',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        audio: '2023-05-16-11-25-34intro-session1_36.mp3',
        type: 'rule',
    },
];
