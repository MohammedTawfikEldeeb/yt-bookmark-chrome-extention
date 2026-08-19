chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParams = tab.url.split("?")[1];
        const urlParams = new URLSearchParams(queryParams);
        const videoId = urlParams.get("v");

        setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
                type: "NEW",
                videoId: videoId,
            });
        }, 1000);
    }
});
