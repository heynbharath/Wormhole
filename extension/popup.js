document.getElementById("openErpBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ums.mydsi.org" });
});
