export interface Vowel {
    /** Vowel placed on ก as example consonant, e.g. 'กา', 'กิ', 'เก' */
    symbol: string;
    /** Thai name of the vowel, e.g. 'สระ อา' */
    thaiName: string;
    /** Romanised name, e.g. 'Sara Aa' */
    name: string;
    /** Phonetic value with tonal diacritic convention omitted (pure vowel sound), e.g. 'aa' */
    romanisation: string;
    length: 'Short' | 'Long' | 'Diphthong';
    /** Real Thai word demonstrating the vowel, using ก where possible */
    exampleWord: string;
    /** English meaning of the example word */
    exampleMeaning: string;
    type: 'vowel';
}

export const VOWELS: Vowel[] = [
    // ── Short vowels (8) ──────────────────────────────────────────────────────
    {
        symbol: 'กะ', thaiName: 'สระ อะ', name: 'Sara A',
        romanisation: 'a', length: 'Short',
        exampleWord: 'กะทิ', exampleMeaning: 'coconut milk',
        type: 'vowel',
    },
    {
        symbol: 'กิ', thaiName: 'สระ อิ', name: 'Sara I',
        romanisation: 'i', length: 'Short',
        exampleWord: 'กิน', exampleMeaning: 'to eat',
        type: 'vowel',
    },
    {
        symbol: 'กึ', thaiName: 'สระ อึ', name: 'Sara Ue',
        romanisation: 'ue', length: 'Short',
        exampleWord: 'กึก', exampleMeaning: 'thud',
        type: 'vowel',
    },
    {
        symbol: 'กุ', thaiName: 'สระ อุ', name: 'Sara U',
        romanisation: 'u', length: 'Short',
        exampleWord: 'กุ้ง', exampleMeaning: 'shrimp',
        type: 'vowel',
    },
    {
        symbol: 'เก็', thaiName: 'สระ เอะ', name: 'Sara E',
        romanisation: 'e', length: 'Short',
        exampleWord: 'เก็บ', exampleMeaning: 'to collect',
        type: 'vowel',
    },
    {
        symbol: 'แกะ', thaiName: 'สระ แอะ', name: 'Sara Ae',
        romanisation: 'ae', length: 'Short',
        exampleWord: 'แกะ', exampleMeaning: 'lamb',
        type: 'vowel',
    },
    {
        symbol: 'โกะ', thaiName: 'สระ โอะ', name: 'Sara O',
        romanisation: 'o', length: 'Short',
        exampleWord: 'โต๊ะ', exampleMeaning: 'table',
        type: 'vowel',
    },
    {
        symbol: 'เกาะ', thaiName: 'สระ เอาะ', name: 'Sara Aw',
        romanisation: 'aw', length: 'Short',
        exampleWord: 'เกาะ', exampleMeaning: 'island',
        type: 'vowel',
    },

    // ── Long vowels (8) ───────────────────────────────────────────────────────
    {
        symbol: 'กา', thaiName: 'สระ อา', name: 'Sara Aa',
        romanisation: 'aa', length: 'Long',
        exampleWord: 'กา', exampleMeaning: 'crow',
        type: 'vowel',
    },
    {
        symbol: 'กี', thaiName: 'สระ อี', name: 'Sara Ii',
        romanisation: 'ii', length: 'Long',
        exampleWord: 'กีตาร์', exampleMeaning: 'guitar',
        type: 'vowel',
    },
    {
        symbol: 'กือ', thaiName: 'สระ อือ', name: 'Sara Uue',
        romanisation: 'uue', length: 'Long',
        exampleWord: 'คือ', exampleMeaning: 'to be / is',
        type: 'vowel',
    },
    {
        symbol: 'กู', thaiName: 'สระ อู', name: 'Sara Uu',
        romanisation: 'uu', length: 'Long',
        exampleWord: 'ดู', exampleMeaning: 'to watch',
        type: 'vowel',
    },
    {
        symbol: 'เก', thaiName: 'สระ เอ', name: 'Sara Ee',
        romanisation: 'ee', length: 'Long',
        exampleWord: 'เก่า', exampleMeaning: 'old',
        type: 'vowel',
    },
    {
        symbol: 'แก', thaiName: 'สระ แอ', name: 'Sara Aae',
        romanisation: 'aae', length: 'Long',
        exampleWord: 'แมว', exampleMeaning: 'cat',
        type: 'vowel',
    },
    {
        symbol: 'โก', thaiName: 'สระ โอ', name: 'Sara Oo',
        romanisation: 'oo', length: 'Long',
        exampleWord: 'โต', exampleMeaning: 'big',
        type: 'vowel',
    },
    {
        symbol: 'กอ', thaiName: 'สระ ออ', name: 'Sara Aw',
        romanisation: 'aw', length: 'Long',
        exampleWord: 'พอ', exampleMeaning: 'enough',
        type: 'vowel',
    },

    // ── Diphthongs & special (7) ──────────────────────────────────────────────
    {
        symbol: 'เกีย', thaiName: 'สระ เอีย', name: 'Sara Ia',
        romanisation: 'ia', length: 'Diphthong',
        exampleWord: 'เบียร์', exampleMeaning: 'beer',
        type: 'vowel',
    },
    {
        symbol: 'เกือ', thaiName: 'สระ เอือ', name: 'Sara Uea',
        romanisation: 'uea', length: 'Diphthong',
        exampleWord: 'เดือน', exampleMeaning: 'month',
        type: 'vowel',
    },
    {
        symbol: 'กัว', thaiName: 'สระ อัว', name: 'Sara Ua',
        romanisation: 'ua', length: 'Diphthong',
        exampleWord: 'วัว', exampleMeaning: 'cow',
        type: 'vowel',
    },
    {
        symbol: 'ไก', thaiName: 'ไม้มลาย', name: 'Mai Malai',
        romanisation: 'ai', length: 'Diphthong',
        exampleWord: 'ไก่', exampleMeaning: 'chicken',
        type: 'vowel',
    },
    {
        symbol: 'ใก', thaiName: 'ไม้ม้วน', name: 'Mai Muan',
        romanisation: 'ai', length: 'Diphthong',
        exampleWord: 'ใจ', exampleMeaning: 'heart / mind',
        type: 'vowel',
    },
    {
        symbol: 'เกา', thaiName: 'สระ เอา', name: 'Sara Ao',
        romanisation: 'ao', length: 'Diphthong',
        exampleWord: 'เกา', exampleMeaning: 'to scratch',
        type: 'vowel',
    },
    {
        symbol: 'กำ', thaiName: 'สระ อำ', name: 'Sara Am',
        romanisation: 'am', length: 'Diphthong',
        exampleWord: 'ทำ', exampleMeaning: 'to do',
        type: 'vowel',
    },
];
