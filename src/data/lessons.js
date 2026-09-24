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
    6: 'च छ ज झ ञ च छ ज झ ञ च छ ज झ ञ च छ ज झ ञ',
    7: 'ट ठ ड ढ ण ट ठ ड ढ ण ट ठ ड ढ ण ट ठ ड ढ ण',
    8: 'त थ द ध न त थ द ध न त थ द ध न त थ द ध न',
    9: 'प फ ब भ म प फ ब भ म प फ ब भ म प फ ब भ म',
    10: 'य र ल व श ष स ह य र ल व श ष स ह य र ल व',
    11: 'मैं पढ़ता हूँ। वह चलता है। यह अच्छा है। हम खेलते हैं। तुम क्या करते हो?',
    12: 'नमस्ते आप कैसे हैं? मैं ठीक हूँ धन्यवाद। आज मौसम बहुत अच्छा है।',
    13: 'भारत एक महान देश है। यहाँ अनेक भाषाएँ बोली जाती हैं। हिंदी सबसे ज़्यादा बोली जाने वाली भाषा है।',
    14: 'प्रौद्योगिकी ने हमारे जीवन को बदल दिया है। आज हम अपने फ़ोन से सब कुछ कर सकते हैं — पढ़ाई, काम, और मनोरंजन।',
    15: 'हर दिन अभ्यास करने से टाइपिंग की गति बढ़ती है। शुरुआत में गलतियाँ होती हैं लेकिन धीरे-धीरे सुधार आता है। धैर्य रखें और लगातार अभ्यास करते रहें।',
  16: 'क्ष त्र ज्ञ श्र क्ष त्र ज्ञ श्र क्ष त्र ज्ञ द्व न्य स्त स्थ स्न स्म ह्म क्ष त्र ज्ञ',
  17: 'का की कु के कौ हा ही हु है हौ रा री रु रे रौ ला ली लु ले लौ वा वी वु वे वौ',
  18: 'पानी घर स्कूल किताब दोस्त माता पिता भाई बहन देश समय काम विद्या अभ्यास सफलता',
  19: 'मैं रोज विद्यालय जाता हूँ। मोहन एक अच्छा लड़का है। राधा गीत गाती है। पानी जीवन है।',
  20: 'सोमवार मंगलवार बुधवार गुरुवार शुक्रवार शनिवार रविवार जनवरी फरवरी मार्च अप्रैल मई जून',
  21: 'एक दो तीन चार पांच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह बीस तीस चालीस',
  22: 'आप कैसे हैं? मैं ठीक हूँ। यह क्या है? वह कौन है? मुझे चाय पसंद है। हम खेलते हैं।',
  23: 'सूरज पूर्व में उगता है। बादल आसमान में घूमते हैं। नदियाँ पहाड़ों से निकलती हैं। हवा धीरे चल रही है।',
  24: 'भारत हमारा देश है। यहाँ कई भाषाएँ बोली जाती हैं। हमें अपने देश पर गर्व है। हमें मेहनत करनी चाहिए।',
  25: 'समय बहुत कीमती है। जो समय खो जाता है वह वापस नहीं आता। इसलिए हमें समय का सही उपयोग करना चाहिए। हर दिन कुछ नया सीखना चाहिए।',
  26: 'शिक्षा जीवन की रोशनी है। शिक्षित व्यक्ति समाज का विकास कर सकता है। विद्या धन से बढ़कर है। हमें पढ़ना और लिखना चाहिए। परिश्रम ही सफलता की कुंजी है।',
  27: 'कंप्यूटर आज के युग की बड़ी देन है। इससे हम तेजी से काम कर सकते हैं। कंप्यूटर टाइपिंग एक आवश्यक कौशल बन गया है। अच्छी टाइपिंग से समय और श्रम दोनों बचते हैं। नियमित अभ्यास से टाइपिंग तेज और सटीक होती है।',
  28: 'प्रौद्योगिकी ने हमारे जीवन को बहुत बदल दिया है। आज हम अपने हाथ में मौजूद फोन से दुनिया से जुड़े रहते हैं। पढ़ाई, काम और मनोरंजन सब कुछ डिजिटल हो गया है। पर हमें इसका उपयोग संयम से करना चाहिए। अधिक स्क्रीन समय हमारे स्वास्थ्य के लिए हानिकारक है।',
  29: 'स्वास्थ्य सबसे बड़ा धन है। शरीर को स्वस्थ रखने के लिए सुबह व्यायाम करना चाहिए। संतुलित आहार और साफ पानी जरूरी है। रोज थोड़ी देर टहलना भी फायदेमंद है। जब शरीर स्वस्थ रहता है तो मन भी प्रसन्न रहता है और काम अच्छा होता है।',
  30: 'हमारा भारत देश संस्कृति और परंपरा का धनी देश है। यहाँ विभिन्न धर्मों और भाषाओं के लोग एक साथ रहते हैं। भारत के लोग मेहनती और भाईचारे वाले हैं। हमें अपनी संस्कृति पर गर्व है और उसे आगे बढ़ाना हमारा कर्तव्य है। शिक्षा, सेवा और सदाचार से हम देश को और अच्छा बना सकते हैं। इसलिए हमें मिलजुल कर प्रगति करनी चाहिए।',
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

// Har lesson ka title + duration (LessonsScreen display aur TypingScreen ke
// "Next Lesson" button dono ke liye), taki dono jagah ek jaise rahe.
export const LESSON_META = {
  english: [
    { id: 1, title: 'Home Row - Letters', time: '2 min' },
    { id: 2, title: 'Home Row - Easy Words 1', time: '2 min' },
    { id: 3, title: 'Home Row - Easy Words 2', time: '2 min' },
    { id: 4, title: 'Middle Row (G H)', time: '2 min' },
    { id: 5, title: 'Middle Row - Words', time: '2 min' },
    { id: 6, title: 'Top Row - Letters', time: '3 min' },
    { id: 7, title: 'Top Row - Words 1', time: '3 min' },
    { id: 8, title: 'Top Row - Words 2', time: '3 min' },
    { id: 9, title: 'Bottom Row - Letters', time: '3 min' },
    { id: 10, title: 'Bottom Row - Words', time: '3 min' },
    { id: 11, title: 'All Letters - Mixed Words', time: '4 min' },
    { id: 12, title: 'Common Words 1', time: '4 min' },
    { id: 13, title: 'Common Words 2', time: '4 min' },
    { id: 14, title: 'Common Words 3', time: '4 min' },
    { id: 15, title: 'Sight Words', time: '4 min' },
    { id: 16, title: 'Action Verbs', time: '5 min' },
    { id: 17, title: 'Short Sentences', time: '5 min' },
    { id: 18, title: 'Question Words', time: '5 min' },
    { id: 19, title: 'Colours', time: '5 min' },
    { id: 20, title: 'Days of Week', time: '5 min' },
    { id: 21, title: 'Months of Year', time: '6 min' },
    { id: 22, title: 'Numbers', time: '6 min' },
    { id: 23, title: 'School Words', time: '6 min' },
    { id: 24, title: 'Family Words', time: '6 min' },
    { id: 25, title: 'Nature - Sentence', time: '7 min' },
    { id: 26, title: 'About Me', time: '7 min' },
    { id: 27, title: 'Proverb Practice', time: '8 min' },
    { id: 28, title: 'Tongue Twister', time: '8 min' },
    { id: 29, title: 'Long Paragraph', time: '9 min' },
    { id: 30, title: 'Final Exam', time: '10 min' },
  ],
  hindi: [
    { id: 1, title: 'क, ख, ग', time: '2 min' },
    { id: 2, title: 'स्वर', time: '2 min' },
    { id: 3, title: 'शब्द अभ्यास', time: '3 min' },
    { id: 4, title: 'वाक्य लेखन', time: '5 min' },
    { id: 5, title: 'पैराग्राफ', time: '5 min' },
    { id: 6, title: 'च, छ, ज, झ, ञ', time: '2 min' },
    { id: 7, title: 'ट, ठ, ड, ढ, ण', time: '2 min' },
    { id: 8, title: 'त, थ, द, ध, न', time: '2 min' },
    { id: 9, title: 'प, फ, ब, भ, म', time: '2 min' },
    { id: 10, title: 'य, र, ल, व, श, ष, स, ह', time: '3 min' },
    { id: 11, title: 'छोटे वाक्य', time: '4 min' },
    { id: 12, title: 'संवाद अभ्यास', time: '5 min' },
    { id: 13, title: 'भारत परिचय', time: '5 min' },
    { id: 14, title: 'प्रौद्योगिकी', time: '6 min' },
    { id: 15, title: 'अभ्यास परीक्षा', time: '8 min' },
    { id: 16, title: 'संयुक्त अक्षर', time: '2 min' },
    { id: 17, title: 'मात्रा अभ्यास', time: '3 min' },
    { id: 18, title: 'आम शब्द', time: '3 min' },
    { id: 19, title: 'रोज़-भर के वाक्य', time: '4 min' },
    { id: 20, title: 'दिन और महीने', time: '4 min' },
    { id: 21, title: 'गिनती', time: '4 min' },
    { id: 22, title: 'प्रश्न वाक्य', time: '4 min' },
    { id: 23, title: 'प्रकृति', time: '5 min' },
    { id: 24, title: 'भारत परिचय', time: '5 min' },
    { id: 25, title: 'समय का महत्व', time: '5 min' },
    { id: 26, title: 'शिक्षा', time: '6 min' },
    { id: 27, title: 'कंप्यूटर', time: '6 min' },
    { id: 28, title: 'प्रौद्योगिकी 2', time: '7 min' },
    { id: 29, title: 'स्वास्थ्य', time: '7 min' },
    { id: 30, title: 'अंतिम परीक्षा', time: '10 min' },
  ],
};

// Kisi lesson se agla lesson ka data dhundo (agar ho)
export const getNextLesson = (lang, lessonId) => {
  const list = LESSON_META[lang] || [];
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx === -1 || idx + 1 >= list.length) return null;
  const next = list[idx + 1];
  return {
    id: next.id,
    title: next.title,
    timeSec: parseInt(next.time) * 60,
    label: `Lesson ${next.id}`,
  };
};

// Practice paragraphs - Start Typing button ke liye
// Duration ke hisab se paragraph ka size hota hai (1/3/5/10 min)
// 30 WPM average maankar text lambai set karte hain

const SHORT_PARAGRAPHS = [
  'Technology has changed the way we live. Smartphones help us stay connected with friends and manage work every day.',
  'Reading books is one of the most valuable habits. It improves vocabulary and expands understanding of different ideas.',
  'Physical exercise is essential for a healthy lifestyle. Regular activity keeps your body fit and mind sharp.',
  'Learning to type fast is a skill that becomes more important every year. Good typing saves you time and effort.',
  'Music has been an integral part of human culture for thousands of years. It serves as a powerful medium for expression.',
  'Traveling to new places is one of the most enriching activities. You encounter different ways of life and customs.',
  'Artificial intelligence has made remarkable progress in recent years. AI is becoming part of our daily lives.',
  'Climate change is one of the most pressing challenges. Individuals can help by reducing energy consumption daily.',
];

const MEDIUM_PARAGRAPHS = [
  'Technology has changed the way we live our daily lives in so many ways. From the moment we wake up to the time we sleep, we are surrounded by devices that make our tasks easier. Smartphones help us stay connected with friends, manage work schedules, and track our health. The internet has opened a world of information at our fingertips. As technology advances rapidly, it is important for us to keep learning and adapting to stay productive in this fast changing digital world.',
  'Reading books is one of the most valuable habits a person can develop. When you read regularly, you improve your vocabulary and expand your understanding of different cultures and ideas. Books can transport you to different worlds and teach you lessons you might never learn from experience. Whether you prefer fiction or non fiction, reading stimulates your mind and helps you think more clearly. Even reading for twenty minutes a day can make a significant difference in your personal growth over time.',
  'Physical exercise is essential for a healthy lifestyle. Many people spend long hours sitting at desks which leads to back pain and weight gain. Regular activity keeps your body fit and mind sharp. It reduces the risk of diabetes, heart disease, and high blood pressure. Walking for thirty minutes a day or doing yoga can have a profound impact on your wellbeing. Making exercise part of your daily routine is one of the best investments you can make in yourself.',
  'Learning to type fast is a skill that becomes more important every year. Whether you are a student or a professional, good typing skills save you time and effort. The ability to type without looking at the keyboard lets you focus on what you want to say. With consistent practice, anyone can improve their typing speed significantly within a few weeks. The key is to practice regularly and not get discouraged by mistakes along the way.',
  'Climate change is one of the most pressing challenges humanity faces today. Human activities like burning fossil fuels are causing global temperatures to rise. This leads to more severe weather events and rising sea levels. While the problem seems overwhelming, individuals can help by reducing energy consumption and using renewable sources. Making sustainable choices in daily life contributes to a healthier planet for future generations.',
  'Music has been an integral part of human culture for thousands of years. From ancient drums to modern electronic compositions, music serves as a powerful medium for expression and emotional connection. Research shows listening to music can reduce stress and improve mood. Learning an instrument develops discipline and creativity. Whether you enjoy classical symphonies or contemporary pop, music has the unique ability to bring people together across cultural boundaries.',
  'Artificial intelligence has made remarkable progress in recent years. From voice assistants to recommendation systems, AI is becoming part of our daily lives. Machine learning can analyze vast data to identify patterns and automate complex tasks. While these advancements bring potential for improving efficiency, they also raise important questions about ethics and privacy that society must address thoughtfully and responsibly for the benefit of all people.',
  'Traveling to new places is one of the most enriching activities a person can undertake. When you travel, you step outside your comfort zone and encounter different ways of life. You taste authentic cuisine, observe customs, and meet people from diverse backgrounds. Travel teaches you to be adaptable and open minded. Even exploring your own local area with curiosity can reveal hidden gems and new experiences you never knew existed.',
];

const LONG_PARAGRAPHS = [
  `Technology has transformed every aspect of modern life, from how we communicate to how we work and learn. Smartphones have become extensions of ourselves, keeping us connected to family, friends, and colleagues around the clock. Social media platforms allow us to share ideas and experiences instantly with people across the globe. Cloud computing has revolutionized how businesses operate, enabling remote work and collaboration on a scale never before possible. As we embrace these tools, we must also be mindful of screen time, digital wellness, and the importance of face to face human connection in an increasingly virtual world.`,
  `The habit of reading regularly offers countless benefits that extend far beyond simple entertainment. Studies show that reading improves cognitive function, enhances memory, and reduces stress levels significantly. When you dive into a good book, your brain forms new neural pathways that strengthen comprehension and analytical thinking. Fiction readers develop greater empathy by experiencing life through the eyes of diverse characters. Non fiction readers gain practical knowledge and fresh perspectives on real world issues. Libraries remain vital community resources, offering free access to thousands of books and digital materials for people of all ages and backgrounds.`,
  `Regular physical activity is one of the most effective ways to maintain both physical and mental health throughout life. Exercise strengthens the cardiovascular system, builds muscle mass, and improves flexibility and balance. Beyond the physical benefits, working out releases endorphins that naturally boost mood and reduce anxiety. Walking, swimming, cycling, and yoga are excellent low impact options for people of all fitness levels. The key is consistency rather than intensity. Even twenty minutes of moderate activity most days of the week can lead to significant improvements in overall health, energy levels, and quality of life over time.`,
  `Climate change represents the greatest environmental challenge of our generation. Rising global temperatures are causing glaciers to melt, sea levels to rise, and weather patterns to become increasingly unpredictable. Extreme heat waves, powerful storms, and prolonged droughts are becoming more frequent and severe. While governments and corporations bear primary responsibility for systemic change, individual actions collectively make a meaningful difference. Reducing energy consumption, choosing public transportation, supporting sustainable businesses, and minimizing waste are practical steps everyone can take. The choices we make today will determine the kind of planet future generations inherit from us.`,
];

const EXTRALONG_PARAGRAPHS = [
  `Technology has fundamentally transformed how we live, work, and interact with one another. In just a few decades, we have moved from landline telephones to smartphones that put the entire world's knowledge at our fingertips. The internet has created unprecedented opportunities for education, commerce, and social connection. Online learning platforms make quality education accessible to millions who previously had limited options. E commerce has revolutionized retail, allowing people to shop from anywhere at any time. Social media connects families across continents and enables movements that shape public policy and cultural norms. However, this digital revolution also brings challenges. Privacy concerns, misinformation, digital addiction, and the widening digital divide are issues that societies must address. As we navigate this rapidly changing landscape, it becomes essential to develop digital literacy skills, maintain healthy boundaries with technology, and ensure that the benefits of innovation are shared equitably across all communities and generations.`,
  `The importance of regular reading cannot be overstated in terms of its impact on personal and intellectual development. When you read consistently, you expand your vocabulary, improve your writing skills, and enhance your ability to think critically about complex topics. Fiction readers develop emotional intelligence by experiencing the world through characters whose lives and perspectives differ from their own. Non fiction readers gain practical knowledge that can be applied to professional and personal challenges. Reading before bed has been shown to reduce stress levels more effectively than listening to music or taking a walk. Libraries and digital platforms like Project Gutenberg provide free access to millions of books, making reading accessible to virtually everyone regardless of economic background. Schools that emphasize reading programs consistently produce students with stronger academic performance across all subjects, demonstrating that literacy is truly the foundation upon which all other learning is built.`,
  `Maintaining good physical health requires a balanced approach that combines regular exercise, proper nutrition, and adequate rest. The human body is designed for movement, yet modern sedentary lifestyles have contributed to rising rates of obesity, diabetes, and cardiovascular disease. Even moderate physical activity such as a thirty minute daily walk can significantly reduce the risk of chronic illness and improve mental clarity. Nutrition plays an equally important role. Whole foods rich in vitamins, minerals, and fiber fuel the body and support immune function, while processed foods high in sugar and unhealthy fats contribute to inflammation and disease. Sleep is the third pillar of health that is often overlooked. Adults need seven to nine hours of quality sleep each night for optimal cognitive function, emotional regulation, and physical recovery. Building sustainable habits around these three areas creates a strong foundation for a long, healthy, and fulfilling life.`,
  `Climate change is not a distant threat but a present reality that communities around the world are already experiencing. The scientific consensus is clear that human activities, primarily the burning of fossil fuels and deforestation, are driving unprecedented increases in global temperatures. The consequences are far reaching. Rising sea levels threaten coastal cities and small island nations. Changing precipitation patterns cause devastating droughts in some regions and catastrophic flooding in others. Biodiversity loss accelerates as ecosystems struggle to adapt to rapidly changing conditions. While the scale of the problem can feel overwhelming, meaningful progress is being made. Renewable energy sources like solar and wind are becoming increasingly affordable and efficient. Electric vehicles are gaining mainstream adoption. International agreements and local policies are pushing corporations toward more sustainable practices. Every individual action, from reducing energy consumption to supporting environmentally responsible businesses, contributes to the collective effort needed to protect our planet for future generations.`,
];

// Duration ke hisab se sahi size ka paragraph choose karo
export const getRandomPracticeParagraph = (timeSec = 300) => {
  let pool;
  if (timeSec <= 90) pool = SHORT_PARAGRAPHS;
  else if (timeSec <= 240) pool = MEDIUM_PARAGRAPHS;
  else if (timeSec <= 420) pool = LONG_PARAGRAPHS;
  else pool = EXTRALONG_PARAGRAPHS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
};