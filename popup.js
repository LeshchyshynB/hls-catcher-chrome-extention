const toggleBtn = document.getElementById("toggle");
const clearBtn = document.getElementById("clear");
const streamsDiv = document.getElementById("streams");

function getStorage(keys) { return new Promise(r => chrome.storage.local.get(keys, r)) }
function setStorage(data) { return new Promise(r => chrome.storage.local.set(data, r)) }
function copy(text, indicator) {
	navigator.clipboard.writeText(text);
	if (indicator) {
		indicator.classList.add("show");
		setTimeout(() => indicator.classList.remove("show"), 1500);
	}
}

async function updateToggle() {
	const { enabled = false } = await getStorage(["enabled"]);
	toggleBtn.textContent = enabled ? "Disable" : "Enable";
}

toggleBtn.onclick = async () => {
	const { enabled = false } = await getStorage(["enabled"]);
	await setStorage({ enabled: !enabled });
	updateToggle();
}

clearBtn.onclick = async () => {
	await setStorage({ streams: [] });
	chrome.runtime.sendMessage("clearStreams");
	renderStreams();
}

function createStreamElement(url, template) {
	const div = document.createElement("div");
	div.className = "stream";
	const urlBox = document.createElement("div");
	urlBox.className = "url"; urlBox.textContent = url;
	const cmd = template.replace("{url}", url);
	const cmdBox = document.createElement("div"); cmdBox.className = "command"; cmdBox.textContent = cmd;

	const actions = document.createElement("div"); actions.className = "actions";
	const indicator = document.createElement("div"); indicator.className = "copy-indicator"; indicator.textContent = "Copied";

	const copyUrl = document.createElement("button"); copyUrl.textContent = "Copy URL"; copyUrl.onclick = () => copy(url, indicator);
	const copyCmd = document.createElement("button"); copyCmd.textContent = "Copy ffmpeg"; copyCmd.onclick = () => copy(cmd, indicator);

	actions.append(copyUrl, copyCmd, indicator);
	div.append(urlBox, cmdBox, actions);
	return div;
}

async function renderStreams() {
	const { streams = [], cmdTemplate } = await getStorage(["streams", "cmdTemplate"]);
	streamsDiv.innerHTML = "";
	const template = cmdTemplate || 'ffmpeg -user_agent "Mozilla/5.0" -i "{url}" -c copy video.mp4';
	streams.forEach(url => streamsDiv.appendChild(createStreamElement(url, template)));
}

async function init() {
	await updateToggle();
	await renderStreams();
}

init();