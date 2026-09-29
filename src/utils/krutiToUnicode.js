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

// Target Unicode text ke liye Kruti Dev key sequences map karta hai.
// Har Unicode grapheme ke liye required Kruti Dev keys ka sequence milta hai.
const graphemeToKruti = new Map();

function buildGraphemeMap() {
  if (graphemeToKruti.size > 0) return;

  // Single-key mappings (MAIN array se)
  const singleKeys = [
    ['d', '\u0915'], ['[k', '\u0916'], ['x', '\u0917'], ['?k', '\u0918'],
    ['p', '\u091a'], ['N', '\u091b'], ['t', '\u091c'], ['>', '\u091d'],
    ['V', '\u091f'], ['B', '\u0920'], ['M', '\u0921'], ['<', '\u0922'],
    ['r', '\u0924'], ['Fk', '\u0925'], ['n', '\u0926'], ['/k', '\u0927'],
    ['u', '\u0928'], ['i', '\u092a'], ['Q', '\u092b'], ['c', '\u092c'],
    ['Hk', '\u092d'], ['e', '\u092e'], [';', '\u092f'], ['j', '\u0930'],
    ['y', '\u0932'], ['o', '\u0935'], ["'k", '\u0936'], ['"k', '\u0937'],
    ['l', '\u0938'], ['g', '\u0939'],
    ['v', '\u0905'], ['vk', '\u0906'], ['b', '\u0907'], ['bZ', '\u0908'],
    ['m', '\u0909'], ['\xc5', '\u090a'], [',', '\u090f'], [',s', '\u0910'],
    ['vks', '\u0913'], ['vkS', '\u0914'],
    ['k', '\u093e'], ['f', '\u093f'], ['h', '\u0940'], ['q', '\u0941'],
    ['w', '\u0942'], ['`', '\u0943'], ['s', '\u0947'], ['S', '\u0948'],
    ['ks', '\u094b'], ['kS', '\u094c'], ['a', '\u0902'], ['%', '\u0903'],
    ['\xa1', '\u0901'], ['W', '\u0945'],
    ['\xe5', '\u0966'], ['\u0192', '\u0967'], ['\u201e', '\u0968'],
    ['\u2026', '\u0969'], ['\u2020', '\u096a'], ['\u2021', '\u096b'],
    ['\u02c6', '\u096c'], ['\u2030', '\u096d'], ['\u0160', '\u096e'],
    ['\u2039', '\u096f'],
  ];

  singleKeys.forEach(([kruti, unicode]) => {
    if (!graphemeToKruti.has(unicode)) {
      graphemeToKruti.set(unicode, kruti);
    }
  });

  // Multi-key conjuncts
  const multiKeys = [
    ['[k', '\u0916'], ['?k', '\u0918'], ['\xb3', '\u0919'],
    ['\xa5', '\u091e'], ['.k', '\u0923'], ['Fk', '\u0925'],
    ['/k', '\u0927'], ['Hk', '\u092d'], ["'k", '\u0936'], ['"k', '\u0937'],
    ['\xb3~', '\u0919'], ['\xa5~', '\u091e'], ['\xf7', '\u091d'],
    ['\xcb', '\u0927'], ['\xe8', '\u0927'], ['\xb6', '\u092b'],
    ['\xb8', '\u092f'], ['\xba', '\u0939'], ['\xdc', '\u0936'],
    ['\u0958', '\u0958'], ['\u0959', '\u0959'], ['\u095a', '\u095a'],
    ['\u095b', '\u095b'], ['\u095c', '\u095c'], ['\u095d', '\u095d'],
    ['\u095e', '\u095e'], ['\u095f', '\u095f'],
    ['\u0934', '\u0934'], ['\u0931', '\u0931'],
    ['\u0929', '\u0929'], ['\u0924\u094d\u0924', '\u0924\u094d\u0924'],
    ['\u0924\u094d\u0924\u094d', '\u0924\u094d\u0924\u094d'],
    ['\u0928\u094d\u0928', '\u0928\u094d\u0928'],
    ['\u0928\u094d\u0928\u094d', '\u0928\u094d\u0928\u094d'],
    ['\u0926\u094d\u0926', '\u0926\u094d\u0926'],
    ['\u0926\u094d\u0927', '\u0926\u094d\u0927'],
    ['\u0926\u094d\u092f', '\u0926\u094d\u092f'],
    ['\u0926\u094d\u0935', '\u0926\u094d\u0935'],
    ['\u0915\u094d\u0937', '\u0915\u094d\u0937'],
    ['\u0924\u094d\u0930', '\u0924\u094d\u0930'],
    ['\u091c\u094d\u091e', '\u091c\u094d\u091e'],
    ['\u0936\u094d\u0930', '\u0936\u094d\u0930'],
    ['\u0936\u094d\u0930', '\u0936\u094d\u0930'],
    ['\u0915\u094d\u0930', '\u0915\u094d\u0930'],
    ['\u092b\u094d\u0930', '\u092b\u094d\u0930'],
    ['\u092a\u094d\u0930', '\u092a\u094d\u0930'],
    ['\u0917\u094d\u0930', '\u0917\u094d\u0930'],
    ['\u0939\u094d\u0930', '\u0939\u094d\u0930'],
    ['\u0939\u094d\u0928', '\u0939\u094d\u0928'],
    ['\u0939\u094d\u092f', '\u0939\u094d\u092f'],
    ['\u0939\u094d\u092e', '\u0939\u094d\u092e'],
    ['\u0939\u0943', '\u0939\u0943'],
    ['\u0926\u0943', '\u0926\u0943'],
    ['\u0915\u0943', '\u0915\u0943'],
    ['\u092d\u094d\u0930', '\u092d\u094d\u0930'],
    ['\u0927\u094d\u092f', '\u0927\u094d\u092f'],
    ['\u0927\u094d\u0930', '\u0927\u094d\u0930'],
    ['\u091f\u094d\u092f', '\u091f\u094d\u092f'],
    ['\u091f\u094d\u0930', '\u091f\u094d\u0930'],
    ['\u0920\u094d\u092f', '\u0920\u094d\u092f'],
    ['\u0920\u094d\u0930', '\u0920\u094d\u0930'],
    ['\u0921\u094d\u092f', '\u0921\u094d\u092f'],
    ['\u0921\u094d\u0922', '\u0921\u094d\u0922'],
    ['\u0921\u094d\u0930', '\u0921\u094d\u0930'],
    ['\u0922\u094d\u092f', '\u0922\u094d\u092f'],
    ['\u0922\u094d\u0930', '\u0922\u094d\u0930'],
    ['\u091b\u094d\u092f', '\u091b\u094d\u092f'],
    ['\u091b\u094d\u0930', '\u091b\u094d\u0930'],
    ['\u091c\u094d\u091e', '\u091c\u094d\u091e'],
    ['\u092c\u094d\u092f', '\u092c\u094d\u092f'],
    ['\u092e\u094d\u092a', '\u092e\u094d\u092a'],
    ['\u092e\u094d\u092b', '\u092e\u094d\u092b'],
    ['\u0928\u094d\u0926', '\u0928\u094d\u0926'],
    ['\u0928\u094d\u0927', '\u0928\u094d\u0927'],
    ['\u0928\u094d\u0924', '\u0928\u094d\u0924'],
    ['\u0928\u094d\u0925', '\u0928\u094d\u0925'],
    ['\u0928\u094d\u092e', '\u0928\u094d\u092e'],
    ['\u0928\u094d\u0928', '\u0928\u094d\u0928'],
    ['\u0932\u094d\u0932', '\u0932\u094d\u0932'],
    ['\u0938\u094d\u0924', '\u0938\u094d\u0924'],
    ['\u0938\u094d\u0925', '\u0938\u094d\u0925'],
    ['\u0938\u094d\u0928', '\u0938\u094d\u0928'],
    ['\u0938\u094d\u092e', '\u0938\u094d\u092e'],
    ['\u0938\u094d\u0924\u094d\u0930', '\u0938\u094d\u0924\u094d\u0930'],
    ['\u0939\u094d\u092e', '\u0939\u094d\u092e'],
    ['\u0939\u094d\u0928', '\u0939\u094d\u0928'],
    ['\u0939\u094d\u092f', '\u0939\u094d\u092f'],
    ['\u0939\u094d\u0930', '\u0939\u094d\u0930'],
    ['\u0939\u0943', '\u0939\u0943'],
    ['\u0926\u0943', '\u0926\u0943'],
    ['\u0915\u0943', '\u0915\u0943'],
    ['\u0940\u0902', '\u0940\u0902'],
    ['\u0947\u0902', '\u0947\u0902'],
    ['\u0948\u0902', '\u0948\u0902'],
    ['\u0941\u0902', '\u0941\u0902'],
    ['\u0942\u0902', '\u0942\u0902'],
    ['\u0942\u0901', '\u0942\u0901'],
    ['\u093e\u0901', '\u093e\u0901'],
    ['\u094d\u0930\u0902', '\u094d\u0930\u0902'],
    ['\u094d\u0930\u0947\u0902', '\u094d\u0930\u0947\u0902'],
    ['\u094d\u0930\u0948\u0902', '\u094d\u0930\u0948\u0902'],
  ];

  multiKeys.forEach(([kruti, unicode]) => {
    if (!graphemeToKruti.has(unicode)) {
      graphemeToKruti.set(unicode, kruti);
    }
  });
}

buildGraphemeMap();

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

// Sequence-aware progress: target ke har grapheme ke liye required keys track karta hai
// Sirf tab complete mark karta hai jab saare required keys enter ho chuke hain
export const krutiSequenceProgress = (raw, target) => {
  if (!raw || !target) return { ok: 0, pending: false, currentGrapheme: null, keysEntered: 0, keysRequired: 0 };

  const full = krutiToUnicode(raw);

  // Check if full conversion matches target exactly
  if (full.length > 0 && target.startsWith(full)) {
    // Count how many graphemes are complete
    let pos = 0;
    let graphemeCount = 0;
    while (pos < full.length) {
      const grapheme = getGraphemeAt(full, pos);
      if (!grapheme) break;
      pos += grapheme.length;
      graphemeCount++;
    }
    return { ok: graphemeCount, pending: false, currentGrapheme: null, keysEntered: 0, keysRequired: 0 };
  }

  // Find current incomplete grapheme
  let pos = 0;
  let lastCompleteGrapheme = 0;
  while (pos < target.length) {
    const grapheme = getGraphemeAt(target, pos);
    if (!grapheme) break;

    const requiredKeys = graphemeToKruti.get(grapheme);
    if (!requiredKeys) {
      // Unknown grapheme, skip
      pos += grapheme.length;
      continue;
    }

    // Check if we have enough raw input for this grapheme
    const rawForGrapheme = raw.slice(lastCompleteGrapheme);
    const converted = krutiToUnicode(rawForGrapheme);

    if (converted === grapheme) {
      // This grapheme is complete
      lastCompleteGrapheme += requiredKeys.length;
      pos += grapheme.length;
    } else {
      // This grapheme is in progress or incorrect
      const keysEntered = rawForGrapheme.length;
      const keysRequired = requiredKeys.length;
      return {
        ok: pos,
        pending: keysEntered < keysRequired,
        currentGrapheme: grapheme,
        keysEntered,
        keysRequired,
      };
    }
  }

  return { ok: 0, pending: false, currentGrapheme: null, keysEntered: 0, keysRequired: 0 };
};

// Unicode string se grapheme extract karta hai (combining marks ke saath)
function getGraphemeAt(str, pos) {
  if (pos >= str.length) return null;

  let end = pos + 1;
  // Combining marks (matras, halants, etc.) ko include karo
  while (end < str.length) {
    const code = str.charCodeAt(end);
    // Devanagari combining marks: 0x093E-0x094F, 0x0951-0x0957, 0x0962-0x0963
    if ((code >= 0x093E && code <= 0x094F) || (code >= 0x0951 && code <= 0x0957) || (code >= 0x0962 && code <= 0x0963)) {
      end++;
    } else {
      break;
    }
  }
  return str.slice(pos, end);
}

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

  // NFC normalization - consistent Unicode representation
  if (typeof text.normalize === 'function') {
    text = text.normalize('NFC');
  }

  return text;
};

export default krutiToUnicode;
