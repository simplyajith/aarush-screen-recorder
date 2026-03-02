chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: "https://aarushscreenrecorder.vercel.app/"
  });
});