// src/utils/wordUnits.js
// Text ko word-units me todo (word + uske baad ke spaces) — taaki flex-wrap
// sirf word boundaries par ho, word kabhi beech se na kate.

export function wordUnits(text) {
  const units = [];
  const n = text.length;
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && text[j] !== ' ' && text[j] !== '\n' && text[j] !== '\t') j++;
    let k = j;
    while (k < n && (text[k] === ' ' || text[k] === '\n' || text[k] === '\t')) k++;
    if (k > i) units.push({ s: i, e: k });
    i = k > i ? k : i + 1;
  }
  return units;
}
