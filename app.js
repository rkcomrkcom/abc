// ---------- DATA ----------

const THAI_CONSONANTS = ["ก","ข","ฃ","ค","ฅ","ฆ","ง","จ","ฉ","ช","ซ","ฌ","ญ","ฎ","ฏ","ฐ","ฑ","ฒ","ณ","ด","ต","ถ","ท","ธ","น","บ","ป","ผ","ฝ","พ","ฟ","ภ","ม","ย","ร","ล","ว","ศ","ษ","ส","ห","ฬ","อ","ฮ"];

// [display with "-" placeholder, spoken form using อ as carrier]
// [display, spoken form]. Vowels that stack a floating mark (ั ิ ี ึ ื ุ ู)
// need a real Thai base letter (อ) to render correctly — a plain "-" leaves
// the mark with nothing valid to attach to and shows as a blank box on many
// phones. Vowels that are full-width characters (ะ า ำ) or sit beside the
// base rather than on top of it (เ แ โ ใ ไ -อ) render fine with a "-".
const THAI_VOWEL_PAIRS = [
  ["-ะ", "อะ"], ["-า", "อา"], ["ิ", "อิ"], ["ี", "อี"],
  ["ึ", "อึ"], [" ือ", "อือ"], ["ุ", "อุ"], ["ู", "อู"],
  ["เ-ะ", "เอะ"], ["เ-", "เอ"], ["แ-ะ", "แอะ"], ["แ-", "แอ"],
  ["โ-ะ", "โอะ"], ["โ-", "โอ"], ["เ-าะ", "เอาะ"], ["-อ", "ออ"],
  ["เ-อะ", "เออะ"], ["เ-อ", "เออ"], ["เ ียะ", "เอียะ"], ["เ ีย", "เอีย"],
  ["เ ือะ", "เอือะ"], ["เ ือ", "เอือ"], [" ัวะ", "อัวะ"], [" ัว", "อัว"],
  ["-°า", "อำ"], ["ใ-", "ใอ"], ["ไ-", "ไอ"], ["เ-า", "เอา"],
  ["ฤ", "ฤ"], ["ฤๅ", "ฤๅ"], ["ฦ", "ฦ"], ["ฦๅ", "ฦๅ"],
];

// English-vs-Thai vowel comparison chart [label, spoken Thai forms]
const ENG_VOWEL_CHART = [
  ["A", "อะ อั อา"], ["Am", "อำ อาม"], ["I", "อิ อี"], ["U", "อึ อื อุ อู"],
  ["E", "เอะ เอ็ เอ"], ["Ae", "แอะ แอ"], ["O", "โอะ โอ เอาะ ออ"], ["Oe", "เออะ เออ"],
  ["Ai", "ใอ ไอ อัย ไอย อาย"], ["Ia", "เอียะ เอีย"], ["Ua", "เอือะ เอือ อัวะ อัว"],
  ["Ao", "เอา อาว"], ["Ui", "อุย อูย"], ["Oi", "โอย ออย"], ["Oei", "เอย"],
  ["Uai", "เอือย อวย"], ["Iu", "อิว"], ["Eo", "เอว"], ["Aeo", "แอว"], ["Ieo", "เอียว"],
  ["Ru", "รึ รือ"], ["Ri", "ริ"], ["Roe", "เรอ"], ["Lu", "ฦ ฦๅ"],
];

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

const THAI_DIGIT_CHARS = ["๐","๑","๒","๓","๔","๕","๖","๗","๘","๙"];

// building blocks for the Thai word-builder tray — the full set of vowel
// components/marks used across all 32 Thai vowels, plus the 4 standalone
// vowel-consonants (ฤ ฤๅ ฦ ฦๅ), so any word can be spelled.
const THAI_VOWEL_PARTS = ["ะ","ั","า","ำ","ิ","ี","ึ","ื","ุ","ู","เ","แ","โ","ใ","ไ","อ","็","ฤ","ฤๅ","ฦ","ฦๅ"];
const THAI_TONE_MARKS = ["่","้","๊","๋"];
const ENG_VOWEL_LETTERS = ["A","E","I","O","U"];
const ENG_CONSONANT_LETTERS = "BCDFGHJKLMNPQRSTVWXYZ".split("");

function toThaiNumeral(n) {
  return String(n).split("").map((d) => THAI_DIGIT_CHARS[parseInt(d, 10)]).join("");
}

// Thai number-to-words (supports 0 - 999,999+, recursive for millions)
function thaiNumberToWords(n) {
  const digitsTh = ["ศูนย์","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"];
  const places = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  if (n === 0) return "ศูนย์";
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    return thaiNumberToWords(millions) + "ล้าน" + (rest > 0 ? thaiNumberToWords(rest) : "");
  }
  const str = String(n);
  const len = str.length;
  let s = "";
  for (let i = 0; i < len; i++) {
    const d = parseInt(str[i], 10);
    const place = len - i - 1;
    if (d === 0) continue;
    if (place === 0) {
      s += (d === 1 && len > 1) ? "เอ็ด" : digitsTh[d];
    } else if (place === 1) {
      if (d === 1) s += "สิบ";
      else if (d === 2) s += "ยี่สิบ";
      else s += digitsTh[d] + "สิบ";
    } else {
      s += digitsTh[d] + places[place];
    }
  }
  return s;
}

function buildItems(chars, opts) {
  return chars.map((ch) => ({
    ch,
    lang: opts.lang,
    speech: opts.speechOf ? opts.speechOf(ch) : ch,
  }));
}

function buildPairItems(pairs, lang) {
  return pairs.map(([display, speech]) => ({ ch: display, lang, speech }));
}

function buildNumericItems(max, thaiNumerals) {
  const arr = [];
  for (let i = 0; i <= max; i++) {
    arr.push({
      ch: thaiNumerals ? toThaiNumeral(i) : String(i),
      lang: "th-TH",
      speech: thaiNumberToWords(i),
    });
  }
  return arr;
}

const CATEGORIES = {
  "thai-vowels": { name: "สระไทย", icon: "🍭", color: "c-pink", items: buildPairItems(THAI_VOWEL_PAIRS, "th-TH") },
  "eng-vowels": { name: "สระอังกฤษ", icon: "🍬", color: "c-teal", items: buildPairItems(ENG_VOWEL_CHART, "th-TH") },
  "consonants": { name: "ก - ฮ", icon: "🦉", color: "c-yellow", items: buildItems(THAI_CONSONANTS, { lang: "th-TH", speechOf: (ch) => ch + "อ" }) },
  "upper": { name: "A - Z", icon: "🔤", color: "c-purple", items: buildItems(UPPER, { lang: "en-US" }) },
  "lower": { name: "a - z", icon: "🔡", color: "c-blue", items: buildItems(LOWER, { lang: "en-US" }) },
  "digits": { name: "ตัวเลข", icon: "🔢", color: "c-green", numeric: true, thaiNumerals: false },
  "thai-digits": { name: "เลขไทย", icon: "🧮", color: "c-orange", numeric: true, thaiNumerals: true },
  "thai-builder": {
    name: "ผสมคำไทย", icon: "🧩", color: "c-red", type: "builder", lang: "th-TH",
    consonants: buildItems(THAI_CONSONANTS, { lang: "th-TH", speechOf: (ch) => ch + "อ" }),
    vowels: buildItems(THAI_VOWEL_PARTS, { lang: "th-TH" }),
    tones: buildItems(THAI_TONE_MARKS, { lang: "th-TH" }),
  },
  "eng-builder": {
    name: "ผสมคำอังกฤษ", icon: "🔡", color: "c-indigo", type: "builder", lang: "en-US",
    consonants: buildItems(ENG_CONSONANT_LETTERS, { lang: "en-US" }),
    vowels: buildItems(ENG_VOWEL_LETTERS, { lang: "en-US" }),
  },
};

function getCategoryItems(catKey) {
  const cat = CATEGORIES[catKey];
  if (cat.numeric) {
    const max = state.numberMaxByCat[catKey] ?? 9;
    return buildNumericItems(max, cat.thaiNumerals);
  }
  return cat.items;
}

// ---------- STATE ----------

const state = {
  screen: "home",
  catKey: null,
  blankCount: 5,
  sequence: [],
  tray: [],
  soundOn: true,
  celebrated: false,
  numberMaxByCat: { digits: 9, "thai-digits": 9 },
  builderWord: [],
  settingsOpen: false,
};

try {
  const saved = localStorage.getItem("alphabet-app-sound");
  if (saved !== null) state.soundOn = saved === "1";
} catch (e) {}

const app = document.getElementById("app");

// ---------- SPEECH ----------
// Primary: Google's own text-to-speech voice (same one Google Translate's
// speaker button uses) via its public audio endpoint — sounds far closer to
// Siri-quality than most phones' built-in Thai system voice, and sounds the
// same for every listener regardless of device. Needs an internet connection.
// Falls back automatically to the browser's built-in voice if that request
// ever fails (offline, blocked, etc.).

let voicesCache = [];
function loadVoices() {
  if ("speechSynthesis" in window) voicesCache = window.speechSynthesis.getVoices();
}
loadVoices();
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  let tries = 0;
  const poll = setInterval(() => {
    tries++;
    loadVoices();
    if (voicesCache.length || tries > 8) clearInterval(poll);
  }, 300);
}

function pickVoice(lang) {
  const voices = voicesCache.length ? voicesCache : (("speechSynthesis" in window) ? window.speechSynthesis.getVoices() : []);
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang && v.lang.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;
  const prefix = lang.slice(0, 2).toLowerCase();
  const partial = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
  if (partial) return partial;
  const byName = voices.find((v) => v.name && v.name.toLowerCase().includes(prefix === "th" ? "thai" : "english"));
  return byName || null;
}

function speakBrowserFallback(text, lang) {
  if (!("speechSynthesis" in window)) return;
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    window.speechSynthesis.resume();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "th-TH";
      u.volume = 1;
      u.rate = 0.9;
      u.pitch = 1;
      const v = pickVoice(u.lang);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }, 40);
  } catch (e) {}
}

let currentAudio = null;

function speak(text, lang) {
  if (!state.soundOn || !text) return;
  const ttsLang = (lang || "th-TH").toLowerCase().startsWith("en") ? "en" : "th";

  try {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    // NOTE: Google's endpoint checks a text-length parameter server-side.
    // Thai is multi-byte UTF-8, so without idx/total/textlen it silently
    // rejects Thai requests while plain-ASCII English still goes through —
    // that's why only English was audible. Adding them fixes Thai too.
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${ttsLang}&client=tw-ob&idx=0&total=1&textlen=${text.length}`;
    const audio = new Audio(url);
    audio.volume = 1;
    currentAudio = audio;
    // only fall back to the browser voice if the Google audio never actually
    // started playing — otherwise a late/spurious "error" event after a
    // successful play was causing both voices to speak, one after another.
    let started = false;
    audio.addEventListener("playing", () => { started = true; }, { once: true });
    const failed = () => { if (state.soundOn && !started) speakBrowserFallback(text, lang); };
    audio.addEventListener("error", failed, { once: true });
    audio.play().catch(failed);
  } catch (e) {
    speakBrowserFallback(text, lang);
  }
}

function stopSpeech() {
  if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
  if ("speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
}

// ---------- HOME SCREEN ----------

function renderHome() {
  state.screen = "home";
  const cards = Object.entries(CATEGORIES).map(([key, cat]) => {
    let countLabel;
    if (cat.type === "builder") countLabel = "ลากมาสะกดคำ";
    else if (cat.numeric) countLabel = "ปรับช่วงตัวเลขได้เอง";
    else countLabel = `${cat.items.length} ตัว`;
    return `
    <button class="cat-card ${cat.color}" data-key="${key}">
      <span class="blob">${cat.icon}</span>
      <span>
        <p class="cat-name">${cat.name}</p>
        <p class="cat-count">${countLabel}</p>
      </span>
    </button>
  `;
  }).join("");

  app.innerHTML = `
    <div class="home">
      <div class="home-header">
        <div class="mascot">🦉</div>
        <h1 class="home-title">หนูเก่ง ก.ไก่</h1>
        <p class="home-sub">เลือกหมวดที่อยากฝึกกันเลย!</p>
      </div>
      <div class="card-grid">${cards}</div>
    </div>
  `;

  app.querySelectorAll(".cat-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const cat = CATEGORIES[key];
      state.catKey = key;
      if (cat.type === "builder") {
        openBuilder(key);
      } else {
        const total = getCategoryItems(key).length;
        state.blankCount = clampBlank(state.blankCount, total);
        openLesson(key);
      }
    });
  });
}

function clampBlank(n, total) {
  const max = Math.max(1, total - 2);
  return Math.min(Math.max(n, 1), max);
}

// ---------- QUIZ LESSON SCREEN ----------

function openLesson(catKey) {
  state.screen = "lesson";
  generateRound();
}

function generateRound() {
  const items = getCategoryItems(state.catKey);
  const total = items.length;
  state.blankCount = clampBlank(state.blankCount, total);

  const indices = [...Array(total).keys()];
  shuffle(indices);
  const blankIndices = new Set(indices.slice(0, state.blankCount));

  state.sequence = items.map((item, i) => ({
    ch: item.ch,
    lang: item.lang,
    speech: item.speech,
    blank: blankIndices.has(i),
    filled: false,
    seqIndex: i,
  }));

  state.tray = state.sequence
    .filter((s) => s.blank)
    .map((s) => ({ ch: s.ch, lang: s.lang, speech: s.speech, seqIndex: s.seqIndex }));
  shuffle(state.tray);
  state.celebrated = false;

  renderLesson();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderLesson() {
  const cat = CATEGORIES[state.catKey];
  const total = getCategoryItems(state.catKey).length;
  const maxBlank = Math.max(1, total - 2);

  const seqHtml = state.sequence.map((s) => {
    if (!s.blank) {
      return `<div class="tile shown" data-say="${escapeAttr(s.speech)}" data-lang="${s.lang}">${s.ch}</div>`;
    }
    if (s.filled) {
      return `<div class="tile filled-correct" data-say="${escapeAttr(s.speech)}" data-lang="${s.lang}">${s.ch}</div>`;
    }
    return `<div class="tile blank" data-seq="${s.seqIndex}"></div>`;
  }).join("");

  const doneCount = state.tray.length === 0;
  const trayHtml = state.tray.map((t, i) => `
    <div class="tile tray-tile" data-tray-i="${i}" data-say="${escapeAttr(t.speech)}" data-lang="${t.lang}">${t.ch}</div>
  `).join("");

  const numberRangeHtml = cat.numeric ? `
    <div class="blank-count number-range">
      <span>ตัวเลขตั้งแต่ 0 ถึง</span>
      <input type="number" id="maxInput" value="${state.numberMaxByCat[state.catKey]}" min="1" max="500" inputmode="numeric" />
    </div>
    <div class="range-presets">
      <button data-preset="9">0-9</button>
      <button data-preset="20">0-20</button>
      <button data-preset="50">0-50</button>
      <button data-preset="100">0-100</button>
    </div>
  ` : "";

  app.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon-btn" id="backBtn">⬅️</button>
        <div class="lesson-title">${cat.icon} ${cat.name}</div>
        <button class="icon-btn sound-btn ${state.soundOn ? "on" : "off"}" id="soundBtn">${state.soundOn ? "🔊" : "🔇"}</button>
      </div>

      <div class="sequence-board" id="seqBoard">${seqHtml}</div>

      ${doneCount
        ? `<div class="celebrate-msg" id="celebrateMsg">🎉 เก่งมาก! ครบทุกตัวแล้ว 🎉</div>`
        : `<p class="tray-label">ลากตัวอักษรด้านล่างไปใส่ในช่องว่างนะ</p>
           <div class="tray" id="trayBoard">${trayHtml}</div>`
      }
    </div>

    <div class="control-bar ${state.settingsOpen ? "" : "collapsed"}">
      <button class="collapse-tab" id="collapseTab" aria-label="เปิด/ปิดแถบควบคุม">${state.settingsOpen ? "▼" : "▲"}</button>
      <div class="bar-content">
        ${numberRangeHtml}
        <div class="blank-count">
          <span>จำนวนช่องว่าง</span>
          <div class="stepper">
            <button id="minusBtn">−</button>
            <input type="number" class="count-val" id="countVal" value="${state.blankCount}" min="1" max="${maxBlank}" inputmode="numeric" />
            <button id="plusBtn">+</button>
          </div>
        </div>
        <button class="generate-btn" id="generateBtn">🔀 สร้างใหม่</button>
      </div>
    </div>
  `;

  wireLessonEvents(maxBlank);

  if (doneCount && !state.celebrated) {
    state.celebrated = true;
    launchConfetti();
    speak("เก่งมาก", "th-TH");
  }
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

function wireLessonEvents(maxBlank) {
  document.getElementById("backBtn").addEventListener("click", () => {
    stopSpeech();
    renderHome();
  });

  document.getElementById("soundBtn").addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    try { localStorage.setItem("alphabet-app-sound", state.soundOn ? "1" : "0"); } catch (e) {}
    if (!state.soundOn) stopSpeech();
    renderLesson();
  });

  document.getElementById("collapseTab").addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    renderLesson();
  });

  const countInput = document.getElementById("countVal");
  if (countInput) {
    document.getElementById("minusBtn").addEventListener("click", () => {
      const total = getCategoryItems(state.catKey).length;
      state.blankCount = clampBlank(state.blankCount - 1, total);
      countInput.value = state.blankCount;
    });
    document.getElementById("plusBtn").addEventListener("click", () => {
      const total = getCategoryItems(state.catKey).length;
      state.blankCount = clampBlank(state.blankCount + 1, total);
      countInput.value = state.blankCount;
    });
    countInput.addEventListener("change", () => {
      const total = getCategoryItems(state.catKey).length;
      let v = parseInt(countInput.value, 10);
      if (isNaN(v)) v = state.blankCount;
      state.blankCount = clampBlank(v, total);
      countInput.value = state.blankCount;
    });
  }

  document.getElementById("generateBtn").addEventListener("click", () => {
    generateRound();
  });

  const maxInput = document.getElementById("maxInput");
  if (maxInput) {
    maxInput.addEventListener("change", () => {
      let v = parseInt(maxInput.value, 10);
      if (isNaN(v)) v = 9;
      v = Math.min(Math.max(v, 1), 500);
      maxInput.value = v;
      state.numberMaxByCat[state.catKey] = v;
    });
    document.querySelectorAll(".range-presets button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = parseInt(btn.dataset.preset, 10);
        maxInput.value = v;
        state.numberMaxByCat[state.catKey] = v;
      });
    });
  }

  document.querySelectorAll("[data-say]").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.dataset.justDragged === "1") { el.dataset.justDragged = "0"; return; }
      speak(el.dataset.say, el.dataset.lang);
      if (el.classList.contains("tray-tile")) selectTrayTile(el);
    });
  });

  document.querySelectorAll(".tile.blank").forEach((el) => {
    el.addEventListener("click", () => {
      const selected = document.querySelector(".tray-tile.selected");
      if (selected) attemptPlace(selected, el);
    });
  });

  wireDragging();
}

let selectedTrayEl = null;

function selectTrayTile(el) {
  if (selectedTrayEl) selectedTrayEl.classList.remove("selected");
  if (selectedTrayEl === el) { selectedTrayEl = null; return; }
  selectedTrayEl = el;
  el.classList.add("selected");
}

// ---------- DRAG & DROP (quiz mode: pointer events, mouse+touch unified) ----------

function wireDragging() {
  const trayTiles = document.querySelectorAll(".tray-tile");
  trayTiles.forEach((tile) => {
    tile.addEventListener("pointerdown", (e) => startDrag(e, tile));
  });
}

let dragCtx = null;

function startDrag(e, tile) {
  e.preventDefault();
  const rect = tile.getBoundingClientRect();
  const ghost = tile.cloneNode(true);
  ghost.classList.add("dragging");
  ghost.style.width = rect.width + "px";
  ghost.style.height = rect.height + "px";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  document.body.appendChild(ghost);

  tile.style.opacity = "0.35";

  dragCtx = {
    tile,
    ghost,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    moved: false,
  };

  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
}

function onDragMove(e) {
  if (!dragCtx) return;
  dragCtx.moved = true;
  dragCtx.ghost.style.left = (e.clientX - dragCtx.offsetX) + "px";
  dragCtx.ghost.style.top = (e.clientY - dragCtx.offsetY) + "px";

  document.querySelectorAll(".tile.blank").forEach((b) => b.classList.remove("drag-over"));
  dragCtx.ghost.style.display = "none";
  const under = document.elementFromPoint(e.clientX, e.clientY);
  dragCtx.ghost.style.display = "";
  const blankEl = under && under.closest(".tile.blank");
  if (blankEl) blankEl.classList.add("drag-over");
}

function onDragEnd(e) {
  if (!dragCtx) return;
  const { tile, ghost, moved } = dragCtx;

  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);

  document.querySelectorAll(".tile.blank").forEach((b) => b.classList.remove("drag-over"));
  ghost.style.display = "none";
  const under = moved ? document.elementFromPoint(e.clientX, e.clientY) : null;
  ghost.remove();
  tile.style.opacity = "";

  const blankEl = under && under.closest(".tile.blank");
  if (blankEl) {
    if (moved) {
      tile.dataset.justDragged = "1";
      setTimeout(() => { if (tile.isConnected) tile.dataset.justDragged = "0"; }, 350);
    }
    attemptPlace(tile, blankEl);
  }

  dragCtx = null;
}

function attemptPlace(trayEl, blankEl) {
  const trayI = parseInt(trayEl.dataset.trayI, 10);
  const seqI = parseInt(blankEl.dataset.seq, 10);
  const trayItem = state.tray[trayI];
  if (!trayItem) return;

  if (trayItem.seqIndex === seqI) {
    state.sequence[seqI].filled = true;
    state.tray.splice(trayI, 1);
    if (selectedTrayEl) { selectedTrayEl.classList.remove("selected"); selectedTrayEl = null; }
    speak(trayItem.speech, trayItem.lang);
    renderLesson();
  } else {
    blankEl.classList.add("shake");
    trayEl.classList.add("shake");
    setTimeout(() => {
      blankEl.classList.remove("shake");
      trayEl.classList.remove("shake");
    }, 400);
  }
}

// ---------- WORD BUILDER SCREEN ----------

function openBuilder(catKey) {
  state.screen = "builder";
  state.builderWord = [];
  renderBuilder();
}

function renderBuilder() {
  const cat = CATEGORIES[state.catKey];

  const wordHtml = state.builderWord.length
    ? state.builderWord.map((t, i) => `<div class="tile word-tile" data-wi="${i}" data-say="${escapeAttr(t.speech)}" data-lang="${t.lang}">${t.ch}</div>`).join("")
    : `<p class="empty-hint">ลากหรือแตะตัวอักษรด้านล่างมาต่อกันเป็นคำตรงนี้</p>`;

  const consonantHtml = cat.consonants.map((c, i) => `
    <div class="tile tray-tile consonant-tile" data-kind="consonant" data-i="${i}" data-say="${escapeAttr(c.speech)}" data-lang="${c.lang}">${c.ch}</div>
  `).join("");
  const vowelHtml = cat.vowels.map((v, i) => `
    <div class="tile tray-tile vowel-tile" data-kind="vowel" data-i="${i}" data-say="${escapeAttr(v.speech)}" data-lang="${v.lang}">${v.ch}</div>
  `).join("");
  const toneHtml = cat.tones ? cat.tones.map((t, i) => `
    <div class="tile tray-tile tone-tile" data-kind="tone" data-i="${i}" data-say="${escapeAttr(t.speech)}" data-lang="${t.lang}">${t.ch}</div>
  `).join("") : "";

  app.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon-btn" id="backBtn">⬅️</button>
        <div class="lesson-title">${cat.icon} ${cat.name}</div>
        <button class="icon-btn sound-btn ${state.soundOn ? "on" : "off"}" id="soundBtn">${state.soundOn ? "🔊" : "🔇"}</button>
      </div>

      <div class="word-board" id="wordBoard">${wordHtml}</div>

      <div class="builder-actions">
        <button class="listen-btn" id="listenWordBtn">🔊 ฟังคำนี้</button>
        <button id="backspaceBtn">⌫ ลบตัวล่าสุด</button>
        <button id="clearWordBtn">🗑️ ล้างคำ</button>
      </div>

      <p class="tray-label">พยัญชนะ</p>
      <div class="tray" id="consonantTray">${consonantHtml}</div>

      <p class="tray-label">สระ</p>
      <div class="tray" id="vowelTray">${vowelHtml}</div>

      ${cat.tones ? `
      <p class="tray-label">วรรณยุกต์</p>
      <div class="tray" id="toneTray">${toneHtml}</div>
      ` : ""}
    </div>
  `;

  wireBuilderEvents();
}

function wireBuilderEvents() {
  document.getElementById("backBtn").addEventListener("click", () => {
    stopSpeech();
    renderHome();
  });

  document.getElementById("soundBtn").addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    try { localStorage.setItem("alphabet-app-sound", state.soundOn ? "1" : "0"); } catch (e) {}
    if (!state.soundOn) stopSpeech();
    renderBuilder();
  });

  document.getElementById("listenWordBtn").addEventListener("click", () => {
    const cat = CATEGORIES[state.catKey];
    if (!state.builderWord.length) return;
    const word = state.builderWord.map((t) => t.ch).join("");
    speak(word, cat.lang);
  });

  document.getElementById("backspaceBtn").addEventListener("click", () => {
    state.builderWord.pop();
    renderBuilder();
  });

  document.getElementById("clearWordBtn").addEventListener("click", () => {
    state.builderWord = [];
    renderBuilder();
  });

  // tap a tray tile: append to word + say the letter
  document.querySelectorAll("#consonantTray .tray-tile, #vowelTray .tray-tile, #toneTray .tray-tile").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.dataset.justDragged === "1") { el.dataset.justDragged = "0"; return; }
      appendTileFromEl(el);
    });
    el.addEventListener("pointerdown", (e) => startBuilderDrag(e, el));
  });

  // tap a placed word tile to hear that single letter, or remove it
  document.querySelectorAll(".word-tile").forEach((el) => {
    el.addEventListener("click", () => {
      speak(el.dataset.say, el.dataset.lang);
    });
  });
}

function appendTileFromEl(el) {
  const cat = CATEGORIES[state.catKey];
  const kind = el.dataset.kind;
  const i = parseInt(el.dataset.i, 10);
  const item = kind === "consonant" ? cat.consonants[i] : kind === "tone" ? cat.tones[i] : cat.vowels[i];
  if (!item) return;
  state.builderWord.push(item);
  renderBuilder();
  speak(item.speech, item.lang);
}

let builderDragCtx = null;

function startBuilderDrag(e, tile) {
  e.preventDefault();
  const rect = tile.getBoundingClientRect();
  const ghost = tile.cloneNode(true);
  ghost.classList.add("dragging");
  ghost.style.width = rect.width + "px";
  ghost.style.height = rect.height + "px";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  document.body.appendChild(ghost);
  tile.style.opacity = "0.35";

  builderDragCtx = {
    tile,
    ghost,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    moved: false,
  };

  window.addEventListener("pointermove", onBuilderDragMove);
  window.addEventListener("pointerup", onBuilderDragEnd);
}

function onBuilderDragMove(e) {
  if (!builderDragCtx) return;
  builderDragCtx.moved = true;
  builderDragCtx.ghost.style.left = (e.clientX - builderDragCtx.offsetX) + "px";
  builderDragCtx.ghost.style.top = (e.clientY - builderDragCtx.offsetY) + "px";

  const board = document.getElementById("wordBoard");
  builderDragCtx.ghost.style.display = "none";
  const under = document.elementFromPoint(e.clientX, e.clientY);
  builderDragCtx.ghost.style.display = "";
  if (board) {
    if (under && under.closest("#wordBoard")) board.classList.add("drag-over");
    else board.classList.remove("drag-over");
  }
}

function onBuilderDragEnd(e) {
  if (!builderDragCtx) return;
  const { tile, ghost, moved } = builderDragCtx;

  window.removeEventListener("pointermove", onBuilderDragMove);
  window.removeEventListener("pointerup", onBuilderDragEnd);

  const board = document.getElementById("wordBoard");
  if (board) board.classList.remove("drag-over");
  ghost.style.display = "none";
  const under = moved ? document.elementFromPoint(e.clientX, e.clientY) : null;
  ghost.remove();
  tile.style.opacity = "";

  const droppedOnBoard = under && under.closest("#wordBoard");
  if (droppedOnBoard && moved) {
    tile.dataset.justDragged = "1";
    setTimeout(() => { if (tile.isConnected) tile.dataset.justDragged = "0"; }, 350);
    appendTileFromEl(tile);
  }

  builderDragCtx = null;
}

// ---------- CELEBRATION ----------

function launchConfetti() {
  const colors = ["#ff6f91", "#ffc93c", "#35c2b1", "#a66dd4", "#4ea8ff", "#6bce6e"];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 1.5) + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3600);
  }
}

// ---------- INIT ----------

renderHome();
