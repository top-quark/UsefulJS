/**
 * Query string parsing and building
 * Author: Christopher Williams
 */

UsefulJS.Query = (function() {
    "use strict";
    /**
     * Fixes for this module
     * _query
     *      parse : Parses window.location.search to extract the query
     *        parameters and makes them available through
     *        UsefulJS.Query.parameters.get() (default true)
     *      returns "parsed" property in optsOut
     */
    UsefulJS.fixes._query = function(_u, optsIn, optsOut) {
        var parsed = false;
        if (false !== optsIn.parse && ("location" in _u.globalObject)) {
            // Parse query parameters
            _u.Query.parameters.parse();
            parsed = true;
        }
        optsOut.parsed = parsed;
    };

    var _u = UsefulJS, __typ = _u._typeof,
        // Does a string look like a number?
        _isNumeric = function(s) {
            var ret = true;
            switch (__typ(s)) {
                case "string":
                    ret = String(parseInt(s, 10)) === s;
                    break;

                case "number":
                    break;

                default:
                    ret = false;
                    break;
            }
            return ret;
        };

    return {
        /**
         * Interface to the query parameters for the page
         */
        parameters : (function() {
            var _params = {};

            return {
                /**
                 * Parses the location.search string
                 */
                parse : function() {
                    var _q = _u.Query;
                    if ("location" in _u.globalObject) {
                        _params = _q.parse(location.search);
                    }
                },

                /**
                 * Gets a value out of the parsed query string
                 * @param prop {String} the property to get
                 * @param def {Object} the value to return if prop was not in
                 *  the query string
                 * @return {String} if there was only one named value in the
                 *  original search string
                 * @return {Number} if there was one named numeric value in
                 *  the original search string
                 * @return {Array} if there were multiple values with the
                 *  same name in the original search string
                 * @return {Boolean} true if the property was in the original
                 *  search string but did not have an associated value
                 * @return {Object} the value of def if the proeprty was not
                 *  present in the original search string
                 */
                get : function(prop, def) {
                    var ret = def;
                    if (_params.hasOwnProperty(prop)) {
                        ret = UsefulJS.clone(_params[prop]);
                    }
                    return ret;
                },

                /**
                 * Returns a copy of the parsed query string
                 */
                all : function() {
                    return UsefulJS.clone(_params);
                }
            };
        })(),

        /**
         * Pulls a query string apart into its separate name value pairs; if
         * the name does not have an associated value, the returned value
         * associated with the name is set to Boolean true; if there are
         * multiple values with the same name, the property set is a JavaScript
         * array
         * @param q the query string to parse
         * @return {Object} the parsed query string
         */
        parse : function(q) {
            var ret = {};
            if (!(q && "string" === __typ(q))) {
                // Input isn't sensible
                return ret;
            }
            if ('?' === q.charAt(0)) {
                // Lose the leading '?' - it's just the separator from the path
                q = q.substring(1, q.length);
            }
            var parts = q.split('&'), i, pair, p, v, _v;
            for (i = 0; i < parts.length; i++) {
                if (!parts[i]) {
                    continue;
                }
                // k=v pair
                pair = parts[i].split('=');
                // decodeURIComponent does not decode '+' into spaces
                p = decodeURIComponent(pair[0].replace(/\+/g, "%20"));
                if (1 === pair.length) {
                    // No associated value
                    if (!ret.hasOwnProperty(p)) {
                        ret[p] = true;
                    }
                }
                else {
                    v = decodeURIComponent(pair[1].replace(/\+/g, "%20"));
                    if (_isNumeric(v)) {
                        v = parseInt(v, 10);
                    }
                    _v = ret[p];
                    switch (__typ(_v)) {
                        case "string":
                        case "number":
                            // Promote to an array
                            ret[p] = [_v, v];
                            break;

                        case "array":
                            // Add to it
                            _v.push(v);
                            break;

                        default:
                            ret[p] = v;
                            break;
                    }
                }
            }
            return ret;
        },

        /**
         * Builds up a query string from parameters
         * @param params {Object} a map of named parameters; values should be
         *  type "string" or "number" for single values, "array" for multiple
         *  values, Boolean true for no value
         * @return {String} the query string; "" if input is not an Object or
         *  contains no enumerable properties
         */
        build : function(params) {
            var _q = _u.Query, ret = "", p;
            if (!(params && "object" === __typ(params))) {
                return ret;
            }
            for (p in params) {
                if (params.hasOwnProperty(p)) {
                    ret = _q.append(ret, p, params[p]);
                }
            }
            return ret;
        },

        /**
         * Adds to a query string
         * @param s {String} the query string to add to
         * @param n {String} the parameter name
         * @param v {Object} the parameter value (a string, number, array or
         *  Boolean true
         * @return {String} the concatenation of the existing string with the
         *  new parameter
         */
        append : function(s, n, v) {
            var _q = _u.Query;
            if ("string" !== __typ(s)) {
                return "";
            }
            if (!(n && "string" === __typ(n))) {
                return s;
            }
            var _t = __typ(v), p = encodeURIComponent(n), i, a = "";
            switch (_t) {
                case "string":
                case "number":
                    a = p + '=' + encodeURIComponent(String(v));
                    break;

                case "boolean":
                    if (true === v) {
                        a = p;
                    }
                    break;

                case "array":
                    for (i = 0; i < v.length; i++) {
                        s = _q.append(s, p, v[i]);
                    }
                    break;

                default:
                    break;
            }
            if (a) {
                if (s) {
                    s += '&';
                }
                s += a;
            }
            return s;
        }
    };
})();

