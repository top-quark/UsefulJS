
// DOMStorage interface to document.cookie
UsefulJS.Storage = (function() {
    "use strict";
    var _u = UsefulJS, __typ = _u._typeof;

    // Can we create getters?
    var _getters = _u.featureSupport.defineProperty;

    // Constructs the part of a cookie that comes after the name=value bit
    var _initCookie = function(propsIn, propsOut) {
        var cProps = {
            lifetime : 365,
            path : "",
            domain : "",
            secure : false
        }, p;
        for (p in propsIn) {
            if (cProps.hasOwnProperty(p) && 
                __typ(propsIn[p] === __typ(cProps[p]))) {
                cProps[p] = propsIn[p];
            }
        }
        cProps.attributes = _cookieAttributes(cProps);
        _u.mix(propsOut, cProps, true);
    };

    var _cookieAttributes = function(cProps) {
        var cAttrs = [];
        if (cProps.lifetime) {
            // Construct an "expires" string
            var d = new Date();
            d.setTime(d.getTime() + cProps.lifetime * 86400000);
            cAttrs.push("expires=" + d.toUTCString());
        }
        if (cProps.path || cProps.domain) {
            if (cProps.path) {
                cAttrs.push("path=" + cProps.path);
            }
            if (cProps.domain) {
                cAttrs.push("domain=" + cProps.domain);
            }
        }
        else {
            cAttrs.push("path=/");
        }
        if (cProps.secure) {
            cAttrs.push("secure");
        }
        return cAttrs.join("; ");
    };

    // Loads the cookie from document.cookie
    var _loadCookie = function(ck) {
        _clearValues(ck);
        var c = document.cookie;
        if (!c) {
            return;
        }
        var cSearch = ck.name + '=', dFn = decodeURIComponent,
            ckIdx = c.indexOf(cSearch);
        if (ckIdx < 0) {
            return;
        }
        // Advance past <NAME>=
        ckIdx += cSearch.length;
        var endIdx = c.indexOf(';', ckIdx);
        if (endIdx < 0) {
            endIdx = c.length;
        }
        // Unpack the contents
        var ckVal = dFn(c.substring(ckIdx, endIdx)), p, v, i, pair,
            _store = ck._data, _keys = ck._keys, parts = ckVal.split('?');
        for (i = 0; i < parts.length; i++) {
            pair = parts[i].split('=');
            p = pair[0];
            v = pair[1] || "";
            _store[p] = v;
            _keys.push(p);
        }
        if (!_getters) {
            ck.length = ck._keys.length;
        }
    };

    var _clearValues = function(ck) {
        ck._keys = [];
        ck._data = {};
        if (!_getters) {
            ck.length = 0;
        }
    };

    // Saves a cookie
    var _saveCookie = function(ck) {
        document.cookie = ck.toString() + '; ' + ck.attributes;
    };

    /**
     * Creates and manages a keystore, implemented using cookies
     * @param name {String} The name of the store
     * @param props {Object} Properties for the cookie:
     *   lifetime {Number} The lifetime of the cookie in days; if 0, this is a
     *    session cookie; defaults to 365
     *   path {String} Path scope for the cookie
     *   domain {String} Domain scope for the cookie
     *   secure {Boolean} whether this cookie should only be served over secure
     *     connections
     * @throw {TypeError} name is not a non-empty string
     */
    var Cookie = function(name, props) {
        if (!(name && "string" === __typ(name))) {
            throw new TypeError();
        }
        this.name = name;
        if (!props) {
            props = {};
        }
        _initCookie(props, this);
        _loadCookie(this);
    };


    Cookie.prototype = {
        toString : function() {
            var ckVal = "", eFn = encodeURIComponent, i,
                _keys = this._keys, _store = this._data, p;
            // Lifetime <0 means that we're getting rid of the cookie
            if (this.lifetime >= 0) {
                // Cookie value is like a query string, but URI-encoded again (to
                // escape all those '=' signs that would otherwise make the
                // cookie hard to get at)
                var parts = [];
                for (i = 0; i < _keys.length; i++) {
                    p = _keys[i];
                    parts.push(eFn(p) + '=' + eFn(_store[p]));
                }
                ckVal = parts.join('?');
            }
            return this.name + '=' + eFn(ckVal);
        },

        /**
         * Gets an item out of the store
         * @param key {String} The key to look for
         * @return {String} The value associated with the key;
         *  or null if not found
         */
        getItem : function(key) {
            var ret = null;
            if (_u.defined(key) && this._data.hasOwnProperty(key)) {
                ret = this._data[key];
            }
            return ret;
        },

        /**
         * Sets a value in the store
         * @param key {String} The key against which to store the value
         * @param value {String} the parameter value to store
         */
        setItem : function(key, value) {
            if ("string" !== __typ(value)) {
                value = String(value);
            }
            var _store = this._data,
                _new = !(_store.hasOwnProperty(key)),
                _newValue = (value !== _store[key]);
            _store[key] = value;
            if (_new) {
                this._keys.push(key);
                if (!_getters) {
                    ++this.length;
                }
            }
            if (_newValue) {
                _saveCookie(this);
            }
        },

        /**
         * Removes a key from the store
         * @param key {String} The key to remove
         */
        removeItem : function(key) {
            var modified = false;
            if (_u.defined(key) && this._data.hasOwnProperty(key)) {
                delete(this._data[key]);
                for (var i = this._keys.length - 1; i >= 0; --i) {
                    if (key === this._keys[i]) {
                        this._keys.splice(i, 1);
                        if (!_getters) {
                            --this.length;
                        }
                        modified = true;
                        break;
                    }
                }
            }
            if (modified) {
                _saveCookie(this);
            }
        },

        // Clears the cookie (and its data values)
        clear : function() {
            var oL = this.lifetime;
            _clearValues(this);
            // Clear the cookie by setting its expiry time in the past
            this.lifetime = -10;
            this.attributes = _cookieAttributes(this);
            _saveCookie(this);
            this.lifetime = oL;
            this.attributes = _cookieAttributes(this);
        },

        // Gets a key at a given index
        key : function(idx) {
            if ("number" === __typ(idx) && idx >= 0 && idx < this._keys.length) {
                return this._keys[idx];
            }
            return null;
        }
    };

    if (_getters) {
        // Read-only length property
        Object.defineProperty(Cookie.prototype, "length", {
            get : function() { return this._keys.length; }
        });
    }
    
    // See https://gist.github.com/paulirish/5558557
    var _testStorage = function(t) {
        var ret = true;
        try {
            var st = window[t], r = Math.random().toString();
            st.setItem(r, r);
            st.removeItem(r, r);
        }
        catch(e) {
            ret = false;
        }
        return ret;
    };
    
    var _fSupport = {
        local : _testStorage("localStorage"),
        session : _testStorage("sessionStorage"),
        cookies : false
    };
        
    // See whether cookies are enabled
    var ckName = _u.uuid(), ckKey = "t", ckVal = "v", ck = new Cookie(ckName, {lifetime : 0});
    ck.setItem(ckKey, ckVal);
    ck = new Cookie(ckName);
    if (ckVal === ck.getItem(ckKey)) {
        _fSupport.cookies = true;
        ck.clear();
    }
    
    _u.featureSupport.storage = _fSupport;
        
    
    
    /**
     * _storage
     *      localStorage : implements localStorage via a cookie if
     *       localStorage is not available via window (default true)
     *      sessionStorage : implements sessionStorage via a cookie if
     *       sessionStorage is not available via window (default true)
     */
    UsefulJS.fixes._storage = function(_u, optsIn, optsOut) {
        var l = false, s = false;
        if (false !== optsIn.localStorage && !_u.featureSupport.storage.local) {
            try {
                if (!"Storage" in window) {
                    // Will throw if localstorage is disabled in browser settings
                    window.localStorage = new Cookie("UsefulJSLocalStorage");
                    l = true;
                }
            }
            catch(e) {}
        }
        if (false !== optsIn.sessionStorage && !_u.featureSupport.storage.session) {
            try {
                if (!"Storage" in window) {
                    window.sessionStorage = 
                        new Cookie("UsefulJSSessionStorage", { lifetime : 0 } );
                    s = true;
                }
            }
            catch(e) {}
        }
        optsOut.localStorage = l;
        optsOut.sessionStorage = s;
    };

    return Cookie;
})();

