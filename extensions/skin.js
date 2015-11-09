/**
 * Alternate stylesheet support
 * Author: Christopher Williams
 */
 
UsefulJS.Skin = (function() {
    "use strict";
    var _known = {}, _current = null;

    var _choose = function(linkElements, skin) {
        linkElements.forEach(function(linkElem) {
            // Note: necessary to explicitly disable an alternate sylesheet
            // and then explicitly enable it for the right thing to happen on page load
            linkElem.disabled = true;
            if (skin === linkElem.title) {
                linkElem.disabled = false;
                _current = skin;
            }
        });
    };
    
    var _find = function() {
        var linkElements = [], kids = document.head.childNodes, i, elem;
        for (i = 0; i < kids.length; i++) {
            if (1 !== kids[i].nodeType) {
                continue;
            }
            elem = kids[i];
            if (("LINK" === elem.nodeName && elem.rel && elem.rel.indexOf("style") >= 0 && elem.title) ||
                ("STYLE" === elem.nodeName && elem.title)) {
                linkElements.push(elem);    
            }
        }
        return linkElements;
    };

    return {
        /**
         * Loads the selectable stylesheets
         * @param active {String} the active stylesheet; may be null
         * @return {Array} the choices available
         */
        load : function(active) {
            var linkElements = _find(), ret = [], first = null;
            _known = {};
            // Add in 
            linkElements.forEach(function(linkElem) {
                var sheetName = linkElem.title;
                _known[sheetName] = 1;
                if (!(first || linkElem.disabled)) {
                    // This is the one that will be used unless overridden
                    first = sheetName;
                }
                ret.push(sheetName);
            });
            if (active && _known[active] && active !== first) {
                _choose(linkElements, active);
            }
            else {
                _current = first;
            }
            return ret;
        },
        
        /**
         * Gets the active stylesheet
         */
        active : function() {
            return _current;
        },
        
        /**
         * Selects the active skin
         * @param active {String} the active stylesheet
         */
        choose : function(active) {
            if (_known[active] && active !== _current) {
                _choose(_find(), active);
            }
        }
    };
})();