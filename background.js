var cssAlertify = null;
var cssAlertifyTheme = null;
var tabId;

async function doSearch(itemsData, tab) {
	chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: () => { alertify.set('notifier', 'position', 'bottom-center'); alertify.success('Item found'); }
	});

	let settings = {};
	const data = await chrome.storage.sync.get("settings");
	Object.assign(settings, data.settings);
	if(Boolean(settings.showresults)){
		chrome.storage.local.set({itemsData});

		chrome.scripting.executeScript({
			target: { tabId: tabId },
			func: () => {
				chrome.storage.local.get("itemsData").then((res) => {
					let resultsDiv = document.createElement('div');
					resultsDiv.className = "bootstrap-iso rcsearchResults";

					var itemsUl = document.createElement('ul');
					itemsUl.className = "list-unstyled";

					for (const item of res.itemsData) {
						let itemLi = document.createElement('li');
						itemLi.className = "media d-flex align-items-center rcsearchItemLi";

						let itemA = document.createElement('a');
						itemA.href = item.url;
						itemA.target = "_blank";

						let itemImgDiv = document.createElement('div');
						itemImgDiv.className = "align-self-start mr-3 rcsearchItemImg";
						itemImgDiv.innerHTML = `<img src="${item.icon ? item.icon : "https://cdn.nwdb.info/static/images/brand/logo_transparent_48.png"}" width="64" height="64" alt="${item.name}">`;

						itemLi.appendChild(itemImgDiv);

						let itemBody = document.createElement('div');
						itemBody.className = "media-body";

						let itemName = document.createElement('h6');
						itemName.className = "mt-0 rcsearchItemName";
						itemName.textContent = item.name;

						itemBody.appendChild(itemName);

						for (const tag of item.tags) {
							let itemTag = document.createElement('span');
							itemTag.className = "badge badge-primary badge-pill rcsearchItemTag";
							itemTag.textContent = tag;
							itemBody.appendChild(itemTag);
						}

						let itemTypeTag = document.createElement('span');
						itemTypeTag.className = "badge badge-primary badge-pill rcsearchItemTag";
						itemTypeTag.textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);
						itemBody.appendChild(itemTypeTag);

						itemLi.appendChild(itemBody);
						itemA.appendChild(itemLi);
						itemsUl.appendChild(itemA);
					}

					resultsDiv.appendChild(itemsUl);

					var pre = document.createElement('pre');
					//custom style.
					pre.style.maxHeight = "400px";
					pre.style.margin = "0";
					pre.style.padding = "24px";
					pre.style.whiteSpace = "pre-wrap";
					pre.style.textAlign = "justify";
					pre.appendChild(resultsDiv);


					//show as confirm
					alertify.alert("Results", pre, function () {
					}).settings({'label': ''});
					/* alertify.confirm('Confirm Title', 'Confirm Message', function () { alertify.success('Ok') }
						, function () { alertify.error('Cancel') }); */
				});
			}
		});
	}else{
		chrome.tabs.create({
			url: itemsData[0].url,
			selected: true,
			index: tab.index + 1
		});
	}
}

function selectionHandler(info, tab) {
	chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: () => { alertify.set('notifier', 'position', 'bottom-center'); alertify.notify('Searching...'); }
	});
	
	fetch('https://api.catrinagames.com/NW/searchguide/' + info.selectionText).then(res => {
		//console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data, tab);
			})
		}
		else if (res.status == 404) {
			chrome.scripting.executeScript({
				target: { tabId: tabId },
				func: () => { alertify.set('notifier', 'position', 'bottom-center'); alertify.warning('No results found.'); }
			});
		}
		else {
			chrome.scripting.executeScript({
				target: { tabId: tabId },
				func: () => { alertify.set('notifier', 'position', 'bottom-center'); alertify.error('Search failed, please try again...'); }
			});
		}
	}).catch(err => {
		console.log(err);
	})
}

async function resetContextMenus() {
	chrome.runtime.onConnect.addListener(port => {
		if (port.name === 'keepRcSearchAlive') {
			setTimeout(() => port.disconnect(), 250e3);
			port.onDisconnect.addListener(() => findTab());
		}
	});

	chrome.tabs.onUpdated.addListener((tabid, changeInfo, tab) => {
		findTab();
	});

	contextMenuInit();
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

resetContextMenus();
findTab();


// KEEP ALIVE
const onUpdate = (tabId, info, tab) => /^https?:/.test(info.url) && findTab([tab]);
async function findTab(tabs) {
	if (chrome.runtime.lastError) { /* tab was closed before setTimeout ran */ }
	for (const { id: tabId } of tabs || await chrome.tabs.query({ url: '*://*/*' })) {
		try {
			await chrome.scripting.executeScript({ target: { tabId }, func: connect });
			chrome.tabs.onUpdated.removeListener(onUpdate);
			return;
		} catch (e) { }
	}
	chrome.tabs.onUpdated.addListener(onUpdate);
}
function connect() {
	chrome.runtime.connect({ name: 'keepRcSearchAlive' })
		.onDisconnect.addListener(connect);
}