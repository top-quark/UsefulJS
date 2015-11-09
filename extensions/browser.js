/**
 * User agent sniffing
 * Author: Christopher Williams
 */

/**
 * Obtains name, engine and version information from the user agent
 * string, made available as properties of UsefulJS.Browser;
 * User may do with this information as she sees fit.
 * Properties:
 * name {String} - the browser name; informational only
 * version {String} - the version string (major.minor.build...)
 * major {Number} - the major version number
 * minor {Number} - the minor version number
 * engine {String} - the name of the rendering engine; may be
 *  one of gecko, webkit, trident, presto, msie or khtml
 * engineVersion {String} - the version of the rendering engine
 * engineMajor {Number} - the major version number of the engine
 * engineMinor {Number} - the minor version of the engine
 * mobile {Boolean} - a guess at whether the browser is a mobile version
 * All properties apart from name may be null
 */
UsefulJS.Browser = (function() {
    "use strict";
    /**
     * Add in the fixes for this module
     * Options are:
     *  _browser :
     *      identify : add classes to the documentElement to identify the
     *        engine and engine version (default false)
     */
    UsefulJS.fixes._browser = function(_u, optsIn, optsOut, all, none) {
        if (true === optsIn.identify || "all") {
            var docElement = document.documentElement;
            if (!docElement) {
                return;
            }
            var bInf = _u.Browser;
            var engClass = bInf.engine || "", verClass = "",
                verClassFull = "";
            if (!engClass) {
                return;
            }
            if (_u.defined(bInf.engineMajor) && engClass) {
                verClass = engClass + "-" + bInf.engineMajor;
                if (_u.defined(bInf.engineMinor)) {
                    verClassFull = verClass + "-" + bInf.engineMinor;
                }
            }
            // Add classes
            var cl = _u.ClassList.get(docElement);
            cl.add(engClass);
            if (verClass) {
                cl.add(verClass);
            }
            if (verClassFull) {
                cl.add(verClassFull);
            }
            optsOut.identify = true;
        }
    };

    var UA = navigator.userAgent;
    // Speed up searches by losing the useless "Mozilla/5.0"
    var ua = UA.replace(/^Mozilla\/5\.0\s/, "").toLowerCase();
    // Name, engine and regexes to get the versions
    var bName = null, bVer = null, bEngine = null, vRe, eRe;
    if (ua.indexOf("konqueror") >= 0) {
        // Try Konqueror first because it has "like Gecko" in its user agent
        // string and webkit browsers show "KHTML"
        bName = "Konqueror";
        vRe = /konqueror\/(\S+)/;
        if (ua.indexOf("khtml") >= 0) {
            bEngine = "khtml";
            eRe = /khtml\/([\d\.]+)/;
        }
    }
    else if (ua.indexOf("applewebkit") >= 0) {
        // Liable to also contain both "KHTML" and "like Gecko"
        bEngine = "webkit";
        eRe = /webkit\/([\d\.]+)/;
        if (ua.indexOf("opr") >= 0) {
            // Recent version of Opera (will also contain Chrome / Safari)
            bName = "Opera";
            vRe = /opr\/([\d\.]+)/;
        }
        else if (ua.indexOf("maxthon") >= 0) {
            // UA contains Chrome and Safari
            bName = "Maxthon";
            vRe = /maxthon\/([\d\.]+)/;
        }
        else if (ua.indexOf("chrome") >= 0) {
            // Chrome pretends to be Safari but not the other way round
            bName = "Chrome";
            vRe = /chrome\/([\d\.]+)/;
        }
        else if (ua.indexOf("safari") >= 0) {
            vRe = /version\/([\d\.]+)/;
            if (vRe.test(ua)) {
                if (ua.indexOf("android") >= 0) {
                    // Mobile Safari on Android? Not likely!
                    bName = "Android Browser";
                }
                else if (ua.indexOf("blackberry") >= 0) {
                    bName = "BlackBerry";
                }
                else {
                    // It probably is Safari
                    bName = "Safari";
                }
            }
            else {
                // Some webkit-based browser
                vRe = null;
            }
        }
    }
    else if (ua.indexOf("opera") >= 0 || window.opera) {
        // Opera could be configured to masquerade as both Gecko and IE so 
        // test for it before testing for those
        bName = "Opera";
        if (window.opera) {
            bVer = opera.version(); // How convenient!
        }
        else {
            vRe = /version\/([\d\.]+)/;
            if (ua.indexOf("version") < 0) {
                // Masqueraded user agent
                vRe = /opera ([\d\.]+)/;
            }
        }
        // Engine version available since 9.6; not available when
        // pretending to be Gecko or MSIE; however, since Presto engine
        // is now legacy, we'll not mind overmuch
        bEngine = "presto";
        if (ua.indexOf("presto") >= 0) {
            eRe = /presto\/([\d\.]+)/;
        }
    }
    else if (ua.indexOf("msie") >= 0 || ua.indexOf("trident") >= 0) {
        // IE has joined the "like Gecko" bandwagon so we need to check
        // it here.
        // Some obsolete browsers besides Opera identified themselves
        // as "compatible; MSIE X.x" (WebTV, for example); we are
        // unlikely ever to encounter one
        bName = "Internet Explorer";
        vRe = /msie ([\d\.]+)/;
        bEngine = "trident";
        eRe = /trident\/([\d\.]+)/;
        if (ua.indexOf("msie") < 0) {
            // Recent version using "rv:X.x"
            vRe = /rv:([\d\.]+)/;
        }
        // Engine only reported since IE 8; prime use case for browser
        // sniffing in the first place is to detect IE 7 (or even 6)
        // because we're forced to support it and cannot handle its
        // many shortcomings through feature detection alone; therefore
        // report engine as "msie" and engine version as browser version
        if (ua.indexOf("trident") < 0) {
            bEngine = "msie";
            eRe = vRe;
        }
    }
    else if (ua.indexOf("gecko") >= 0) {
        bEngine = "gecko";
        vRe = /firefox\/([\d\.]+)/;
        eRe = /rv:([\d\.]+)/;
        if (ua.indexOf("iceweasel") >= 0) {
            bName = "Iceweasel"; // Mustn't offend Debian folks!
            // To extract the version
            ua = ua.replace(/iceweasel/g, "firefox");
        }
        else if (ua.indexOf("camino") >= 0) {
            bName = "Camino";
            vRe = /camino\/([\d\.]+)/;
        }
        else if (ua.indexOf("firefox") >= 0) {
            bName = "Firefox";
        }
        else if (ua.indexOf("netscape") >= 0) {
            // Unlikely!
            bName = "Netscape";
            vRe = /netscape\/(\S+)$/; // 7.0 and up
        }
        else {
            // One of many Gecko-based browsers
            vRe = null;
        }
    }
    // Should have detected >99% of the browsers that we may encounter
    // (Lynx? no JavaScript!); now extract versions and set properties
    var bMajor = null, bMinor = null, eVer = null, 
        eMajor = null, eMinor = null, n, parts;
    if (vRe) {
        n = ua.match(vRe);
        if (n) {
            bVer = n[1];
        }
    }
    if (eRe) {
        n = ua.match(eRe);
        if (n) {
            eVer = n[1];
        }
    }
    if (bVer) {
        parts = bVer.split(".");
        bMajor = parseInt(parts.shift(), 10);
        if (parts.length) {
            bMinor = parseInt(parts.shift(), 10);
        }
    }
    if (eVer) {
        parts = eVer.split(".");
        eMajor = parseInt(parts.shift(), 10);
        if (parts.length) {
            eMinor = parseInt(parts.shift(), 10);
        }
    }
    return {
        name : bName || UA,
        version : bVer,
        major : bMajor,
        minor : bMinor,
        engine : bEngine,
        engineVersion : eVer,
        engineMajor : eMajor,
        engineMinor : eMinor,
        // If the agent string contains "mobi" or "opera mini", it's a
        // reasonable bet that it's a mobile browser
        mobile : (ua.indexOf("mobi") >= 0 ||
            ua.indexOf("opera mini") >= 0)
    };
})();

