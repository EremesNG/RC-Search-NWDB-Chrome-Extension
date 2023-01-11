/* 
* ███████╗██████╗ ███████╗███╗   ███╗███████╗███████╗███╗   ██╗ ██████╗ 
* ██╔════╝██╔══██╗██╔════╝████╗ ████║██╔════╝██╔════╝████╗  ██║██╔════╝ 
* █████╗  ██████╔╝█████╗  ██╔████╔██║█████╗  ███████╗██╔██╗ ██║██║  ███╗
* ██╔══╝  ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝  ╚════██║██║╚██╗██║██║   ██║
* ███████╗██║  ██║███████╗██║ ╚═╝ ██║███████╗███████║██║ ╚████║╚██████╔╝
* ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝                                                                 
*/

const settings = {
    showresults: false,
    sourcedb: "NWINFO"
};

const settingsForm = document.getElementById("settingsForm");

async function init() {
    settingsForm.showresults.addEventListener("change", (event) => {
        settings.showresults = event.target.checked;
        checkForm();
        chrome.storage.sync.set({ settings });
    });
    settingsForm.nwguide.addEventListener("change", (event) => {
        settings.sourcedb = event.target.value;
        checkForm();
        chrome.storage.sync.set({ settings });
    });
    settingsForm.nwinfo.addEventListener("change", (event) => {
        settings.sourcedb = event.target.value;
        checkForm();
        chrome.storage.sync.set({ settings });
    });

    const data = await chrome.storage.sync.get("settings");
    Object.assign(settings, data.settings);
    settingsForm.showresults.checked = Boolean(settings.showresults);
    settingsForm.sourcedb = settings.sourcedb;
    checkForm();
}

function checkForm(){
    /* if (settings.sourcedb == "NWINFO") {
        settingsForm.showresults.disabled = true;
        settingsForm.showresults.checked = false
        settings.showresults = false;
    } else {
        settingsForm.showresults.disabled = false;
    } */
    
    switch (settings.sourcedb) {
        case "NWGUIDE":
            settingsForm.nwguide.checked = true;
            break;
        case "NWINFO":
            settingsForm.nwinfo.checked = true;
            break;
    }
}

init();