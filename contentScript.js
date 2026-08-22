(() => {
    let youtubePlayer;
    let currentVideo = "";

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "ADD_BOOKMARK") {
            addNewBookmark();
        } else if (type === "SEEK") {
            const player = document.querySelector("video");
            if (player) {
                player.currentTime = value;
            }
        }
    });

    function newVideoLoaded() {
        const existingBtn = document.getElementById("yt-bookmark-btn");
        if (existingBtn) return;

        const playerContainer = document.querySelector("#movie_player");
        if (!playerContainer) {
            setTimeout(newVideoLoaded, 1000);
            return;
        }

        const bookmarkBtn = document.createElement("button");
        bookmarkBtn.id = "yt-bookmark-btn";
        bookmarkBtn.innerHTML = `<img src="${chrome.runtime.getURL("assets/bookmark.png")}" style="width:24px;height:24px;">`;
        bookmarkBtn.title = "Bookmark this video";
        bookmarkBtn.style.cssText = "position:absolute;bottom:80px;right:10px;z-index:99999;cursor:pointer;background:rgba(0,0,0,0.8);border-radius:50%;padding:8px;border:none;display:flex;align-items:center;justify-content:center;pointer-events:auto;";

        playerContainer.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmark);
    }

    function addNewBookmark() {
        const video = document.querySelector("video");
        if (!video) return;

        const currentTime = video.currentTime;

        const existing = document.getElementById("yt-bookmark-modal");
        if (existing) existing.remove();

        const modal = document.createElement("div");
        modal.id = "yt-bookmark-modal";
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;";

        modal.innerHTML = `
            <div style="background:#1a1a2e;border-radius:10px;padding:16px;width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.5);font-family:Arial,sans-serif;">
                <h3 style="font-size:14px;font-weight:600;color:#e94560;margin-bottom:12px;">Add Note</h3>
                <textarea id="yt-bookmark-note" style="width:100%;height:80px;padding:10px;border:1px solid #0f3460;border-radius:6px;background:#16213e;color:#eee;font-size:13px;font-family:inherit;resize:none;outline:none;box-sizing:border-box;" placeholder="Write your note..."></textarea>
                <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
                    <button id="yt-bookmark-cancel" style="padding:8px 16px;border:none;border-radius:6px;font-size:12px;cursor:pointer;background:#333;color:#ccc;">Cancel</button>
                    <button id="yt-bookmark-save" style="padding:8px 16px;border:none;border-radius:6px;font-size:12px;cursor:pointer;background:#e94560;color:white;">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const noteInput = document.getElementById("yt-bookmark-note");
        noteInput.focus();

        document.getElementById("yt-bookmark-cancel").addEventListener("click", () => {
            modal.remove();
        });

        document.getElementById("yt-bookmark-save").addEventListener("click", () => {
            const note = noteInput.value;
            const newBookmark = {
                time: currentTime,
                desc: note || "Bookmark at " + formatTime(currentTime),
            };

            chrome.storage.sync.get([currentVideo], (result) => {
                const videoBookmarks = result[currentVideo] ? JSON.parse(result[currentVideo]) : [];
                videoBookmarks.push(newBookmark);
                chrome.storage.sync.set({ [currentVideo]: JSON.stringify(videoBookmarks) });
            });

            modal.remove();
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function formatTime(time) {
        const date = new Date(0);
        date.setSeconds(time);
        return date.toISOString().substr(11, 8);
    }

    newVideoLoaded();
})();
