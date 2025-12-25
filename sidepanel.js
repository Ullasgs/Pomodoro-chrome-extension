let interval = null;
let isRunning = false;
let view = 'focus';

/* ---------- DURATIONS (DEFAULTS, OVERRIDDEN BY SETTINGS) ---------- */
let FOCUS = { work: 25 * 60, short: 5 * 60, long: 10 * 60 };
let BREAK = { short: 5 * 60, long: 10 * 60, super: 15 * 60 };

/* ---------- STATE ---------- */
let focusMode = 'work';
let breakMode = 'short';

let focusRemaining = { ...FOCUS };
let breakRemaining = { ...BREAK };

let time = focusRemaining[focusMode];

/* ---------- ELEMENTS ---------- */
const focusPage = document.getElementById('focusPage');
const breakPage = document.getElementById('breakPage');

const timerEl = document.getElementById('timer');
const breakTimerEl = document.getElementById('breakTimer');

const progressCircle = document.getElementById('progressCircle');
const breakProgressCircle = document.getElementById('breakProgressCircle');

const focusButtons = document.querySelectorAll('.focus-modes .mode-btn');
const breakButtons = document.querySelectorAll('.break-modes .mode-btn');

const startPauseBtn = document.getElementById('startPause');
const resetBtn = document.getElementById('reset');
const focusTab = document.getElementById('focusTab');
const breakTab = document.getElementById('breakTab');
const themeToggle = document.getElementById('themeToggle');

const soundButton = document.getElementById('soundButton');
const soundPanel = document.getElementById('soundPanel');
const muteToggle = document.getElementById('muteToggle');
const volumeSlider = document.getElementById('volumeSlider');

const openSettingsBtn = document.getElementById('openSettings');

/* ---------- SVG ---------- */
const circumference = 2 * Math.PI * 90;
progressCircle.style.strokeDasharray = circumference;
breakProgressCircle.style.strokeDasharray = circumference;

/* ---------- THEME ---------- */
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.onclick = () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
};

/* ---------- SOUND ---------- */
const alarmSound = new Audio(chrome.runtime.getURL('alarm.mp3'));

let volume = Number(localStorage.getItem('volume'));
if (isNaN(volume)) volume = 0.8;

let lastVolume = Number(localStorage.getItem('lastVolume'));
if (isNaN(lastVolume)) lastVolume = volume;

alarmSound.volume = volume;
volumeSlider.value = volume * 100;
updateMuteIcon();

function updateMuteIcon() {
  muteToggle.textContent = alarmSound.volume === 0 ? '🔇' : '🔊';
}

muteToggle.onclick = () => {
  if (alarmSound.volume === 0) {
    alarmSound.volume = lastVolume || 0.8;
  } else {
    lastVolume = alarmSound.volume;
    alarmSound.volume = 0;
    localStorage.setItem('lastVolume', lastVolume);
  }
  volumeSlider.value = alarmSound.volume * 100;
  localStorage.setItem('volume', alarmSound.volume);
  updateMuteIcon();
};

volumeSlider.oninput = () => {
  const v = volumeSlider.value / 100;
  if (v > 0) lastVolume = v;
  alarmSound.volume = v;
  localStorage.setItem('volume', v);
  localStorage.setItem('lastVolume', lastVolume);
  updateMuteIcon();
};

soundButton.onclick = (e) => {
  e.stopPropagation();
  soundPanel.hidden = !soundPanel.hidden;
};
soundPanel.onclick = (e) => e.stopPropagation();
document.addEventListener('click', () => soundPanel.hidden = true);

/* ---------- DISPLAY ---------- */
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateFocusDisplay() {
  const total = FOCUS[focusMode];
  timerEl.textContent = formatTime(time);
  progressCircle.style.strokeDashoffset =
    circumference - ((total - time) / total) * circumference;
}

function updateBreakDisplay() {
  const total = BREAK[breakMode];
  breakTimerEl.textContent = formatTime(time);
  breakProgressCircle.style.strokeDashoffset =
    circumference - ((total - time) / total) * circumference;
}

/* ---------- TIMER ---------- */
function stopTimer() {
  clearInterval(interval);
  interval = null;
  isRunning = false;
  startPauseBtn.textContent = 'Start';
}

function tick() {
  if (view === 'focus') {
    focusRemaining[focusMode]--;
    time = focusRemaining[focusMode];
  } else {
    breakRemaining[breakMode]--;
    time = breakRemaining[breakMode];
  }

  if (time <= 0) {
    time = 0;
    view === 'focus' ? updateFocusDisplay() : updateBreakDisplay();

    alarmSound.currentTime = 0;
    alarmSound.play().catch(() => {});
    stopTimer();

    setTimeout(() => {
      if (view === 'focus') {
        focusRemaining[focusMode] = FOCUS[focusMode];
        switchToBreak(true);
      } else {
        breakRemaining[breakMode] = BREAK[breakMode];
        switchToFocus();
      }
    }, 300);
    return;
  }

  view === 'focus' ? updateFocusDisplay() : updateBreakDisplay();
}

/* ---------- CONTROLS ---------- */
startPauseBtn.onclick = () => {
  if (isRunning) return stopTimer();
  interval = setInterval(tick, 1000);
  isRunning = true;
  startPauseBtn.textContent = 'Pause';
};

resetBtn.onclick = () => {
  stopTimer();
  if (view === 'focus') {
    focusRemaining[focusMode] = FOCUS[focusMode];
    time = focusRemaining[focusMode];
    updateFocusDisplay();
  } else {
    breakRemaining[breakMode] = BREAK[breakMode];
    time = breakRemaining[breakMode];
    updateBreakDisplay();
  }
};

/* ---------- MODE BUTTONS ---------- */
focusButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    focusButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    focusMode = btn.dataset.mode;
    time = focusRemaining[focusMode];
    updateFocusDisplay();
  };
});

breakButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    breakButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    breakMode = btn.dataset.break;
    time = breakRemaining[breakMode];
    updateBreakDisplay();
  };
});

/* ---------- VIEW SWITCH ---------- */
function switchToFocus() {
  view = 'focus';
  document.body.classList.remove('break-mode');
  breakPage.hidden = true;
  focusPage.hidden = false;
  focusTab.classList.add('active');
  breakTab.classList.remove('active');
  time = focusRemaining[focusMode];
  updateFocusDisplay();
}

function switchToBreak(forceShort) {
  view = 'break';
  document.body.classList.add('break-mode');
  focusPage.hidden = true;
  breakPage.hidden = false;

  if (forceShort && breakRemaining[breakMode] <= 0) {
    breakMode = 'short';
    breakRemaining[breakMode] = BREAK[breakMode];
  }

  breakButtons.forEach(b =>
    b.classList.toggle('active', b.dataset.break === breakMode)
  );

  time = breakRemaining[breakMode];
  updateBreakDisplay();
}

focusTab.onclick = () => !isRunning && switchToFocus();
breakTab.onclick = () => !isRunning && switchToBreak(false);

/* ---------- NAVIGATION ---------- */
openSettingsBtn.onclick = () => {
  window.location.href = 'settings.html';
};

/* ---------- LOAD SETTINGS + INIT ---------- */
chrome.storage.local.get(['durations'], (res) => {
  if (res.durations) {
    const d = res.durations;

    FOCUS = {
      work: d.focus.work * 60,
      short: d.focus.short * 60,
      long: d.focus.long * 60
    };

    BREAK = {
      short: d.break.short * 60,
      long: d.break.long * 60,
      super: d.break.super * 60
    };

    focusRemaining = { ...FOCUS };
    breakRemaining = { ...BREAK };
  }

  switchToFocus();
});
