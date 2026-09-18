// src/data/lessons.js
// सभी lessons की shared definition।
// यहाँ हर lesson की difficulty और उससे जुड़ा typing text होता है।
// इस module को App, LessonsScreen और TypingScreen सब use करते हैं,
// ताकि सब जगह एक ही data रहे और हर lesson का अपना unique text हो।

// English - 30 lessons, पहले आसान (letters) फिर कठिन (words/sentences/paragraphs)
export const LESSON_TEXTS = {
  english: {
    1: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl asdf',
    2: 'sad lad fall add flag sad lad fall add flag flag',
    3: 'ask all jazz salad lass dad ask all jazz salad fall',
    4: 'gh gh gh asdfghjkl asdfghjkl asdfghjkl asdfghjkl',
    5: 'has gas dash half glad has gas dash half glad',
    6: 'qwertyuiop qwertyuiop qwertyuiop qwerty uiop qwe',
    7: 'write quiet trip prep were write quiet trip prep',
    8: 'great after water point lower great after water point',
    9: 'zxcvbnm zxcvbnm zxcvbnm zxcv bnm zxc vbn',
    10: 'buzz zinc box fun very brown buzz zinc box fun very',
    11: 'the quick brown fox jumps over the lazy dog again',
    12: 'the and for you are can the and for you are can',
    13: 'was not but all she her was not but all she her',
    14: 'from have this with your will from have this with your',
    15: 'jump rain tree bird moon star jump rain tree bird moon',
    16: 'run walk speak learn write read run walk speak learn',
    17: 'i am fine she is my friend we like to read books',
    18: 'who what when where why how who what when where why how',
    19: 'red blue green yellow black white orange pink purple',
    20: 'monday tuesday wednesday thursday friday saturday sunday',
    21: 'january february march april may june july august',
    22: 'one two three four five six seven eight nine ten',
    23: 'teacher student pen book class room school learn grow',
    24: 'father mother brother sister uncle aunt grandfather grandmother',
    25: 'the sun rises in the east and sets in the west daily',
    26: 'my name is ann and i love to learn typing fast',
    27: 'practice makes perfect so type a little bit every single day',
    28: 'she sells sea shells on the sea shore so the shells she sells',
    29: 'the early morning dew sparkles on the green grass and the birds sing sweet songs',
    30: 'typing fast and accurate requires daily practice patience and focus keep your fingers on the home row and do not look at the keyboard',
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
// हर language में lesson order: 1 -> 2 -> 3 ... -> 30
export const LESSON_ORDER = Array.from({ length: 30 }, (_, i) => i + 1);

// हर lesson की difficulty (LessonsScreen display के लिए)
// English: 1-10 Easy, 11-20 Medium, 21-30 Hard
const difficulties = {};
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((id) => {
  difficulties[id] = 'Easy';
});
[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((id) => {
  difficulties[id] = 'Medium';
});
[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].forEach((id) => {
  difficulties[id] = 'Hard';
});

export const LESSON_DIFFICULTY = difficulties;

// Practice paragraphs - Start Typing button ke liye (10 min wale bade paragraphs)
// Har baar ek random paragraph aata hai, agla click pe doosra
const PRACTICE_PARAGRAPHS = [
  `Technology has changed the way we live our daily lives in so many ways. From the moment we wake up to the time we sleep, we are surrounded by devices that make our tasks easier. Smartphones help us stay connected with friends, manage work schedules, and track our health. The internet has opened a world of information at our fingertips. As technology advances rapidly, it is important for us to keep learning and adapting to stay productive in this fast changing digital world.`,
  `Reading books is one of the most valuable habits a person can develop. When you read regularly, you improve your vocabulary and expand your understanding of different cultures and ideas. Books can transport you to different worlds and teach you lessons you might never learn from experience. Whether you prefer fiction or non fiction, reading stimulates your mind and helps you think more clearly. Even reading for twenty minutes a day can make a significant difference in your personal growth over time.`,
  `Physical exercise is essential for a healthy lifestyle. Many people spend long hours sitting at desks which leads to back pain and weight gain. Regular activity keeps your body fit and mind sharp. It reduces the risk of diabetes, heart disease, and high blood pressure. Walking for thirty minutes a day or doing yoga can have a profound impact on your wellbeing. Making exercise part of your daily routine is one of the best investments you can make in yourself.`,
  `Learning to type fast is a skill that becomes more important every year. Whether you are a student or a professional, good typing skills save you time and effort. The ability to type without looking at the keyboard lets you focus on what you want to say. With consistent practice, anyone can improve their typing speed significantly within a few weeks. The key is to practice regularly and not get discouraged by mistakes along the way.`,
  `Climate change is one of the most pressing challenges humanity faces today. Human activities like burning fossil fuels are causing global temperatures to rise. This leads to more severe weather events and rising sea levels. While the problem seems overwhelming, individuals can help by reducing energy consumption and using renewable sources. Making sustainable choices in daily life contributes to a healthier planet for future generations.`,
  `Music has been an integral part of human culture for thousands of years. From ancient drums to modern electronic compositions, music serves as a powerful medium for expression and emotional connection. Research shows listening to music can reduce stress and improve mood. Learning an instrument develops discipline and creativity. Whether you enjoy classical symphonies or contemporary pop, music has the unique ability to bring people together across cultural boundaries.`,
  `Artificial intelligence has made remarkable progress in recent years. From voice assistants to recommendation systems, AI is becoming part of our daily lives. Machine learning can analyze vast data to identify patterns and automate complex tasks. While these advancements bring potential for improving efficiency, they also raise important questions about ethics and privacy that society must address thoughtfully and responsibly for the benefit of all people.`,
  `Traveling to new places is one of the most enriching activities a person can undertake. When you travel, you step outside your comfort zone and encounter different ways of life. You taste authentic cuisine, observe customs, and meet people from diverse backgrounds. Travel teaches you to be adaptable and open minded. Even exploring your own local area with curiosity can reveal hidden gems and new experiences you never knew existed.`,
];

// Random practice paragraph choose karne ke liye (har baar different)
export const getRandomPracticeParagraph = () => {
  const idx = Math.floor(Math.random() * PRACTICE_PARAGRAPHS.length);
  return PRACTICE_PARAGRAPHS[idx];
};