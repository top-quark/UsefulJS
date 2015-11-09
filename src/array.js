/**
 * Array routines
 * @author: Christopher Williams
 */
UsefulJS.Array = (function() {
    "use strict";

    /**
     * Add in the "fixes" for this module
     * Options are:
     *  _array :
     *      (Static methods):
     *      isArray
     *      (Prototype methods)
     *      indexOf, lastIndexOf, forEach, every, some, filter, map,
     *          reduce, reduceRight, find, findIndex, fill
     *      (Factory methods)
     *      from, of
     */
    UsefulJS.fixes._array = function(_u, optsIn, optsOut, all, none) {
        var _a = _u.Array, protoObj = Array.prototype, __it = _a.iterate,
            __typ = _u._typeof;
        
        // Converts a string to an Array, paying attention to characters
        var _strToArray = function(s, a, m, t, len) {
            var i, idx = 0, c;
            for (i = 0; i < len; ++idx) {
                // Get the code point and convert to string
                c = _u.fromCodePoint(_u.codePointAt.call(s, i));
                i += c.length;
                if (m) {
                    // Transform
                    c = m.call(t, c, idx);
                }
                a[idx] = c;
            }
            a.length = idx;
        };
        
        // Static array methods
        var sMethods = {
            isArray : function(obj) {
                return ("array" === __typ(obj));
            },
            /**
             * Converts an array-like object to an Array
             * @param obj {Object} An array-like object
             * @param mapFn {Function} Transformation for each item in the input; takes
             *   the item and its index in the source object as input
             * @param ctx {Object} calling context for mapFn
             * @return {Array}
             */
            from : function(obj) {
                if (!_u.defined(obj)) {
                    throw new TypeError("Cannot convert null or undefined to object"); 
                }
                var mapFn = null, ctx = null, _a = arguments;
                if (_a.length > 1) {
                    mapFn = _a[1];
                    if ("function" !== __typ(mapFn)) {
                        throw new TypeError(mapFn + " is not a function");
                    }
                }
                if (_a.length > 2) {
                    ctx = _a[2];
                }
                var ret, len = obj.length >>> 0, i;
                if ("function" === __typ(this)) {
                    // Return a new instance of the supplied class
                    ret = Object(new this(len));
                }
                else {
                    ret = [];
                }
                if ("string" === __typ(obj)) {
                    // Special handling required
                    _strToArray(obj, ret, mapFn, ctx, len);
                }
                else {
                    for (i = 0; i < len; ++i) {
                        ret[i] = mapFn ? mapFn.call(ctx, obj[i], i) : obj[i];
                    }
                    ret.length = len;
                }
                return ret;
            },
            /**
             * Constructs an Array from its arguments
             * @param ... {Any} any number of arguments
             * @return {Array}
             */
            of : function() {
                var ret, _a = arguments, len = _a.length, i;
                if ("function" === __typ(this)) {
                    // Return a new instance of the supplied class
                    ret = Object(new this(len));
                }
                else {
                    ret = [];
                }
                for (i = 0; i < len; ++i) {
                    ret[i] = _a[i];
                }
                ret.length = len;
                
                return ret;
            }              
        };
        _u.forEach(sMethods, function(m, mName) {
            if (!(false === optsIn[mName] || none || mName in Array)) {
                optsOut[mName] = _u._protoAdd(Array, mName, m, false);
            }
        });

        // Array.prototype fixes
        var pMethods = {
            indexOf : function(item) {
                var idx = 0;
                if (arguments.length > 1) {
                    idx = arguments[1];
                }
                return _a.find(this, item, idx);
            },
            lastIndexOf : function(item) {
                var idx = Math.max(this.length - 1, 0);
                if (arguments.length > 1) {
                    idx = arguments[1];
                }
                return _a.find(this, item, idx, -1);
            },
            forEach : function(callback, ctx) {
                return __it(this, callback, ctx, "forEach");
            },
            every : function(callback, ctx) {
                return __it(this, callback, ctx, "every");
            },
            some : function(callback, ctx) {
                return __it(this, callback, ctx, "some");
            },
            filter : function(callback, ctx) {
                return __it(this, callback, ctx, "filter");
            },
            map : function(callback, ctx) {
                return __it(this, callback, ctx, "map");
            },
            find : function(callback, ctx) {
                return __it(this, callback, ctx, "find");
            },
            findIndex : function(callback, ctx) {
                return __it(this, callback, ctx, "findIndex");
            },
            reduce : function(callback, initValue) {
                return _a.reduce(this, callback, initValue);
            },
            reduceRight : function(callback, initValue) {
                return _a.reduce(this, callback, initValue, -1);
            },
            fill : function(value) {
                return _a.fill(this, arguments[0], arguments[1], arguments[2]);
            },
            copyWithin : function(target, start) {
                // ES6 spec, 22.1.3.3
                if (!_u.defined(this)) {
                    throw new TypeError("copyWithin called on null or undefined");
                }
                var len = this.length >>> 0, _max = Math.max, _min = Math.min;
                target >>= 0;
                var to = (target < 0) ? _max(len + target, 0) : _min(target, len);
                start >>= 0;
                var from = (start < 0) ? _max(len + start, 0) : _min(start, len);
                var end = arguments[2], fin = len;
                if (_u.defined(end)) {
                    end >>= 0;
                    fin = (end < 0) ? _max(len + end, 0) : _min(end, len);
                }
                var count = _min(fin - from, len - to), dir = 1;
                
                if (from < to && to < from + count) {
                    // Walking backwards
                    dir = -1;
                    from += count - 1;
                    to += count - 1;
                }
                for(; count > 0; --count, from += dir, to += dir) {
                    if (this.hasOwnProperty(from)) {
                        this[to] = this[from];
                    }
                    else {
                        delete(this[to]);
                    }
                }
                return this;
            }
        };
        _u.forEach(pMethods, function(m, mName) {
           if (!(false === optsIn[mName] || none || mName in protoObj)) {
                optsOut[mName] = _u._protoAdd(protoObj, mName, m, false);
            }
        });
    };

    /**
     * Array generics - makes protoype methods available on the class object
     * to work on array-like objects; not all Array methods are implemented
     * generically, so this is done only for a subset
     * _array_generic
     *      (Static methods)
     *      indexOf, forEach, every, some, filter, map,
     *          reduce, reduceRight, join, slice
     *      (Implementation fixes)
     *      fixSlice makes Array.prototype.slice generic (required for
     *       Array generics support); optsOut property is "sliceFixed"
     */
    /*UsefulJS.fixes._array_generic = function(_u, optsIn, optsOut, all, none) {
        var protoObj = Array.prototype;
        if (!(false === optsIn.fixSlice || none)) {
            var _sl = protoObj.slice, badSlice = false;
            try {
                // Is slice generic? undefined as parameter 3 catches
                // an implementation bug where explicit null/undefined
                // as the third parameter results in an exception even
                // when slice is otherwise good; slicing an element
                // determines whether slice will work on array-like
                // objects
                _sl.call(document.documentElement, 0, undefined);
            }
            catch(e) {
                badSlice = true;
            }
            if (badSlice && _u._protoAdd(protoObj, "__BADSLICE_G__", 
                _sl, false)) {
                var _stringIndex = _u.featureSupport.stringIndex;
                protoObj.slice = function(startIdx, endIdx) {
                    // Convert this to a real array and slice that
                    var a = [], i;
                    if ("string" === _u._typeof(this)) {
                        // Operating on a string and [] indexing doesn't work
                        for (i = 0; i < this.length; i++) {
                            a[i] = this.charAt(i);
                        }
                    }
                    else {
                        for (i = 0; i < this.length; i++) {
                            a[i] = this[i];
                        }
                    }
                    // Sanitize parameters
                    if (!("number" === _u._typeof(startIdx) && isFinite(startIdx))) {
                        startIdx = 0;
                    }
                    if (!("number" === _u._typeof(endIdx) && isFinite(endIdx))) {
                        endIdx = a.length;
                    }
                    return _sl.call(a, startIdx, endIdx);
                };
                optsOut.sliceFixed = true;
            }

        }

        var gMethods = ["indexOf", "forEach", "every", "some",
            "filter", "map", "reduce", "reduceRight", "join", "slice"],
            classObj = Array, cMethod;
        var iterFn = function(mName) {
            var pMethod = protoObj[mName];
            if (pMethod && !(false === optsIn[mName] || none || mName in classObj)) {
                // No generic method takes more than three arguments so four
                // is more than enough!
                cMethod = function(a, b, c, d) {
                    // Coerce a into an Array via slice (for IE < 9 and any
                    // other browser where array methods do not work
                    // generically)
                    return protoObj.slice.call(a)[mName](b, c, d);
                };
                optsOut[mName] = UsefulJS._protoAdd(classObj, mName, cMethod);
            }
        };
        _u.Array.iterate(gMethods, iterFn, null, "forEach");
    };*/

    return {
        /**
         * Returns the index of an item in an array
         * @param a {Array} An Array object
         * @param item {Object} The item to search for
         * @param idx {Number} (optional) The index to start at; may be
         *  negative to start the search at an offset from the end
         * @param incr {Number} 1 for forwards search, -1 for backwards;
         *   defaults to 1
         * @return {Number} The index of the item or -1 if not found
         */
        find : function(a, item, idx, incr) {
            var _u = UsefulJS;
            // toObject on the argument so that we can work generically
            a = Object(a);
            var n = a.length;
            if (!n) {
                return -1;
            }
            // Constrain the increment to +1 or -1
            if (!(_u.defined(incr) && -1 === incr)) {
                incr = 1;
            }
            // Determine the start index
            if (!("number" === _u._typeof(idx) && isFinite(idx))) {
                idx = (1 === incr) ? 0 : n - 1;
            }
            if (idx < 0) {
                // Offset from the end
                idx = n - Math.abs(idx);
            }
            if (idx >= n) {
                if (1 === incr) {
                    return -1;
                }
                else {
                    idx = n - 1;
                }
            }
            else if (idx < 0) {
                if (-1 === incr) {
                    return -1;
                }
                else {
                    idx = 0;
                }
            }
            // Determine the end index: (a.length - 1) or 0
            var end = (1 === incr) ? n - 1 : 0;
            do {
                if (a[idx] === item) {
                    return idx;
                }
                if (idx === end) {
                    break;
                }
                idx += incr;
            }
            while (true);
            return -1;
        },

        /**
         * Generic array iterator
         * @param a {Object} An iterable object
         * @param callback {Function} The callback for each item in the array
         * @param ctx {Object} (optional) the calling context for the callback
         * @param mode {String} the iteration mode; may be one of "every",
         *  "filter", "find", "findIndex", "forEach", "map" or "some"; see the documentation for
         *  Array for details
         * @returns {Boolean|Array|Object|Number}
         * @throws {TypeError} callback is not a function
         * @throws {Error} mode is not recognized
         */
        iterate : function(a, callback, ctx, mode) {
            var _u = UsefulJS;
            if (!_u.defined(a)) {
                throw new TypeError("Cannot iterate over a null or undefined value");
            }
            if ("function" !== _u._typeof(callback)) {
                throw new TypeError("Argument 2 is not a function");
            }
            var ret;
            switch (mode) {
                case "every":
                    ret = true;
                    break;

                case "filter":
                case "map":
                    ret = [];
                    break;

                case "some":
                    ret = false;
                    break;
                    
                case "findIndex":
                    ret = -1;
                    break;
                    
                case "forEach":
                case "find":
                    break;

                default:
                    throw new Error("Unrecognized mode");
            }
            // Determine the range that will be visited;
            // Straight from the official algorithm: toObject on the primary
            // argument, toUint32 on the length property
            var t = Object(a), len = t.length >>> 0, i, item;
            for (i = 0; i < len; i++) {
                if (!(i in t)) { // Implicit toString on i
                    continue;
                }
                item = t[i];
                var retVal = callback.call(ctx, item, i, t);
                // Return value may indicate a stop condition
                if (false === retVal && "every" === mode) {
                    return false;
                }
                else if (retVal) {
                    if ("some" === mode) {
                        return true;
                    }
                    else if ("filter" === mode) {
                        ret.push(item);
                    }
                    else if ("find" === mode) {
                        // Return the item at this index
                        return item;
                    }
                    else if ("findIndex" === mode) {
                        // Return the index
                        return i;
                    }
                }
                if ("map" === mode) {
                    ret.push(retVal);
                }
            }
            return ret;
        },

        /**
         * Generic reduce method - iterates over all items in the array,
         * passing two items at a time to a callback function; the final return
         * value from the callback is the return value from the reduce operation
         * @param a {Object} An iterable object
         * @param callback {Function} A callback for each item in the array
         * @param initValue {Object} (optional) The initial value for the
         *   reduce operation
         * @param incr {Number} The increment, 1 for reduce, -1 for reduceRight
         * @return {Object} The reduced value returned from the callback
         * @throws {TypeError} Callback is not a Function or the first argument
         *   is not defined or the first argument is an empty array and
         *   initValue is not defined
         */
        reduce : function(a, callback, initValue, incr) {
            var _u = UsefulJS;
            if (!_u.defined(a)) {
                throw new TypeError("a is not defined");
            }
            if ("function" != _u._typeof(callback)) {
                throw new TypeError("callback is not a function");
            }
            var t = Object(a), len = t.length >>> 0;
            if (0 === len) {
                if (!_u.defined(initValue)) {
                    throw new TypeError("Empty array and no initial value");
                }
                return initValue;
            }
            // Default to first-to-last iteration
            incr = (-1 === incr) ? -1 : 1;
            var start = 0, end = len - 1;
            if (-1 === incr) {
                start = end;
                end = 0;
            }
            var ret;
            if (_u.defined(initValue)) {
                ret = initValue;
            }
            else {
                ret = t[start];
                if (incr > 0) {
                    ++start;
                }
                else {
                    --start;
                }
            }
            var idx = start;
            while ((incr > 0 && idx <= end) || (incr < 0 && idx >= end)) {
                if (idx in t) {
                    ret = callback(ret, t[idx], idx, a);
                }
                idx += incr;
            }
            return ret;
        },
        
        /**
         * Fills an Array with values between optional limits, otherwise the entire Array
         * @param a {Object} an iterable object
         * @param value {Object} the value used to fill
         * @param start {Number} the fill start point; defaults to 0
         * @param end {Number} the fill end point; defaults to a.length
         */
        fill : function(a, value) {
            var _u = UsefulJS, _args = arguments;
            if (!_u.defined(a)) {
                throw new TypeError("a is not defined");
            }
            var t = Object(a), len = t.length >>> 0, start = 0, end = len, i;
            if (_args[2]) {
                start = _args[2] >> 0;
                if (start < 0) {
                    // Offset from the end
                    start = Math.max(len + start, 0);
                }
                else {
                    start = Math.min(len, start);
                }
            }
            if (_u.defined(_args[3])) {
                end = _args[3] >> 0;
                if (end < 0) {
                    // Offset from the end
                    end = Math.max(len + end, 0);
                }
                else {
                    end = Math.min(len, end);
                }
            }
            for (i = start; i < end; i++) {
                t[i] = value;
            }
            return t;
        }
    };

})();
