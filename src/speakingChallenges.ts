export interface SpeakingChallenge {
    prompt: string;
    thai: string;
    latinised: string;
    category: 'modals' | 'directions' | 'food-ordering';
}

export const SPEAKING_CHALLENGES: SpeakingChallenge[] = [
    // ── Modal verb combinations ────────────────────────────────────────────
    { prompt: 'I want to eat pad thai', thai: 'อยากกินผัดไทย', latinised: 'yàak gin phàt thai', category: 'modals' },
    { prompt: 'I want to go to the market', thai: 'อยากไปตลาด', latinised: 'yàak bpai dta làat', category: 'modals' },
    { prompt: 'Can you speak Thai?', thai: 'พูดภาษาไทยได้ไหม', latinised: 'phûut phaasǎa thai dâi mǎi', category: 'modals' },
    { prompt: "I can't eat spicy food", thai: 'กินเผ็ดไม่ได้', latinised: 'gin phèt mâi dâi', category: 'modals' },
    { prompt: 'You should try green curry', thai: 'ควรลองแกงเขียวหวาน', latinised: 'khuuan lawng gaeng khǐaw wǎan', category: 'modals' },
    { prompt: 'I must go now', thai: 'ต้องไปแล้ว', latinised: 'dtông bpai láew', category: 'modals' },
    { prompt: 'I like eating Thai food', thai: 'ชอบกินอาหารไทย', latinised: 'chôop gin aa hǎan thai', category: 'modals' },
    { prompt: 'Can you help me?', thai: 'ช่วยได้ไหม', latinised: 'chûai dâi mǎi', category: 'modals' },
    { prompt: 'I want to buy this', thai: 'อยากซื้ออันนี้', latinised: 'yàak súe an nîi', category: 'modals' },
    { prompt: "I don't want it spicy", thai: 'ไม่เอาเผ็ด', latinised: 'mâi ao phèt', category: 'modals' },
    { prompt: 'I have to go home', thai: 'ต้องกลับบ้าน', latinised: 'dtông glàp bâan', category: 'modals' },
    { prompt: 'Do you want to eat together?', thai: 'อยากกินข้าวด้วยกันไหม', latinised: 'yàak gin khâao dûai gan mǎi', category: 'modals' },
    { prompt: 'I should try this', thai: 'ควรลองอันนี้', latinised: 'khuuan lawng an nîi', category: 'modals' },
    { prompt: 'I like going for walks', thai: 'ชอบไปเดินเล่น', latinised: 'chôop bpai dooen lên', category: 'modals' },
    { prompt: 'Please speak slowly', thai: 'ช่วยพูดช้าช้าหน่อย', latinised: 'chûai phûut cháa cháa nòi', category: 'modals' },
    // ── Directions ─────────────────────────────────────────────────────────
    { prompt: 'Where is the train station?', thai: 'สถานีรถไฟอยู่ที่ไหน', latinised: 'sà thǎa nii rót fai yùu thîi nǎi', category: 'directions' },
    { prompt: 'Turn left at the market', thai: 'เลี้ยวซ้ายที่ตลาด', latinised: 'líaw sáai thîi dta làat', category: 'directions' },
    { prompt: 'Go straight then turn right', thai: 'ตรงไปแล้วเลี้ยวขวา', latinised: 'dtrong bpai láew líaw khwǎa', category: 'directions' },
    { prompt: 'The temple is near the river', thai: 'วัดอยู่ใกล้แม่น้ำ', latinised: 'wát yùu glâi mâe nám', category: 'directions' },
    { prompt: 'Is it far?', thai: 'ไกลไหม', latinised: 'glai mǎi', category: 'directions' },
    { prompt: 'The bank is next to the market', thai: 'ธนาคารอยู่ข้างๆตลาด', latinised: 'thá naa khaan yùu khâang khâang dta làat', category: 'directions' },
    { prompt: 'Where is the hotel?', thai: 'โรงแรมอยู่ที่ไหน', latinised: 'roong raem yùu thîi nǎi', category: 'directions' },
    { prompt: 'Where are you going?', thai: 'ไปไหน', latinised: 'bpai nǎi', category: 'directions' },
    { prompt: 'I want to go to Bangkok', thai: 'อยากไปกรุงเทพฯ', latinised: 'yàak bpai grung thêep', category: 'directions' },
    { prompt: "It's on the left side", thai: 'อยู่ทางซ้าย', latinised: 'yùu thaang sáai', category: 'directions' },
    { prompt: "It's on the right side", thai: 'อยู่ทางขวา', latinised: 'yùu thaang khwǎa', category: 'directions' },
    { prompt: 'The airport is far', thai: 'สนามบินอยู่ไกล', latinised: 'sà nǎam bin yùu glai', category: 'directions' },
    { prompt: 'Is the police station near?', thai: 'สถานีตำรวจอยู่ใกล้ไหม', latinised: 'sà thǎa nii dtam rùat yùu glâi mǎi', category: 'directions' },
    { prompt: 'The hotel is opposite the temple', thai: 'โรงแรมอยู่ตรงข้ามวัด', latinised: 'roong raem yùu dtrong khâam wát', category: 'directions' },
    { prompt: 'Go straight on this road', thai: 'ตรงไปถนนนี้', latinised: 'dtrong bpai thà nǒn níi', category: 'directions' },
    // ── Food ordering ──────────────────────────────────────────────────────
    { prompt: "I'd like fried rice, please", thai: 'ขอข้าวผัดครับ', latinised: 'khǒo khâao phàt kráp', category: 'food-ordering' },
    { prompt: 'Not too spicy, please', thai: 'ไม่เผ็ดมาก', latinised: 'mâi phèt mâak', category: 'food-ordering' },
    { prompt: 'A little spicy', thai: 'เผ็ดนิดหน่อย', latinised: 'phèt nít nòi', category: 'food-ordering' },
    { prompt: 'With egg, please', thai: 'ใส่ไข่ด้วย', latinised: 'sài khài dûai', category: 'food-ordering' },
    { prompt: 'No sugar', thai: 'ไม่ใส่น้ำตาล', latinised: 'mâi sài nám dtaan', category: 'food-ordering' },
    { prompt: 'Eat here', thai: 'กินที่นี่', latinised: 'gin thîi nîi', category: 'food-ordering' },
    { prompt: 'Take away', thai: 'กลับบ้าน', latinised: 'glàp bâan', category: 'food-ordering' },
    { prompt: 'Check, please', thai: 'เก็บเงินด้วย', latinised: 'gèp ngoen dûai', category: 'food-ordering' },
    { prompt: 'How much is this?', thai: 'อันนี้เท่าไร', latinised: 'an nîi thâo rài', category: 'food-ordering' },
    { prompt: 'One green curry with rice', thai: 'ขอแกงเขียวหวานหนึ่งจานกับข้าว', latinised: 'khǒo gaeng khǐaw wǎan nùeng jaan gàp khâao', category: 'food-ordering' },
    { prompt: 'Is it delicious?', thai: 'อร่อยไหม', latinised: 'à ròi mǎi', category: 'food-ordering' },
    { prompt: 'Very delicious!', thai: 'อร่อยมาก', latinised: 'à ròi mâak', category: 'food-ordering' },
    { prompt: 'One more beer, please', thai: 'ขอเบียร์อีกหนึ่งขวด', latinised: 'khǒo bia ìik nùeng khùat', category: 'food-ordering' },
    { prompt: 'Water, please', thai: 'ขอน้ำครับ', latinised: 'khǒo nám kráp', category: 'food-ordering' },
    { prompt: 'I want pad thai with egg', thai: 'เอาผัดไทยใส่ไข่', latinised: 'ao phàt thai sài khài', category: 'food-ordering' },
];
