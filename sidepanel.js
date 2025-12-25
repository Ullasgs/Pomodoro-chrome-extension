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
let focusRemaining = {
  work: FOCUS.work,
  short: FOCUS.short,
  long: FOCUS.long
};

let breakRemaining = {
  short: BREAK.short,
  long: BREAK.long,
  super: BREAK.super
};


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
  if (view === 'focus') {
    focusRemaining[focusMode]--;
    time = focusRemaining[focusMode];
  } else {
    breakRemaining[breakMode]--;
    time = breakRemaining[breakMode];
  }

if (time <= 0) {
  time = 0;

  if (view === 'focus') {
    focusRemaining[focusMode] = 0;
    updateFocusDisplay();
  } else {
    breakRemaining[breakMode] = 0;
    updateBreakDisplay();
  }

  stopTimer();

  setTimeout(() => {
    if (view === 'focus') {
      // 🔑 RESET FOCUS FOR NEXT CYCLE
      focusRemaining[focusMode] = FOCUS[focusMode];
      switchToBreak(true);
    } else {
      // 🔑 RESET BREAK FOR NEXT CYCLE
      breakRemaining[breakMode] = BREAK[breakMode];
      switchToFocus();
    }
  }, 300);

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

// ---------- MODE BUTTONS ----------
focusButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;

    focusButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    focusMode = btn.dataset.mode;
    time = focusRemaining[focusMode]; // 🔑 restore paused time

    updateFocusDisplay();
  };
});

breakButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;

    breakButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    breakMode = btn.dataset.break;
    time = breakRemaining[breakMode]; // 🔑 restore paused time

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
