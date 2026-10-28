
# Text Quick Menu

A lightweight Chrome extension that adds a floating action menu when you select text on a webpage or press and hold the mouse inside an editable field.

Quickly access Copy, Paste, Paste & Go, and Google Search without relying on traditional keyboard shortcuts for every action.

## Features

- **Floating Selection Menu:** Automatically displays a compact menu when text is selected.
- **Copy:** Copy selected text to the clipboard.
- **Paste:** Insert clipboard text into supported input fields and editable elements.
- **Paste & Go:** Paste clipboard text and dispatch an Enter key event.
- **Google Search:** Search selected text on Google in a new tab.
- **Click-and-Hold Menu:** Display a smaller Paste menu by holding the left mouse button inside an editable field.
- **Editable Field Support:** Supports standard input fields, textareas, and content-editable elements.
- **Clipboard Integration:** Uses the browser Clipboard API for reading and writing text.
- **Enable/Disable Toggle:** Click the extension toolbar icon to enable or disable the menu.
- **Dynamic Extension Icons:** Updates the toolbar icon to reflect the enabled state.
- **Persistent State:** Stores the enabled state using Chrome's local storage.
- **Viewport-Aware Positioning:** Positions the menu to keep it within the visible browser viewport.
- **Manifest V3:** Uses the Chrome Extension Manifest V3 architecture.

## Requirements

- Google Chrome or a compatible Chromium-based browser.
- JavaScript enabled.
- Permission to install unpacked extensions if installing locally.

## Installation

### Install Using Chrome Developer Mode

1. Download or clone this repository.
2. Extract the ZIP archive if necessary.
3. Open Google Chrome.
4. Navigate to `chrome://extensions/`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the `Text_Quick_Menu` folder containing `manifest.json`.

The extension should now appear in your Chrome toolbar.

No build process is required.

## How to Use

### 1. Enable the Extension

Click the Text Quick Menu toolbar icon to enable or disable the extension.

The icon changes according to the current enabled state.

### 2. Copy Selected Text

1. Select text on a webpage.
2. Wait briefly for the floating menu to appear.
3. Click the **Copy** button.

The selected text is copied to the clipboard.

### 3. Paste Clipboard Text

1. Click inside a supported input field, textarea, or content-editable element.
2. Press and hold the left mouse button briefly to display the smaller menu.
3. Click **Paste**.

The extension attempts to insert clipboard text at the saved cursor or selection position.

### 4. Paste & Go

Use **Paste & Go** in a supported editable field to insert clipboard text and dispatch an Enter key event.

The actual behavior depends on the target webpage and how it handles keyboard events.

### 5. Search Selected Text

1. Select text on a webpage.
2. Wait for the floating menu to appear.
3. Click **Search**.

Google opens in a new tab with the selected text as the search query.

## Menu Actions

| Action | Description |
|---|---|
| Copy | Copies selected text to the clipboard. |
| Paste | Inserts clipboard text into a supported editable element. |
| Paste & Go | Pastes clipboard text and dispatches an Enter key event. |
| Search | Opens a Google search for the selected text. |

The selection menu contains Copy, Paste, Paste & Go, and Search.

The click-and-hold menu contains Paste and Paste & Go.

## Project Structure

```text
Text_Quick_Menu/
├── manifest.json
├── service_worker.js
├── content.js
├── icon.png
├── on.png
└── off.png
```

### File Descriptions

| File | Purpose |
|---|---|
| `manifest.json` | Defines extension metadata, permissions, icons, service worker, and content script configuration. |
| `service_worker.js` | Manages the enabled state, toolbar icon, installation, browser startup, and toolbar clicks. |
| `content.js` | Detects text selection and mouse gestures, creates the floating menus, and implements the text actions. |
| `icon.png` | Main extension icon used in the browser. |
| `on.png` | Toolbar icon displayed when the extension is enabled. |
| `off.png` | Toolbar icon displayed when the extension is disabled. |

## How It Works

### Content Script

`content.js` runs on webpages matched by the extension manifest.

It listens for selection changes and displays the floating menu when non-empty text is selected.

For editable fields, it also detects a left-mouse-button hold gesture and displays a smaller menu.

### Background Service Worker

`service_worker.js` manages the extension's enabled state.

It:

- Initializes the enabled state when the extension is installed or updated.
- Restores the toolbar icon when Chrome starts.
- Toggles the enabled state when the toolbar icon is clicked.
- Stores the state using `chrome.storage.local`.

### Clipboard and Text Insertion

The extension uses the browser Clipboard API to copy selected text and read clipboard contents.

For input fields and textareas, it uses selection positions and `setRangeText()` to insert clipboard text.

For content-editable elements, it restores the saved selection range and attempts to insert text using `document.execCommand()`.

## Permissions

The extension requests the following permission:

| Permission | Purpose |
|---|---|
| `storage` | Stores the extension's enabled state. |

The content script is configured to run on pages matching `<all_urls>`.

This broad match allows the extension to operate across many websites, but browser-restricted pages may prevent content scripts from running.

## Configuration

The extension's behavior is defined in `content.js` and `service_worker.js`.

The current implementation uses fixed values for menu dimensions, colors, spacing, positioning, and gesture timing.

For example, the selection menu waits approximately 200 milliseconds after a selection change before displaying, and the click-and-hold menu uses a 200-millisecond timer.

To customize these values, edit the relevant source code and reload the extension from `chrome://extensions/`.

## Troubleshooting

### The Menu Does Not Appear

- Confirm that the extension is enabled.
- Select non-empty text on a webpage.
- Wait briefly after selecting the text.
- Check whether the current page restricts content scripts.
- Inspect the webpage console for JavaScript errors.

### Copy Does Not Work

The extension first attempts to use `navigator.clipboard.writeText()` and falls back to a temporary textarea and `document.execCommand("copy")`.

Clipboard behavior may vary depending on browser permissions and webpage context.

### Paste Does Not Work

- Make sure the target is a supported input, textarea, or content-editable element.
- Confirm that the browser permits clipboard reading.
- Check whether the target webpage accepts programmatic text insertion.

### Paste & Go Does Not Submit the Form

The extension dispatches an Enter key event after attempting to paste.

Some websites require trusted keyboard events or use custom form submission logic. As a result, dispatching Enter does not guarantee that a form will submit.

### The Extension Does Not Work on Certain Pages

Chrome restricts extension content scripts on some browser-internal pages and other protected contexts.

The extension may not work on every webpage.

## Known Limitations

- Clipboard access depends on browser permissions and context.
- Some websites may reject programmatic text insertion or synthetic keyboard events.
- The extension does not include a dedicated settings page.
- Menu styling and gesture timing are configured directly in the source code.
- The extension uses inline DOM styling for its floating menu.
- The content script is configured for all URL patterns, subject to Chrome's restrictions.
- No automated test suite or build system is included in the supplied project.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

When reporting an issue, include:

- Your Chrome version.
- The affected website.
- Steps to reproduce the problem.
- Relevant console errors, if available.

For pull requests, describe the changes and explain how they were tested.

## License

No license file was included with the supplied project.

If you plan to distribute this project as open source, add a `LICENSE` file specifying how others may use, modify, and redistribute the code.

Until a license is added, do not assume that the repository grants standard open-source reuse permissions.
