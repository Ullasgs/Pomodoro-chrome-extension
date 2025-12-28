const DEFAULTS = {
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

// ---------- LOAD ----------
chrome.storage.local.get(['durations'], (res) => {
  const data = res.durations || DEFAULTS;

  document.getElementById('focus-work').value = data.focus.work;
  document.getElementById('focus-short').value = data.focus.short;
  document.getElementById('focus-long').value = data.focus.long;

  document.getElementById('break-short').value = data.break.short;
  document.getElementById('break-long').value = data.break.long;
  document.getElementById('break-super').value = data.break.super;
});

// ---------- SAVE ----------
document.getElementById('saveBtn').onclick = () => {
  const durations = {
    focus: {
      work: Number(document.getElementById('focus-work').value),
      short: Number(document.getElementById('focus-short').value),
      long: Number(document.getElementById('focus-long').value)
    },
    break: {
      short: Number(document.getElementById('break-short').value),
      long: Number(document.getElementById('break-long').value),
      super: Number(document.getElementById('break-super').value)
    }
  };

  chrome.storage.local.set({ durations }, () => {
    window.location.href = 'sidepanel.html';
  });
};

// ---------- BACK ----------
document.getElementById('backBtn').onclick = () => {
  window.location.href = 'sidepanel.html';
};

document.getElementById('resetDefaultsBtn').onclick = () => {

  // update inputs
  document.getElementById('focus-work').value = DEFAULTS.focus.work;
  document.getElementById('focus-short').value = DEFAULTS.focus.short;
  document.getElementById('focus-long').value = DEFAULTS.focus.long;

  document.getElementById('break-short').value = DEFAULTS.break.short;
  document.getElementById('break-long').value = DEFAULTS.break.long;
  document.getElementById('break-super').value = DEFAULTS.break.super;

  // save immediately
  chrome.storage.local.set({ durations: DEFAULTS });
};

