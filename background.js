const skipAds = (tabId) => {
    chrome.scripting.executeScript({
        target : {tabId: tabId },
        func: () => {
            const config = { 
                attributes: true, 
                childList: true, 
                characterData: true,
                subtree: true,
            };

            const $player = document.getElementById('movie_player');
            const playerObserver = new MutationObserver(() => {
                const $skip_container =  document.getElementsByClassName("video-ads ytp-ad-module")[0] || null;
                if($skip_container == null)  return;

                const observer = new MutationObserver(() => {
                    const $skip_button = document.getElementsByClassName('ytp-ad-skip-button ytp-button')[0] || null;
                    if($skip_button == null)    return;
                    $skip_button.click();
                });
                
                observer.observe($skip_container, config);
                playerObserver.disconnect();
            });
            playerObserver.observe($player, config);
        },
    });
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const pattern = /^https:\/\/(www\.)?youtube\.com\/.+/
    if(tab.url.match(pattern) && changeInfo.status === 'complete'){
        skipAds(tabId);
    }
})