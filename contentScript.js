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
        const note = prompt("Add a note for this bookmark:", "");

        if (note === null) return;

        const newBookmark = {
            time: currentTime,
            desc: note || "Bookmark at " + formatTime(currentTime),
        };

        chrome.storage.sync.get([currentVideo], (result) => {
            const videoBookmarks = result[currentVideo] ? JSON.parse(result[currentVideo]) : [];
            videoBookmarks.push(newBookmark);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(videoBookmarks) });
        });
    }

    function formatTime(time) {
        const date = new Date(0);
        date.setSeconds(time);
        return date.toISOString().substr(11, 8);
    }

    newVideoLoaded();
})();
