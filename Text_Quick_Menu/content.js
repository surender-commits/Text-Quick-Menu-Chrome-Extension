let extensionEnabled = true;

let menu = null;

let savedActiveElement = null;
let savedInputStart = 0;
let savedInputEnd = 0;
let savedRange = null;

let selectionTimer = null;
let holdTimer = null;
let holdTarget = null;

// Get current extension state
chrome.storage.local.get("enabled", function (result) {
  extensionEnabled = result.enabled !== false;
});

// Watch enable / disable
chrome.storage.onChanged.addListener(function (changes) {
  if (changes.enabled) {
    extensionEnabled = changes.enabled.newValue !== false;

    if (!extensionEnabled) {
      removeMenu();
    }
  }
});

// Check editable element
function isEditable(element) {
  if (!element) {
    return false;
  }

  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    return !element.disabled && !element.readOnly;
  }

  if (element.isContentEditable) {
    return true;
  }

  return false;
}

// Save editable element and its cursor/selection
function saveEditableTarget(element) {
  savedActiveElement = element;

  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    savedInputStart = element.selectionStart;
    savedInputEnd = element.selectionEnd;

    savedRange = null;
  } else if (element.isContentEditable) {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  }
}

// Remove current menu
function removeMenu() {
  if (menu) {
    menu.remove();
    menu = null;
  }
}

// Create menu button
function createButton(icon, action, title) {
  const button = document.createElement("button");

  button.type = "button";
  button.title = title;

  button.innerHTML = icon;

  button.style.width = "32px";
  button.style.height = "32px";
  button.style.padding = "0";
  button.style.margin = "0";
  button.style.border = "0";
  button.style.borderRadius = "6px";
  button.style.background = "transparent";
  button.style.color = "white";
  button.style.cursor = "pointer";

  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";

  button.addEventListener("mouseenter", function () {
    button.style.background = "#444";
  });

  button.addEventListener("mouseleave", function () {
    button.style.background = "transparent";
  });

  button.addEventListener("mousedown", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    action();

    removeMenu();
  });

  return button;
}

// Create menu
function createMenu() {
  menu = document.createElement("div");

  menu.style.position = "fixed";
  menu.style.zIndex = "2147483647";

  menu.style.display = "flex";
  menu.style.alignItems = "center";

  menu.style.gap = "2px";

  menu.style.padding = "4px";

  menu.style.background = "#222";

  menu.style.border = "1px solid rgba(255,255,255,0.15)";

  menu.style.borderRadius = "8px";

  menu.style.boxShadow = "0 4px 15px rgba(0,0,0,0.35)";

  menu.style.userSelect = "none";

  document.body.appendChild(menu);

  return menu;
}

// Position menu while keeping it inside viewport
function positionMenu(x, y) {
  if (!menu) {
    return;
  }

  const rect = menu.getBoundingClientRect();

  let left = x;
  let top = y;

  if (left + rect.width > window.innerWidth - 5) {
    left = window.innerWidth - rect.width - 5;
  }

  if (top + rect.height > window.innerHeight - 5) {
    top = y - rect.height - 8;
  }

  if (left < 5) {
    left = 5;
  }

  if (top < 5) {
    top = 5;
  }

  menu.style.left = left + "px";
  menu.style.top = top + "px";
}

// Copy selected text
async function copySelectedText() {
  const text = selectedText();
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    document.execCommand("copy");

    textarea.remove();
  }
}

// Paste clipboard text into saved element
async function pasteText() {
  if (!savedActiveElement) {
    return;
  }

  let text = "";

  try {
    text = await navigator.clipboard.readText();
  } catch (error) {
    return;
  }

  savedActiveElement.focus();

  // INPUT / TEXTAREA
  if (
    savedActiveElement.tagName === "INPUT" ||
    savedActiveElement.tagName === "TEXTAREA"
  ) {
    savedActiveElement.setSelectionRange(savedInputStart, savedInputEnd);

    savedActiveElement.setRangeText(
      text,
      savedInputStart,
      savedInputEnd,
      "end",
    );

    savedActiveElement.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text,
      }),
    );

    return;
  }

  // CONTENTEDITABLE
  if (savedActiveElement.isContentEditable) {
    if (savedRange) {
      const selection = window.getSelection();

      selection.removeAllRanges();

      selection.addRange(savedRange);
    }

    document.execCommand("insertText", false, text);
  }
}

// Paste and Go
async function pasteAndGo() {
  await pasteText();

  if (!savedActiveElement) {
    return;
  }

  savedActiveElement.focus();

  setTimeout(function () {
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });

    savedActiveElement.dispatchEvent(event);
  }, 50);
}

// Icons

const COPY_ICON = `
<svg width="18" height="18"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">

    <rect x="9" y="9" width="11" height="11" rx="2"></rect>

    <path d="M5 15H4a2 2 0 0 1-2-2V4
             a2 2 0 0 1 2-2h9
             a2 2 0 0 1 2 2v1">
    </path>

</svg>
`;

const PASTE_ICON = `
<svg width="18" height="18"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">

    <rect x="5" y="4" width="14" height="17" rx="2"></rect>

    <path d="M9 4V2h6v2"></path>

    <path d="M9 10h6"></path>
    <path d="M9 14h6"></path>

</svg>
`;

const GO_ICON = `
<svg width="18" height="18"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">

    <path d="M5 12h13"></path>

    <path d="m13 6 6 6-6 6"></path>

</svg>
`;

const SEARCH_ICON = `
<svg width="18" height="18"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">

    <circle cx="11" cy="11" r="7"></circle>

    <path d="m20 20-4-4"></path>

</svg>
`;

function selectedText() {
  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  if (selection.isCollapsed) {
    return;
  }

  const selectedText = selection.toString().trim();

  if (!selectedText) {
    return;
  }

  return selectedText;
}

function encodeURIComponentfromSelection() {
  const txt = selectedText();
  return encodeURIComponent(txt);
}

// Show selection menu
function showSelectionMenu(rect) {
  if (!extensionEnabled) {
    return;
  }

  removeMenu();

  createMenu();

  const copyButton = createButton(
    COPY_ICON,
    function () {
      copySelectedText();
    },
    "Copy",
  );

  const pasteButton = createButton(
    PASTE_ICON,
    function () {
      pasteText();
    },
    "Paste",
  );

  const goButton = createButton(
    GO_ICON,
    function () {
      pasteAndGo();
    },
    "Paste & Go",
  );

  const searchButton = createButton(
    SEARCH_ICON,
    function () {
      window.open(
        "https://www.google.com/search?q=" + encodeURIComponentfromSelection(),
        "_blank",
      );
    },
    "Search",
  );

  menu.appendChild(copyButton);
  menu.appendChild(pasteButton);
  menu.appendChild(goButton);
  menu.appendChild(searchButton);

  // Put menu above selection
  let x = rect.left;
  let y = rect.top - 45;

  // If there isn't enough space above
  if (y < 5) {
    y = rect.bottom + 8;
  }

  positionMenu(x, y);
}

// Show long-press menu
function showHoldMenu(target, x, y) {
  if (!extensionEnabled) {
    return;
  }

  removeMenu();

  saveEditableTarget(target);

  createMenu();

  const pasteButton = createButton(
    PASTE_ICON,
    function () {
      pasteText();
    },
    "Paste",
  );

  const goButton = createButton(
    GO_ICON,
    function () {
      pasteAndGo();
    },
    "Paste & Go",
  );

  menu.appendChild(pasteButton);
  menu.appendChild(goButton);

  positionMenu(x, y);
}

// Selection detection
document.addEventListener("selectionchange", function () {
  if (!extensionEnabled) {
    return;
  }

  clearTimeout(selectionTimer);

  selectionTimer = setTimeout(function () {
    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    if (selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();

    if (!selectedText) {
      return;
    }
    if (menu) {
      return;
    }

    const range = selection.getRangeAt(0);

    savedRange = range.cloneRange();

    const rect = range.getBoundingClientRect();

    showSelectionMenu(rect);
  }, 200);
});

// Mouse down
document.addEventListener(
  "mousedown",
  function (event) {
    if (!extensionEnabled) {
      return;
    }

    // Only left mouse button
    if (event.button !== 0) {
      return;
    }

    // If clicking inside menu,
    // don't start a hold timer
    if (menu && menu.contains(event.target)) {
      return;
    }

    // Clicking outside existing menu
    if (menu && !menu.contains(event.target)) {
      removeMenu();
    }

    // Find editable target
    let target = event.target;

    if (target && target.closest) {
      target = target.closest(
        "input, textarea, [contenteditable='true'], [contenteditable='']",
      );
    }

    if (!target) {
      return;
    }

    if (!isEditable(target)) {
      return;
    }

    holdTarget = target;

    clearTimeout(holdTimer);

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    holdTimer = setTimeout(function () {
      if (!holdTarget) {
        return;
      }

      // Make sure mouse is still down
      if (!holdTarget) {
        return;
      }

      showHoldMenu(holdTarget, mouseX, mouseY);
    }, 200);
  },
  true,
);

// Mouse up cancels hold
document.addEventListener(
  "mouseup",
  function () {
    clearTimeout(holdTimer);

    holdTimer = null;

    holdTarget = null;
  },
  true,
);

// Mouse leaves browser window
document.addEventListener(
  "mouseleave",
  function () {
    clearTimeout(holdTimer);

    holdTimer = null;

    holdTarget = null;
  },
  true,
);

// Cancel hold if mouse moves significantly
document.addEventListener(
  "mousemove",
  function (event) {
    if (!holdTarget) {
      return;
    }

    // Don't cancel immediately for tiny mouse movement.

    // The hold is intended to work while keeping
    // the mouse approximately in the same place.
  },
  true,
);
