// src/data/typingTexts.js
// Text generators used by Typing Practice, Tests and Games.
// All generators produce real, normal English content.

// --- Word pools by difficulty ---
const EASY_WORDS = [
  'the', 'and', 'for', 'you', 'are', 'can', 'was', 'not', 'but', 'all',
  'she', 'her', 'his', 'had', 'has', 'gas', 'sad', 'lad', 'fall', 'add',
  'flag', 'asdf', 'jkl', 'ask', 'all', 'jazz', 'salad', 'lass', 'dad',
  'run', 'sun', 'fun', 'red', 'bed', 'cat', 'dog', 'big', 'sit', 'hop',
  'top', 'map', 'tap', 'pan', 'man', 'men', 'ten', 'pen', 'net', 'get',
  'let', 'set', 'yes', 'day', 'way', 'may', 'say', 'now', 'how', 'who',
  'tree', 'moon', 'star', 'rain', 'jump', 'walk', 'read', 'book', 'good',
  'home', 'time', 'look', 'make', 'more', 'each', 'most', 'other', 'only',
  'some', 'such', 'than', 'them', 'then', 'they', 'this', 'will', 'with',
  'have', 'from', 'what', 'when', 'where', 'why', 'which', 'while',
];

const MEDIUM_WORDS = [
  'about', 'after', 'again', 'below', 'could', 'every', 'first', 'found',
  'great', 'house', 'large', 'learn', 'never', 'other', 'place', 'plant',
  'point', 'right', 'small', 'sound', 'spell', 'still', 'study', 'their',
  'these', 'thing', 'think', 'three', 'water', 'where', 'which', 'world',
  'would', 'write', 'quick', 'brown', 'zinc', 'buzz', 'quiet', 'quote',
  'wrote', 'river', 'green', 'phone', 'light', 'night', 'right', 'under',
  'happy', 'smile', 'music', 'dance', 'cloud', 'paper', 'train', 'table',
  'chair', 'shirt', 'grass', 'stone', 'glass', 'plant', 'fresh', 'clean',
];

const HARD_WORDS = [
  'practice', 'patience', 'accuracy', 'keyboard', 'computer', 'education',
  'technology', 'achievement', 'challenge', 'important', 'knowledge',
  'often', 'engineer', 'programming', 'university', 'opportunity',
  'beautiful', 'attention', 'particular', 'understand', 'through',
  'remember', 'together', 'therefore', 'sometimes', 'something',
  'without', 'already', 'against', 'between', 'different', 'difficult',
  'especially', 'government', 'everything', 'experience', 'information',
  'temperature', 'dictionary', 'independent', 'professional',
  'concentration', 'environmental', 'consistently', 'distinguished',
];

// --- Sentence pools ---
const EASY_SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes a person perfect in every way.',
  'A journey of a thousand miles begins with one step.',
  'Keep your fingers on the home row while typing.',
  'The sun rises in the east every single morning.',
  'Reading books is a very good daily habit.',
  'Water is essential for every living thing on earth.',
  'My school has a very big library full of books.',
];

const MEDIUM_SENTENCES = [
  'Typing fast and accurately requires consistent daily practice and total focus.',
  'The early morning dew sparkles on the green grass of the garden.',
  'She sells sea shells on the sea shore so the shells she sells are surely sea shells.',
  'Learning new skills opens many doors in both personal and professional life.',
  'A healthy body and a calm mind are the foundation of a happy life.',
  'Technology has changed the way we work and communicate with each other.',
  'Regular exercise keeps your body fit and your mind sharp throughout the day.',
  'Every great achievement begins with the decision to try something new.',
];

const HARD_SENTENCES = [
  'The most successful people are those who practice consistently and never give up easily.',
  'Artificial intelligence is transforming industries by automating complex tasks and revealing hidden patterns in data.',
  'A comprehensive understanding of grammar enhances both written and verbal communication skills.',
  'Biotechnology combined with computational modeling is accelerating discoveries in modern medicine.',
  'The combination of patience, discipline, and deliberate practice produces extraordinary typing speed.',
  'Effective communication requires listening carefully before responding thoughtfully to others.',
  'Historical research often challenges our assumptions about the past and reshapes modern perspectives.',
  'Sustainable development balances economic growth with the protection of our natural environment.',
];

// --- Paragraph pools ---
const EASY_PARAGRAPHS = [
  'Practice makes perfect. If you type a little bit every day, you will get faster. Keep your eyes on the screen and your hands on the home row. Do not look at the keyboard while typing. Speed will come with time.',
  'Reading is a good habit. It helps you learn new words. Books take you to new places. You can read a story, a poem, or a short article. Even ten minutes of reading a day can help you grow.',
  'Water is life. Plants need water to grow. Animals need water to drink. We need water to stay healthy. We should save water and use it carefully every day.',
  'A good student works hard. He listens to his teacher. He finishes his homework on time. He reads his books daily. He asks questions when he does not understand. This way he learns fast and improves every day.',
];

const MEDIUM_PARAGRAPHS = [
  'Technology has changed the way we live our daily lives. From the moment we wake up to the time we sleep, we are surrounded by devices that make our tasks easier. Smartphones help us stay connected with friends, manage work schedules, and track our health. The internet has opened a world of information at our fingertips. As technology advances rapidly, it is important for us to keep learning and adapting to stay productive in this fast changing digital world.',
  'Reading books is one of the most valuable habits a person can develop. When you read regularly, you improve your vocabulary and expand your understanding of different cultures and ideas. Books can transport you to different worlds and teach you lessons you might never learn from experience. Even reading for twenty minutes a day can make a significant difference in your personal growth over time.',
  'Physical exercise is essential for a healthy lifestyle. Many people spend long hours sitting at desks which leads to back pain and weight gain. Regular activity keeps your body fit and your mind sharp. Walking for thirty minutes a day or doing yoga can have a profound impact on your well being. Making exercise part of your daily routine is one of the best investments you can make in yourself.',
  'Learning to type fast is a skill that becomes more important every year. Whether you are a student or a professional, good typing saves you time and effort. The ability to type without looking at the keyboard lets you focus on what you want to say. With consistent practice, anyone can improve their typing speed significantly within a few weeks. The key is to practice regularly and not get discouraged by mistakes along the way.',
];

const HARD_PARAGRAPHS = [
  'Climate change represents the greatest environmental challenge of our generation. Rising global temperatures are causing glaciers to melt, sea levels to rise, and weather patterns to become increasingly unpredictable. Extreme heat waves, powerful storms, and prolonged droughts are becoming more frequent and severe. While governments and corporations bear primary responsibility for systemic change, individual actions collectively make a meaningful difference in protecting our planet for future generations.',
  'Artificial intelligence has made remarkable progress in recent years. From voice assistants to recommendation systems, machine learning can analyze vast amounts of data to identify patterns and automate complex tasks. While these advancements bring tremendous potential for improving efficiency and productivity, they also raise important questions about ethics, privacy, and accountability that society must address thoughtfully and responsibly for the benefit of all people.',
  'The habit of reading regularly offers countless benefits that extend far beyond simple entertainment. Studies show that reading improves cognitive function, enhances memory, and reduces stress levels significantly. Fiction readers develop greater empathy by experiencing life through the eyes of diverse characters. Non fiction readers gain practical knowledge and fresh perspectives on real world issues. Reading before bed has been shown to reduce stress more effectively than other common relaxation techniques.',
  'Effective time management is a skill that separates successful people from those who always feel overwhelmed. When you plan your day, you gain clarity about your priorities and reduce the mental burden of keeping track of everything. Start by identifying your most important tasks, allocate focused blocks of time to complete them, and eliminate distractions that steal your attention. Review your progress at the end of each day and adjust your approach accordingly for continuous improvement.',
];

// --- Word lists per mode (everyday common words) ---
const COMMON_WORDS = [
  'time', 'year', 'people', 'way', 'day', 'man', 'thing', 'woman', 'life', 'child',
  'world', 'school', 'state', 'family', 'student', 'group', 'country', 'problem',
  'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question',
  'work', 'government', 'number', 'night', 'point', 'home', 'water', 'room', 'mother',
  'area', 'money', 'story', 'fact', 'month', 'book', 'eye', 'job', 'word', 'business',
  'issue', 'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power',
  'hour', 'game', 'line', 'end', 'member', 'law', 'car', 'city', 'team', 'minute',
  'idea', 'body', 'parent', 'face', 'level', 'office', 'door', 'health', 'person',
  'art', 'war', 'history', 'party', 'result', 'change', 'morning', 'reason', 'research',
  'girl', 'guy', 'moment', 'air', 'teacher', 'force', 'education',
];

const pickRandom = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

// Generate a word list string with punctuation for words mode
export const wordsText = (count = 60, difficulty = 'easy') => {
  const pool = difficulty === 'hard'
    ? HARD_WORDS
    : difficulty === 'medium'
      ? [...MEDIUM_WORDS, ...EASY_WORDS]
      : EASY_WORDS;
  const chosen = pickRandom(pool, count);
  const separators = [',', '.', ';', '!'];
  return chosen
    .map((w, i) => {
      const capitalize = Math.random() < 0.12;
      let wd = capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
      if (Math.random() < 0.18) wd += separators[Math.floor(Math.random() * separators.length)];
      return wd;
    })
    .join(' ');
};

export const sentencesText = (count = 5, difficulty = 'easy') => {
  const pool = difficulty === 'hard'
    ? HARD_SENTENCES
    : difficulty === 'medium'
      ? MEDIUM_SENTENCES
      : EASY_SENTENCES;
  const chosen = pickRandom(pool, count);
  return chosen.join(' ');
};

export const paragraphText = (difficulty = 'easy') => {
  const pool = difficulty === 'hard'
    ? HARD_PARAGRAPHS
    : difficulty === 'medium'
      ? MEDIUM_PARAGRAPHS
      : EASY_PARAGRAPHS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const HINDI_LETTERS = 'कखगघचछजझञटठडढणतथदधनपफबभमयरलवशषसहअआइईउऊएऐओऔ';
const ENGLISH_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const ENGLISH_HOME_ROW = 'asdfjkl;';

// Generate a letter-groups string for Letters mode
export const lettersText = (count = 120, difficulty = 'easy', lang = 'english') => {
  let pool;
  if (lang === 'hindi') pool = HINDI_LETTERS;
  else if (difficulty === 'easy') pool = ENGLISH_HOME_ROW;
  else if (difficulty === 'hard') pool = `${ENGLISH_LETTERS},.;`;
  else pool = ENGLISH_LETTERS;

  const chunkLen = lang === 'hindi' ? 4 : 5;
  const parts = [];
  for (let i = 0; i < count; i += chunkLen) {
    let chunk = '';
    for (let j = 0; j < chunkLen && i + j < count; j++) {
      chunk += pool[Math.floor(Math.random() * pool.length)];
    }
    parts.push(chunk);
  }
  return parts.join(' ');
};

// Build text for practice/test based on mode + difficulty + duration
export const generateTypingText = ({ mode = 'paragraph', difficulty = 'easy', timeSec = 60, lang = 'english' }) => {
  if (mode === 'words') {
    return wordsText(Math.max(20, Math.round(timeSec / 2.2)), difficulty);
  }
  if (mode === 'sentences') {
    return sentencesText(Math.max(3, Math.round(timeSec / 18)), difficulty);
  }
  if (mode === 'letters') {
    return lettersText(Math.max(40, Math.round(timeSec * 2.2)), difficulty, lang);
  }
  return paragraphText(difficulty);
};

// Word list for Word Rush game (very common short words)
export const rushWordList = () => [...COMMON_WORDS];