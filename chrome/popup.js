document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (!root) return;

  // Try to communicate with the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!document.getElementById('focusflow-overlay'),
    }, (results) => {
      const overlayExists = results?.[0]?.result;
      if (overlayExists) {
        root.innerHTML = `<div style='padding:1em;text-align:center;'>FocusFlow overlay is active.<br/><button id='close-overlay' style='margin-top:1em;padding:0.5em 1em;background:#6366f1;color:white;border:none;border-radius:6px;cursor:pointer;'>Close Overlay</button></div>`;
        document.getElementById('close-overlay').onclick = () => {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => document.getElementById('focusflow-overlay')?.remove(),
          });
          window.close();
        };
      } else {
        root.innerHTML = `<div style='padding:1em;text-align:center;'><button id='show-overlay' style='padding:0.5em 1em;background:#6366f1;color:white;border:none;border-radius:6px;cursor:pointer;'>Show FocusFlow Overlay</button></div>`;
        document.getElementById('show-overlay').onclick = () => {
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js'],
          });
          chrome.scripting.insertCSS({
            target: { tabId },
            files: ['content.css'],
          });
          window.close();
        };
      }
    });
  });
}); 