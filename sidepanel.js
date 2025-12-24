let interval = null;
let isRunning = false;
let view = 'focus';

// ---------- DURATIONS ----------
const FOCUS = {
  work: 25 * 60,
  short: 5 * 60,
  long: 10 * 60
};

const BREAK = {
  short: 5 * 60,
  long: 10 * 60,
  super: 15 * 60
};

// ---------- STATE ----------
let focusMode = 'work';
let breakMode = 'short';
let time = FOCUS[focusMode];

// ---------- ELEMENTS ----------
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

// ---------- SVG ----------
const circumference = 2 * Math.PI * 90;
progressCircle.style.strokeDasharray = circumference;
breakProgressCircle.style.strokeDasharray = circumference;

// ---------- THEME ----------
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.onclick = () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
};

// ---------- DISPLAY ----------
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

// ---------- TIMER ----------
function stopTimer() {
  clearInterval(interval);
  interval = null;
  isRunning = false;
  startPauseBtn.textContent = 'Start';
}

function tick() {
  time--;

  if (time <= 0) {
    stopTimer();
    view === 'focus' ? switchToBreak(true) : switchToFocus();
    return;
  }

  view === 'focus' ? updateFocusDisplay() : updateBreakDisplay();
}

startPauseBtn.onclick = () => {
  if (isRunning) {
    stopTimer();
    return;
  }
  interval = setInterval(tick, 1000);
  isRunning = true;
  startPauseBtn.textContent = 'Pause';
};

resetBtn.onclick = () => {
  stopTimer();
  view === 'focus' ? switchToFocus() : switchToBreak(false);
};

// ---------- MODE BUTTONS ----------
focusButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    focusButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    focusMode = btn.dataset.mode;
    time = FOCUS[focusMode];
    updateFocusDisplay();
  };
});

breakButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    breakButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    breakMode = btn.dataset.break;
    time = BREAK[breakMode];
    updateBreakDisplay();
  };
});

// ---------- VIEW SWITCH ----------
function forceReflow(el) {
  void el.offsetHeight;
}

function switchToFocus() {
  view = 'focus';
  document.body.classList.remove('break-mode');

  breakPage.hidden = true;
  focusPage.hidden = false;
  forceReflow(focusPage);

  focusTab.classList.add('active');
  breakTab.classList.remove('active');

  time = FOCUS[focusMode];
  updateFocusDisplay();
}

function switchToBreak(forceShort) {
  view = 'break';
  document.body.classList.add('break-mode');

  focusPage.hidden = true;
  breakPage.hidden = false;
  forceReflow(breakPage); // 🔑 THIS FIXES STYLING

  focusTab.classList.remove('active');
  breakTab.classList.add('active');

  if (forceShort) breakMode = 'short';

  breakButtons.forEach(b =>
    b.classList.toggle('active', b.dataset.break === breakMode)
  );

  time = BREAK[breakMode];
  updateBreakDisplay();
}

focusTab.onclick = () => {
  if (isRunning) return;
  switchToFocus();
};

breakTab.onclick = () => {
  if (isRunning) return;
  switchToBreak(false);
};

// ---------- INIT ----------
switchToFocus();
