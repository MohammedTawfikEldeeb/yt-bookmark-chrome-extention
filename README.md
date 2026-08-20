# YouTube Bookmark Chrome Extension

Bookmark YouTube videos at specific timestamps and jump back to them later.

## Features

- Bookmark any moment in a YouTube video
- Saved timestamps persist across sessions
- Click timestamp to seek directly to that point
- Delete individual bookmarks or all at once
- Timestamps sorted chronologically

## Installation

1. Clone this repo
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

## Usage

1. Open any YouTube video
2. Click the **bookmark icon** on the video player to save current timestamp
3. Click the **extension icon** in toolbar to view bookmarks
4. Click a **timestamp** to jump to that moment
5. Click the **trash icon** to delete a bookmark

## File Structure

```
├── manifest.json        # Extension config
├── background.js        # Detects YouTube pages
├── contentScript.js     # Injects bookmark button
├── popup.html           # Popup UI
├── popup.css            # Styling
├── popup.js             # Popup logic
└── assets/
    ├── bookmark.png
    ├── delete.png
    ├── edit.png
    ├── play.png
    └── ext-icon.png
```

## Tech

- Chrome Extension Manifest V3
- Chrome Storage API
- Content Scripts
