document.addEventListener("DOMContentLoaded", () => {
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const bookmarksContainer = document.getElementById("bookmarksContainer");
    const emptyState = document.getElementById("emptyState");
    const deleteAllBtn = document.getElementById("deleteAllBtn");

    let currentVideoId = "";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        if (url && url.includes("youtube.com/watch")) {
            const queryParams = url.split("?")[1];
            const urlParams = new URLSearchParams(queryParams);
            currentVideoId = urlParams.get("v");
            loadBookmarks();
        } else {
            emptyState.textContent = "Open a YouTube video to bookmark it";
        }
    });

    bookmarkBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "ADD_BOOKMARK" });
        });
    });

    deleteAllBtn.addEventListener("click", () => {
        if (currentVideoId) {
            chrome.storage.sync.remove(currentVideoId, () => {
                loadBookmarks();
            });
        }
    });

    function loadBookmarks() {
        chrome.storage.sync.get([currentVideoId], (result) => {
            const videoBookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];
            renderBookmarks(videoBookmarks);
        });
    }

    function renderBookmarks(bookmarks) {
        bookmarksContainer.innerHTML = "";

        if (bookmarks.length === 0) {
            emptyState.textContent = "No bookmarks yet";
            bookmarksContainer.appendChild(emptyState);
            return;
        }

        bookmarks.sort((a, b) => a.time - b.time);

        bookmarks.forEach((bookmark, index) => {
            const item = document.createElement("div");
            item.className = "bookmark-item";

            const time = document.createElement("span");
            time.className = "time";
            time.textContent = formatTime(bookmark.time);
            time.addEventListener("click", () => {
                seekToTime(bookmark.time);
            });

            const desc = document.createElement("span");
            desc.className = "description";
            desc.textContent = bookmark.desc;

            const actions = document.createElement("div");
            actions.className = "actions";

            const deleteBtn = document.createElement("img");
            deleteBtn.src = "assets/delete.png";
            deleteBtn.title = "Delete";
            deleteBtn.addEventListener("click", () => {
                deleteBookmark(index);
            });

            actions.appendChild(deleteBtn);
            item.appendChild(time);
            item.appendChild(desc);
            item.appendChild(actions);
            bookmarksContainer.appendChild(item);
        });
    }

    function deleteBookmark(index) {
        chrome.storage.sync.get([currentVideoId], (result) => {
            const videoBookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];
            videoBookmarks.splice(index, 1);
            chrome.storage.sync.set({ [currentVideoId]: JSON.stringify(videoBookmarks) }, () => {
                loadBookmarks();
            });
        });
    }

    function seekToTime(time) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "SEEK", value: time });
        });
    }

    function formatTime(time) {
        const date = new Date(0);
        date.setSeconds(time);
        return date.toISOString().substr(11, 8);
    }
});
