// src/data/certificates.js
// Shared certificate definitions + earned-logic used by Certificate & Profile screens.

import { COLORS } from '../theme';

export const CERT_DEFS = [
  { id: 'beginner', name: 'Beginner Typist', icon: 'leaf', color: COLORS.green, target: 15, req: (s) => s.bestWpm >= 15 },
  { id: 'learning', name: 'Learning Typist', icon: 'school', color: COLORS.teal, target: 25, req: (s) => s.bestWpm >= 25 },
  { id: 'intermediate', name: 'Intermediate Typist', icon: 'book', color: COLORS.blue, target: 35, req: (s) => s.bestWpm >= 35 },
  { id: 'advanced', name: 'Advanced Typist', icon: 'rocket', color: COLORS.purple, target: 50, req: (s) => s.bestWpm >= 50 },
  { id: 'speed', name: 'Speed Expert', icon: 'flash', color: COLORS.amber, target: 70, req: (s) => s.bestWpm >= 70 },
  { id: 'accuracy', name: 'Accuracy Champion', icon: 'locate', color: COLORS.rose, target: 97, req: (s) => s.bestAcc >= 97 },
];

export const targetText = (c) => (c.id === 'accuracy' ? `${c.target}%+ Accuracy` : `${c.target} WPM`);

export function certsFromRecords(records) {
  const wpmArr = records.map((r) => r.wpm || 0);
  const accArr = records.map((r) => r.accuracy || 0);
  const summary = {
    total: records.length,
    bestWpm: wpmArr.length ? Math.max(...wpmArr) : 0,
    bestAcc: accArr.length ? Math.max(...accArr) : 0,
  };
  return CERT_DEFS.map((c) => {
    const earned = c.req(summary);
    let date = null;
    if (earned) {
      const rec = records.find((r) => (c.id === 'accuracy' ? (r.accuracy || 0) >= c.target : (r.wpm || 0) >= c.target));
      date = rec ? rec.date : null;
    }
    return { ...c, earned, date };
  });
}