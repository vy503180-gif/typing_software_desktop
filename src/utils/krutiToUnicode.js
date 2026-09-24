// src/utils/krutiToUnicode.js
// Kruti Dev 010 (legacy ASCII) se Unicode Devanagari me convert karta hai.
// Isse Hindi lessons ko Kruti Dev keyboard layout par type kiya ja sakta hai:
// user ASCII keys dabata hai, hum unhe Unicode me badal kar lesson text se match karte hain.

const replaceAll = (str, find, replace) => str.split(find).join(replace);

// ---- Mapping data (Kruti Dev -> Unicode) ----
const CONSONANTS_KRUTI = [
  'd', '[k', 'x', '?k', '\xb3', 'p', 'N', 't', '>', '\xa5',
  'V', 'B', 'M', '<', '.k', 'r', 'Fk', 'n', '/k', 'u',
  'u', 'i', 'Q', 'c', 'Hk', 'e', ';', 'j', 'j', 'y',
  'G', '\u0934', 'o', "'k", '"k', 'l', 'g', 'd', '[k', 'x',
  't', 'M+', '<+', 'Q', ';', 'D', '[', 'X', '?', '\xb3~',
  'P', 'N~', 'T', '\xf7', '\xa5~', 'V~', 'B~', 'M~', '<~', '.',
  'R', 'F', 'n~', '/', '\xcb', '\xe8', 'U', 'I', '\xb6', 'C',
  'H', 'E', '\xb8', 'Z', 'Y', 'O', "'", '\xdc', '"', 'L', '\xba',
];

const VOWELS_UNICODE = [
  '\u0905', '\u0906', '\u0907', '\u0908', '\u0909', '\u090a',
  '\u090f', '\u0910', '\u0913', '\u0914', '\u093e', '\u093f',
  '\u0940', '\u0941', '\u0942', '\u0943', '\u0947', '\u0948',
  '\u094b', '\u094c', '\u0902', '\u0903', '\u0901', '\u0945',
];

const UNATTACHED_UNICODE = [
  '\u093e', '\u093f', '\u0940', '\u0941', '\u0942', '\u0943',
  '\u0947', '\u0948', '\u094b', '\u094c', '\u0902', '\u0903', '\u0901', '\u0945',
];

const MAIN = [
  ['\xf1', '\u0970'],
  ['Q+Z', 'QZ+'],
  ['sas', 'sa'],
  ['aa', 'a'],
  [')Z', '\u0930\u094d\u0926\u094d\u0927'],
  ['ZZ', 'Z'],
  ['\u2018', '"'],
  ['\u2019', '"'],
  ['\u201c', "'"],
  ['\u201d', "'"],
  ['\xe5', '\u0966'],
  ['\u0192', '\u0967'],
  ['\u201e', '\u0968'],
  ['\u2026', '\u0969'],
  ['\u2020', '\u096a'],
  ['\u2021', '\u096b'],
  ['\u02c6', '\u096c'],
  ['\u2030', '\u096d'],
  ['\u0160', '\u096e'],
  ['\u2039', '\u096f'],
  ['\xb6+', '\u095e\u094d'],
  ['d+', '\u0958'],
  ['[+k', '\u0959'],
  ['[+', '\u0959\u094d'],
  ['x+', '\u095a'],
  ['T+', '\u091c\u093c\u094d'],
  ['t+', '\u095b'],
  ['M+', '\u095c'],
  ['<+', '\u095d'],
  ['Q+', '\u095e'],
  [';+', '\u095f'],
  ['j+', '\u0931'],
  ['u+', '\u0929'],
  ['\xd9k', '\u0924\u094d\u0924'],
  ['\xd9', '\u0924\u094d\u0924\u094d'],
  ['\xe4', '\u0915\u094d\u0924'],
  ['\u2013', '\u0926\u0943'],
  ['\u2014', '\u0915\u0943'],
  ['\xe9', '\u0928\u094d\u0928'],
  ['\u2122', '\u0928\u094d\u0928\u094d'],
  ['=kk', '=k'],
  ['f=k', 'f='],
  ['\xe0', '\u0939\u094d\u0928'],
  ['\xe1', '\u0939\u094d\u092f'],
  ['\xe2', '\u0939\u0943'],
  ['\xe3', '\u0939\u094d\u092e'],
  ['\xbaz', '\u0939\u094d\u0930'],
  ['\xba', '\u0939\u094d'],
  ['\xed', '\u0926\u094d\u0926'],
  ['{k', '\u0915\u094d\u0937'],
  ['{', '\u0915\u094d\u0937\u094d'],
  ['=', '\u0924\u094d\u0930'],
  ['\xab', '\u0924\u094d\u0930\u094d'],
  ['N\xee', '\u091b\u094d\u092f'],
  ['V\xee', '\u091f\u094d\u092f'],
  ['B\xee', '\u0920\u094d\u092f'],
  ['M\xee', '\u0921\u094d\u092f'],
  ['<\xee', '\u0922\u094d\u092f'],
  ['|', '\u0926\u094d\u092f'],
  ['K', '\u091c\u094d\u091e'],
  ['}', '\u0926\u094d\u0935'],
  ['J', '\u0936\u094d\u0930'],
  ['V\xaa', '\u091f\u094d\u0930'],
  ['M\xaa', '\u0921\u094d\u0930'],
  ['<\xaa\xaa', '\u0922\u094d\u0930'],
  ['N\xaa', '\u091b\u094d\u0930'],
  ['\xd8', '\u0915\u094d\u0930'],
  ['\xdd', '\u092b\u094d\u0930'],
  ['nzZ', '\u0930\u094d\u0926\u094d\u0930'],
  ['\xe6', '\u0926\u094d\u0930'],
  ['\xe7', '\u092a\u094d\u0930'],
  ['\xc1', '\u092a\u094d\u0930'],
  ['xz', '\u0917\u094d\u0930'],
  ['#', '\u0930\u0941'],
  [':', '\u0930\u0942'],
  ['v\u201a', '\u0911'],
  ['vks', '\u0913'],
  ['vkS', '\u0914'],
  ['vk', '\u0906'],
  ['v', '\u0905'],
  ['b\xb1', '\u0908\u0902'],
  ['\xc3', '\u0908'],
  ['bZ', '\u0908'],
  ['b', '\u0907'],
  ['m', '\u0909'],
  ['\xc5', '\u090a'],
  [',s', '\u0910'],
  [',', '\u090f'],
  ['_', '\u090b'],
  ['\xf4', '\u0915\u094d\u0915'],
  ['d', '\u0915'],
  ['Dk', '\u0915'],
  ['D', '\u0915\u094d'],
  ['[k', '\u0916'],
  ['[', '\u0916\u094d'],
  ['x', '\u0917'],
  ['Xk', '\u0917'],
  ['X', '\u0917\u094d'],
  ['\xc4', '\u0918'],
  ['?k', '\u0918'],
  ['?', '\u0918\u094d'],
  ['\xb3', '\u0919'],
  ['pkS', '\u091a\u0948'],
  ['p', '\u091a'],
  ['Pk', '\u091a'],
  ['P', '\u091a\u094d'],
  ['N', '\u091b'],
  ['t', '\u091c'],
  ['Tk', '\u091c'],
  ['T', '\u091c\u094d'],
  ['>', '\u091d'],
  ['\xf7', '\u091d\u094d'],
  ['\xa5', '\u091e'],
  ['\xea', '\u091f\u094d\u091f'],
  ['\xeb', '\u091f\u094d\u0920'],
  ['V', '\u091f'],
  ['B', '\u0920'],
  ['\xec', '\u0921\u094d\u0921'],
  ['\xef', '\u0921\u094d\u0922'],
  ['M+', '\u0921\u093c'],
  ['<+', '\u0922\u093c'],
  ['M', '\u0921'],
  ['<', '\u0922'],
  ['.k', '\u0923'],
  ['.', '\u0923\u094d'],
  ['r', '\u0924'],
  ['Rk', '\u0924'],
  ['R', '\u0924\u094d'],
  ['Fk', '\u0925'],
  ['F', '\u0925\u094d'],
  [')', '\u0926\u094d\u0927'],
  ['n', '\u0926'],
  ['/k', '\u0927'],
  ['/', '\u0927\u094d'],
  ['\xcb', '\u0927\u094d'],
  ['\xe8', '\u0927'],
  ['u', '\u0928'],
  ['Uk', '\u0928'],
  ['U', '\u0928\u094d'],
  ['i', '\u092a'],
  ['Ik', '\u092a'],
  ['I', '\u092a\u094d'],
  ['Q', '\u092b'],
  ['\xb6', '\u092b\u094d'],
  ['c', '\u092c'],
  ['Ck', '\u092c'],
  ['C', '\u092c\u094d'],
  ['Hk', '\u092d'],
  ['H', '\u092d\u094d'],
  ['e', '\u092e'],
  ['Ek', '\u092e'],
  ['E', '\u092e\u094d'],
  [';', '\u092f'],
  ['\xb8', '\u092f\u094d'],
  ['j', '\u0930'],
  ['y', '\u0932'],
  ['Yk', '\u0932'],
  ['Y', '\u0932\u094d'],
  ['G', '\u0933'],
  ['o', '\u0935'],
  ['Ok', '\u0935'],
  ['O', '\u0935\u094d'],
  ["'k", '\u0936'],
  ["'", '\u0936\u094d'],
  ['"k', '\u0937'],
  ['"', '\u0937\u094d'],
  ['l', '\u0938'],
  ['Lk', '\u0938'],
  ['L', '\u0938\u094d'],
  ['g', '\u0939'],
  ['\xc8', '\u0940\u0902'],
  ['saz', '\u094d\u0930\u0947\u0902'],
  ['z', '\u094d\u0930'],
  ['\xcc', '\u0926\u094d\u0926'],
  ['\xcd', '\u091f\u094d\u091f'],
  ['\xce', '\u091f\u094d\u0920'],
  ['\xcf', '\u0921\u094d\u0921'],
  ['\xd1', '\u0915\u0943'],
  ['\xd2', '\u092d'],
  ['\xd3', '\u094d\u092f'],
  ['\xd4', '\u0921\u094d\u0922'],
  ['\xd6', '\u091d\u094d'],
  ['\xd8', '\u0915\u094d\u0930'],
  ['\xd9', '\u0924\u094d\u0924\u094d'],
  ['\xdck', '\u0936'],
  ['\xdc', '\u0936\u094d'],
  ['\u201a', '\u0949'],
  ['kas', '\u094b\u0902'],
  ['ks', '\u094b'],
  ['kS', '\u094c'],
  ['\xa1k', '\u093e\u0901'],
  ['ak', 'k\u0902'],
  ['k', '\u093e'],
  ['ah', '\u0940\u0902'],
  ['h', '\u0940'],
  ['aq', '\u0941\u0902'],
  ['q', '\u0941'],
  ['aw', '\u0942\u0902'],
  ['\xa1w', '\u0942\u0901'],
  ['w', '\u0942'],
  ['`', '\u0943'],
  ['\u0300', '\u0943'],
  ['as', '\u0947\u0902'],
  ['\xb1s', 's\xb1'],
  ['s', '\u0947'],
  ['aS', '\u0948\u0902'],
  ['S', '\u0948'],
  ['a\xaa', '\u094d\u0930\u0902'],
  ['\xaa', '\u094d\u0930'],
  ['fa', '\u0902f'],
  ['a', '\u0902'],
  ['\xa1', '\u0901'],
  ['%', ':'],
  ['W', '\u0945'],
  ['\u2022', '\u093d'],
  ['\xb7', '\u093d'],
  ['\u2219', '\u093d'],
  ['\xb7', '\u093d'],
  ['~j', '\u094d\u0930'],
  ['~', '\u094d'],
  ['\\', '?'],
  ['+', '\u093c'],
  ['^', '\u2018'],
  ['*', '\u2019'],
  ['\xde', '\u201c'],
  ['\xdf', '\u201d'],
  ['(', ';'],
  ['\xbc', '('],
  ['\xbd', ')'],
  ['\xc0', '}'],
  ['\xbe', '='],
  ['A', '\u0964'],
  ['-', '.'],
  ['&', '-'],
  ['&', '\xb5'],
  ['\u03bc', '-'],
  ['\u0152', '\u0970'],
  [']', ','],
  ['~ ', '\u094d '],
  ['@', '/'],
  ['\xae', '\u0948\u0902'],
];

const SAFE_MAX = 1000;

// Woh keys jo user Kruti Dev me daba sakta hai — "pending" (bech ka state)
// check karne ke liye: agar abhi type hua raw + ek aur key dabane par
// match ho sakta hai, to red mat dikhao (jaise ि = f consonant se pehle).
const KRUTI_KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ;,'\"/\\.?:[]`~=+<>-";

// raw (abi tak type kiye ASCII keys) + target (unicode lesson text) se batao:
//   ok      -> target ke kitne leading chars poori tarah sahi type ho chuke hain
//   pending -> raw ko ek aur sahi key ke saath complete kiya ja sakta hai
//              (multi-key ka adhura part ho, ya pre-base matra jaise ki ि)
export const krutiKeyProgress = (raw, target) => {
  if (!raw || !target) return { ok: 0, pending: false };

  // Sabse pehle: poori raw abhi tak sahi hai?
  const full = krutiToUnicode(raw);
  if (full.length > 0 && target.startsWith(full)) {
    return { ok: full.length, pending: false };
  }

  // Ek aur key aage padhne par kya match ho sakta hai? (pending check)
  let pending = false;
  for (const c of KRUTI_KEYS) {
    const sc = krutiToUnicode(raw + c);
    if (sc !== full && sc.length > 0 && target.startsWith(sc)) {
      pending = true;
      break;
    }
  }

  // Jahan tak poori tarah match ho chuka hai wo count karo
  let ok = 0;
  for (let i = 1; i <= raw.length; i++) {
    const pc = krutiToUnicode(raw.slice(0, i));
    if (pc.length > 0 && target.startsWith(pc)) ok = Math.max(ok, pc.length);
  }

  return { ok, pending };
};

// Kruti Dev string -> Unicode string
export const krutiToUnicode = (input) => {
  if (!input) return '';
  let text = input;

  text = replaceAll(text, ' \xaa', '\xaa');
  text = replaceAll(text, ' ~j', '~j');
  text = replaceAll(text, ' z', 'z');

  MAIN.forEach(([find, replace]) => {
    text = replaceAll(text, find, replace);
  });

  text = replaceAll(text, '\xb1', 'Z\u0902');
  text = replaceAll(text, '\xc6', '\u0930\u094df');

  // f + ? -> ? + ि  (i-matra reordering)
  let guard = 0;
  let m = /f(.?)/g.exec(text);
  while (m && guard++ < SAFE_MAX) {
    text = replaceAll(text, 'f' + m[1], m[1] + '\u093f');
    m = /f(.?)/g.exec(text);
  }

  text = replaceAll(text, '\xc7', 'fa');
  text = replaceAll(text, '\xaf', 'fa');
  text = replaceAll(text, '\xc9', '\u0930\u094dfa');

  guard = 0;
  m = /fa(.?)/g.exec(text);
  while (m && guard++ < SAFE_MAX) {
    text = replaceAll(text, 'fa' + m[1], m[1] + '\u093f\u0902');
    m = /fa(.?)/g.exec(text);
  }

  text = replaceAll(text, '\xca', '\u0940Z');

  guard = 0;
  m = /\u093f\u094d(.?)/g.exec(text);
  while (m && guard++ < SAFE_MAX) {
    text = replaceAll(text, '\u093f\u094d' + m[1], '\u094d' + m[1] + '\u093f');
    m = /\u093f\u094d(.?)/g.exec(text);
  }

  text = replaceAll(text, '\u094dZ', 'Z');

  // र + ् ko matra se pehle sahi jagah rakho
  guard = 0;
  m = /(.?)Z/g.exec(text);
  while (m && guard++ < SAFE_MAX) {
    let match = m[1];
    let index = text.indexOf(match + 'Z');
    while (index >= 0 && VOWELS_UNICODE.includes(text[index])) {
      index -= 1;
      match = text[index] + match;
    }
    text = replaceAll(text, match + 'Z', '\u0930\u094d' + match);
    m = /(.?)Z/g.exec(text);
  }

  UNATTACHED_UNICODE.forEach((matra) => {
    text = replaceAll(text, ' ' + matra, matra);
    text = replaceAll(text, ',' + matra, matra + ',');
    text = replaceAll(text, '\u094d' + matra, matra + ',');
  });

  text = replaceAll(text, '\u094d\u094d\u0930', '\u094d\u0930');
  text = replaceAll(text, '\u094d\u0930\u094d', '\u0930\u094d');
  text = replaceAll(text, '\u094d\u094d', '\u094d');
  text = replaceAll(text, '\u094d ', ' ');

  return text;
};

export default krutiToUnicode;
