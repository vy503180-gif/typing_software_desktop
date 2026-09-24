import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import TypingScreen from './src/screens/TypingScreen';
import TestScreen from './src/screens/TestScreen';
import StatsScreen from './src/screens/StatsScreen';
import CertificatesScreen from './src/screens/CertificatesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NameEntryScreen from './src/screens/NameEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BottomNav from './src/components/BottomNav';
import { Sidebar } from './src/components/DesktopShell';
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
import SpeedChallengeScreen from './src/screens/SpeedChallengeScreen';
import WordRushScreen from './src/screens/WordRushScreen';
import AccuracyChallengeScreen from './src/screens/AccuracyChallengeScreen';
import TimeAttackScreen from './src/screens/TimeAttackScreen';
import GamesMenuScreen from './src/screens/GamesMenuScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import InfoScreen from './src/screens/InfoScreen';
import { LESSON_ORDER, getNextLesson } from './src/data/lessons';
import { BG, BG_DEEP, COLORS } from './src/theme';
import { applyLightTheme } from './src/lightTheme';

LogBox.ignoreAllLogs();

const STORAGE_KEYS = {
  name: 'antriksh_student_name',
  users: 'antriksh_users',
  settings: 'antriksh_settings',
};

const unlockedKeyFor = (name) => `antriksh_unlocked_lessons_${name || 'default'}`;
const courseProgressKeyFor = (name) => `antriksh_course_progress_${name || 'default'}`;
const historyKeyFor = (name) => `antriksh_typing_history_${name || 'default'}`;

const DEFAULT_UNLOCKED = { english: [1], hindi: [1] };

const DEFAULT_SETTINGS = {
  keyboardSound: true,
  virtualKeyboard: true,
  fingerGuide: false,
  nextKeyHighlight: true,
  fontSize: 22,
  practiceTimeSec: 300,
  hindiLayout: 'mangal',
  theme: 'white',
};

export default function App() {
  const [tab, setTab] = useState('Home');
  const [studentName, setStudentName] = useState('');
  const [unlockedLessons, setUnlockedLessons] = useState(DEFAULT_UNLOCKED);
  const [users, setUsers] = useState([]);
  const [showNameEntry, setShowNameEntry] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [typingConfig, setTypingConfig] = useState(null);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [certTarget, setCertTarget] = useState(null);
  const [completedSubLessons, setCompletedSubLessons] = useState([]);
  const [reviewConfig, setReviewConfig] = useState(null);
  const [launchTab, setLaunchTab] = useState('Home');
  const [alphabetMode, setAlphabetMode] = useState('az');
  const [bubblesMode, setBubblesMode] = useState('lower');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [bestWpm, setBestWpm] = useState(0);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    // Project ka fixed background #D5EEF2 hai — sirf light theme.
    applyLightTheme();
  }, []);

  const isDesktop = dimensions.width >= 900;

  const loadBestWpm = (name) => {
    AsyncStorage.getItem(historyKeyFor(name))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          const wpmList = (Array.isArray(all) ? all : []).map((e) => e.wpm || 0);
          setBestWpm(wpmList.length ? Math.max(...wpmList) : 0);
        } catch {}
      })
      .catch(() => {});
  };

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
            try { setCompletedSubLessons(JSON.parse(savedCourseProgress)); } catch {}
          }
          loadBestWpm(savedName);
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
            if (parsed && typeof parsed === 'object') setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          } catch {}
        }
      } catch (e) {} finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persistSettings = (next) => {
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next)).catch(() => {});
  };

  const setSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persistSettings(next);
      return next;
    });
  };

  const changePracticeTime = (sec) => setSetting('practiceTimeSec', sec);
  const changeHindiLayout = (layout) => setSetting('hindiLayout', layout);

  const handleSubmitName = (name) => {
    const safe = name.trim();
    if (!safe) return;
    setStudentName(safe);
    setShowNameEntry(false);
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
          try { setCompletedSubLessons(JSON.parse(raw)); } catch { setCompletedSubLessons([]); }
        } else { setCompletedSubLessons([]); }
      })
      .catch(() => setCompletedSubLessons([]));
    AsyncStorage.setItem(STORAGE_KEYS.name, safe).catch(() => {});
    loadBestWpm(safe);
    setUsers((prev) => {
      if (prev.includes(safe)) return prev;
      const next = [...prev, safe];
      AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const startPracticeFromHome = () => {
    setTypingConfig({
      type: 'practice',
      lang: 'english',
      title: 'Typing Practice',
      timeSec: settings.practiceTimeSec || 300,
      difficulty: 'Easy',
      mode: 'paragraph',
    });
    setLaunchTab('Home');
    setTab('Type');
  };

  const startPractice = () => {
    setTypingConfig({
      type: 'practice',
      lang: 'english',
      title: 'Typing Practice',
      timeSec: settings.practiceTimeSec || 300,
      difficulty: 'Easy',
      mode: 'paragraph',
    });
    setLaunchTab('Home');
    setTab('Type');
  };

  const startTest = ({ timeSec, difficulty, mode }) => {
    setTypingConfig({
      type: 'test',
      lang: 'english',
      title: 'Typing Test',
      timeSec,
      difficulty,
      mode,
    });
    setLaunchTab('Tests');
    setTab('Type');
  };

  const startCert = (c) => {
    setCertTarget(c);
    setTypingConfig({
      type: 'cert',
      lang: 'english',
      title: `${c.name} Certificate`,
      timeSec: 60,
      difficulty: 'Easy',
      mode: 'paragraph',
      targetWpm: c.id === 'accuracy' ? null : c.target,
      targetAcc: c.id === 'accuracy' ? c.target : null,
    });
    setLaunchTab('Certificates');
    setTab('Type');
  };

  const startLesson = (lang, lessonId, title, timeSec) => {
    setTypingConfig({
      type: 'lesson',
      lang,
      id: lessonId,
      title,
      timeSec,
      nextLesson: getNextLesson(lang, lessonId),
    });
    setLaunchTab('Lessons');
    setTab('Type');
  };

  const unlockNextLesson = (lang, lessonId) => {
    const current = unlockedLessons[lang] || [];
    const nextId = LESSON_ORDER[LESSON_ORDER.indexOf(lessonId) + 1];
    if (nextId !== undefined && !current.includes(nextId)) {
      const next = { ...unlockedLessons, [lang]: [...current, nextId] };
      setUnlockedLessons(next);
      AsyncStorage.setItem(unlockedKeyFor(studentName), JSON.stringify(next)).catch(() => {});
    }
    loadBestWpm(studentName);
  };

  const handleNextLesson = (lang, lessonId, nextLessonData) => {
    if (nextLessonData) {
      unlockNextLesson(lang, lessonId);
      setTypingConfig({
        type: 'lesson',
        lang,
        id: nextLessonData.id,
        title: nextLessonData.title,
        timeSec: nextLessonData.timeSec,
        nextLesson: getNextLesson(lang, nextLessonData.id),
      });
      setLaunchTab('Lessons');
    }
  };

  const completeCourseSubLesson = (subId) => {
    const currentCourse = course || COURSES[0];
    if (!currentCourse) return;
    const alreadyDone = completedSubLessons.includes(subId);
    const newProgress = alreadyDone ? completedSubLessons : [...completedSubLessons, subId];
    if (!alreadyDone) {
      setCompletedSubLessons(newProgress);
      AsyncStorage.setItem(courseProgressKeyFor(studentName), JSON.stringify(newProgress)).catch(() => {});
    }
    const allComplete = currentCourse.lessons.every((l) =>
      l.subLessons.every((s) => newProgress.includes(s.id))
    );
    if (allComplete) {
      setLaunchTab('LessonDetail');
      setTypingConfig(null);
      setTab('Result');
      return;
    }
    const parentLesson = currentCourse.lessons.find((l) =>
      l.subLessons.some((s) => s.id === subId)
    );
    if (parentLesson) {
      const parentComplete = parentLesson.subLessons.every((s) => newProgress.includes(s.id));
      const idx = currentCourse.lessons.findIndex((l) => l.id === parentLesson.id);
      const nextLesson = currentCourse.lessons[idx + 1];
      if (parentComplete && nextLesson) {
        setLesson(nextLesson);
        setLaunchTab('LessonDetail');
        setTypingConfig(null);
        setTab('LessonDetail');
        return;
      }
    }
    setLaunchTab('LessonDetail');
    setTypingConfig(null);
    setTab('LessonDetail');
  };

  const handleTypingComplete = (lang, lessonId) => {
    if (typingConfig && typingConfig.courseSubId) {
      completeCourseSubLesson(typingConfig.courseSubId);
    } else {
      unlockNextLesson(lang, lessonId);
    }
  };

  const closeTyping = () => {
    loadBestWpm(studentName);
    const returnTo = launchTab === 'Type' ? 'Home' : launchTab;
    setTypingConfig(null);
    setTab(returnTo);
  };

  const resetAll = () => {
    setStudentName('');
    setUsers([]);
    setUnlockedLessons(DEFAULT_UNLOCKED);
    setCompletedSubLessons([]);
    setAlphabetMode('az');
    setBubblesMode('lower');
    setSettings(DEFAULT_SETTINGS);
    setBestWpm(0);
    setShowNameEntry(true);
    setTab('Home');
  };

  const renderScreen = () => {
    switch (tab) {
      case 'Lessons':
        return (
          <LessonsScreen
            studentName={studentName}
            unlockedLessons={unlockedLessons}
            onStartLesson={startLesson}
            hindiLayout={settings.hindiLayout || 'mangal'}
            onChangeHindiLayout={changeHindiLayout}
            onBack={() => setTab('Home')}
          />
        );
      case 'Type':
        return (
          <TypingScreen
            config={typingConfig || {}}
            settings={settings}
            onComplete={handleTypingComplete}
            onNextLesson={handleNextLesson}
            studentName={studentName}
            hindiLayout={settings.hindiLayout || 'mangal'}
            onBack={closeTyping}
          />
        );
      case 'Tests':
        return (
          <TestScreen
            studentName={studentName}
            onStartTest={startTest}
            onBack={() => setTab('Home')}
          />
        );
      case 'Statistics':
      case 'Stats':
        return (
          <StatsScreen
            studentName={studentName}
            onBack={() => setTab('Home')}
          />
        );
      case 'Certificates':
        return (
          <CertificatesScreen
            studentName={studentName}
            onStartCert={startCert}
            onBack={() => setTab('Home')}
          />
        );
      case 'Profile':
        return (
          <ProfileScreen
            studentName={studentName}
            onBack={() => setTab('Home')}
            onSwitchUser={() => setShowNameEntry(true)}
            onSettings={() => setTab('Settings')}
          />
        );
      case 'History':
        return (
          <HistoryScreen
            studentName={studentName}
            onBack={() => setTab('Home')}
          />
        );
      case 'Course':
        return (
          <CourseScreen
            onBack={() => setTab('Home')}
            completedSubLessons={completedSubLessons}
            onViewResult={() => setTab('Result')}
            onStartLesson={(c, l) => {
              setCourse(c);
              setLesson(l);
              setTab('LessonDetail');
            }}
          />
        );
      case 'LessonDetail':
        return (
          <LessonDetailScreen
            lesson={lesson}
            course={course}
            completedSubLessons={completedSubLessons}
            onBack={() => setTab('Course')}
            onStartSubLesson={(sub) => {
              const minutes = sub.duration ? parseInt(sub.duration) : 5;
              setTypingConfig({
                type: 'lesson',
                lang: 'english',
                id: `course_${sub.id}_${Date.now()}`,
                title: sub.title,
                timeSec: minutes * 60,
                lessonText: sub.text,
                courseSubId: sub.id,
              });
              setLaunchTab('LessonDetail');
              setTab('Type');
            }}
            onSelectLesson={(l) => setLesson(l)}
          />
        );
      case 'Result':
        return (
          <ResultScreen
            course={course || COURSES[0]}
            onBack={() => setTab('Course')}
          />
        );
      case 'Review':
        return (
          <ReviewScreen
            onBack={() => setTab('Home')}
            onStartReview={(config) => {
              if (config.exercise === 'Keyboard Drill') {
                setReviewConfig(config);
                setTab('ReviewDrill');
              } else if (config.exercise === 'Word Drill') {
                setReviewConfig(config);
                setTab('WordDrill');
              } else if (config.exercise === 'Game' && config.game === 'Clouds') {
                setReviewConfig(config);
                setTab('CloudsGame');
              } else if (config.exercise === 'Game' && config.game === 'WordTris') {
                setReviewConfig(config);
                setTab('WordTrisGame');
              } else {
                setTab('Review');
              }
            }}
          />
        );
      case 'ReviewDrill':
        return (
          <ReviewDrillScreen
            onBack={() => setTab('Review')}
            keyOption={reviewConfig ? reviewConfig.keyOption : 'Difficult Keys'}
          />
        );
      case 'WordDrill':
        return <WordDrillScreen onBack={() => setTab('Review')} />;
      case 'CloudsGame':
        return <CloudsGameScreen onBack={() => setTab('Review')} />;
      case 'WordTrisGame':
        return <WordTrisGameScreen onBack={() => setTab('Review')} />;
      case 'Games':
        return (
          <GamesMenuScreen
            onBack={() => setTab('Home')}
            onStartABC={(mode) => { setAlphabetMode(mode || 'az'); setTab('AlphabetGame'); }}
            onStartBubbles={(mode) => { setBubblesMode(mode || 'lower'); setTab('BubblesGame'); }}
            onStartSpeed={() => setTab('SpeedChallenge')}
            onStartWordRush={() => setTab('WordRush')}
            onStartAccuracy={() => setTab('AccuracyChallenge')}
            onStartTimeAttack={() => setTab('TimeAttack')}
          />
        );
      case 'AlphabetGame':
        return <AlphabetGameScreen onBack={() => setTab('Games')} mode={alphabetMode} />;
      case 'BubblesGame':
        return <BubblesGameScreen onBack={() => setTab('Games')} mode={bubblesMode} />;
      case 'SpeedChallenge':
        return <SpeedChallengeScreen onBack={() => setTab('Games')} />;
      case 'WordRush':
        return <WordRushScreen onBack={() => setTab('Games')} />;
      case 'AccuracyChallenge':
        return <AccuracyChallengeScreen onBack={() => setTab('Games')} />;
      case 'TimeAttack':
        return <TimeAttackScreen onBack={() => setTab('Games')} />;
      case 'Settings':
        return (
          <SettingsScreen
            studentName={studentName}
            settings={settings}
            onChangeSetting={setSetting}
            practiceTimeSec={settings.practiceTimeSec || 300}
            onChangePracticeTime={changePracticeTime}
            hindiLayout={settings.hindiLayout || 'mangal'}
            onChangeHindiLayout={changeHindiLayout}
            onSwitchUser={() => setShowNameEntry(true)}
            onBack={() => setTab('Home')}
            onResetAll={resetAll}
          />
        );
      case 'Explore':
        return (
          <ExploreScreen
            studentName={studentName}
            onBack={() => setTab('Home')}
          />
        );
      case 'Info':
        return <InfoScreen onBack={() => setTab('Home')} />;
      case 'Home':
      default:
        return (
          <HomeScreen
            studentName={studentName}
            onStartTyping={startPracticeFromHome}
            onLessons={() => setTab('Lessons')}
            onTests={() => setTab('Tests')}
            onGames={() => setTab('Games')}
            onCertificates={() => setTab('Certificates')}
            onStatistics={() => setTab('Statistics')}
            onProfile={() => setTab('Profile')}
            onSettings={() => setTab('Settings')}
            onSwitchUser={() => setShowNameEntry(true)}
            onCourse={() => setTab('Course')}
            onReview={() => setTab('Review')}
            onExplore={() => setTab('Explore')}
            onInfo={() => setTab('Info')}
          />
        );
    }
  };

  if (!loaded) {
    return (
      <View style={[styles.app, { alignItems: 'center', justifyContent: 'center', backgroundColor: BG }]}>
        <Text style={{ color: '#f8fafc', fontSize: 18, letterSpacing: 2, fontFamily: 'Calibri', fontWeight: '700' }}>Typing Master</Text>
        <Text style={{ color: 'rgba(226,232,240,0.65)', fontSize: 12, marginTop: 6 }}>Loading...</Text>
      </View>
    );
  }

  if (showNameEntry) {
    return (
      <NameEntryScreen
        onSubmit={handleSubmitName}
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

  const fullScreenTabs = ['Type', 'WordDrill', 'ReviewDrill', 'CloudsGame', 'WordTrisGame', 'AlphabetGame', 'BubblesGame', 'SpeedChallenge', 'WordRush', 'AccuracyChallenge', 'TimeAttack'];
  const isFullScreen = fullScreenTabs.includes(tab);

  if (isDesktop && !isFullScreen) {
    return (
      <View style={styles.desktopRoot}>
        <Sidebar
          activeTab={tab}
          onTabPress={(t) => {
            if (t !== 'Practice') setTab(t);
            else startPractice();
          }}
          studentName={studentName}
          bestWpm={bestWpm}
        />
        <View style={styles.desktopMain}>
          <View style={styles.desktopContent}>
            {renderScreen()}
          </View>
        </View>
      </View>
    );
  }

  if (isDesktop && isFullScreen) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.fsOuter}>
          <View style={styles.fsWindow}>
            <View style={styles.fsExitFloating}>
              <TouchableOpacity
                style={styles.fsExitBtn}
                onPress={() => { setTypingConfig(null); setTab('Home'); }}
                activeOpacity={0.8}
              >
                <Ionicons name="home" size={14} color="#fff" />
              </TouchableOpacity>
              {typeof window !== 'undefined' && window.close && (
                <TouchableOpacity
                  style={styles.fsExitBtn}
                  onPress={closeTyping}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.fsBody}>
              {renderScreen()}
            </View>
          </View>
        </View>
      </View>
    );
  }

  const mobileHiddenTabs = ['Type', 'WordDrill', 'ReviewDrill', 'CloudsGame', 'WordTrisGame', 'AlphabetGame', 'BubblesGame', 'Settings', 'Games', 'Tests', 'Statistics', 'Certificates', 'Profile', 'SpeedChallenge', 'WordRush', 'AccuracyChallenge', 'TimeAttack'];

  return (
    <View style={styles.app}>
      {renderScreen()}
      {!mobileHiddenTabs.includes(tab) && (
        <BottomNav activeTab={tab} onTabPress={setTab} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BG,
    paddingHorizontal: 100,
    overflow: 'hidden',
  },
  desktopMain: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  desktopContent: {
    flex: 1,
    overflow: 'hidden',
  },
  fsOuter: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 100,
    paddingRight: 100,
    backgroundColor: BG_DEEP,
  },
  fsWindow: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    backgroundColor: BG,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 12,
  },
  fsExitFloating: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fsExitBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,14,26,0.55)',
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  fsBody: {
    flex: 1,
    overflow: 'hidden',
  },
});