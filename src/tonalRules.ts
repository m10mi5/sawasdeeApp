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
    type: 'rule';
}

export const TONAL_RULES: TonalRule[] = [
    {
        ruleLabel: 'Mid Class + Long Vowel',
        thaiWord: 'กา',
        romanisation: 'gaa',
        meaning: 'crow',
        tone: 'Mid Tone',
        consonantThai: 'กอ ไก่',
        consonantLatin: 'Ko Kai',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Short Vowel',
        thaiWord: 'จับ',
        romanisation: 'jàp',
        meaning: 'to catch',
        tone: 'Low Tone',
        consonantThai: 'จอ จาน',
        consonantLatin: 'Jo Jan',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Ek (่)',
        thaiWord: 'จ่า',
        romanisation: 'jàa',
        meaning: 'sergeant',
        tone: 'Low Tone',
        consonantThai: 'จอ จาน',
        consonantLatin: 'Jo Jan',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Tho (้)',
        thaiWord: 'จ้า',
        romanisation: 'jâa',
        meaning: 'yes! (emphatic)',
        tone: 'Falling Tone',
        consonantThai: 'จอ จาน',
        consonantLatin: 'Jo Jan',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Tri (๊)',
        thaiWord: 'โต๊ะ',
        romanisation: 'dtó',
        meaning: 'table',
        tone: 'High Tone',
        consonantThai: 'ตอ เต่า',
        consonantLatin: 'To Tao',
        toneMarkThai: 'ไม้ตรี',
        toneMarkLatin: 'Mai Tri',
        type: 'rule',
    },
    {
        ruleLabel: 'Mid Class + Mai Chattawa (๋)',
        thaiWord: 'ก๋วยเตี๋ยว',
        romanisation: 'gǔai dtǐao',
        meaning: 'noodles',
        tone: 'Rising Tone',
        consonantThai: 'กอ ไก่',
        consonantLatin: 'Ko Kai',
        toneMarkThai: 'ไม้จัตวา',
        toneMarkLatin: 'Mai Chattawa',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Long Vowel',
        thaiWord: 'ขา',
        romanisation: 'khǎa',
        meaning: 'leg',
        tone: 'Rising Tone',
        consonantThai: 'ขอ ไข่',
        consonantLatin: 'Kho Khai',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Short Vowel',
        thaiWord: 'ขับ',
        romanisation: 'khàp',
        meaning: 'to drive',
        tone: 'Low Tone',
        consonantThai: 'ขอ ไข่',
        consonantLatin: 'Kho Khai',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Mai Ek (่)',
        thaiWord: 'ข่า',
        romanisation: 'khàa',
        meaning: 'galangal',
        tone: 'Low Tone',
        consonantThai: 'ขอ ไข่',
        consonantLatin: 'Kho Khai',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        type: 'rule',
    },
    {
        ruleLabel: 'High Class + Mai Tho (้)',
        thaiWord: 'ข้าว',
        romanisation: 'khâao',
        meaning: 'rice',
        tone: 'Falling Tone',
        consonantThai: 'ขอ ไข่',
        consonantLatin: 'Kho Khai',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Long Vowel',
        thaiWord: 'คา',
        romanisation: 'khaa',
        meaning: 'to be stuck',
        tone: 'Mid Tone',
        consonantThai: 'คอ ควาย',
        consonantLatin: 'Kho Khwai',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Short Vowel',
        thaiWord: 'คะ',
        romanisation: 'khá',
        meaning: 'polite particle (f.)',
        tone: 'High Tone',
        consonantThai: 'คอ ควาย',
        consonantLatin: 'Kho Khwai',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Mai Ek (่)',
        thaiWord: 'ค่า',
        romanisation: 'khâa',
        meaning: 'value / cost',
        tone: 'Falling Tone',
        consonantThai: 'คอ ควาย',
        consonantLatin: 'Kho Khwai',
        toneMarkThai: 'ไม้เอก',
        toneMarkLatin: 'Mai Ek',
        type: 'rule',
    },
    {
        ruleLabel: 'Low Class + Mai Tho (้)',
        thaiWord: 'ค้า',
        romanisation: 'kháa',
        meaning: 'to trade',
        tone: 'High Tone',
        consonantThai: 'คอ ควาย',
        consonantLatin: 'Kho Khwai',
        toneMarkThai: 'ไม้โท',
        toneMarkLatin: 'Mai Tho',
        type: 'rule',
    },
];
