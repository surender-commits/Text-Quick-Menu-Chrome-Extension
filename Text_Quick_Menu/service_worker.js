function setIcon(enabled) {
  chrome.action.setIcon({
    path: enabled ? "on.png" : "off.png",
  });
}

// Extension installed / updated
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get("enabled", function (result) {
    if (result.enabled === undefined) {
      chrome.storage.local.set({ enabled: true });
      setIcon(true);
    } else {
      setIcon(result.enabled);
    }
  });
});

// Browser started
chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.get("enabled", function (result) {
    const enabled = result.enabled !== false;

    setIcon(enabled);
  });
});

// Toolbar icon clicked
chrome.action.onClicked.addListener(function () {
  chrome.storage.local.get("enabled", function (result) {
    const currentState = result.enabled !== false;
    const newState = !currentState;

    chrome.storage.local.set({
      enabled: newState,
    });

    setIcon(newState);
  });
});
