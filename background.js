const skipAds = (tabId) => {
    chrome.scripting.executeScript({
        target : {tabId: tabId },
        func: () => {
            const $skip_container =  document.getElementsByClassName("video-ads ytp-ad-module")[0] || null;

            if($skip_container.length < 1)  return;
            const observer = new MutationObserver(() => {
                const $skip_button = document.getElementsByClassName('ytp-ad-skip-button ytp-button')[0] || null;
                if($skip_button < 1)    return;
                $skip_button.click();
            });
            
            const config = { 
                attributes: true, 
                childList: true, 
                characterData: true,
                subtree: true,
            };
            observer.observe($skip_container, config);
        },
    });
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const pattern = /^https:\/\/(www\.)?youtube\.com\/.+/
    if(tab.url.match(pattern) && changeInfo.status === 'complete'){
        skipAds(tabId);
    }
})