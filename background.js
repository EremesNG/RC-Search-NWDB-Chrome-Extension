var cssAlertify = "";
var cssAlertifyTheme = "";
var tabId;

function doSearch(urlItem, tab) {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['/alertify/alertify.min.js', '/alerts/alertOk.js']
	});

	chrome.tabs.create({
		url: urlItem,
		selected: true,
		index: tab.index + 1
	});
}

function selectionHandler(info, tab) {
	console.log(info);
	fetch('https://erc-search-nwdbinfo.onrender.com/' + info.selectionText).then(res => {
		console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data.url, tab);
			})
		} else {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['/alertify/alertify.min.js', '/alerts/alertError.js']
			});
		}
	}).catch(err => {
		console.log(err);
	})
}

async function resetContextMenus() {
	fetch("/alertify/alertify.min.css", { headers: { 'Content-Type': 'text/plain' } }).then(data => {
		data.text().then(jData => {
			cssAlertify = jData;
		})
	});
	fetch("/alertify/default.min.css", { headers: { 'Content-Type': 'text/plain' } }).then(data => {
		data.text().then(jData => {
			cssAlertifyTheme = jData;
		})
	});

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
		console.log(info);
		tabId = tab.id;

		if (info.menuItemId == "rcSearch") {

			insertCSS(tab.id);

			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['/alertify/alertify.min.js', '/alerts/alertStart.js']
			});

			selectionHandler(info, tab);
		}
	});
}

function insertCSS(tabIndex) {
	chrome.scripting.removeCSS({
		target: { tabId: tabIndex },
		css: cssAlertify
	});
	chrome.scripting.removeCSS({
		target: { tabId: tabIndex },
		css: cssAlertifyTheme
	});

	chrome.scripting.insertCSS({
		target: { tabId: tabIndex },
		css: cssAlertify
	});
	chrome.scripting.insertCSS({
		target: { tabId: tabIndex },
		css: cssAlertifyTheme
	});
}

resetContextMenus();