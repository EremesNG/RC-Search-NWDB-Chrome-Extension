alertify.rcShowResults || alertify.dialog('rcShowResults', function () {
    var iframe;
    return {
        // dialog constructor function
        main: function () {
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
        // This will be called once the DOM is ready and will never be invoked again.
        // Here we create the iframe to embed the video.
        build: function () {
            // create the iframe element
            iframe = document.createElement('iframe');
            iframe.frameBorder = "no";
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.src = chrome.runtime.getURL("/results/index.html");
            // add it to the dialog
            this.elements.content.appendChild(iframe);

            //give the dialog initial height (half the screen height).
            this.elements.body.style.minHeight = screen.height * .5 + 'px';
        }
    };
});