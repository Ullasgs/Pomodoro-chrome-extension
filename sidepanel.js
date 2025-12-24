let interval = null;
let isRunning = false;
let currentMode = 'work';

const timerEl = document.getElementById('timer');
const startPauseBtn = document.getElementById('startPause');
const resetBtn = document.getElementById('reset');
const progressCircle = document.getElementById('progressCircle');

const focusTab = document.getElementById('focusTab');
const breakTab = document.getElementById('breakTab');
const focusPage = document.getElementById('focusPage');
const breakPage = document.getElementById('breakPage');

const themeToggle = document.getElementById('themeToggle');
const modeButtons = document.querySelectorAll('.mode-btn');

const circumference = 2 * Math.PI * 90;
progressCircle.style.strokeDasharray = circumference;

// ---------- DURATIONS (editable via settings) ----------
function loadDurations() {
  const d = JSON.parse(localStorage.getItem('durations') || '{}');
  return {
    work: (d.work ?? 25) * 60,
    short: (d.short ?? 5) * 60,
    long: (d.long ?? 10) * 60
  };
}

let DURATIONS = loadDurations();
let time = DURATIONS.work;

// ---------- THEME ----------
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
};

// ---------- DISPLAY ----------
function updateDisplay() {
  const m = Math.floor(time / 60);
  const s = time % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

  const progress = (DURATIONS[currentMode] - time) / DURATIONS[currentMode];
  progressCircle.style.strokeDashoffset =
    circumference - progress * circumference;
}

// ---------- TIMER ----------
function tick() {
  time--;
  if (time <= 0) {
    clearInterval(interval);
    interval = null;
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    time = DURATIONS[currentMode];
  }
  updateDisplay();
}

startPauseBtn.onclick = () => {
  if (isRunning) {
    clearInterval(interval);
    interval = null;
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    return;
  }
  interval = setInterval(tick, 1000);
  isRunning = true;
  startPauseBtn.textContent = 'Pause';
};

resetBtn.onclick = () => {
  clearInterval(interval);
  interval = null;
  isRunning = false;
  time = DURATIONS[currentMode];
  startPauseBtn.textContent = 'Start';
  updateDisplay();
};

// ---------- WORK / SHORT / LONG ----------
modeButtons.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    DURATIONS = loadDurations();
    time = DURATIONS[currentMode];
    updateDisplay();
  };
});

// ---------- FOCUS / BREAK VIEW ----------
focusTab.onclick = () => {
  focusTab.classList.add('active');
  breakTab.classList.remove('active');
  focusPage.hidden = false;
  breakPage.hidden = true;
};

breakTab.onclick = () => {
  breakTab.classList.add('active');
  focusTab.classList.remove('active');
  focusPage.hidden = true;
  breakPage.hidden = false;
};

// ---------- SETTINGS ----------
document.getElementById('openSettings').onclick = () => {
  window.location.href = 'settings.html';
};

// ---------- INIT ----------
updateDisplay();
