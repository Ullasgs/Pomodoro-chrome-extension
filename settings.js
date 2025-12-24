const defaults = {
  focus: {
    work: 25,
    short: 5,
    long: 10
  },
  break: {
    short: 5,
    long: 10,
    super: 15
  }
};

function load() {
  return JSON.parse(localStorage.getItem('durations')) || defaults;
}

function save(data) {
  localStorage.setItem('durations', JSON.stringify(data));
}

const data = load();

// ---------- INPUTS ----------
const inputs = {
  focus: {
    work: document.getElementById('focusWork'),
    short: document.getElementById('focusShort'),
    long: document.getElementById('focusLong')
  },
  break: {
    short: document.getElementById('breakShort'),
    long: document.getElementById('breakLong'),
    super: document.getElementById('breakSuper')
  }
};

// ---------- INIT ----------
Object.keys(inputs.focus).forEach(k => {
  inputs.focus[k].value = data.focus[k];
});

Object.keys(inputs.break).forEach(k => {
  inputs.break[k].value = data.break[k];
});

// ---------- SAVE ----------
Object.values(inputs.focus).forEach(input =>
  input.addEventListener('change', persist)
);

Object.values(inputs.break).forEach(input =>
  input.addEventListener('change', persist)
);

function persist() {
  save({
    focus: {
      work: +inputs.focus.work.value,
      short: +inputs.focus.short.value,
      long: +inputs.focus.long.value
    },
    break: {
      short: +inputs.break.short.value,
      long: +inputs.break.long.value,
      super: +inputs.break.super.value
    }
  });
}

// ---------- BACK ----------
document.getElementById('backBtn').onclick = () => {
  window.location.href = 'sidepanel.html';
};
