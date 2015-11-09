/**
 * UsefulJS core module; defines basic core functionality and creates the
 * locale support framework
 * Author: Christopher Williams
 */

var UsefulJS = (function() {
    "use strict";
    var _O = Object, _OP = Object.prototype, _S = String, _SP = _S.prototype;
    
    // Test defineProperty support
    var _defineProperty = ("defineProperty" in _O) ? (function() {
        try {
            var thing = { k : [] };
            _O.defineProperty(thing, 'l', {
                get : function() { return this.k.length; },
                enumerable : false,
                configurable : false
            });
        }
        catch(e) {
            return false;
        }
        return true;
    })() : false;
    // Test createObject support
    var _createObject = ("create" in _O && 
        "getPrototypeOf" in _O && _defineProperty) ? (function() {;
        var T = function(p) {
            this.p = p;
        };
        T.prototype = {
            a : function() { return true; }
        };
        try {
            var obj = new T(1);
            var cloned = _O.create(_O.getPrototypeOf(obj)),
                propNames = _O.getOwnPropertyNames(obj);
            propNames.forEach(function(name) {
                var descriptor = 
                    _O.getOwnPropertyDescriptor(obj, name);
                _O.defineProperty(cloned, name, descriptor);
            });
            if (1 === cloned.p && true === cloned.a()) {
                return true;
            }
        }
        catch(e) {
        }
        return false;
    })() : false;
    // Test whether strict mode does anything
    var smTest = function() {
        return this;
    },
    UNDEF,
    _strictMode = (smTest() === UNDEF);
    
    // Implementation of String.fromCodePoint; behaves like fromCharCode for code
    // values <= 0xffff; for values between 10000 and 10ffff codepoints are resolved
    // into surrogate pairs using the following algorithm from the Unicode standard:
    // N = (H, L) where H is a value in the range 0xD800-DBFF and L is a value in the
    // range 0xDC00-DFFF
    // H = (N - 0x10000) / 0x400 + 0xD800
    // L = (N - 0x10000) % 0x400 + 0xDC00
    var _fromCodePoint = ("fromCodePoint" in _S) ? _S.fromCodePoint : function() {
        var i, max = 0x10ffff, bmp = 0xffff, _args = [], cp, hs, ls;
        for (i = 0; i < arguments.length; i++) {
            cp = Number(arguments[i]) >>> 0;
            if (cp <= bmp) {
                // fromCharCode will take care of this
                _args.push(cp);
            }
            else if (cp <= max) {
                cp -= 0x10000;
                // Push the surrogate pair onto the arguments
                _args.push((cp >> 10) + 0xd800, cp % 0x400 + 0xdc00);
            }
            else {
                throw new RangeError("Invalid code point " + arguments[i]);
            }
        }
        return _S.fromCharCode.apply(null, _args);
    };

    // Can we use [] indexing for strings?
    /*var _stringIndex = false;
    try {
        _stringIndex = ('a' === 'a'[0]);
    }
    catch(e) {
    }*/

    // Padding worker function; reference to this will be returned but
    // we want it for padding hex strings
    var _pad = function(s, padTo, padWith, right) {
        s = s + '';
        padTo >>>= 0;
        padWith = padWith || ' ';
        var pad = "", toPad = Math.max(padTo, s.length) - s.length;
        while (toPad) {
            if (toPad & 1) {
                pad += padWith;
            }
            toPad >>>= 1;
            if (toPad) {
                padWith += padWith;
            }
        }
        return right ? s + pad : pad + s;
    };

    // Convert a code point to "\\uxxxx"
    var _cToU = function(cCode) {
        return "\\u" + _pad(cCode.toString(16), 4, '0', false);
    };

    // How Unicode-aware is /\s/ on this system?
    // See:
    //  http://www.unicode.org/Public/UNIDATA/PropList.txt
    // for whitespace characters
    var wsArray = ["\\s"], ws = /\s/,
        spaces = "\u00a0\u1680\u180e\u3000",
        // Most space characters fall into the range u\20xx
        range_2000 = [2, 3, 4, 5, 6, 7, 8, 9, 0xA, 0x28, 0x29, 0x2f, 0x5f],
        i, c, cCode;
    for (i = 0; i < spaces.length; i++) {
        c = spaces.charAt(i);
        if (!ws.test(c)) {
            wsArray.push(_cToU(spaces.charCodeAt(i)));
        }
    }
    for (i = 0; i < range_2000.length; i++) {
        cCode = 0x2000 + range_2000[i];
        c = _fromCodePoint(cCode);
        if (!ws.test(c)) {
            wsArray.push(_cToU(cCode));
        }
    }
    var wsStr = wsArray.join("");
    if (wsArray.length > 1) {
        wsStr = "[" + wsStr + "]";
    }

    // Defined test
    var _defined = function(obj) {
        return !(obj === null || obj === UNDEF);
    };
    
    // Get the global object
    var _otRe = /\[object (\w+)\]$/,
    __otRe = /(?:Error|Element|Event)$/,
    _otype = function(s) {
        var n = s.match(_otRe), ret = n ? n[1] : "";
        if (ret) {
            n = ret.match(__otRe);
            if (n) {
                ret = n[0];
            }
        }
        return ret;
    },
    _globalObject = ("undefined" === typeof(window)) ? this : window,        
    _globalObjectName = (function() {
        var _goBase;
        // Chrome (at least) returns different results for
        //  window.toString()                           // [object Window]
        //  Object.prototype.toString.call(window)      // [object global]
        // Therefore call toString directly to get the [[class]] of window
        if (_globalObject && "toString" in _globalObject) {
            _goBase = _globalObject.toString();
        }
        else {
            _goBase = _OP.toString.call(_globalObject);
        }
        return _otype(_goBase).toLowerCase();   
    })();

    var _codePointAt;
    if ("codePointAt" in _SP) {
        _codePointAt = _SP.codePointAt;
    }
    else {
        _codePointAt = function(pos) {
            if (!_defined(this)) {
                throw new TypeError("this cannot be null or undefined");
            }
            var str = '' + this, n = str.length;
            if (pos) {
                pos = Number(pos);
                if (!isFinite(pos) || pos < 0 || pos >= n) {
                    // Out of bounds
                    return undefined;
                }
                pos >>>= 0;
            }
            else {
                pos = 0;
            }                
            // Is the character code at this position one half of a surrogate pair?
            var c1 = str.charCodeAt(pos), c2;
            if (c1 >= 0xD800 && c1 <= 0xDBFF && ++pos < n) {
                c2 = str.charCodeAt(pos);
                // Is the next character the other half of a surrogate pair?
                if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                    // Reverse the algorithm used to create the surrogate pair
                    // N = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000
                    // Note: 0x2400 = 0x10000 - 0xDC00
                    return 0x2400 + ((c1 - 0xD800) << 10) + c2; 
                }
            }
            return c1;
        };
    }
    
    // Object.is
    var _is = ("is" in _O) ? _O.is : function(a, b) {
        if (a === b) {
            // 0 and -0 should return false
            return (a || b || (1/a === 1/b)); 
        }
        // NaN and NaN should return true
        return (a !== a && b !== b);            
    };

    // Type identification
    var __typeof = function(obj) {
        // Cross-browser support: make identification of null and window
        // explicit
        if (obj === null) {
            return "null";
        }
        else if (obj === _globalObject) {
            return _globalObjectName;
        }
        var ret = typeof(obj);
        if ("object" === ret) {
            // Liable to be useless for most Objects
            // Object's toString output can give additional information, e.g.
            // [object Array]
            var s = _otype(_O.prototype.toString.call(obj));
            if (s) {
                if ("Object" === s && obj && 
                    "nodeName" in obj && "nodeType" in obj) {
                    // Looks like a possible DOM object -
                    // Element, Node, Attr, etc. don't really behave like
                    // vanilla objects so identifying them as "object" can be
                    // problematic. constructor.toString may give us the
                    // information we're looking for.
                    try {
                        s = _otype(obj.constructor.toString());
                    }
                    catch(e) {
                        // Can't query obj.constructor? Assume some kind of DOM
                        // object and use the nodeType property
                        switch (obj.nodeType) {
                            case 1:
                                return "element";

                            case 2:
                                return "attr";

                            case 3:
                                return "text";

                            case 9:
                                return "document";

                            default:
                                break;
                        }
                    }
                }
                if ("HTMLDocument" === s) {
                    s = "Document";
                }
                ret = s.toLowerCase();
            }
        }
        return ret;
    };

    // Gets the keys of an object    
    var _keys = ("keys" in _O) ? _O.keys : (function() {
        var bugged = true, possibleOverrides = ["toString", "toLocaleString", "valueOf",
            "hasOwnProperty", "constructor", "propertyIsEnumerable", 
            "isPrototypeOf"], poC = possibleOverrides.length;
        for (var p in {toString : null}) {
            // Properties that shadow non-enumerable properties are visited in
            // a for...in loop
            bugged = false;
        }
        return function(obj) {
            if (!_defined(obj)) {
                throw new TypeError("Object is null or undefined");
            }
            obj = _O(obj);
            // hasOwnProperty can be overridden
            var _h = _OP.hasOwnProperty, ret = [], p;
        
            for (p in obj) {
                if (_h.call(obj, p)) {
                    ret.push(p);
                }
            }
            if (bugged) {            
                for (p = 0; p < poC.length; ++p) {
                    if (_h.call(obj, possibleOverrides[i])) {
                        ret.push(possibleOverrides[i]);
                    }
                }
            }
            return ret;
        };
    })();
    
    var reProps = {
        global : "g", ignoreCase : "i", multiline : "m",
        sticky : "s", unicode : "u"
    };

    // Object copying
    var __clone = function(obj, depth) {
        if (depth > 100) {
            throw new Error("clone: circular reference detected");
        }
        var ret = obj, p, i, _k, n;
        switch (__typeof(obj)) {
            case "date":
                ret = new Date(obj.getTime());
                break;

            case "regexp":
                var f = "";
                if ("flags" in obj) {
                    f = obj.flags;
                }
                else {
                    for (p in reProps) {
                        if (p in obj && obj[p]) {
                            f += reProps[p];
                        }
                    }
                }
                ret = new RegExp(obj.source, f);
                break;

            case "array":
                ret = [];
                n = obj.length;
                for (i = 0; i < n; i++) {
                    ret[i] = _clone(obj[i], depth + 1);
                }
                break;

            case "object":
                ret = null;
                if (_createObject) {
                    ret = _O.create(_O.getPrototypeOf(obj));
                    var propNames = _O.getOwnPropertyNames(obj);
                    propNames.forEach(function(name) {
                        var descriptor = 
                            _O.getOwnPropertyDescriptor(obj, name);
                        descriptor.value = _clone(descriptor.value, depth + 1);
                        _O.defineProperty(ret, name, descriptor);
                    });
                }
                else {
                    ret = {};
                    _k = _keys(obj);
                    n = _k.length;
                    for (i = 0; i < n; ++i) {
                        p = _k[i];
                        ret[p] = _clone(obj[p], depth + 1);
                    }
                }
                break;

            case "arraybuffer":
                if (ret.slice) {
                    return ret.slice(0);
                }
                break;

            default:
                break;
        }
        return ret;
    },
    _clone = function(obj) {
        return __clone(obj, 0);
    };

    // Property mixing
    var _mix = function(o1, o2, prefer1) {
        if (!("object" === __typeof(o1) && "object" === __typeof(o2))) {
            throw new TypeError("Object expected");
        }
        if (!_defined(prefer1)) {
            prefer1 = true;
        }
        var p, add, pType, pType_src;
        for (p in o2) {
            if (o2.hasOwnProperty(p)) {
                add = true;
                pType = null;
                if (p in o1) {
                    pType = __typeof(o1[p]);
                    pType_src = __typeof(o2[p]);
                    // Don't add if the two values are identical or if we
                    // are preferring the first argument; if, however,
                    // we're copying Objects, mix recursively
                    add = !(prefer1 || (o1[p] === o2[p])) ||
                        (pType === "object" && pType_src === "object");
                }
                if (add) {
                    var _o2 = _clone(o2[p]);
                    if (pType === "object" && pType_src === "object") {
                        _mix(o1[p], _o2, prefer1);
                    }
                    else {
                        o1[p] = _o2;
                    }
                }
            }
        }
        return o1;
    };

    // Object iteration - like Array iteration but for Objects!
    var _iterate = function(obj, callback, ctx, mode) {
        if ("function" !== __typeof(callback)) {
            throw new TypeError("callback is not a function");
        }
        // Freeze the keys of the object
        var keys = _keys(obj), i, len = keys.length, key, item, ret,
            isArray = false;
        obj = _O(obj);
        // Initialize the return value
        switch (mode) {
            case "every":
                ret = true;
                break;

            case "filter":
            case "map":
                if ("array" === __typeof(obj)) {
                    ret = [];
                    isArray = true;
                }
                else if (_createObject) {
                    ret = Object.create(Object.getPrototypeOf(obj));
                }
                else {
                    ret = {};
                }
                break;

            case "some":
                ret = false;
                break;

            default:
                break;
        }
        for (i = 0; i < len; i++) {
            key = keys[i];
            if (!(key in obj)) {
                // Object perturbed during the iteration
                continue;
            }
            item = obj[key];
            var retVal = callback.call(ctx, item, key, obj),
                add = false, toAdd;
            // Return value may indicate a stop condition
            if (false === retVal && "every" === mode) {
                return false;
            }
            else if (retVal) {
                if ("some" === mode) {
                    return true;
                }
                else if ("filter" === mode) {
                    add = true;
                    toAdd = item;
                }
                else if ("find" === mode) {
                    return item;
                }
                else if ("findKey" === mode) {
                    return key;
                }
            }
            if ("map" === mode) {
                add = true;
                toAdd = retVal;
            }
            if (add) {
                if (isArray) {
                    ret.push(toAdd);
                }
                else if (_createObject && (key in obj)) {
                    var descriptor =
                        Object.getOwnPropertyDescriptor(obj, key);
                    descriptor.value = toAdd;
                    Object.defineProperty(ret, key, descriptor);
                }
                else {
                    ret[key] = toAdd;
                }
            }
        }
        return ret;
    };

    // Function binding
    var __bindFn = Function.prototype.bind;
    var _bindFn = function(fn, ctx) {
        if (__bindFn) {
            // If bind is implemented, it should be OK to use Array.prototype.slice
            return __bindFn.apply(fn, Array.prototype.slice.call(arguments, 1));
        }
        if ("function" !== __typeof(fn)) {
            throw new TypeError("Function argument required");
        }
        var _a = arguments, n = _a.length, defArgs = [], EmptyFn = function() {}, i;
        // Could use slice, but can't depend on generic slice behaviour
        for (i = 2; i < n; i++) {
            defArgs.push(_a[i]);
        }
        if (fn.prototype) {
            EmptyFn.prototype = fn.prototype;
        }
        var boundFn = function() {
            var callCtx = (this instanceof EmptyFn && ctx) ? this : ctx,
                params = [], i, n = arguments.length;
            for (i = 0; i < n; i++) {
                params.push(arguments[i]);
            }
            var args = defArgs.length ? defArgs.concat(params) : params;
            return fn.apply(callCtx, args);
        };
        boundFn.prototype = new EmptyFn();
        return boundFn;
    };

    // Number systems - offsets into Unicode; default is latn
    var _numbers = {
        // Latin digits - no conversion required
        latn : {
            digits : null,
            rdigits : null
        },
        // Arabic-Indic digits
        arab : 0x0660,
        arabext : 0x06F0,
        bali : 0x1B50,
        beng : 0x09E6,
        // Devangaric (Hindi)
        deva : 0x0966,
        fullwide : 0xFF10,
        gujr : 0x0AE6,
        guru : 0x0A66,
        // Non-contiguous
        hanidec : {
            digits : "〇一二三四五六七八九",
            rdigits : {
                "〇" : "0", "一" : "1", "二" : "2", "三" : "3",
                "四" : "4", "五" : "5", "六" : "6", "七" : "7",
                "八" : "8", "九" : "9"
            }
        },
        khmr : 0x17E0,
        knda : 0x0CE6,
        laoo : 0x0ED0,
        limb : 0x1946,
        mlym : 0x0D66,
        mong : 0x1810,
        mymr : 0x1040,
        orya : 0x0B66,
        tamldec : 0x0BE6,
        telu : 0x0C66,
        thai : 0x0E50,
        tibt : 0x0F20
    };

    // Define the calendars used for date formatting and parsing
    var _isGregorianLeapYear = function(y) {
        return ((0 === y % 4) && (0 !== y % 100 || 0 === y % 400));
    };

    // Get a Date object so that we can set default values for parsing
    var today = new Date(), yT = today.getFullYear(), mT = today.getMonth(),
        dT = today.getDate(), wdT = today.getDay();
    var _calendars = {
        gregory : {
            era : ["AD", "BC"],
            eraRequired : false,
            defs : [yT, mT, dT, 0, wdT],
            // Year offset;
            // negative year correction;
            // negative year is absolute;
            years : [0, -1, 1],
            helper : null,
            fieldWidths : {},
            // Determines whether a year is a leap-year
            isLeapYear : function(y, e) {
                y = Number(y);
                if (!isFinite(y)) {
                    return false;
                }
                var dProps = {
                    yy : y,
                    era : e
                };
                this.fromCalendarDate(dProps);
                y = dProps.yy;
                return _isGregorianLeapYear(y);
            },
            // Determines whether a given day and month is a leap day
            isLeapDay : function(m, d) {
                return (m === 1 && d === 29);
            },
            // How many days in a normal year?
            normalYearDays : function() {
                return 365;
            },
            // How many days in a leap year?
            leapYearDays : function() {
                return 366;
            },
            // Gets the months for the year
            months : function(y, e) {
                var ret = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (this.isLeapYear(y, e)) {
                    ret[1] = 29;
                }
                return ret;
            },
            // Turns a Date object into the local calendar representation
            dateToCalendarDate : function(d, utc) {
                return this.toCalendarDate({
                    yy : utc ? d.getUTCFullYear() : d.getFullYear(),
                    mm : utc ? d.getUTCMonth() : d.getMonth(),
                    dd : utc ? d.getUTCDate() : d.getDate(),
                    dateObj : d,
                    utc : utc
                });
            },
            // Turns the internal date representation into the local
            // representation
            toCalendarDate : function(dProps) {
                var ret = {}, y4d = dProps.yy, eraIdx = 0,
                    yc = this.years;
                // Year offset
                y4d += yc[0];
                // Corrections for pre-era dates
                if (y4d <= 0) {
                    y4d += yc[1];
                    if (y4d < 0 && this.era.length > 1) {
                        eraIdx = 1;
                    }
                }
                if (yc[2]) {
                    // Negative years are absolute
                    y4d = Math.abs(y4d);
                }
                ret.yy = y4d;
                ret.en = eraIdx;
                if (dProps.utc) {
                    ret.wd = dProps.dateObj.getUTCDay();
                }
                else {
                    ret.wd = dProps.dateObj.getDay();
                }
                return _mix(ret, dProps, true);
            },
            // Turns the calendar date representation into the internal
            // date representation values; takes local year, month, day
            // data and any era string pulled out of the date string
            fromCalendarDate : function(dProps, _2digy) {
                var beforeEra = (dProps.en > 0), yc = this.years, tmp;
                if (_2digy && !beforeEra) {
                    this.y2y4(dProps);
                }
                // Make calendar corrections
                tmp = dProps.yy;
                if (beforeEra) {
                    if (yc[2] && tmp) {
                        // Years <= 0 are absolute
                        tmp *= -1;
                    }
                    // remove the negative year correction
                    tmp -= yc[1];
                }
                // Year difference
                tmp -= yc[0];
                dProps.yy = tmp;
            },
            // Turns a 2-digit year into a 4-digit year
            y2y4 : function(dProps) {
                var yc = this.years,
                    // After calendar correction: 00-29 20xx; 30-99 19xx
                    y2c = yc[0] % 100, y4c = yc[0] - y2c,
                    addend = ((dProps.yy - y2c) < 30) ? 2000 : 1900;
                dProps.yy += addend + y4c;
            },
            // Turns the year into a displayable string
            formatYear : function(y) {
                return y.toString();
            },
            // How many days into the year is a given date? Takes the dLocal
            // object produced by toCalendar date
            dayOffset : function(dLocal) {
                var monthDays = this.months(dLocal.yy, dLocal.en),
                    ret = 0, i;
                for (i = 0; i < dLocal.mm; i++) {
                    ret += monthDays[i];
                }
                return ret + dLocal.dd;
            },
            // Turns day offset into month and date
            monthAndDate : function(yd, dProps) {
                var monthDays = this.months(dProps.yy, dProps.en),
                    ret = 0, i, n = monthDays.length;
                var d = yd, c;
                for (i = 0; i < n; i++) {
                    c = monthDays[i];
                    if (c >= d) {
                        dProps.mm = i;
                        break;
                    }
                    d -= c;
                }
                dProps.dd = d;
            },
            // Gets the current date in calendar representation
            today : function() {
                var d = new Date();
                return this.toCalendarDate({
                    yy : d.getFullYear(),
                    mm : d.getMonth(),
                    dd : d.getDate(),
                    wd : d.getDay(),
                    dateObj : d
                });
            },
            // toCalendarDate method for calendars that are offset from Jan 1
            toCalendarDate_r : function(dProps, nym, nyd) {
                var iso8601 = this.helper;
                // Get the offset of the current date into the year and
                // the offset of new year's day
                var gY = dProps.yy, yc = this.years, y4d = gY + yc[0],
                    dOffset = iso8601.dayOffset(dProps), yLen;
                var dP2 = _mix({ mm : nym, dd : nyd }, dProps, true);
                var dOffset2 = iso8601.dayOffset(dP2);
                if (dOffset < dOffset2) {
                    // Last year
                    --y4d;
                    yLen = this.isLeapYear(y4d) ? 366 : 365;
                    dOffset = yLen - (dOffset2 - dOffset) + 1;
                }
                else {
                    // Offset into this year
                    dOffset -= (dOffset2 - 1);
                }
                var ret = {
                    yy : y4d,
                    en : 0
                };
                // Convert the day offset into month and date
                this.monthAndDate(dOffset, ret);
                if (dProps.utc) {
                    ret.wd = dProps.dateObj.getUTCDay();
                }
                else {
                    ret.wd = dProps.dateObj.getDay();
                }
                return _mix(ret, dProps, true);
            },
            // For calendars that are offset from Jan 1
            fromCalendarDate_r : function(dProps, _2digy, gdOffs, dC) {
                var yc = this.years, iso8601 = this.helper;
                if (_2digy) {
                    this.y2y4(dProps);
                }
                // Gregorian year
                var gY = dProps.yy - yc[0];
                // How many days into the year are we?
                var ydays = this.dayOffset(dProps),
                    yLen = this.isLeapYear() ? 366 : 365;
                ydays += gdOffs;
                if (ydays >= yLen) {
                    // We're into the next Gregorian year
                    ++gY;
                    ydays -= yLen;
                    if (iso8601.isLeapYear(gY - 1)) {
                        dC -= 1;
                    }
                }
                ydays += dC;
                dProps.yy = gY;
                iso8601.monthAndDate(ydays, dProps);
            }
        },
        iso8601 : {
            years : [0, 0, 0],
            era : [""],
            // ISO-8601 allows us to create all-numeric date and time strings
            // because it defines fixed field widths.
            fieldWidths : {
                Y : 4, G : 4, y : 2, g : 2, m : 2, d : 2,
                V : 2, H : 2, M : 2, S : 2, j : 3, "/" : 3,
                u : 1
            },
            toCalendarDate : function(dProps) {
                var ret = {
                    // Era? No way!
                    en : 0
                };
                if (dProps.utc) {
                    ret.wd = dProps.dateObj.getUTCDay();
                }
                else {
                    ret.wd = dProps.dateObj.getDay();
                }
                return _mix(ret, dProps, true);
            },
            fromCalendarDate : function() {
                // Nothing to do
            },
            formatYear : function(y) {
                // Four digit year mandated; year 0 and years >9999
                // must be prefixed with '+'
                var yabs = Math.abs(y), sign = "";
                if (y === 0 || y > 9999) {
                    sign = '+';
                }
                else if (y < 0) {
                    sign = '-';
                }
                return sign + _pad(yabs.toString(), 4, '0');
            },
            // ISO-8601 makes a number of prescriptions
            isIso : true,
            hour12 : false,
            ddigits : "latn",
            dfmt : {
                "-nnn" : "%F",
                "-nn-" : "%Y-%m"
            },
            tfmt : {
                "nnn" : "%T",
                "-nn" : "%R"
            },
            datetime : "{d}T{t}",
            dateera : "{d}",
            timetz : "{t}%z",
            fd : 1
        },
        buddhist : {
            era : ["BE"],
            years : [543, 0, 0],
            defs : [yT + 543, mT, dT, 0, wdT]
        },
        roc : {
            era : ["R.O.C", "Before R.O.C."],
            eraRequired : true,
            years : [-1911, -1, 1],
            defs : [yT - 1911, mT, dT, 0, wdT]
        },
        japanese : {
            eraRequired : true,
            years : [0, 0, 0],
            // Start times relative to UTC
            periods : [-3197149200000, -1812070800000, -1357516800000,
                600220800000],
            era : ['Meiji', 'Taishō', 'Shōwa', 'Heisei'],
            years0 : [1868, 1912, 1926, 1989],
            defs : [yT - 1989, mT, dT, 3, wdT],
            toCalendarDate : function(dProps) {
                var ret = {
                    en : 0
                }, d = dProps.dateObj;
                var idx = -1, t = d.getTime() - d.getTimezoneOffset() * 60000, i,
                    p = this.periods;
                for (i = p.length - 1; i >= 0; --i) {
                    if (t >= p[i]) {
                        idx = i;
                        break;
                    }
                }
                if (idx >= 0) {
                    d.setTime(p[idx]);
                    var y0 = dProps.utc ? d.getUTCFullYear() : d.getFullYear();
                    // Set year and era name
                    ret.yy = dProps.yy - y0 + 1;
                    ret.e = this.era[idx];
                    ret.en = idx;
                    // Restore the time
                    d.setTime(t);
                }
                else {
                    ret.yy = this.years0[0] - (dProps.yy + 1);
                }
                if (dProps.utc) {
                    ret.wd = dProps.dateObj.getUTCDay();
                }
                else {
                    ret.wd = dProps.dateObj.getDay();
                }
                return _mix(ret, dProps, true);
            },
            fromCalendarDate : function(dProps) {
                var idx = dProps.en;
                if (idx >= 0) {
                    dProps.yy = this.years0[idx] + dProps.yy - 1;
                }
            }
        },
        indian : {
            era : ["Saka Era"],
            // We need to calculate this later
            defs : null,
            years : [-78, 0, 0],
            // Month names
            mf : ["Chaitra", "Vaisakha", "Jyaistha", "Asadha",
                "Sravana", "Bhadra", "Asvina", "Kartika",
                "Agrahayana", "Pausa", "Magha", "Phalguna"],
            mc : null,
            // Determines whether a year is a leap-year
            isLeapYear : function(sy) {
                return _isGregorianLeapYear(sy + 78);
            },
            isLeapDay : function(m, d) {
                return (m === 0 && d === 31);
            },
            months : function(y, e) {
                var ret = [30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
                if (this.isLeapYear(y, e)) {
                    ret[0] = 31;
                }
                return ret;
            },
            // Turns the internal date representation into the local
            // representation
            toCalendarDate : function(dProps) {
                var nyd = 22; // Assume March 22nd
                if (_isGregorianLeapYear(dProps.yy)) {
                    --nyd;
                }
                return this.toCalendarDate_r(dProps, 2, nyd);
            },
            fromCalendarDate : function(dProps, _2digy) {
                return this.fromCalendarDate_r(dProps, _2digy, 80, 0);
            }
        },
        persian : {
            era : ["AP"],
            // We need to calculate this later
            defs : null,
            years : [-621, 0, 0],
            // Table of offsets of the spring equinox from March 21st
            // for the years 1900 to 2100
            equinoxes : [
                0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
                1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0,
                0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
                0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1,
                0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0,
                -1, 0, 0, 0, -1, -1, 0, 0, -1, -1, 0, 0, -1, -1, 0,
                0, -1, -1, 0, 0, -1, -1, 0, 0, -1, -1, 0, 0, -1, -1,
                0, 0, -1, -1, 0, 0, -1, -1, -1, 0, -1, -1, -1, 0, -1,
                -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, 0,
                -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, 0
            ],
            // Reverse correction from 1279 AP
            eq_r : [
                0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, // 1293
                1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, // 1308
                0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, // 1323
                0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, // 1338
                1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, // 1353
                0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, // 1368
                0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 1383
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 1398
                0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, // 1413
                0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, // 1428
                0, 0, 0, -1, 0, 0, 0, -1, -1, 0, 0, -1, -1, 0, 0, // 1443
                -1, -1, 0, 0, -1, -1, 0, 0, -1, -1, 0, 0, -1, -1, 0, // 1458
                0, -1, -1, 0, 0, -1, -1, 0, 0, -1, -1, -1, 0, -1, -1, // 1473
                -1, 0, -1, -1, -1, 0
            ],
            // Month names
            mf : ["Farvardin", "Ordibehesht", "Khordad", "Tir",
                "Mordad", "Shahrivar", "Mehr", "Aban",
                "Azar", "Dey", "Bahman", "Esfand"],
            mc : null,
            // Determines whether a year is a leap-year
            isLeapYear : function(hy) {
                // Algorithmic method based based on 2820-year cycle; real
                // calendar uses actual period between equinoxes
                return ((((((hy - ((hy > 0) ? 474 : 473)) % 2820) + 474) +
                    38) * 682) % 2816) < 682;
            },
            isLeapDay : function(m, d) {
                return (m === 11 && d === 30);
            },
            months : function(y, e) {
                var ret = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
                if (this.isLeapYear(y, e)) {
                    ret[11] = 30;
                }
                return ret;
            },
            toCalendarDate : function(dProps) {
                var y4d = dProps.yy,
                    nyd = 21; // Assume March 21st until we know better
                if (y4d >= 1900 && y4d <= 2100) {
                    // Got precise data
                    nyd += this.equinoxes[y4d - 1900];
                }
                return this.toCalendarDate_r(dProps, 2, nyd);
            },
            fromCalendarDate : function(dProps, _2digy) {
                var yc = this.years, pY = dProps.yy;
                if (_2digy) {
                    this.y2y4(dProps);
                    pY = dProps.yy + this.years[0];
                }
                // If the Persian year starts on March 21 then it
                // starts eighty days later than the Gregorian, but we
                // need to take into account a correction for the equinox
                var gdOffs = 79, dC = 0;
                if (pY >= 1279 && pY <= 1479) {
                    dC = this.eq_r[pY - 1279];
                }
                return this.fromCalendarDate_r(dProps, false, gdOffs, dC);
            }
        }
    }, defCal = "gregory";
    // Add properties from the default calendar
    _iterate(_calendars, function(cObj, cName) {
        if (cName !== defCal) {
            _mix(cObj, _calendars[defCal], true);
        }
    }, null, "forEach");

    // Load a calendar object
    var _loadCalendar = function(cal) {
        var calendarObj = _clone(_calendars[cal]);
        // Bind any calendar functions to the calendar object
        _iterate(calendarObj, function(fn, n, cObj) {
            if ("function" === __typeof(fn)) {
                cObj[n] = _bindFn(fn, cObj);
            }
        }, null, "forEach");
        return calendarObj;
    };

    // Need to set defaults in the Persian and Indian calendars
    // and create a helper object for the date offset
    var iso8601 = _loadCalendar("iso8601");
    _calendars.persian.helper = _calendars.indian.helper = iso8601;
    _iterate(["persian", "indian"], function(cal) {
        var pCal = _loadCalendar(cal);
        var jsDate = {
            yy : yT,
            mm : mT,
            dd : dT,
            dateObj : today
        };
        var pDate = pCal.toCalendarDate(jsDate);
        _calendars[cal].defs = [
            pDate.yy, pDate.mm, pDate.dd, 0, pDate.wd
        ];
    }, null, "forEach");

    // Gets digits
    var _getNumbers = function(dCode) {
        // Until we know better
        var ret = _numbers.latn;
        if (_numbers.hasOwnProperty(dCode)) {
            ret = _numbers[dCode];
            if ("number" === __typeof(ret)) {
                // Not resolved this yet
                var offs = ret, s = "", m = {}, i, c, d;
                for (i = 0; i < 10; i++) {
                    d = String.fromCharCode(i + 0x30); // Latin-digit
                    c = _fromCodePoint(i + offs); // Locale digit
                    s += c;   // Encode
                    m[c] = d; // Decode
                }
                ret = (_numbers[dCode] = { digits : s, rdigits : m });
            }
        }
        return ret;
    };
    
    // Currency fractional digit overrides
    var _cuDigits = {
        BHD : 3,
        BYR : 0,
        IQD : 3,
        ISK : 0,
        JOD : 3,
        JPY : 0,
        KRW : 0,
        KWD : 3,
        LYD : 3,
        OMR : 3,
        RWF : 0,
        TND : 3,
        VND : 3,
        VUV : 0
    },
    // Currency-specific rounding functions
    _cuRounding = {
        CHF : function(n, fd) {
            var scale = Math.pow(10, fd - 1),
                a = n * scale,
                u = Math.ceil(a), l = Math.floor(a),
                m = l + 0.5, f = a - l, r;
            if (f < 0.26) {
                r = l; // Round down
            }
            else if (0.75 < f) {
                r = u; // Round up
            }
            else {
                r = m; // Round to half
            }
            return (r / scale).toString();
        }
    };

    // Neutral locale to serve as a base for other locale definitions; DMY date
    // format is much more common than MDY; using MDY as a base would mean that
    // we will have to override many more properties in derived locales;
    // 24-hour clock is assumed
    var lProps_def = {
        n : "English",
        ndigits : "latn",
        ds : ".",
        gs : ",",
        gc : [3],
        nn : "-%1",
        cc : "EUR",
        cu : {
            EUR : "€",
            GBP : "£",
            USD : "$",
            AUD : "AU$",
            BRL : "R$",
            CAD : "CA$",
            CNY : "CN¥",
            HKD : "HK$",
            ILS : "₪",
            INR : "₹",
            JPY : "￥",
            KRW : "₩",
            MXN : "MX$",
            NZD : "NZ$",
            PHP : "Php",
            THB : "฿",
            TWS : "NT$",
            VND : "₫",
            XAF : "FCFA",
            XCD : "EC$",
            XOF : "CFA",
            XPF : "CFPF"
        },
        cf : ["$%1", "-$%1"],
        pc : ["%1%", "-%1%"],
        ddigits : "latn",
        mc : ["Jan", "Feb", "Mar", "Apr", 
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"],
        mf : ["January", "February", "March", "April", 
            "May", "June", "July", "August", 
            "September", "October", "November", "December"],
        mn : null,
        da : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        dc : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        df : ["Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"],
        um : ["AM", "PM"],
        lm : ["am", "pm"],
        hd : [0, 12],
        hour12 : false,
        sc : {
            "%c" : "%a %d %b %Y %X",
            "%x" : "%d/%m/%Y",
            "%X" : "%T",
            "%r" : "%I:%M:%S %p"
        },
        dfmt : {
            // weekday, year, month, day
            "tntn" : "%A, %e %B %Y",
            "tnnn" : "%A, %e/%N/%Y",
            // Year, month, day
            "-ntn" : "%e %B %Y",
            "-nnn" : "%e/%N/%Y",
            // Year, month
            "-nt-" : "%B %Y",
            "-nn-" : "%N/%Y",
            // Month, day
            "--tn" : "%e %B",
            "--nn" : "%e/%N"
        },
        tfmt : {
            // Hour, minute, second
            "nnn" : "%k:%M:%S",
            // Hour, minute
            "nn-" : "%k:%M"
        },
        datetime : "{d} {t}",
        dateera : "{d} %!",
        time12 : "{t} %p",
        timetz : "{t} GMT%z",
        fd : 1,
        calendar : "gregory"
    };

    // Overrides for en-US
    var lProps_en = {
        n : "English (US)",
        cc : "USD",
        cf : ["$%1", "($%1)"],
        hour12 : true,
        sc : {
            "%c" : "%a %d %b %Y %r",
            "%x" : "%m/%d/%Y",
            "%X" : "%r"
        },
        dfmt : {
            // weekday, year, month, day
            "tntn" : "%A, %B %e, %Y",
            "tnnn" : "%A, %N/%e/%Y",
            // Year, month, day
            "-ntn" : "%B %e, %Y",
            "-nnn" : "%N/%e/%Y",
            // Month, day
            "--ln" : "%B %e",
            "--nn" : "%N/%e"
        },
        fd : 0
    };
    // Copy in locale properties from the default
    _mix(lProps_en, lProps_def, true);
    
    var _defLoc = (navigator.language || navigator.userLanguage ||
        navigator.browserLanguage || "en").substring(0, 2);
    
    var _localeObj = {
        /**
         * English locale for number and date formatting
         * Properties
         * @property rtl {Boolean} true if the language is written
         *   right-to-left
         * @property n {String} The localized name
         * @property base {String} The base locale
         * @property ndigits {String} The symbolic name of the digits used for
         *   rendering numbers, e.g. "latn" or "arab".
         * @property ddigits {String} the digits used for rendering dates
         * @property ds {String} the decimal separator (for example, '.')
         * @property gs {String} the numeric group separator (for example, ',')
         * @property gc {Array} a list that controls grouping of 
         *   digits (for example, [3] means that digts are grouped in threes)
         * @property nn {String} The pattern for a negative number, for
         *   example "-%1"
         * @property cc {String} ISO 4217 currency code (for example, USD);
         *   required for Intl.NumberFormat compatability
         * @property cf {Array} the patterns for displaying positive and 
         *   negative currency values
         * @property cs {String} The locale currency symbol
         * @property cd {Number} the number of decimal digits to use when
         *   formatting currency (for example, 2)
         * @property cr {Function} a locale-specific currency rounding
         *   function, null for default rounding function
         * @property pc {Array} Formats for percentages( for example "%1%")
         * @property mc {Array} compact calendar months (for example,
         *   "Jan", "Feb", etc.)
         * @property mf {Array} full calendar months (for example,
         *   "January", "February", etc.)
         * @property mn {Array} nominative forms of the month names; null
         *   where this is irrelevant
         * @property da {Array} abbreviated weekday names for calendar
         *   headings and the like (for example, "Mo", "Tu", etc.)
         * @property dc {Array} compact weekday names (for example,
         *   "Mon", "Tue", etc.)
         * @property df {Array} full weekday names (for example,
         *   "Monday", "Tuesday", etc.)
         * @property um {Array} meridiem code (uppercase) (for example, "AM")
         * @property lm {Array} meridiem code (lowercase) (for example, "am")
         * @property hd {Array} divisions of the 24-hour day for example,
         *   [0, 12]); should correspond to the number of entries in lm/um
         * @property sc {Object} locale-sensitive strftime macros
         *      %c preferred time and date (for example,
         *          "Thu 23 Aug 14:55:02 2001")
         *      %x date representation (for example, "23/08/2001")
         *      %X time representation (for example, "14:55:02")
         *      %r time in am/pm notation
         *      %+ date and time in Unix `date` format
         * @property dfmt {Object} raw format strings for date formatting
         * @property tfmt {Object} raw format strings for time formatting
         * @property hour12 {Boolean} default value for the hour12 date formatting option
         * @property datetime {String} template for combining date and time
         * @property dateera {String} template for combining date and era
         * @property time12 {String} template combining time and am/pm
         * @property timetz {String} template for combining time and timezone
         * @property fd {Number} the first day of the week; 0 is Sunday, 1 is Monday, etc.
         * @property calendar {String} the name of the default calendar for the locale
         */
        def : lProps_def,
        en : lProps_en,

        /**
         * Gets locale options; defaults to "en" if the locale is not supported
         * @param loc {String} The locale
         * @return {Object} The numeric / date options for the selected locale
         */
        options : function(loc) {
            var _u = UsefulJS, _l = _u.Locale;
            // Resolve any alias
            loc = _l.alias(loc);
            var ret = _l[loc];
            ret.loc = loc;
            if (ret.base) {
                // Haven't resolved this yet
                var lB = ret.base, baseOptions = ("def" === lB) ? _l.def :
                    _l.options(lB);
                _mix(ret, baseOptions, true);
                // So that we don't resolve the locale options again
                delete(ret.base);
            }
            return ret;
        },

        // Locale matcher; uses lookup algorithm to get the closest match
        // from a list of requested locales
        lookup : function(locales) {
            var _u = UsefulJS, _l = _u.Locale, ret = [_defLoc, ''],
                re = /(.*)-u-(.*)/;
            if ("array" !== __typeof(locales)) {
                locales = [locales];
            }
            _u.some(locales, function(loc) {
                if (!loc) {
                    return false;
                }
                // Split the language tag and any -u- extension
                var ext = "", match = re.exec(loc);
                if (match) {
                    loc = match[1];
                    ext = match[2];
                }
                var _loc = _l.alias(loc);
                if (_loc !== _defLoc || loc === _defLoc || 0 === loc.indexOf(_defLoc + "-")) {
                    // Acceptable match
                    ret = [_loc, ext];
                    return true;
                }
                return false;
            });
            return ret;
        },

        /**
         * Gets locale options for number formatting
         * @param locales {Array|String} The requested locales
         * @return {Object} The numeric options for the selected locale
         */
        numericOptions : function(locales, opts) {
            var _u = UsefulJS, _l = _u.Locale,
                lInfo = _l.lookup(locales), loc = lInfo[0], ext = lInfo[1],
                lOpts = _l.options(loc),
                lDigits = _getNumbers(lOpts.ndigits),
                ret = {}, copyOpts = ["ds", "gs", "gc", "loc", 
                    "nn", "ndigits", "cc", "cs", "cd", "cr"],
                re_n = /nu-([a-z]*)/, match_n = re_n.exec(ext);
            opts = opts || {};
            _u.forEach(copyOpts, function(item) {
                ret[item] = lOpts[item];
            });
            // Have we been asked for specific digits?
            if (match_n) {
                var nuReq = match_n[1];
                lDigits = _getNumbers(nuReq);
                ret.ndigits = _numbers.hasOwnProperty(nuReq) ?
                    nuReq : "latn";
            }
            switch (opts.style) {
                case "percent":
                    ret.patterns = lOpts.pc;
                    break;

                case "currency":
                    var dispOpt = opts.currencyDisplay || "symbol", 
                        cCode = opts.currency;
                    ret.patterns = lOpts.cf;
                    if (!cCode) {
                        throw new TypeError("Currency code is required with currency style");
                    }
                    ret.cd = (cCode in _cuDigits) ? _cuDigits[cCode] : 2;
                    ret.cr = (cCode in _cuRounding) ? _cuRounding[cCode] : null;
                    // If the locale uses different group / decimal separators
                    // for currency, apply them here
                    /*ret.ds = lOpts.cds || ret.ds;
                    ret.gs = lOpts.cgs || ret.gs;*/
                    if ("code" === dispOpt || "name" === dispOpt || !(cCode in lOpts.cu)) {
                        ret.cs = cCode;
                    }
                    else {
                        ret.cs = lOpts.cu[cCode];
                    }
                    break;

                default:
                    ret.patterns = ["%1", lOpts.nn];
                    break;
            }
            if (opts.SI) {
                // Standardized format
                ret.gs = '\u00a0';
                if (ret.ds !== ',') {
                    ret.ds = '.';
                }
                ret.gc = [];
                ret.patterns = ["%1", "-%1"];
                ret.ndigits = "latn";
                lDigits = {
                    digits : null,
                    rdigits : null
                };
            }
            if (false === opts.useGrouping) {
                ret.gs = "";
            }
            _mix(ret, lDigits, false);
            return ret;
        },

        /**
         * Gets locale options for date formatting
         * @param loc {String} The locale
         * @return {Object} The date options for the selected locale
         */
        dateOptions : function(locales, opts) {
            var _u = UsefulJS, _l = _u.Locale,
                lInfo = _l.lookup(locales), loc = lInfo[0], ext = lInfo[1],
                lOpts = _l.options(loc),
                ret = {}, copyOpts = ["loc", "ddigits", "mc", "mf", "mn",
                    "df", "dc", "da", "um", "lm", "hd", "hour12",
                    "sc", "dfmt", "tfmt", "datetime", "dateera",
                    "time12", "timetz", "fd"],
                re_n = /nu-([a-z]*)/, match_n = re_n.exec(ext),
                re_c = /ca-([a-z0-9]*)/, match_c = re_c.exec(ext);
            _u.forEach(copyOpts, function(item) {
                ret[item] = lOpts[item];
            });
            var cal = lOpts.calendar;
            var validCalendars = " buddhist gregory indian iso8601 " +
                "japanese persian roc ";
            if (match_c) {
                var reqCalendar = match_c[1];
                if (validCalendars.indexOf(' ' + reqCalendar + ' ') >= 0 &&
                    _calendars.hasOwnProperty(reqCalendar)) {
                    cal = reqCalendar;
                }
            }
            ret.cal = cal;
            var calendarObj = _loadCalendar(cal);
            if (lOpts.hasOwnProperty(cal)) {
                // Localized era names and the like
                _mix(calendarObj, lOpts[cal], false);
            }
            // Have we been asked for specific digits?
            if (match_n && !calendarObj.ddigits) {
                var nuReq = match_n[1];
                ret.ddigits = _numbers.hasOwnProperty(nuReq) ?
                    nuReq : "latn";
            }
            if (opts) {
                // Copy properties from the DateTimeFormat options blob
                copyOpts = ["timeZone", "hour12", "weekday", "year",
                    "month", "day", "hour", "minute", "second",
                    "timeZoneName", "era"];
                _u.forEach(copyOpts, function(item) {
                    if (opts.hasOwnProperty(item)) {
                        ret[item] = opts[item];
                    }
                });
            }
            // The chosen calendar may have specific rules that need to
            // be observed
            var calendarOverrides = ["hour12", "ddigits", "datetime",
                "dateera", "timetz", "fd", "mf", "mc"];
            _u.forEach(calendarOverrides, function(prop) {
                if (calendarObj.hasOwnProperty(prop)) {
                    ret[prop] = calendarObj[prop];
                }
            });
            if (calendarObj.eraRequired) {
                ret.era = "short";
            }
            if (calendarObj.dfmt) {
                // Prescribed format strings
                ret.dfmt = _u.clone(lOpts.dfmt);
                _u.mix(ret.dfmt, calendarObj.dfmt, false);
            }
            if (calendarObj.tfmt) {
                // Prescribed time formats
                ret.tfmt = _u.clone(lOpts.tfmt);
                _u.mix(ret.tfmt, calendarObj.tfmt, false);
            }
            ret.calendarObj = calendarObj;
            // Fill in missing properties
            var gaps = [["mc", "mf"], ["dc", "df"], ["da", "dc"],
                ["um", "lm"], ["lm", "um"]], p1, p2;
            _u.forEach(gaps, function(pair) {
                p1 = pair[0];
                p2 = pair[1];
                if (!ret[p1]) {
                    ret[p1] = ret[p2];
                }
            });
            // Finally, get the numbering system
            var lDigits = _getNumbers(ret.ddigits);
            _mix(ret, lDigits, false);

            return ret;
        },

        getSupported : (function() {
            var _sLocales = null;
            return function() {
                var _u = UsefulJS;
                if (null === _sLocales) {
                    _sLocales = [];
                    _u.forEach(_u.Locale, function(lProps, loc) {
                        if ("def" === loc) {
                            return;
                        }
                        if (lProps.hasOwnProperty("n")) {
                            _sLocales.push(loc);
                        }
                    });
                }
                return _u.clone(_sLocales);
            };
        })(),

        /**
         * Resolves locale aliases (for example, zh-Hans -> zh), if called
         * with multiple arguments, sets one or more aliases; if called
         * with a single argument, attempts to resolve it.
         */
        alias : (function() {
            var _aliases = {};
            return function() {
                var _a = arguments;
                if (!_a.length) {
                    return null;
                }
                var pLocale = _a[0], i, sLocale;
                if (_a.length > 1) {
                    for (i = 1; i < _a.length; i++) {
                        sLocale = _a[i];
                        _aliases[sLocale] = pLocale;
                    }
                }
                else {
                    var _u = UsefulJS, _l = _u.Locale;
                    // Do we support this directly?
                    if ("object" === _u._typeof(_l[pLocale])) {
                        return pLocale;
                    }
                    // Do we already know what it maps to?
                    if (pLocale && _aliases.hasOwnProperty(pLocale)) {
                        return _aliases[pLocale];
                    }
                    // Walk up the hierarchy until we find a directly 
                    // supported locale; fall back to the current or "en"
                    var parts = pLocale.split('-'), resolved = _l.current || "en", tLoc;
                    // We know that we don't support the full string
                    parts.pop();
                    while (parts.length) {
                        tLoc = parts.join('-');
                        if ("object" === _u._typeof(_l[tLoc])) {
                            resolved = tLoc;
                            break;
                        }
                        parts.pop();
                    }
                    // Save for later
                    _aliases[pLocale] = resolved;
                    return resolved;
                }
            };
        })(),

        /**
         * Intl API support
         */
        supportedLocalesOf : function(locales) {
            // opts is ignored
            if ("array" !== __typeof(locales)) {
                locales = [locales];
            }
            var _u = UsefulJS, _l = _u.Locale;
            return _u.filter(locales, function(loc) {
                if (_defLoc === loc || 0 === loc.indexOf(_defLoc + "-")) {
                    return true;
                }
                return (_defLoc !== _l.alias(loc));
            });
        },

        /**
         * Returns the choice of numbering systems
         */
        numberSystems : function() {
            return _keys(_numbers);
        },
        
        /**
         * Returns the choice of calendars
         */
        calendars : function() {
            return _keys(_calendars);
        }  
    };
    
    // Create the Locale "current" property; if Object.defineProperty is supported
    // we can ensure that the value is sensible
    if (_defineProperty) {
        _O.defineProperty(_localeObj, "current", {
            get : function() { return _defLoc; },
            set : function(_c) {
                if (!(__typeof(_c) === "string" && _c)) {
                    throw new TypeError("Invalid locale argument");
                }
                var _x = UsefulJS.Locale.lookup(_c);
                if (_x[0] !== _c) {
                    // Use fallback
                    _c = _x[0];
                }
                _defLoc = _c;
            },
            enumerable : true,
            configurable : false
        });
    }
    else {
        _localeObj.current = _defLoc;
    }
    
    // Maximum value of a 32-bit unsigned integer
    var uintMax = Math.pow(2, 32) - 1;

    return {
        /**
         * What is the global context?
         */
        globalObject : _globalObject,

        globalObjectName : _globalObjectName,

        // Whitespace regexes
        RE_WS : new RegExp(wsStr),
        RE_WS_START : new RegExp("^" + wsStr + "*"),
        RE_WS_END : new RegExp(wsStr + "*$"),

        featureSupport : {
            //stringIndex : _stringIndex,
            defineProperty : _defineProperty,
            createObject : _createObject,
            strictMode : _strictMode
        },

        /**
         * Determine the list separator used on this system
         */
        listSeparator : (function() {
            var a = ["a", "b"];
            var s = a.toLocaleString();
            return s.substring(1, s.length - 1).replace(/^\s+|\s+$/g, "");
        })(),

        /**
         * Drop-in replacement for typeof - gives you a better idea what sort
         * of thing its argument is
         * @param {Object} obj Any value
         * @return {String} The type of the argument: boolean, number, string, etc.
         * NOTE: Type testing does not use Array.isArray because we can add an isArray
         * function to Array for environments that do not support it natively
         */
        _typeof : __typeof,

        /**
         * Determines whether a value is null or undefined; keeps jslint happy
         * while allowing you to avoid littering your code with statements like
         * "if (x === undefined || x === null)..."
         * @param {Object} obj Any value
         * @return {Boolean} true if the input is not null or undefined
         */
        defined : _defined,

        /**
         * Clones the argument; rules are:
         *  - object, array, date, regexp: cloned; (array and object are recursive)
         *  - scalars (string, boolean, number, null, undefined): not cloned
         *  - arraybuffer: cloned if the slice method is avaiable
         *  - other builtin classes: not cloned
         * The returned value will have the same properties as the argument 
         * but, with exceptions noted above, === will return false
         * Note: an instance of a user-defined class will lose its identity if the
         * environment doesn't support Object.createObject
         * @param {Object} obj Any value
         * @return {Object} the cloned argument
         */
        clone : _clone,

        /**
         * Adds properties from one Object to another, with an option to
         * prefer the first or second argument when properties are duplicated
         * @param o1 {Object} The Object to add properties to
         * @param o2 {Object} The Object to take properties from
         * @param prefer1 {Boolean} Whether to prefer the receiving Object when
         *  properties are duplicated; defaults to true
         * @return {Object} Returns its argument
         * @throws {TypeError} When o1 or o2 is not a simple Object
         */
        mix : _mix,

        /**
         * Gets the keys of an Object - all properties for which hasOwnProperty
         * is true
         * @param obj {Object} an Object
         * @return {Array} the properties of the Object
         */
        keys : _keys,

        /**
         * Iterates over an Object until the callback returns false
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {Boolean} The last return value from the callback
         * @throws {TypeError} Callback is not a function
         */
        every : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "every");
        },

        /**
         * Iterates over an Object calling the callback for each property
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {Object} containing the properties from the input for
         *  which the callback returned true
         * @throws {TypeError} Callback is not a function
         */
        filter : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "filter");
        },

        /**
         * Iterates over an Object calling the callback for each property
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @throws {TypeError} Callback is not a function
         */
        forEach : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "forEach");
        },

        /**
         * Iterates over an Object calling the callback for each property
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {Object} containing the properties from the input
         *  transformed by the callback
         * @throws {TypeError} Callback is not a function
         */
        map : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "map");
        },

        /**
         * Iterates over an Object until the callback returns true
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {Boolean} The last return value from the callback
         * @throws {TypeError} Callback is not a function
         */
        some : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "some");
        },
        
        /**
         * Iterates over an Object until the callback returns true
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {Object} The value for which the callback evaluated to true
         * @throws {TypeError} Callback is not a function
         */
        find : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "find");
        },

        /**
         * Iterates over an Object until the callback returns true
         * @param obj {Object} an Object
         * @param callback {Function} a function to call on each iteration
         * @param ctx {Object} the calling context for the callback
         * @return {String} The key for which the callback evaluated to true
         * @throws {TypeError} Callback is not a function
         */
        findKey : function(obj, callback, ctx) {
            return _iterate(obj, callback, ctx, "findKey");
        },

       /**
         * Binds a function to a specific context
         * @param fn {Function} The function to bind
         * @param ctx {Object} The calling context to bind it to
         * Other arguments are default arguments to the bound function
         * @return {Function} the bound function
         */
        bindFunction : _bindFn,

        /**
         * Adds UsefulJS functions to global Object and builtin classes
         * @param opts {Object} The fixes to apply
         * Options for the core module are detailed below.
         * Other UsefulJS modules add their own "fixes" to the fixes map
         * @return {Object} The options successfully set
         */
        fix : function(opts) {
            var _u = UsefulJS;
            if (!_defined(opts)) {
                opts = {};
            }
            return _iterate(_u.fixes, function(fn, fixName) {
                if ("function" === __typeof(fn)) {
                    var optsIn = opts[fixName], all = ("all" === optsIn),
                        none = ("none" === optsIn), optsOut = {};
                    if ("object" !== __typeof(optsIn)) {
                        optsIn = {};
                    }
                    _u.fixes[fixName](_u, optsIn, optsOut, all, none);
                    return optsOut;
                }
                return {};
            }, null, "map");
        },

        /**
         * "Fixes" for the module:
         *  _core :
         *      (Global methods)
         *      defined, _typeof, clone
         *      (Other)
         *      language : add a "language" property to the navigator object 
         *        (default true)
         */
        fixes : {
            _core : function(_u, optsIn, optsOut, all, none) {
                var gObj = _u.globalObject, _l = _u.Locale;
                var gMethods = {
                    "defined" : _u.defined,
                    "_typeof" : _u._typeof,
                    "clone" : _u.clone
                }, mName;
                _u.forEach(gMethods, function(m, mName) {
                    if (!(false === optsIn[mName] || none || mName in gObj)) {
                        optsOut[mName] = _u._protoAdd(gObj, mName, m, false);
                    }
                });

                if ("navigator" in gObj) {
                    // Get the current language setting from the environment; 
                    // should take the form xx-XX (language code-country code)
                    // but can arrive in the form xx-xx where the country code
                    // is in lower case
                    var bLang = navigator.language || navigator.userLanguage || 
                        navigator.browserLanguage || "en";
                    var parts = bLang.split("-");
                    for (var i = 1; i < parts.length; i++) {
                        if (/[a-z]{2}/.test(parts[i])) {
                            // Should be a country code
                            parts[i] = parts[i].toUpperCase();
                        }
                    }
                    bLang = parts.join("-");
                    var supported = (_l.hasOwnProperty(bLang)),
                        supportedLoc = supported ? bLang : _l.alias(bLang);
                    // Update the current locale
                    _u.Locale.current = supportedLoc;

                    if (!(false === optsIn.language || none || 
                        navigator.language)) {
                        // Add in the navigator.language property
                        optsOut.language = _u._protoAdd(navigator, "language", 
                            bLang, true);
                    }
                }
                var protoObj = Function.prototype, pName = "bindFunction";
                mName = "bind";
                if (!(false === optsIn[pName] || none || (mName in protoObj))) {
                    // Function.prototype.bind
                    var m = function() {
                        var args = [this], i, n = arguments.length;
                        for (i = 0; i < n; i++) {
                            args.push(arguments[i]);
                        }
                        return _bindFn.apply(null, args);
                    };
                    optsOut[pName] = _u._protoAdd(protoObj, mName, m, false);
                }
                
                pName = "is";
                if (!(false === optsIn[pName] || none || (_is === _O[pName]))) {
                    optsOut[pName] = _u._protoAdd(_O, pName, _is, false);
                }
            }
        },

        /**
         * Adds a property or method to a class prototype or global Object
         * @param p {Object} The prototype to enhance
         * @param name {String} The name of the property
         * @param m {Function|Object} The value to set
         * @param enumerable {Boolean} whether the value shows up as an
         *  enumerable property; defaults to false
         * @return true if the value was set (this function does not
         *  overwrite properties with the same name)
         */
        _protoAdd : function(p, name, m, enumerable) {
            if (!_defined(p) || !name || p[name]) {
                // This ain't going to work
                return false;
            }
            if ("isExtensible" in _O && !_O.isExtensible(p)) {
                // This ain't going to work either
                return false;
            }
            // We'll do this the nice way if we can
            if (_defineProperty) {
                var descriptor = {
                    value : m,
                    enumerable : enumerable || false
                };
                try {
                    if (_O.defineProperty(p, name, descriptor)) {
                        return true;
                    }
                }
                catch(e) {
                    // Do it the old way
                }
            }
            try {
                p[name] = m;
                return true;
            }
            catch(e) {
                // No dice
            }
            return false;
        },
        
        /**
         * Constructs a random UUID (variant bits set, version 4)
         * @return {String} in 8-4-4-4-12 notation
         */
        uuid : function() {
            // Create four 32-bit random values
            var r1 = Math.floor(Math.random() * uintMax),
                r2 = Math.floor(Math.random() * uintMax),
                r3 = Math.floor(Math.random() * uintMax),
                r4 = Math.floor(Math.random() * uintMax);
                
            // Set the version bits in r3 - msb to 1, (msb - 1) to 0
            r3 &= 0xbfffffff;
            r3 |= 0x80000000;
            r3 >>>= 0;
            
            // Set the version number (4) in r2
            r2 &= 0x0ffffff;
            r2 |= 0x40000000;
            r2 >>>= 0;
            
            var b2 = _pad(r2.toString(16), 8, '0'), b3 = _pad(r3.toString(16), 8, '0');
            return _pad(r1.toString(16), 8, '0') + '-' + b2.substring(0, 4) + '-' + 
                b2.substring(4, 8) + '-' + b3.substring(0, 4) + '-' + 
                b3.substring(4, 8) + _pad(r4.toString(16), 8, '0');
        },

        /**
         * Adds padding to the start or end of a string so that it is a
         * minimum width
         * @param s {String} The string to pad
         * @param padTo {Number} The minimum length of the return value
         * @param padWith {String} (optional) The character used for
         *  padding; defaults to ' '
         * @param right {Boolean} (optional) whether to pad at the end
         *  of the string
         * @return {String} The padded string
         */
        pad : _pad,

        // I18N / L10N support
        Locale : _localeObj,
        
        // fromCodePoint implementation (if not implemented in the browser)
        fromCodePoint : _fromCodePoint,
        // codePointAt implementation (if not already implemented)
        codePointAt : _codePointAt,
        // Object.is implementation (if not implemented in the browser)
        is : _is
    };
})();

