const settings = {};
const settingsForm = document.getElementById("settingsForm");

async function init() {
    settingsForm.showresults.addEventListener("change", (event) => {
        settings.showresults = event.target.checked;
        chrome.storage.sync.set({ settings });
    });

    const data = await chrome.storage.sync.get("settings");
    Object.assign(settings, data.settings);
    settingsForm.showresults.checked = Boolean(settings.showresults);
}

init();