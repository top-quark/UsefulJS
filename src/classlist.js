/**
 * ClassList support
 * Author: Christopher Williams
 */
UsefulJS.ClassList = (function() {
    "use strict";

    var nativeSupport = (document && ("classList" in document.documentElement)),
        supported = nativeSupport,
        settable = (nativeSupport && ("value" in document.documentElement.classList));
    // Can we create getters?
    var _O = Object, _u = UsefulJS, __typ = _u._typeof,
        _getters = _u.featureSupport.defineProperty;

    /**
     * Add in the fixes for this module
     * Options are:
     *  _classList:
     *      classList whether to add a "classList" property to the Element
     *          class prototype (default true)
     */
    UsefulJS.fixes._classList = function(_u, optsIn, optsOut) {
        if (!(supported || false === optsIn.classList) &&
            _O.defineProperty) {
            var cl = window.Element || window.HTMLElement;
            if (cl) {
                // Try and add classList support to (HTML)Element (conigurable
                // and enumerable properties are the valid value combination
                // for an "accessor" property in IE8)
                var descriptor = {
                    enumerable : false,
                    configurable : true,
                    get : function() {
                        return new _u.ClassList(this);
                    }
                };
                try {
                    _O.defineProperty(cl.prototype, "classList", descriptor);
                    optsOut.classList = true;
                    var _s = _u.featureSupport.classList;
                    _s.supported = true;
                    // Does our classList implementation also implement
                    // DOMSettableTokenList?
                    _s.settable = _u.ClassList.settable || false;
                }
                catch(e) {
                    // Nope!
                }
            }
        }
    };

    // Add in numeric properties so that DOMTokenList supports [] indexing
    var _nProps = function(cL) {
        var a = cL._a, n = a.length, np, i;
        for (i = 0; i < n; i++) {
            np = i.toString();
            cL[np] = a[i];
        }
        // Get rid of any properties left over
        for (i = n; ; i++) {
            np = i.toString();
            if (undefined === cL[np]) {
                break;
            }
            delete(cL[np]);
        }
    };
    // Create a class that implements the DOMTokenList interface
    var DOMTokenList = function(obj, propName, sep) {
        if (!_u.defined(obj)) {
            throw new TypeError("Object expected");
        }
        if (!propName) {
            // Assume that we're managing a className
            propName = "className";
        }
        else {
            propName = String(propName);
        }
        // Cross-browser support: wrap Array rather than subclass
        this._a = [];
        this._current = "";
        if (sep) {
            this._sep = String(sep);
        }
        else {
            this._sep = " ";
        }
        this._sep = sep || " ";
        // Initialize the list from the property of the object
        this._init(obj[propName] || "");
        // Closures to capture the object whose property we're manipulating
        this._apply = function() {
            obj[propName] = this._current = this._a.join(this._sep);
            _nProps(this);
        };
        // Return the property value
        this.toString = function() {
            return obj[propName];
        };
        // Track changes to the object property
        this._check = function() {
            if (obj[propName] !== this._current) {
                this._init(obj[propName] || "");
            }
        };
        if (!_getters) {
            this.length = 0;
        }
    };

    DOMTokenList.prototype = {
        // Don't assume lastIndexOf in Array.prototype
        _lastIndexOf : function(item, start) {
            if (!_u.defined(start)) {
                start = this.length - 1;
            }
            for (var i = start; i >= 0; i--) {
                if (this._a[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        // Worker function for manipulating the token list
        _manip : function(name, op, force) {
            if (!name || _u.RE_WS.test(name)) {
                // The spec says to raise an exception, but what the heck
                return false;
            }
            var idx = this._lastIndexOf(name);
            if (-1 === idx) {
                // false value for toggle force parameter means "remove
                // but don't add"
                if (op === "add" || (op === "toggle" && force !== false)) {
                    this._a.push(name);
                    if (!_getters) {
                        ++this.length;
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            if ("add" === op || ("toggle" === op && force === true)) {
                // Token that already exists; true value for force
                // parameter to toggle means "add but don't remove"
                return false;
            }
            // Remove all instances of the token
            while (idx >= 0) {
                this._a.splice(idx, 1);
                if (!_getters) {
                    --this.length;
                }
                idx = this._lastIndexOf(name, idx - 1);
            }
            return true;
        },
        // Gets the item at the specified index
        item : function(i) { 
            this._check();
            // Specification requires null for a non-existent value rather
            // than undefined
            return this._a[i] || null; 
        },
        // Returns true if the token list contains specified token
        contains : function(tok) {
            this._check();
            return (this._lastIndexOf(tok) >= 0); 
        },
        // Adds one or more tokens to the token list
        add : function() {
            this._check();
            var updated = false;
            for (var i = 0; i < arguments.length; i++) {
                if (this._manip(arguments[i], "add")) {
                    updated = true;
                }
            }
            if (updated) {
                this._apply();
            }
        },
        // Removes one or more tokens
        remove : function() {
            this._check();
            var updated = false;
            for (var i = 0; i < arguments.length; i++) {
                if (this._manip(arguments[i], "remove")) {
                    updated = true;
                }
            }
            if (updated) {
                this._apply();
            }
        },
        // Toggles the token - add if it does not exist and return true,
        // otherwise remove and return false
        toggle : function(tok, force) {
            this._check();
            var oLen = this.length,
                updated = this._manip(tok, "toggle", force);
            if (updated) {
                this._apply();
            }
            // Did we add something?
            if (force === true) {
                // If force is true, return true when the property
                // is unmodified
                return (this.length >= oLen);
            }
            return (this.length > oLen);
        },
        // Initialization from the managed object's property value
        _init : function(str) {
            var tokens = str.split(this._sep), i, n = tokens.length;
            this._a.length = 0;
            for (i = 0; i < n; i++) {
                if (tokens[i]) {
                    this._a.push(tokens[i]);
                }
            }
            this._current = this._a.join(this._sep);
            if (!_getters) {
                this.length = this._a.length;
            }
            _nProps(this);
        }
    };

    // Implement DOMSettableTokenList interface if possible
    if (_u.featureSupport.defineProperty) {
        var descriptor = {
            get : function() { return this.toString(); },
            set : function(str) {
                this._init(str);
                this._apply();
                return this.toString();
            }
        }, classObj = DOMTokenList, protoObj = classObj.prototype;
        _O.defineProperty(protoObj, "value", descriptor);
        // Record whether the class supports setting via its value
        _O.defineProperty(classObj, "settable", { value : true });
        // Implement read-only length property
        _O.defineProperty(protoObj, "length", {
            get : function() { return this._a.length; }
        });
    }

    /**
     * Support for classList in this browser:
     *  - native : native support
     *  - supported : supported (via the fix if native is false)
     *  - settable : classList implements DOMSettableTokenList interface
     */
    _u.featureSupport.classList = {
        nativeSupport : nativeSupport,
        supported : supported,
        settable : settable
    };

    /**
     * Gets a DOMTokenList object for an element
     * @param elem {Element} The element of interest
     * @return {DOMTokenList} either the classList value of the element
     *  if the browser supports it or an instance of
     *  UsefulJS.ClassList if it doesn't
     */
    DOMTokenList.get = function(elem) {
        var t = __typ(elem);
        if ("string" === __typ(elem)) {
            elem = document.getElementById(elem);
            t = __typ(elem);
        }
        if ("element" !== t) {
            return null;
        }
        if ("classList" in elem) {
            return elem.classList;
        }
        return new DOMTokenList(elem);
    };

    return DOMTokenList;

})();

