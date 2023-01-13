/* 
* ███████╗██████╗ ███████╗███╗   ███╗███████╗███████╗███╗   ██╗ ██████╗ 
* ██╔════╝██╔══██╗██╔════╝████╗ ████║██╔════╝██╔════╝████╗  ██║██╔════╝ 
* █████╗  ██████╔╝█████╗  ██╔████╔██║█████╗  ███████╗██╔██╗ ██║██║  ███╗
* ██╔══╝  ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝  ╚════██║██║╚██╗██║██║   ██║
* ███████╗██║  ██║███████╗██║ ╚═╝ ██║███████╗███████║██║ ╚████║╚██████╔╝
* ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝                                                                 
*/

var cssAlertify = null;
var cssAlertifyTheme = null;

async function doSearch(itemsData, tab) {
	chrome.storage.local.set({ itemsData });
	
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['./alertify/alertify.min.js'],
		injectImmediately: true
	}, () => {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: () => {
				alertify.showRcResults || alertify.dialog('showRcResults', function () {
					var iframe;
					return {
						main: function (uriResults) {
							return this.set({
								'uriResults': uriResults
							});
						},
						// we only want to override two options (padding and overflow).
						setup: function () {
							return {
								options: {
									//disable both padding and overflow control.
									padding: !1,
									overflow: !1,
								}
							};
						},
						build: function () {
							// create the iframe element
							iframe = document.createElement('iframe');
							iframe.frameBorder = "no";
							iframe.width = "100%";
							iframe.height = "100%";
							// add it to the dialog
							this.elements.content.appendChild(iframe);

							//give the dialog initial height (half the screen height).
							this.elements.body.style.minHeight = screen.height * .5 + 'px';
						},
						// dialog custom settings
						settings: {
							uriResults: undefined
						},
						// listen and respond to changes in dialog settings.
						settingUpdated: function (key, oldValue, newValue) {
							switch (key) {
								case 'uriResults':
									iframe.src = newValue;
									break;
							}
						},
						// listen to internal dialog events.
						hooks: {
							// triggered when a dialog option gets update.
							// warning! this will not be triggered for settings updates.
							onupdate: function (option, oldValue, newValue) {
								switch (option) {
									case 'resizable':
										if (newValue) {
											this.elements.content.removeAttribute('style');
											iframe && iframe.removeAttribute('style');
										} else {
											this.elements.content.style.minHeight = 'inherit';
											iframe && (iframe.style.minHeight = 'inherit');
										}
										break;
								}
							}
						}
					};
				});
				//show the dialog
				alertify.showRcResults().set({ frameless: true, 'startMaximized': true });
				alertify.showRcResults(chrome.runtime.getURL("/results/index.html")).set({ onclose: () => { chrome.runtime.sendMessage("rcSearchPopClosed"); document.querySelectorAll(".alertify").forEach(el => el.remove()); }});
			}
		});
	});

}

async function rcSearchHandler(info, tab) {
	let sourcedbUri = "https://api.catrinagames.com/NW/searchdb/"
	insertCSS(tab.id, ["/alertify/alertify.min.css", "/alertify/default.min.css", "/popup/css/rcNWSearch.css"]);

	fetch(sourcedbUri + encodeURIComponent(info.selectionText)).then(res => {
		//console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data, tab);
			});
		}
		else if (res.status == 404) {
		}
		else {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['./alertify/alertify.min.js'],
				injectImmediately: true
			}, () => {
				chrome.scripting.executeScript({
					target: { tabId: tab.id },
					func: () => {
						alertify.set('notifier', 'position', 'bottom-center'); alertify.error('Search failed, please try later...');
					}
				});
			}
			);
		}
	}).catch(err => {
		console.log(err);
	})
}

/* async function rcSearchNWINFOHandler(info, tab) {
	let sourcedbUri = "https://api.catrinagames.com/NW/search/"
	
	fetch(sourcedbUri + info.selectionText).then(res => {
		//console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data, tab);
			})
		}
		else if (res.status == 404) {
		}
		else {
		}
	}).catch(err => {
		console.log(err);
	})
} */

/* async function rcSearchNWGUIDEHandler(info, tab) {
	let sourcedbUri = "https://api.catrinagames.com/NW/searchguide/";

	fetch(sourcedbUri + info.selectionText).then(res => {
		//console.log(res);
		if (res.status == 200) {
			res.json().then(data => {
				doSearch(data, tab);
			})
		}
		else if (res.status == 404) {
		}
		else {
		}
	}).catch(err => {
		console.log(err);
	})
} */

async function resetContextMenus() {
	chrome.runtime.onConnect.addListener(port => {
		if (port.name === 'keepRcSearchAlive') {
			setTimeout(() => port.disconnect(), 250e3);
			port.onDisconnect.addListener(() => findTab());
		}
	});

	findTab();

	contextMenuInit();
}

function contextMenuInit(){
	chrome.contextMenus.removeAll(
		function () {
			chrome.contextMenus.create({
				id: "rcSearchMain",
				title: "Search for '%s' in NWDB",
				contexts: ["selection"]
			});
/* 			chrome.contextMenus.create({
				id: "rcSearchNWINFO",
				title: "NWDB.info",
				contexts: ["selection"],
				parentId: "rcSearchMain"
			});
			chrome.contextMenus.create({
				id: "rcSearchNWGUIDE",
				title: "New-World.guide",
				contexts: ["selection"],
				parentId: "rcSearchMain"
			}); */
		}
	);

	chrome.contextMenus.onClicked.addListener(function (info, tab) {
		if (info.menuItemId == "rcSearchMain") {
			rcSearchHandler(info, tab);
		}
		/* if (info.menuItemId == "rcSearchNWINFO") {
			rcSearchNWINFOHandler(info, tab);
		}
		if (info.menuItemId == "rcSearchNWGUIDE") {
			rcSearchNWGUIDEHandler(info, tab);
		} */
		
	});

	chrome.runtime.onMessage.addListener((msg, sender) => {
		if (msg == "rcSearchPopClosed"){
			if (sender.tab){
				removeCSS(sender.tab.id, ["/alertify/alertify.min.css", "/alertify/default.min.css", "/popup/css/rcNWSearch.css"]);
			}
		}
	})
}

function insertCSS(tabIndex, files) {
	chrome.scripting.insertCSS({
		target: { tabId: tabIndex },
		files: files
	});
}

function removeCSS(tabIndex, files) {
	chrome.scripting.removeCSS({
		target: { tabId: tabIndex },
		files: files
	});
}

resetContextMenus();


// KEEP ALIVE
const onUpdate = (info, tab) => /^https?:/.test(info.url) && findTab([tab]);
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