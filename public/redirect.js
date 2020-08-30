function detectBrowser() {
    var realIEVersion = "IE11";
    // 判断真实的IE版本
    if (!!window.MSInputMethodContext && !!document.documentMode) {
        realIEVersion = "IE11";
    } else {
        /*@cc_on                        
                @if (@_jscript_version == 11)
                    realIEVersion = "IE11";
                @elif (@_jscript_version == 10)
                    realIEVersion = "IE10";
                @elif (@_jscript_version == 9)
                    realIEVersion = "IE9";
                @elif (@_jscript_version == 5.8)
                    realIEVersion = "IE8";
                @elif (@_jscript_version == 5.7 && window.XMLHttpRequest)
                    realIEVersion = "IE7";
                @elif (@_jscript_version == 5.6 || (@_jscript_version == 5.7 && !window.XMLHttpRequest))
                    realIEVersion = "IE6";
                @end
            @*/
    }

    if (realIEVersion === "IE10" || realIEVersion === "IE9" || realIEVersion === "IE8" || realIEVersion === "IE7" || realIEVersion === "IE6") {
        window.location = "./redirect.html";
    }
    if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
        window.location = "./redirect.html";
    }
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        window.location = "./redirect.html";
    }
    if (!!window.opera || navigator.userAgent.toLowerCase().indexOf("opr/") > -1) {
        window.location = "./redirect.html";
    }
}
detectBrowser();