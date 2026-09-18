// App.js - app का main component
// यह bottom navigation (Home / Type / Stats) manage करता है
// और चुने गए tab के हिसाब से सही screen दिखाता है।

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import TypingScreen from './src/screens/TypingScreen';
import NameEntryScreen from './src/screens/NameEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BottomNav from './src/components/BottomNav';
import StatsScreen from './src/screens/StatsScreen';
import CourseScreen, { COURSES } from './src/screens/CourseScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import ResultScreen from './src/screens/ResultScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ReviewDrillScreen from './src/screens/ReviewDrillScreen';
import WordDrillScreen from './src/screens/WordDrillScreen';
import CloudsGameScreen from './src/screens/CloudsGameScreen';
import WordTrisGameScreen from './src/screens/WordTrisGameScreen';
import AlphabetGameScreen from './src/screens/AlphabetGameScreen';
import BubblesGameScreen from './src/screens/BubblesGameScreen';
import GamesMenuScreen from './src/screens/GamesMenuScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { LESSON_ORDER, getRandomPracticeParagraph } from './src/data/lessons';

// Saved data के storage keys
const STORAGE_KEYS = {
  name: 'antriksh_student_name',
  users: 'antriksh_users',
  settings: 'antriksh_settings',
};

// हर student का lesson progress अपने नाम के key पर save होता है
const unlockedKeyFor = (name) => `antriksh_unlocked_lessons_${name || 'default'}`;

// Course के complete huye sub-lessons का key (per student)
const courseProgressKeyFor = (name) => `antriksh_course_progress_${name || 'default'}`;

// Default locked state - पहला lesson हर language में unlocked है,
// बाकी lesson complete करने पर एक-एक करके खुलते हैं
const DEFAULT_UNLOCKED = { english: [1], hindi: [1] };

export default function App() {
  const [fontsReady] = useState(true);

  // Abhi kaun sa tab open है
  const [activeTab, setActiveTab] = useState('Home');

  // Student का name - NameEntryScreen पर भरा जाता है
  const [studentName, setStudentName] = useState('');

  // हर language में unlocked lessons (जो खोल दिए गए हैं)।
  // Default में english/hindi के पहले 2 lessons unlocked हैं,
  // बाकी locked रहते हैं और lesson complete करने पर खुलते हैं।
  const [unlockedLessons, setUnlockedLessons] = useState(DEFAULT_UNLOCKED);

  // इस phone पर login करने वाले सभी users की list
  const [users, setUsers] = useState([]);

  // Welcome screen हर बार दिखेगी (ताकि name pick/type कर सकें)
  const [showWelcome, setShowWelcome] = useState(true);

  // अब तक data load हुआ या नहीं (जब तक नहीं होता splash जैसा धीमा render होता है)
  const [isLoaded, setIsLoaded] = useState(false);

  // जो lesson अभी typing screen में open है (language + id + title)
  const [currentLesson, setCurrentLesson] = useState(null);

  // Practice mode - Start Typing button se aaya hai to home par wapas jana hai
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // Course mode
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Course के complete huye sub-lessons (student-specific)
  const [courseProgress, setCourseProgress] = useState([]);

  // Review screen से चुने गए config (drill के लिए)
  const [reviewConfig, setReviewConfig] = useState(null);

  // Previous screen tracking for back navigation
  const [previousScreen, setPreviousScreen] = useState('Home');

  // ABC game का selected mode (Games menu dropdown से)
  const [abcMode, setAbcMode] = useState('az');

  // Bubbles game का selected character set (Games menu dropdown से)
  const [bubbleMode, setBubbleMode] = useState('lower');

  // Practice test ki duration (Settings screen से) - seconds
  const [practiceTimeSec, setPracticeTimeSec] = useState(300);

  // App start होने पर saved data load करो
  useEffect(() => {
    (async () => {
      try {
        const savedName = await AsyncStorage.getItem(STORAGE_KEYS.name);
        if (savedName) {
          setStudentName(savedName);
          const savedUnlocked = await AsyncStorage.getItem(unlockedKeyFor(savedName));
          if (savedUnlocked) {
            try {
              setUnlockedLessons(JSON.parse(savedUnlocked));
            } catch {
              // corrupt data हो तो default रखो
            }
          }
          const savedCourseProgress = await AsyncStorage.getItem(courseProgressKeyFor(savedName));
          if (savedCourseProgress) {
            try {
              setCourseProgress(JSON.parse(savedCourseProgress));
            } catch {
              // corrupt data हो तो default रखो
            }
          }
        }
        const savedUsers = await AsyncStorage.getItem(STORAGE_KEYS.users);
        if (savedUsers) {
          try {
            const parsed = JSON.parse(savedUsers);
            if (Array.isArray(parsed)) setUsers(parsed);
          } catch {
            // corrupt data हो तो empty रखो
          }
        }
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.settings);
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (parsed && typeof parsed.practiceTimeSec === 'number') {
              setPracticeTimeSec(parsed.practiceTimeSec);
            }
          } catch {
            // corrupt data हो तो default रखो
          }
        }
      } catch (e) {
        // storage read fail हो तो default से चलाओ
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // नया name जुड़ने या पुराने user के select होने पर -
  // अपनी lessons progress load होती है, और name इस list में save हो जाता है
  const handleSetName = (name) => {
    const safe = name.trim();
    if (!safe) return;
    setStudentName(safe);
    setShowWelcome(false);

    AsyncStorage.getItem(unlockedKeyFor(safe))
      .then((raw) => {
        if (raw) {
          try {
            setUnlockedLessons(JSON.parse(raw));
          } catch {
            setUnlockedLessons(DEFAULT_UNLOCKED);
          }
        } else {
          // नया user - उसके lessons fresh से शुरू होते हैं
          setUnlockedLessons(DEFAULT_UNLOCKED);
        }
      })
      .catch(() => setUnlockedLessons(DEFAULT_UNLOCKED));

    // Course progress भी उसी student के नाम से load / fresh करो
    AsyncStorage.getItem(courseProgressKeyFor(safe))
      .then((raw) => {
        if (raw) {
          try {
            setCourseProgress(JSON.parse(raw));
          } catch {
            setCourseProgress([]);
          }
        } else {
          setCourseProgress([]);
        }
      })
      .catch(() => setCourseProgress([]));

    AsyncStorage.setItem(STORAGE_KEYS.name, safe).catch(() => {});

    // User को इस phone की users list में add करो (एक ही बार)
    setUsers((prev) => {
      if (prev.includes(safe)) return prev;
      const next = [...prev, safe];
      AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // Lessons screen पर जाने के लिए helper
  const showLessons = () => setActiveTab('Lessons');

  // Practice mode - random paragraph, settings wali duration
  const startPractice = () => {
    const paragraph = getRandomPracticeParagraph();
    setCurrentLesson({
      lang: 'english',
      id: `practice_${Date.now()}`,
      title: 'Practice',
      timeSec: practiceTimeSec,
      practiceText: paragraph,
    });
    setPreviousScreen('Home');
    setIsPracticeMode(true);
    setActiveTab('Type');
  };

  // Settings se practice duration badlo + save karo
  const changePracticeTime = (sec) => {
    setPracticeTimeSec(sec);
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ practiceTimeSec: sec })).catch(() => {});
  };

  // Settings se saara data reset - storage clear + state fresh + welcome screen
  const resetAllData = () => {
    setStudentName('');
    setUsers([]);
    setUnlockedLessons(DEFAULT_UNLOCKED);
    setCourseProgress([]);
    setAbcMode('az');
    setBubbleMode('lower');
    setPracticeTimeSec(300);
    setShowWelcome(true);
    setActiveTab('Home');
  };

  // किसी lesson को open करो - उसका lang, id, title, time save करके typing पर जाओ
  const handleStartLesson = (lang, lessonId, title, timeSec) => {
    setCurrentLesson({ lang, id: lessonId, title, timeSec });
    setPreviousScreen('Lessons');
    setActiveTab('Type');
  };

  // Lesson complete होने पर - practice mode me previous screen par, warna next lesson unlock + lessons
  const handleLessonComplete = (lang, lessonId) => {
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setActiveTab(previousScreen);
      return;
    }
    const current = unlockedLessons[lang] || [];
    const nextId = LESSON_ORDER[LESSON_ORDER.indexOf(lessonId) + 1];
    if (nextId !== undefined && !current.includes(nextId)) {
      const next = { ...unlockedLessons, [lang]: [...current, nextId] };
      setUnlockedLessons(next);
      AsyncStorage.setItem(unlockedKeyFor(studentName), JSON.stringify(next)).catch(() => {});
    }
    setActiveTab('Lessons');
  };

  // Course का sub-lesson complete हुआ - progress save + auto advance + result check
  const handleSubLessonComplete = (subId) => {
    const course = selectedCourse || (COURSES[0]);
    if (!course) return;

    const alreadyDone = courseProgress.includes(subId);
    const newProgress = alreadyDone ? courseProgress : [...courseProgress, subId];

    if (!alreadyDone) {
      setCourseProgress(newProgress);
      AsyncStorage.setItem(courseProgressKeyFor(studentName), JSON.stringify(newProgress)).catch(() => {});
    }

    // सारे lessons complete हुए? तो result screen दिखाओ
    const allLessonsDone = course.lessons.every((lesson) =>
      lesson.subLessons.every((s) => newProgress.includes(s.id))
    );
    if (allLessonsDone) {
      setPreviousScreen('LessonDetail');
      setActiveTab('Result');
      return;
    }

    // जिस lesson का sub-lesson abhi complete हुआ,
    // उस lesson के सारे sub-lessons complete हो गए तो अगले lesson par auto chale jao
    const parentLesson = course.lessons.find((lesson) =>
      lesson.subLessons.some((s) => s.id === subId)
    );
    if (parentLesson) {
      const parentComplete = parentLesson.subLessons.every((s) => newProgress.includes(s.id));
      const idx = course.lessons.findIndex((l) => l.id === parentLesson.id);
      const nextLesson = course.lessons[idx + 1];
      if (parentComplete && nextLesson) {
        setSelectedLesson(nextLesson);
        setPreviousScreen('LessonDetail');
        setActiveTab('LessonDetail');
        return;
      }
    }

    // नहीं तो वापस lesson detail पर
    setPreviousScreen('LessonDetail');
    setActiveTab('LessonDetail');
  };

  // जो screen चुना गया है उसे render करो
  const renderScreen = () => {
    switch (activeTab) {
      case 'Lessons':
        return (
          <LessonsScreen
            unlockedLessons={unlockedLessons}
            onStartLesson={handleStartLesson}
            onBack={() => setActiveTab('Home')}
          />
        );
      case 'Type':
        return (
          <TypingScreen
            lesson={currentLesson}
            onComplete={(lang, id) => {
              // Course का sub-lesson हो तो course progress update करो
              if (currentLesson && currentLesson.courseSubId) {
                handleSubLessonComplete(currentLesson.courseSubId);
              } else if (isPracticeMode) {
                setIsPracticeMode(false);
                setActiveTab(previousScreen);
              } else {
                handleLessonComplete(lang, id);
              }
            }}
            studentName={studentName}
            onBack={() => {
              setIsPracticeMode(false);
              setActiveTab(previousScreen);
            }}
          />
        );
      case 'History':
        return <HistoryScreen studentName={studentName} onBack={() => setActiveTab('Home')} />;
      case 'Stats':
        return <StatsScreen studentName={studentName} onBack={() => setActiveTab('Home')} />;
      case 'Course':
        return (
          <CourseScreen
            onBack={() => setActiveTab('Home')}
            completedSubLessons={courseProgress}
            onViewResult={() => setActiveTab('Result')}
            onStartLesson={(course, lesson) => {
              setSelectedCourse(course);
              setSelectedLesson(lesson);
              setActiveTab('LessonDetail');
            }}
          />
        );
      case 'LessonDetail':
        return (
          <LessonDetailScreen
            lesson={selectedLesson}
            course={selectedCourse}
            completedSubLessons={courseProgress}
            onBack={() => setActiveTab('Course')}
            onStartSubLesson={(sub) => {
              const timeMin = sub.duration ? parseInt(sub.duration) : 5;
              setCurrentLesson({
                lang: 'english',
                id: `course_${sub.id}_${Date.now()}`,
                title: sub.title,
                timeSec: timeMin * 60,
                practiceText: sub.text,
                courseSubId: sub.id,
              });
              setPreviousScreen('LessonDetail');
              setIsPracticeMode(true);
              setActiveTab('Type');
            }}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            onNextLesson={(lesson) => {
              setSelectedLesson(lesson);
            }}
          />
        );
      case 'Result':
        return (
          <ResultScreen
            course={selectedCourse || COURSES[0]}
            onBack={() => setActiveTab('Course')}
          />
        );
      case 'Review':
        return (
          <ReviewScreen
            onBack={() => setActiveTab('Home')}
            onStartReview={(config) => {
              // Keyboard Drill → single-letter drill, Word Drill → word drill
              if (config.exercise === 'Keyboard Drill') {
                setReviewConfig(config);
                setActiveTab('ReviewDrill');
              } else if (config.exercise === 'Word Drill') {
                setReviewConfig(config);
                setActiveTab('WordDrill');
              } else if (config.exercise === 'Game' && config.game === 'Clouds') {
                setReviewConfig(config);
                setActiveTab('CloudsGame');
              } else if (config.exercise === 'Game' && config.game === 'WordTris') {
                setReviewConfig(config);
                setActiveTab('WordTrisGame');
              } else {
                setActiveTab('Review');
              }
            }}
          />
        );
      case 'ReviewDrill':
        return (
          <ReviewDrillScreen
            onBack={() => setActiveTab('Review')}
            keyOption={reviewConfig ? reviewConfig.keyOption : 'Difficult Keys'}
          />
        );
      case 'WordDrill':
        return (
          <WordDrillScreen
            onBack={() => setActiveTab('Review')}
          />
        );
      case 'CloudsGame':
        return (
          <CloudsGameScreen
            onBack={() => setActiveTab('Review')}
          />
        );
      case 'WordTrisGame':
        return (
          <WordTrisGameScreen
            onBack={() => setActiveTab('Review')}
          />
        );
      case 'Home':
      default:
        return (
          <HomeScreen
            studentName={studentName}
            onStartTyping={startPractice}
            onContinueLesson={showLessons}
            onCourse={() => setActiveTab('Course')}
            onReview={() => setActiveTab('Review')}
            onGames={() => setActiveTab('Games')}
            onSetting={() => setActiveTab('Settings')}
            onSwitchUser={() => setShowWelcome(true)}
          />
        );
      case 'Games':
        return (
          <GamesMenuScreen
            onBack={() => setActiveTab('Home')}
            onStartABC={(mode) => {
              setAbcMode(mode || 'az');
              setActiveTab('AlphabetGame');
            }}
            onStartBubbles={(mode) => {
              setBubbleMode(mode || 'lower');
              setActiveTab('BubblesGame');
            }}
          />
        );
      case 'AlphabetGame':
        return <AlphabetGameScreen onBack={() => setActiveTab('Games')} mode={abcMode} />;
      case 'BubblesGame':
        return <BubblesGameScreen onBack={() => setActiveTab('Games')} mode={bubbleMode} />;
      case 'Settings':
        return (
          <SettingsScreen
            studentName={studentName}
            practiceTimeSec={practiceTimeSec}
            onChangePracticeTime={changePracticeTime}
            onSwitchUser={() => setShowWelcome(true)}
            onBack={() => setActiveTab('Home')}
            onResetAll={resetAllData}
          />
        );
    }
  };

  // अगर storage या fonts का data अभी load नहीं हुआ तो splash जैसा धीमा render होता है
  if (!isLoaded) {
    return (
      <View style={[styles.app, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }]}>
        <Text style={{ color: '#f8fafc', fontSize: 18, letterSpacing: 2 }}>Typing Master</Text>
        <Text style={{ color: 'rgba(226,232,240,0.65)', fontSize: 12, marginTop: 6 }}>Loading...</Text>
      </View>
    );
  }

  // Manager: पहले welcome screen दिखाओ (naments में सभी users की list के साथ),
  // ताकि पुराना user अपना name pick कर सके या नया name लिख सके
  if (showWelcome) {
    return (
      <NameEntryScreen
        onSubmit={handleSetName}
        onCancel={() => {
          // web/desktop par window close, native par BackHandler.exitApp
          if (typeof window !== 'undefined' && window.close) {
            window.close();
          } else {
            const { BackHandler } = require('react-native');
            BackHandler.exitApp();
          }
        }}
        users={users}
      />
    );
  }

  return (
    <View style={styles.app}>
      {renderScreen()}
      {/* Typing screen में bottom menu छिपा रहता है ताकि ध्यान भटके नहीं */}
      {activeTab !== 'Type' && activeTab !== 'WordDrill' && activeTab !== 'CloudsGame' && activeTab !== 'WordTrisGame' && activeTab !== 'AlphabetGame' && activeTab !== 'BubblesGame' && activeTab !== 'Settings' && activeTab !== 'Games' && (
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
      )}
    </View>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
});