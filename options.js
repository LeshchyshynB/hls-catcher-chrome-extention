const input=document.getElementById("template");
const defaultTemplate='ffmpeg -user_agent "Mozilla/5.0" -i "{url}" -c copy video.mp4';

chrome.storage.local.get(["cmdTemplate"],data=>{ input.value=data.cmdTemplate||defaultTemplate });
document.getElementById("save").onclick=()=>{ chrome.storage.local.set({cmdTemplate:input.value}) };