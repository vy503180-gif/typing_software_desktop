import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import TypingScreen from './src/screens/TypingScreen';
import NameEntryScreen from './src/screens/NameEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BottomNav, { DesktopSidebar } from './src/components/BottomNav';
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
import ExploreScreen from './src/screens/ExploreScreen';
import InfoScreen from './src/screens/InfoScreen';
import { LESSON_ORDER, getRandomPracticeParagraph } from './src/data/lessons';
import { IS_DESKTOP, SIDEBAR_WIDTH, HEADER_HEIGHT, COLORS, BG } from './src/theme';

const STORAGE_KEYS = {
  name: 'antriksh_student_name',
  users: 'antriksh_users',
  settings: 'antriksh_settings',
};

const unlockedKeyFor = (name) => `antriksh_unlocked_lessons_${name || 'default'}`;
const courseProgressKeyFor = (name) => `antriksh_course_progress_${name || 'default'}`;
const DEFAULT_UNLOCKED = { english: [1], hindi: [1] };

// Desktop header component
function DesktopHeader({ activeTab, studentName }) {
  const titles = {
    Home: 'Dashboard',
    Lessons: 'Lessons',
    History: 'History',
    Stats: 'Statistics',
    Course: 'Course',
    Settings: 'Settings',
    Review: 'Review',
    Games: 'Games',
    Explore: 'Explore',
    Info: 'About',
  };
  return (
    <View style={appStyles.desktopHeader}>
      <Text style={appStyles.desktopHeaderTitle}>{titles[activeTab] || 'Typing Master'}</Text>
      {studentName ? (
        <View style={appStyles.desktopHeaderUser}>
          <View style={appStyles.desktopHeaderAvatar}>
            <Text style={appStyles.desktopHeaderAvatarText}>{studentName[0].toUpperCase()}</Text>
          </View>
          <Text style={appStyles.desktopHeaderName}>{studentName}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  const [fontsReady] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [studentName, setStudentName] = useState('');
  const [unlockedLessons, setUnlockedLessons] = useState(DEFAULT_UNLOCKED);
  const [users, setUsers] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState([]);
  const [reviewConfig, setReviewConfig] = useState(null);
  const [previousScreen, setPreviousScreen] = useState('Home');
  const [abcMode, setAbcMode] = useState('az');
  const [bubbleMode, setBubbleMode] = useState('lower');
  const [practiceTimeSec, setPracticeTimeSec] = useState(300);
  const [hindiLayout, setHindiLayout] = useState('mangal');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Listen for dimension changes (window resize on web)
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => sub?.remove?.();
  }, []);

  const isDesktop = Platform.OS === 'web' && dimensions.width >= 900;

  useEffect(() => {
    (async () => {
      try {
        const savedName = await AsyncStorage.getItem(STORAGE_KEYS.name);
        if (savedName) {
          setStudentName(savedName);
          const savedUnlocked = await AsyncStorage.getItem(unlockedKeyFor(savedName));
          if (savedUnlocked) {
            try { setUnlockedLessons(JSON.parse(savedUnlocked)); } catch {}
          }
          const savedCourseProgress = await AsyncStorage.getItem(courseProgressKeyFor(savedName));
          if (savedCourseProgress) {
            try { setCourseProgress(JSON.parse(savedCourseProgress)); } catch {}
          }
        }
        const savedUsers = await AsyncStorage.getItem(STORAGE_KEYS.users);
        if (savedUsers) {
          try {
            const parsed = JSON.parse(savedUsers);
            if (Array.isArray(parsed)) setUsers(parsed);
          } catch {}
        }
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.settings);
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (parsed && typeof parsed.practiceTimeSec === 'number') setPracticeTimeSec(parsed.practiceTimeSec);
            if (parsed && typeof parsed.hindiLayout === 'string') setHindiLayout(parsed.hindiLayout);
          } catch {}
        }
      } catch (e) {} finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const handleSetName = (name) => {
    const safe = name.trim();
    if (!safe) return;
    setStudentName(safe);
    setShowWelcome(false);
    AsyncStorage.getItem(unlockedKeyFor(safe))
      .then((raw) => {
        if (raw) {
          try { setUnlockedLessons(JSON.parse(raw)); } catch { setUnlockedLessons(DEFAULT_UNLOCKED); }
        } else { setUnlockedLessons(DEFAULT_UNLOCKED); }
      })
      .catch(() => setUnlockedLessons(DEFAULT_UNLOCKED));
    AsyncStorage.getItem(courseProgressKeyFor(safe))
      .then((raw) => {
        if (raw) {
          try { setCourseProgress(JSON.parse(raw)); } catch { setCourseProgress([]); }
        } else { setCourseProgress([]); }
      })
      .catch(() => setCourseProgress([]));
    AsyncStorage.setItem(STORAGE_KEYS.name, safe).catch(() => {});
    setUsers((prev) => {
      if (prev.includes(safe)) return prev;
      const next = [...prev, safe];
      AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const showLessons = () => setActiveTab('Lessons');

  const startPractice = () => {
    const paragraph = getRandomPracticeParagraph(practiceTimeSec);
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

  const changePracticeTime = (sec) => {
    setPracticeTimeSec(sec);
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ practiceTimeSec: sec, hindiLayout })).catch(() => {});
  };

  const changeHindiLayout = (layout) => {
    setHindiLayout(layout);
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ practiceTimeSec, hindiLayout: layout })).catch(() => {});
  };

  const resetAllData = () => {
    setStudentName('');
    setUsers([]);
    setUnlockedLessons(DEFAULT_UNLOCKED);
    setCourseProgress([]);
    setAbcMode('az');
    setBubbleMode('lower');
    setPracticeTimeSec(300);
    setHindiLayout('mangal');
    setShowWelcome(true);
    setActiveTab('Home');
  };

  const handleStartLesson = (lang, lessonId, title, timeSec) => {
    setCurrentLesson({ lang, id: lessonId, title, timeSec });
    setPreviousScreen('Lessons');
    setActiveTab('Type');
  };

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

  const handleSubLessonComplete = (subId) => {
    const course = selectedCourse || (COURSES[0]);
    if (!course) return;
    const alreadyDone = courseProgress.includes(subId);
    const newProgress = alreadyDone ? courseProgress : [...courseProgress, subId];
    if (!alreadyDone) {
      setCourseProgress(newProgress);
      AsyncStorage.setItem(courseProgressKeyFor(studentName), JSON.stringify(newProgress)).catch(() => {});
    }
    const allLessonsDone = course.lessons.every((lesson) =>
      lesson.subLessons.every((s) => newProgress.includes(s.id))
    );
    if (allLessonsDone) {
      setPreviousScreen('LessonDetail');
      setActiveTab('Result');
      return;
    }
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
    setPreviousScreen('LessonDetail');
    setActiveTab('LessonDetail');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Lessons':
        return (
          <LessonsScreen
            unlockedLessons={unlockedLessons}
            onStartLesson={handleStartLesson}
            hindiLayout={hindiLayout}
            onChangeHindiLayout={changeHindiLayout}
            onBack={() => setActiveTab('Home')}
          />
        );
      case 'Type':
        return (
          <TypingScreen
            lesson={currentLesson}
            onComplete={(lang, id) => {
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
            hindiLayout={hindiLayout}
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
        return <ReviewDrillScreen onBack={() => setActiveTab('Review')} keyOption={reviewConfig ? reviewConfig.keyOption : 'Difficult Keys'} />;
      case 'WordDrill':
        return <WordDrillScreen onBack={() => setActiveTab('Review')} />;
      case 'CloudsGame':
        return <CloudsGameScreen onBack={() => setActiveTab('Review')} />;
      case 'WordTrisGame':
        return <WordTrisGameScreen onBack={() => setActiveTab('Review')} />;
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
            onExplore={() => setActiveTab('Explore')}
            onInfo={() => setActiveTab('Info')}
            onSwitchUser={() => setShowWelcome(true)}
          />
        );
      case 'Games':
        return (
          <GamesMenuScreen
            onBack={() => setActiveTab('Home')}
            onStartABC={(mode) => { setAbcMode(mode || 'az'); setActiveTab('AlphabetGame'); }}
            onStartBubbles={(mode) => { setBubbleMode(mode || 'lower'); setActiveTab('BubblesGame'); }}
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
            hindiLayout={hindiLayout}
            onChangeHindiLayout={changeHindiLayout}
            onSwitchUser={() => setShowWelcome(true)}
            onBack={() => setActiveTab('Home')}
            onResetAll={resetAllData}
          />
        );
      case 'Explore':
        return (
          <ExploreScreen
            studentName={studentName}
            onBack={() => setActiveTab('Home')}
          />
        );
      case 'Info':
        return <InfoScreen onBack={() => setActiveTab('Home')} />;
    }
  };

  if (!isLoaded) {
    return (
      <View style={[appStyles.app, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }]}>
        <Text style={{ color: '#f8fafc', fontSize: 18, letterSpacing: 2 }}>Typing Master</Text>
        <Text style={{ color: 'rgba(226,232,240,0.65)', fontSize: 12, marginTop: 6 }}>Loading...</Text>
      </View>
    );
  }

  // Welcome screen (same for mobile & desktop)
  if (showWelcome) {
    return (
      <NameEntryScreen
        onSubmit={handleSetName}
        onCancel={() => {
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

  // Full-screen modes (typing, games, drills) - no sidebar
  const fullScreenTabs = ['Type', 'WordDrill', 'ReviewDrill', 'CloudsGame', 'WordTrisGame', 'AlphabetGame', 'BubblesGame'];
  const isFullScreen = fullScreenTabs.includes(activeTab);

  if (isDesktop && !isFullScreen) {
    // Desktop layout: sidebar + header + content
    return (
      <View style={appStyles.desktopRoot}>
        <DesktopSidebar activeTab={activeTab} onTabPress={setActiveTab} />
        <View style={appStyles.desktopMain}>
          <DesktopHeader activeTab={activeTab} studentName={studentName} />
          <View style={appStyles.desktopContent}>
            {renderScreen()}
          </View>
        </View>
      </View>
    );
  }

  if (isDesktop && isFullScreen) {
    // Full screen mode on desktop (typing, games) - no sidebar/header
    return (
      <View style={appStyles.desktopRoot}>
        <View style={appStyles.desktopMain}>
          {renderScreen()}
        </View>
      </View>
    );
  }

  // Mobile layout (existing)
  return (
    <View style={appStyles.app}>
      {renderScreen()}
      {activeTab !== 'Type' && activeTab !== 'WordDrill' && activeTab !== 'ReviewDrill' && activeTab !== 'CloudsGame' && activeTab !== 'WordTrisGame' && activeTab !== 'AlphabetGame' && activeTab !== 'BubblesGame' && activeTab !== 'Settings' && activeTab !== 'Games' && (
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
      )}
    </View>
  );
}

const appStyles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BG,
    overflow: 'hidden',
  },
  desktopMain: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  desktopHeader: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  desktopHeaderTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 15,
  },
  desktopHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopHeaderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopHeaderAvatarText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 12,
  },
  desktopHeaderName: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textLight,
    fontSize: 13,
  },
  desktopContent: {
    flex: 1,
    overflow: 'hidden',
  },
});
