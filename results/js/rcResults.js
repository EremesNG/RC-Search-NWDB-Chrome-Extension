/* 
* ███████╗██████╗ ███████╗███╗   ███╗███████╗███████╗███╗   ██╗ ██████╗ 
* ██╔════╝██╔══██╗██╔════╝████╗ ████║██╔════╝██╔════╝████╗  ██║██╔════╝ 
* █████╗  ██████╔╝█████╗  ██╔████╔██║█████╗  ███████╗██╔██╗ ██║██║  ███╗
* ██╔══╝  ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝  ╚════██║██║╚██╗██║██║   ██║
* ███████╗██║  ██║███████╗██║ ╚═╝ ██║███████╗███████║██║ ╚████║╚██████╔╝
* ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝                                                                 
*/

chrome.storage.local.get("itemsData").then((res) => {
    let resultsContent = document.getElementById("resultsContent");

    let resultsDiv = document.createElement('div');
    resultsDiv.className = "rcsearchResults container-fluid";

    var itemsUl = document.createElement('ul');
    itemsUl.className = "list-unstyled";

    for (const item of res.itemsData) {
        let itemLi = document.createElement('li');
        itemLi.className = "row media d-flex rcsearchItemLi";

        let aTagsDiv = document.createElement('div');
        aTagsDiv.className = "rcsearchItemSources col-12 col-md-3";

        for(const uri of item.uris){
            let aTag = document.createElement('a');
            aTag.href = uri.url;
            aTag.target = "_blank";
            aTag.className = "btn btn-outline-warning col-6 col-md-12";
            aTag.textContent = uri.name;

            let aTagIcon = document.createElement('i');
            aTagIcon.className = "fa-solid fa-arrow-up-right-from-square";

            aTag.appendChild(aTagIcon);
            aTagsDiv.appendChild(aTag);
        }

        let itemImgDiv = document.createElement('div');
        itemImgDiv.className = "align-self-start rcsearchItemImg col-2 col-md-1";
        itemImgDiv.innerHTML = `<img src="${item.icon ? item.icon : "https://nwdb.info/images/db/soon.png"}" width="64" height="64" alt="${item.name}">`;

        itemLi.appendChild(itemImgDiv);

        let itemBody = document.createElement('div');
        itemBody.className = "media-body col-10 col-md-8";

        let itemName = document.createElement('h5');
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
        itemLi.appendChild(aTagsDiv);
        itemsUl.appendChild(itemLi);
    }

    resultsDiv.appendChild(itemsUl);

    var pre = document.createElement('pre');
    //custom style.
    pre.style.maxHeight = "100%";
    pre.style.margin = "0";
    pre.style.padding = "24px";
    pre.style.whiteSpace = "pre-wrap";
    pre.style.textAlign = "justify";
    pre.appendChild(resultsDiv);

    resultsContent.innerHTML = "";
    resultsContent.appendChild(pre);

    //show as confirm
    /* alertify.alert("Results", pre, function () {
    }).settings({ 'label': '' }); */
    /* alertify.confirm('Confirm Title', 'Confirm Message', function () { alertify.success('Ok') }
        , function () { alertify.error('Cancel') }); */
});