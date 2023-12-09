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
            const video = document.querySelector('video');

            const playerObserver = new MutationObserver(() => {
                const $skip_container =  document.getElementsByClassName("video-ads ytp-ad-module")[0] || null;
                if(!$skip_container.children.length)    return;

                if(video.currentTime == video.duration)    return;

                video.currentTime = video.duration;

                const observer = new MutationObserver(() => {
                    const $skip_button = document.getElementsByClassName('ytp-ad-skip-button-modern ytp-button')[0] || null;
                    if($skip_button == null)    return;
                    $skip_button.click();
                    console.log('skip ads click');

                    observer.disconnect();
                });
                
                observer.observe($skip_container, config);
            });
            playerObserver.observe($player, config);
        },
    });
}


const isEmpty = (obj) => {
    return !Object.keys(obj).length;
}

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.transitionType === 'reload') {
        chrome.storage.session.remove([details.tabId.toString()]);
        console.log("remove script");
    }
}, {url: [{urlMatches : 'https://www.youtube.com/*'}]});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const pattern = /^https:\/\/(www\.)?youtube\.com\/.+/
    if(tab.url.match(pattern) && changeInfo.status === 'complete'){

        chrome.storage.session.get([tabId.toString()]).then((result) => {
            if(isEmpty(result)){
                console.log("insert script");
                skipAds(tabId);
            }
        });

        chrome.storage.session.set({ [tabId]: true });
    }
});