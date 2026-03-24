export interface Vowel {
    /** Vowel placed on ก as example consonant, e.g. 'กา', 'กิ', 'เก' */
    symbol: string;
    /** Thai name of the vowel, e.g. 'สระ อา' */
    thaiName: string;
    /** Romanised name, e.g. 'Sara Aa' */
    name: string;
    /** Phonetic value with tonal diacritic convention omitted (pure vowel sound), e.g. 'aa' */
    romanisation: string;
    length: 'Short' | 'Long' | 'Diphthong' | 'Special';
    /** Real Thai word demonstrating the vowel */
    exampleWord: string;
    /** English meaning of the example word */
    exampleMeaning: string;
    /** Romanised pronunciation of the example word, sourced from vocabulary.ts */
    exampleRomanisation?: string;
    /** Audio filename in public/audio/ for the example word */
    audio?: string;
    /** Vowel form in a closed syllable (with final consonant), e.g. 'กัก' for Sara A */
    closedSymbol?: string;
    /** True for very rare vowels (short diphthong forms) */
    rare?: boolean;
    type: 'vowel';
}

export const VOWELS: Vowel[] = [
    // ── Short vowels (12) ─────────────────────────────────────────────────────
    {
        symbol: 'กะ', thaiName: 'สระ อะ', name: 'Sara A',
        romanisation: 'a', length: 'Short',
        exampleWord: 'คะ', exampleMeaning: 'polite particle (female)',
        exampleRomanisation: 'ká',
        audio: '2023-05-16-15-59-30intro-session1_98.mp3',
        closedSymbol: 'กัก',
        type: 'vowel',
    },
    {
        symbol: 'กิ', thaiName: 'สระ อิ', name: 'Sara I',
        romanisation: 'i', length: 'Short',
        exampleWord: 'กิน', exampleMeaning: 'to eat',
        exampleRomanisation: 'gin',
        audio: '2023-05-16-10-48-23intro-session1_3.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กึ', thaiName: 'สระ อึ', name: 'Sara Ue',
        romanisation: 'ue', length: 'Short',
        exampleWord: 'คิดถึง', exampleMeaning: 'to miss',
        exampleRomanisation: 'kít tǔng',
        audio: '2023-05-30-09-32-41session8-18.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กุ', thaiName: 'สระ อุ', name: 'Sara U',
        romanisation: 'u', length: 'Short',
        exampleWord: 'คุณ', exampleMeaning: 'you',
        exampleRomanisation: 'kun',
        audio: '2023-05-16-11-30-50intro-session1_45.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เกะ', thaiName: 'สระ เอะ', name: 'Sara E',
        romanisation: 'e', length: 'Short',
        exampleWord: 'เจ็บ', exampleMeaning: 'hurt / injured',
        exampleRomanisation: 'jèp',
        audio: '2023-09-12-11-27-24session13-19.mp3',
        closedSymbol: 'เก็ก',
        type: 'vowel',
    },
    {
        symbol: 'แกะ', thaiName: 'สระ แอะ', name: 'Sara Ae',
        romanisation: 'ae', length: 'Short',
        exampleWord: 'น้ำแข็ง', exampleMeaning: 'ice',
        exampleRomanisation: 'naám kǎeng',
        audio: '2023-05-26-10-16-01session5-3.mp3',
        closedSymbol: 'แก็ก',
        type: 'vowel',
    },
    {
        symbol: 'โกะ', thaiName: 'สระ โอะ', name: 'Sara O',
        romanisation: 'o', length: 'Short',
        exampleWord: 'น้ำตก', exampleMeaning: 'waterfall',
        exampleRomanisation: 'náam dtòk',
        audio: '2023-05-16-13-51-35session2_46.mp3',
        closedSymbol: 'กก',
        type: 'vowel',
    },
    {
        symbol: 'เกาะ', thaiName: 'สระ เอาะ', name: 'Sara Aw',
        romanisation: 'aw', length: 'Short',
        exampleWord: 'เพราะว่า', exampleMeaning: 'because',
        exampleRomanisation: 'pŕɔ wâa',
        audio: '2023-05-30-10-45-51session9-1.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เกอะ', thaiName: 'สระ เออะ', name: 'Sara Oe (short)',
        romanisation: 'oe', length: 'Short',
        exampleWord: 'เลอะ', exampleMeaning: 'messy / smeared',
        rare: true,
        type: 'vowel',
    },
    {
        symbol: 'เกียะ', thaiName: 'สระ เอียะ', name: 'Sara Ia (short)',
        romanisation: 'ia', length: 'Short',
        exampleWord: 'เกียะ', exampleMeaning: 'wooden clog',
        rare: true,
        type: 'vowel',
    },
    {
        symbol: 'เกือะ', thaiName: 'สระ เอือะ', name: 'Sara Uea (short)',
        romanisation: 'uea', length: 'Short',
        exampleWord: 'เกือะ', exampleMeaning: '(rare vowel)',
        rare: true,
        type: 'vowel',
    },
    {
        symbol: 'กัวะ', thaiName: 'สระ อัวะ', name: 'Sara Ua (short)',
        romanisation: 'ua', length: 'Short',
        exampleWord: 'ผัวะ', exampleMeaning: 'sound of bursting',
        rare: true,
        type: 'vowel',
    },

    // ── Long vowels (12) ──────────────────────────────────────────────────────
    {
        symbol: 'กา', thaiName: 'สระ อา', name: 'Sara Aa',
        romanisation: 'aa', length: 'Long',
        exampleWord: 'มา', exampleMeaning: 'come',
        exampleRomanisation: 'maa',
        audio: '2023-05-16-16-04-30intro-session1_105.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กี', thaiName: 'สระ อี', name: 'Sara Ii',
        romanisation: 'ii', length: 'Long',
        exampleWord: 'ดี', exampleMeaning: 'good / well',
        exampleRomanisation: 'dii',
        audio: '2023-05-16-16-02-19intro-session1_102.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กือ', thaiName: 'สระ อือ', name: 'Sara Uue',
        romanisation: 'uue', length: 'Long',
        exampleWord: 'มือ', exampleMeaning: 'hand',
        exampleRomanisation: 'muu',
        audio: '2023-09-12-11-08-04session13-12.mp3',
        closedSymbol: 'กืน',
        type: 'vowel',
    },
    {
        symbol: 'กู', thaiName: 'สระ อู', name: 'Sara Uu',
        romanisation: 'uu', length: 'Long',
        exampleWord: 'ดู', exampleMeaning: 'to watch',
        exampleRomanisation: 'duu',
        audio: '2023-05-16-11-06-22intro-session1_11.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เก', thaiName: 'สระ เอ', name: 'Sara Ee',
        romanisation: 'ee', length: 'Long',
        exampleWord: 'เก่า', exampleMeaning: 'old (things)',
        exampleRomanisation: 'gào',
        audio: '2023-08-31-09-31-57session11-9.mp3',
        type: 'vowel',
    },
    {
        symbol: 'แก', thaiName: 'สระ แอ', name: 'Sara Aae',
        romanisation: 'aae', length: 'Long',
        exampleWord: 'แม่', exampleMeaning: 'mother',
        exampleRomanisation: 'mâe',
        audio: '2023-05-16-11-10-30intro-session1_17.mp3',
        type: 'vowel',
    },
    {
        symbol: 'โก', thaiName: 'สระ โอ', name: 'Sara Oo',
        romanisation: 'oo', length: 'Long',
        exampleWord: 'โรง', exampleMeaning: 'big building',
        exampleRomanisation: 'roong',
        audio: '2023-05-16-13-42-00session2_40.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กอ', thaiName: 'สระ ออ', name: 'Sara Aaw',
        romanisation: 'aaw', length: 'Long',
        exampleWord: 'รอ', exampleMeaning: 'to wait',
        exampleRomanisation: 'rɔɔ',
        audio: '2023-05-16-10-54-58intro-session1_7.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เกอ', thaiName: 'สระ เออ', name: 'Sara Oe',
        romanisation: 'oe', length: 'Long',
        exampleWord: 'เจอ', exampleMeaning: 'to meet',
        exampleRomanisation: 'jəə',
        audio: '2023-05-16-16-09-26intro-session1_113.mp3',
        closedSymbol: 'เกิน',
        type: 'vowel',
    },
    {
        symbol: 'เกีย', thaiName: 'สระ เอีย', name: 'Sara Ia',
        romanisation: 'ia', length: 'Long',
        exampleWord: 'เบียร์', exampleMeaning: 'beer',
        exampleRomanisation: 'bia',
        audio: '2023-05-16-11-12-56intro-session1_23.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เกือ', thaiName: 'สระ เอือ', name: 'Sara Uea',
        romanisation: 'uea', length: 'Long',
        exampleWord: 'เดือน', exampleMeaning: 'month',
        exampleRomanisation: 'duan',
        audio: '2023-05-26-13-21-56session6-7.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กัว', thaiName: 'สระ อัว', name: 'Sara Ua',
        romanisation: 'ua', length: 'Long',
        exampleWord: 'กลัว', exampleMeaning: 'afraid',
        exampleRomanisation: 'glua',
        audio: '2023-05-16-11-11-32intro-session1_19.mp3',
        closedSymbol: 'กวก',
        type: 'vowel',
    },

    // ── Special vowels (4) ────────────────────────────────────────────────────
    {
        symbol: 'ไก', thaiName: 'ไม้มลาย', name: 'Mai Malai',
        romanisation: 'ai', length: 'Special',
        exampleWord: 'ไก่', exampleMeaning: 'chicken',
        exampleRomanisation: 'gài',
        audio: '2023-05-25-15-12-09session5-5.mp3',
        type: 'vowel',
    },
    {
        symbol: 'ใก', thaiName: 'ไม้ม้วน', name: 'Mai Muan',
        romanisation: 'ai', length: 'Special',
        exampleWord: 'ใจ', exampleMeaning: 'heart',
        exampleRomanisation: 'jai',
        audio: '2023-05-16-11-14-21intro-session1_25.mp3',
        type: 'vowel',
    },
    {
        symbol: 'เกา', thaiName: 'สระ เอา', name: 'Sara Ao',
        romanisation: 'ao', length: 'Special',
        exampleWord: 'เขา', exampleMeaning: 'he / she / they',
        exampleRomanisation: 'káo',
        audio: '2023-05-16-11-32-55intro-session1_48.mp3',
        type: 'vowel',
    },
    {
        symbol: 'กำ', thaiName: 'สระ อำ', name: 'Sara Am',
        romanisation: 'am', length: 'Special',
        exampleWord: 'ทำ', exampleMeaning: 'to do / make',
        exampleRomanisation: 'tam',
        audio: '2023-05-16-15-17-57session3_9.mp3',
        type: 'vowel',
    },
];
