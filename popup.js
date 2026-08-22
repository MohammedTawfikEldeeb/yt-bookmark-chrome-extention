document.addEventListener("DOMContentLoaded", () => {
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const bookmarksContainer = document.getElementById("bookmarksContainer");
    const emptyState = document.getElementById("emptyState");
    const deleteAllBtn = document.getElementById("deleteAllBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    const noteInput = document.getElementById("noteInput");
    const modalCancel = document.getElementById("modalCancel");
    const modalSave = document.getElementById("modalSave");

    let currentVideoId = "";
    let currentEditIndex = -1;

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

    modalCancel.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
        noteInput.value = "";
        currentEditIndex = -1;
    });

    modalSave.addEventListener("click", () => {
        if (currentEditIndex >= 0) {
            chrome.storage.sync.get([currentVideoId], (result) => {
                const videoBookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];
                videoBookmarks[currentEditIndex].desc = noteInput.value;
                chrome.storage.sync.set({ [currentVideoId]: JSON.stringify(videoBookmarks) }, () => {
                    loadBookmarks();
                });
            });
        }
        modalOverlay.classList.remove("active");
        noteInput.value = "";
        currentEditIndex = -1;
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

            const header = document.createElement("div");
            header.className = "bookmark-header";

            const time = document.createElement("span");
            time.className = "time";
            time.textContent = formatTime(bookmark.time);
            time.addEventListener("click", () => {
                seekToTime(bookmark.time);
            });

            const actions = document.createElement("div");
            actions.className = "actions";

            const editBtn = document.createElement("img");
            editBtn.src = "assets/edit.png";
            editBtn.title = "Edit note";
            editBtn.addEventListener("click", () => {
                openModal(index, bookmark.desc);
            });

            const deleteBtn = document.createElement("img");
            deleteBtn.src = "assets/delete.png";
            deleteBtn.title = "Delete";
            deleteBtn.addEventListener("click", () => {
                deleteBookmark(index);
            });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            header.appendChild(time);
            header.appendChild(actions);

            const desc = document.createElement("span");
            desc.className = "description";
            desc.textContent = bookmark.desc;

            item.appendChild(header);
            item.appendChild(desc);
            bookmarksContainer.appendChild(item);
        });
    }

    function openModal(index, currentNote) {
        currentEditIndex = index;
        noteInput.value = currentNote;
        modalOverlay.classList.add("active");
        noteInput.focus();
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
