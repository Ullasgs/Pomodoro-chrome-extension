const work = document.getElementById('work');
const short = document.getElementById('short');
const long = document.getElementById('long');

const saved = JSON.parse(localStorage.getItem('durations') || '{}');

work.value = saved.work ?? 25;
short.value = saved.short ?? 5;
long.value = saved.long ?? 10;

function save() {
  localStorage.setItem('durations', JSON.stringify({
    work: parseInt(work.value),
    short: parseInt(short.value),
    long: parseInt(long.value)
  }));
}

[work, short, long].forEach(i => i.onchange = save);

document.getElementById('backBtn').onclick = () => {
  window.location.href = 'sidepanel.html';
};
