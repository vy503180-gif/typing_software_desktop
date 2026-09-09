// src/data/lessons.js
// सभी lessons की shared definition।
// यहाँ हर lesson की difficulty और उससे जुड़ा typing text होता है।
// इस module को App, LessonsScreen और TypingScreen सब use करते हैं,
// ताकि सब जगह एक ही data रहे और हर lesson का अपना unique text हो।

export const LESSON_TEXTS = {
  english: {
    1: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl asdf',
    2: 'qwertyuiop qwertyuiop qwertyuiop qwerty ui op qwerty',
    3: 'zxcvbnm zxcvbnm zxcvbnm zxcvbnm zxc vbn m zxcv',
    4: '1234567890 1234567890 1234567890 1234 5678 90',
    5: 'the quick brown fox jumps over the lazy dog near the river bank and then runs fast',
  },
  hindi: {
    1: 'क ख ग घ क ख ग घ क ख ग घ क ख ग घ क ख ग घ',
    2: 'अ आ इ ई उ ऊ ए ऐ ओ औ अ आ इ ई',
    3: 'नमस्ते धन्यवाद कृपया स्वागत है नमस्ते धन्यवाद',
    4: 'यह एक लंबा पाठ है जो पैराग्राफ टाइपिंग के अभ्यास के लिए है। अभ्यास से ही कुशलता आती है।',
    5: 'समय सबसे अनमोल चीज है। हमें अपने समय का सदुपयोग करना चाहिए और हर दिन कुछ नया सीखना चाहिए।',
  },
};

// Locked lessons की unlock sequence - जब कोई lesson complete हो तो
// अगला lesson उसी language में unlock हो जाता है।
// हर language में lesson order: 1 -> 2 -> 3 -> 4 -> 5
export const LESSON_ORDER = [1, 2, 3, 4, 5];

// हर lesson की difficulty (LessonsScreen display के लिए)
export const LESSON_DIFFICULTY = {
  1: 'Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Medium',
  5: 'Hard',
};
