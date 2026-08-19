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
            youtubePlayer = document.getElementsByClassName("video-stream html5-main-video")[0];
            if (youtubePlayer) {
                youtubePlayer.currentTime = value;
            }
        }
    });

    function newVideoLoaded() {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "bookmark-btn";
            bookmarkBtn.title = "Bookmark this video";
            bookmarkBtn.style.cssText = "position:absolute;top:10px;right:10px;z-index:9999;width:32px;height:32px;cursor:pointer;background:rgba(0,0,0,0.7);border-radius:50%;padding:5px;";

            youtubePlayer = document.getElementsByClassName("video-stream html5-main-video")[0];
            const playerContainer = document.getElementById("movie_player") || document.querySelector(".html5-video-player");

            if (playerContainer) {
                playerContainer.style.position = "relative";
                playerContainer.appendChild(bookmarkBtn);
                bookmarkBtn.addEventListener("click", addNewBookmark);
            }
        }
    }

    function addNewBookmark() {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        chrome.storage.sync.get([currentVideo], (result) => {
            const videoBookmarks = result[currentVideo] ? JSON.parse(result[currentVideo]) : [];
            videoBookmarks.push(newBookmark);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(videoBookmarks) });
        });
    }

    function getTime(time) {
        const date = new Date(0);
        date.setSeconds(time);
        return date.toISOString().substr(11, 8);
    }
})();
