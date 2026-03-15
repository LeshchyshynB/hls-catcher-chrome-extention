let enabled = false;
let streams = [];

function loadState() {
	chrome.storage.local.get(["enabled", "streams"], data => {
		enabled = data.enabled || false;
		streams = data.streams || [];
		updateBadge();
	});
}

function saveStreams() {
	chrome.storage.local.set({ streams: streams }, updateBadge);
}

function isMaster(url) {
	return url.includes("master") || url.includes("playlist") || url.includes("index");
}

function updateBadge() {
	chrome.action.setBadgeText({ text: streams.length ? streams.length.toString() : "" });
	chrome.action.setBadgeBackgroundColor({ color: "#7a3cff" });
}

loadState();

chrome.storage.onChanged.addListener(changes => {
	if (changes.enabled) enabled = changes.enabled.newValue;
});

chrome.runtime.onMessage.addListener(msg => {
	if (msg === "clearStreams") {
		streams = [];
		saveStreams();
	}
});

chrome.webRequest.onBeforeRequest.addListener(
	details => {
		if (!enabled) return;

		const url = details.url;
		if (!url.includes(".m3u8") || !isMaster(url)) return;
		if (streams.includes(url)) return;

		streams.push(url);
		saveStreams();
	},
	{ urls: ["<all_urls>"] }
);