export interface Consonant {
    character: string;
    thaiName: string;
    name: string;
    englishMeaning: string;
    class: 'Mid' | 'High' | 'Low';
    /**
     * For Low-class consonants: the paired High-class consonant character
     * (same initial sound, used for tonal parity), or null if unpaired.
     * Omitted for Mid- and High-class consonants.
     */
    pair?: string | null;
}

export const CONSONANTS: Consonant[] = [
    // Mid class (9)
    { character: 'ก', thaiName: 'กอ ไก่', name: 'Ko Kai', englishMeaning: 'Chicken', class: 'Mid' },
    { character: 'จ', thaiName: 'จอ จาน', name: 'Jo Jan', englishMeaning: 'Plate', class: 'Mid' },
    { character: 'ด', thaiName: 'ดอ เด็ก', name: 'Do Dek', englishMeaning: 'Child', class: 'Mid' },
    { character: 'ต', thaiName: 'ตอ เต่า', name: 'To Tao', englishMeaning: 'Turtle', class: 'Mid' },
    { character: 'ฎ', thaiName: 'ฎอ ชฎา', name: 'Do Chada', englishMeaning: 'Headdress', class: 'Mid' },
    { character: 'ฏ', thaiName: 'ฏอ ปฏัก', name: 'To Patak', englishMeaning: 'Goad', class: 'Mid' },
    { character: 'บ', thaiName: 'บอ ใบไม้', name: 'Bo Baimai', englishMeaning: 'Leaf', class: 'Mid' },
    { character: 'ป', thaiName: 'ปอ ปลา', name: 'Po Pla', englishMeaning: 'Fish', class: 'Mid' },
    { character: 'อ', thaiName: 'ออ อ่าง', name: 'Ao Ang', englishMeaning: 'Basin', class: 'Mid' },

    // High class (11)
    { character: 'ข', thaiName: 'ขอ ไข่', name: 'Kho Khai', englishMeaning: 'Egg', class: 'High' },
    { character: 'ฃ', thaiName: 'ฃอ ขวด', name: 'Kho Khuat', englishMeaning: 'Bottle', class: 'High' },
    { character: 'ฉ', thaiName: 'ฉอ ฉิ่ง', name: 'Cho Ching', englishMeaning: 'Cymbals', class: 'High' },
    { character: 'ฐ', thaiName: 'ฐอ ฐาน', name: 'Tho Than', englishMeaning: 'Pedestal', class: 'High' },
    { character: 'ถ', thaiName: 'ถอ ถุง', name: 'Tho Thung', englishMeaning: 'Bag', class: 'High' },
    { character: 'ผ', thaiName: 'ผอ ผึ้ง', name: 'Pho Phung', englishMeaning: 'Bee', class: 'High' },
    { character: 'ฝ', thaiName: 'ฝอ ฝา', name: 'Fo Fa', englishMeaning: 'Lid', class: 'High' },
    { character: 'ศ', thaiName: 'ศอ ศาลา', name: 'So Sala', englishMeaning: 'Pavilion', class: 'High' },
    { character: 'ษ', thaiName: 'ษอ ฤๅษี', name: 'So Ruesi', englishMeaning: 'Hermit', class: 'High' },
    { character: 'ส', thaiName: 'สอ เสือ', name: 'So Suea', englishMeaning: 'Tiger', class: 'High' },
    { character: 'ห', thaiName: 'หอ หีบ', name: 'Ho Hip', englishMeaning: 'Chest', class: 'High' },

    // Low class (24)
    //   pair: the High-class consonant with the same initial sound; null = unpaired sonorant
    { character: 'ค', thaiName: 'คอ ควาย', name: 'Kho Khwai', englishMeaning: 'Buffalo', class: 'Low', pair: 'ข' },
    { character: 'ฅ', thaiName: 'ฅอ คน', name: 'Kho Khon', englishMeaning: 'Person', class: 'Low', pair: 'ฃ' },
    { character: 'ฆ', thaiName: 'ฆอ ระฆัง', name: 'Kho Rakhang', englishMeaning: 'Bell', class: 'Low', pair: 'ข' },
    { character: 'ง', thaiName: 'งอ งู', name: 'Ngo Ngu', englishMeaning: 'Snake', class: 'Low', pair: null },
    { character: 'ช', thaiName: 'ชอ ช้าง', name: 'Cho Chang', englishMeaning: 'Elephant', class: 'Low', pair: 'ฉ' },
    { character: 'ซ', thaiName: 'ซอ โซ่', name: 'So So', englishMeaning: 'Chain', class: 'Low', pair: 'ส' },
    { character: 'ฌ', thaiName: 'ฌอ เฌอ', name: 'Cho Choe', englishMeaning: 'Tree', class: 'Low', pair: 'ฉ' },
    { character: 'ญ', thaiName: 'ยอ หญิง', name: 'Yo Ying', englishMeaning: 'Woman', class: 'Low', pair: null },
    { character: 'ณ', thaiName: 'ณอ เณร', name: 'No Nen', englishMeaning: 'Novice Monk', class: 'Low', pair: null },
    { character: 'ฑ', thaiName: 'ฑอ มณโฑ', name: 'Tho Montho', englishMeaning: 'Montho', class: 'Low', pair: 'ฐ' },
    { character: 'ฒ', thaiName: 'ฒอ ผู้เฒ่า', name: 'Tho Phuthao', englishMeaning: 'Elder', class: 'Low', pair: 'ถ' },
    { character: 'ท', thaiName: 'ทอ ทหาร', name: 'Tho Thahan', englishMeaning: 'Soldier', class: 'Low', pair: 'ถ' },
    { character: 'ธ', thaiName: 'ธอ ธง', name: 'Tho Thong', englishMeaning: 'Flag', class: 'Low', pair: 'ถ' },
    { character: 'น', thaiName: 'นอ หนู', name: 'No Nu', englishMeaning: 'Mouse', class: 'Low', pair: null },
    { character: 'พ', thaiName: 'พอ พาน', name: 'Pho Phan', englishMeaning: 'Tray', class: 'Low', pair: 'ผ' },
    { character: 'ฟ', thaiName: 'ฟอ ฟัน', name: 'Fo Fan', englishMeaning: 'Tooth', class: 'Low', pair: 'ฝ' },
    { character: 'ภ', thaiName: 'ภอ สำเภา', name: 'Pho Samphao', englishMeaning: 'Sailing Boat', class: 'Low', pair: 'ผ' },
    { character: 'ม', thaiName: 'มอ ม้า', name: 'Mo Ma', englishMeaning: 'Horse', class: 'Low', pair: null },
    { character: 'ย', thaiName: 'ยอ ยักษ์', name: 'Yo Yak', englishMeaning: 'Giant', class: 'Low', pair: null },
    { character: 'ร', thaiName: 'รอ เรือ', name: 'Ro Ruea', englishMeaning: 'Boat', class: 'Low', pair: null },
    { character: 'ล', thaiName: 'ลอ ลิง', name: 'Lo Ling', englishMeaning: 'Monkey', class: 'Low', pair: null },
    { character: 'ว', thaiName: 'วอ แหวน', name: 'Wo Waen', englishMeaning: 'Ring', class: 'Low', pair: null },
    { character: 'ฬ', thaiName: 'ฬอ จุฬา', name: 'Lo Chula', englishMeaning: 'Kite', class: 'Low', pair: null },
    { character: 'ฮ', thaiName: 'ฮอ นกฮูก', name: 'Ho Nokhuk', englishMeaning: 'Owl', class: 'Low', pair: 'ห' },
];