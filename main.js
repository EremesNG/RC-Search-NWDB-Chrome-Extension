function doSearch (urlItem, tab)
{
	chrome.tabs.create( {
		url : urlItem,
		selected : true,
		index : tab.index + 1
	} );
}

function selectionHandler (info, tab)
{
	console.log(info);
	fetch('https://erc-search-nwdbinfo.onrender.com/' + info.selectionText).then(res => {
		console.log(res);
		if(res.status == 200){
			res.json().then(data => {
				doSearch( data.url, tab );
			})
		}
	}).catch(err => {
		console.log(err);
	})
}

function resetContextMenus ()
{
    chrome.contextMenus.removeAll(
	function()
	{
	    var id = chrome.contextMenus.create( {
			id: "rcSearch",
		    title: "Search NWDB for '%s'",
		    contexts: [ "selection" ]
	    } ); 
	}
    );

	chrome.contextMenus.onClicked.addListener(function(info, tab) {
		console.log(info);
		if (info.menuItemId == "rcSearch") {
			selectionHandler(info, tab);
		}
	});
}

resetContextMenus();