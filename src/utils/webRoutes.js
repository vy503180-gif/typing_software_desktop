const TAB_PATHS = {
  Home: '/',
  Lessons: '/lessons',
  Type: '/typing',
  Tests: '/tests',
  Stats: '/stats',
  Statistics: '/statistics',
  Certificates: '/certificates',
  Profile: '/profile',
  History: '/history',
  Course: '/course',
  LessonDetail: '/course/lesson',
  Result: '/course/result',
  Review: '/review',
  ReviewDrill: '/review/drill',
  WordDrill: '/review/word-drill',
  CloudsGame: '/games/clouds',
  WordTrisGame: '/games/word-tris',
  Games: '/games',
  AlphabetGame: '/games/alphabet',
  BubblesGame: '/games/bubbles',
  SpeedChallenge: '/games/speed',
  WordRush: '/games/word-rush',
  AccuracyChallenge: '/games/accuracy',
  TimeAttack: '/games/time-attack',
  CarRace: '/games/car-race',
  Settings: '/settings',
  Explore: '/explore',
  Info: '/about',
  Developer: '/contact',
};

const normalizePath = (path = '/') => {
  const normalized = path.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const PATH_TABS = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [normalizePath(path), tab])
);

PATH_TABS['/download'] = 'Stats';

export const getTabFromPath = (path) => PATH_TABS[normalizePath(path)] || 'Home';

export const getPathForTab = (tab) => TAB_PATHS[tab] || '/';

export const isKnownPath = (path) => Object.hasOwn(PATH_TABS, normalizePath(path));