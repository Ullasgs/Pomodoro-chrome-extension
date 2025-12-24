let isOpen = false;

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  if (!isOpen) {
    await chrome.sidePanel.open({ tabId: tab.id });
    isOpen = true;
  } else {
    await chrome.sidePanel.close({ tabId: tab.id });
    isOpen = false;
  }
});
