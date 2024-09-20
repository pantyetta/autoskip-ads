const y_skipAds = (tabId) => {
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
                if($skip_container == null || !$skip_container.children.length)    return;

                const observer = new MutationObserver(() => {
                    const $skip_button = document.getElementsByClassName('ytp-ad-skip-button-modern ytp-button')[0] || null;
                    if($skip_button == null)    return;
                    $skip_button.click();

                    observer.disconnect();
                });
                observer.observe($skip_container, config);
                
                const video = document.querySelector('video');
                try {
                    video.currentTime = video.duration;
                } catch (error) {}
                
            });
            playerObserver.observe($player, config);
        },
    });
}

const n_skipAds = (tabId) => {
    chrome.scripting.executeScript({
        target : {tabId: tabId },
        func: () => {
            const config = { 
                attributes: true, 
                childList: true, 
                characterData: true,
                subtree: true,
            };

            const $root = document.getElementById('root');
            let skip_enable = true;
            
            const rootObserver = new MutationObserver(() => {
                const video = document.querySelector("#nv_watch_VideoAdContainer > div > div:nth-child(1) > video") || null;
                
                if(!video)  return;

                if(!video.duration) {
                    skip_enable = true;
                    return;
                }

                if(video.currentTime == video.duration){
                    const skipButton = document.querySelector("#nv_watch_VideoAdContainer > button") || null;
                    if(!skipButton) return;
                    skipButton.click();
                    console.log("click")
                    return;
                }

                if(!skip_enable) return;


                try {
                    video.currentTime = video.duration;
                    console.log(video.currentTime)
                    skip_enable = false;
                } catch (error) {}
                
            });
            rootObserver.observe($root, config);
        },
    });
}


const isEmpty = (obj) => {
    return !Object.keys(obj).length;
}

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.transitionType === 'reload') {
        chrome.storage.session.remove([details.tabId.toString()]);
    }
}, {url: [{urlMatches : 'https://www.youtube.com/*'}, {urlMatches : 'https://www.nicovideo.jp/watch/*'}]});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const y_pattern = /^https:\/\/(www\.)?youtube\.com\/.+/
    const n_pattern = /^https:\/\/(www\.)?nicovideo\.jp\/watch\/.+/

    if(tab.url.match(y_pattern) && changeInfo.status === 'complete'){

        chrome.storage.session.get([tabId.toString()]).then((result) => {
            if(isEmpty(result)){
                y_skipAds(tabId);
            }
        });

        chrome.storage.session.set({ [tabId]: true });
    }

    if(tab.url.match(n_pattern) && changeInfo.status === 'complete'){

        chrome.storage.session.get([tabId.toString()]).then((result) => {
            if(isEmpty(result)){
                n_skipAds(tabId);
            }
        });

        chrome.storage.session.set({ [tabId]: true });
    }
});