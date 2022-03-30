const DynamicJS = {
    loadScript: function (srcURL, callbackFn) {
        let newScript = document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src = srcURL;
        // most browsers
        newScript.onload = callbackFn;
        // IE 6 & 7
        newScript.onreadystatechange = function () {
            if (this.readyState === "loaded" || this.readyState === "complete") {
                callbackFn();
            }
        };
        document.getElementsByTagName("head")[0].appendChild(newScript);
    },

    removeScript: function (srcURL) {
        $("head script[src='" + srcURL + "']").remove();
    }
};