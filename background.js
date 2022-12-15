var cssAlertify = null;
var cssAlertifyTheme = null;
var tabId;

function doSearch(urlItem, tab) {
	exeScript(tab.id, ['/alertify/alertify.min.js', '/alerts/alertOk.js']);

	chrome.tabs.create({
		url: urlItem,
		selected: true,
		index: tab.index + 1
	});
}

function selectionHandler(info, tab) {
	//console.log(info);
	exeScript(tab.id, ['/alertify/alertify.min.js', '/alerts/alertStart.js']);
	
	fetch('https://api.catrinagames.com/NW/rc/' + info.selectionText).then(res => {
		//console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data.url, tab);
			})
		}
		else if (res.status == 404) {
			exeScript(tab.id, ['/alertify/alertify.min.js', '/alerts/alertNotFound.js']);
		}
		else {
			exeScript(tab.id, ['/alertify/alertify.min.js', '/alerts/alertError.js']);
		}
	}).catch(err => {
		console.log(err);
	})
}

async function resetContextMenus() {
	if(cssAlertify == null || cssAlertifyTheme == null){
		fetch("/alertify/alertify.min.css", { headers: { 'Content-Type': 'text/plain' } }).then(data => {
			data.text().then(jData => {
				cssAlertify = jData;

				fetch("/alertify/default.min.css", { headers: { 'Content-Type': 'text/plain' } }).then(data => {
					data.text().then(jData => {
						cssAlertifyTheme = jData;

						contextMenuInit();
					})
				});
			})
		});
	}else{
		contextMenuInit();
	}
}

function contextMenuInit(){
	chrome.contextMenus.removeAll(
		function () {
			chrome.contextMenus.create({
				id: "rcSearch",
				title: "Search NWDB for '%s'",
				contexts: ["selection"]
			});
		}
	);

	chrome.contextMenus.onClicked.addListener(function (info, tab) {
		//console.log(info);
		tabId = tab.id;

		if (info.menuItemId == "rcSearch") {

			insertCSS(tab.id, cssAlertify);
			insertCSS(tab.id, cssAlertifyTheme);
			selectionHandler(info, tab);
		}
	});
}

function insertCSS(tabIndex, css) {
	chrome.scripting.removeCSS({
		target: { tabId: tabIndex },
		css: css
	});
	chrome.scripting.insertCSS({
		target: { tabId: tabIndex },
		css: css
	});
}

function exeScript(tabid, arrayScripts) {
	chrome.scripting.executeScript({
		target: { tabId: tabid },
		files: arrayScripts
	});
}

resetContextMenus();