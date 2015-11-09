/**
 * String formatting, encoding and escaping
 * Author: Christopher Williams
 */

UsefulJS.String = (function() {
    "use strict";
    
    // Does the system support codepoint escaping?
    var _cpEscaping = false;
    try {
        // Attempt to evaluate a \u{...} escape sequence
        eval("\"\\u{41}\"");
        _cpEscaping = true;
    }
    catch(e) {}
    
    /**
     * Fixes for this module
     * _string :
     *      includes / endsWith / startsWith / repeat: Adds missing methods to
     *       String prototype (default true for all)
     *      trim / trimLeft / trimRight : adds missing leading and
     *       trailing whitespace removal methods to String prototype
     *       (default true for all)
     *      padLeft / padRight : adds pad methods (default false)
     *  fixSplit : fixes bug in split where "A-B".split(/-/) returns the
     *    same value as "-A-B".split(/-/); property set in optsOut is
     *    splitFixed (default false)
     */
    UsefulJS.fixes._string = function(_u, optsIn, optsOut, all, none) {
        // Throws if null is passed to a generic String prototype function, e.g. through
        // String.prototype.blah.call(...)
        // If this is non-null, returns its input coerced to String
        var _checkStr = function(s) {
            if (!_u.defined(s)) {
                throw new TypeError("this cannot be null or undefined");
            }
            return '' + s;
        };

        var pMethods = {
            // Implementations of recent methods
            includes : function(s, pos) {
                pos >>>= 0; // Uint32 coercion
                var str = _checkStr(this);
                return (str.indexOf(String(s), pos) >= 0);
            },
            endsWith : function(s, pos) {
                var str = _checkStr(this);
                s = String(s);
                pos = ((pos >>> 0) || str.length) - s.length;
                if (pos < 0) {
                    return false;
                }
                var idx = this.lastIndexOf(s, pos);
                return (idx >= 0 && idx === pos);
            },
            startsWith : function(s, pos) {
                pos >>>= 0;
                var str = _checkStr(this);
                return (pos >= 0 &&
                    str.indexOf(String(s), pos) === pos);
            },
            // Trims whitespace from the left, right or both ends
            // of a string
            trim : function() {
                var str = _checkStr(this);
                return str.replace(
                    _u.RE_WS_START, "").replace(_u.RE_WS_END, "");
            },
            trimLeft : function() {
                var str = _checkStr(this);
                return str.replace(_u.RE_WS_START, "");
            },
            trimRight : function() {
                var str = _checkStr(this);
                return str.replace(_u.RE_WS_END, "");
            },
            repeat : function(count) {
                var str = _checkStr(this);
                if (!(_u.defined(count) && (count === count))) {
                    // Null or NaN
                    return "";
                }
                else if (count < 0 || !isFinite(count)) {
                    // Less than zero or infinity
                    throw new RangeError("Invalid count value");
                }
                return _u.pad("", count >>> 0, str);
            },
            codePointAt : _u.codePointAt
        };
        // Add pad methods if explicitly asked for
        if (true === optsIn.padLeft || all) {
            pMethods.padLeft = function(t, w) {
                return _u.pad(_checkStr(this), t, w);
            };
        }
        if (true === optsIn.padRight || all) {
            pMethods.padRight = function(t, w) {
                return _u.pad(_checkStr(this), t, w, true);
            };
        }

        var protoObj = String.prototype, mName, m;
        for (mName in pMethods) {
            if (!(false === optsIn[mName] || none)) {
                m = pMethods[mName];
                optsOut[mName] = _u._protoAdd(protoObj,
                    mName, m, false);
            }
        }
        
        var sMethods = {
            fromCodePoint : _u.fromCodePoint
        };
        protoObj = String;
        for (mName in sMethods) {
            if (!(false === optsIn[mName] || none)) {
                m = sMethods[mName];
                optsOut[mName] = _u._protoAdd(protoObj,
                    mName, m, false);
            }
        }

        // Fix bug in split when the string starts and/or ends with the
        // delimiter and the delimiter is a regex
        /*if ((true === optsIn.fixSplit || all) &&
            ("A-B".split(/-/).length === "-A-B".split(/-/).length)) {
            if (_u._protoAdd(protoObj, "__BADSPLIT_R__",
                protoObj.split, false)) {
                protoObj.split = function() {
                    var ret = this.__BADSPLIT_R__.apply(this, arguments),
                        delim = arguments[0];
                    // Don't apply the patch if the input is //
                    if ("regexp" === UsefulJS._typeof(delim) && delim.source) {
                        if (0 === this.search(delim)) {
                            // We'll be lacking an empty string at the front of
                            // the return value
                            ret.unshift("");
                        }
                        // Test for the regex matching the end of the string
                        var src = delim.source;
                        if (src.charAt(0) !== "^") {
                            if (src.charAt(src.length - 1) !== "$") {
                                src += "$";
                            }
                            var re2 = delim.ignoreCase ? new RegExp(src, "i") :
                                new RegExp(src);
                            if (re2.test(this)) {
                                ret.push("");
                            }
                        }
                    }
                    return ret;
                };
                optsOut.splitFixed = true;
            }
        }*/
        
        _u.featureSupport.string = {
            codePointEscaping : _cpEscaping
        };
    };
    
    // sprintf regexes
    var fRe = /[diueEfoxXsbBc%]/,   // Field name
        nfRe = /[diueEfgGoxXbBc]/,  // Numeric field name
        nR1 = /[1-9]/,              // Numeric value in the first position
        nR2 = /[0-9]/,              // Number after the first position
        flagsR = /[\-\+ 0\#\,]/,    // Picks out a format flag
        uR = /[ouxXbB]/,            // Unsigned number field
        sR = /[difeEgG]/,           // Signed number field
        baseR = /[box]/i,           // Binary / octal / hex
        fpR = /[feEgG]/;            // Floating point field 
        
    // Ranges for combining characters
    /*var _comb = [
        0x300, 0x36f, 0x1ab0, 0x1aff, 0x1dc0, 0x1dff, 0x20d0, 0x20ff, 0xfe20, 0xfe2f
    ];
    
    // Checks whether a given codepoint represents a combining character
    var _isCombining = function(cp) {
        var i;
        for (i = 0; i < _comb.length; i += 2) {
            if (cp < _comb[i]) {
                return false;
            }
            if (cp <= _comb[i + 1]) {
                // Within a range
                return true;
            }
        }
        return false;
    };*/
        
    var _u = UsefulJS, __typ = _u._typeof;
    
    // Scans past an invalid UTF-8 sequence looking for the next start character
    var _skipBadUtf8 = function(s, pos) {
        var ret = s.length, c;
        while (pos < ret) {
            c = s.charCodeAt(pos);
            if (c < 0x80 || c > 0xBF) { // Not a continuation byte
                ret = pos;
                break;
            }
            ++pos;
        }
        return ret;
    }
    
    return {
        /**
         * Inserts one or more values into numbered placeholders in the
         * input string
         * Usage: format(s, v1, v2, ...)
         */
        /*format : function() {
            // Start at the end so that we don't replace, for example,
            // the %10 placeholder with the first substitution value
            // (which goes in the %1 slot)
            var ret = String(arguments[0]), pat;
            for (var i = arguments.length - 1; i >= 1; i--) {
                pat = new RegExp("%" + i, "g");
                ret = ret.replace(pat, String(arguments[i]));
            }
            return ret;
        },*/
        
        sprintf : function() {
            var fmt = arguments[0], argIdx = 1;
            if ("string" !== __typ(fmt)) {
                return "";
            }
            var nc = fmt.length, aRet = [], c, i, 
                numberOpts = _u.Locale.numericOptions();
            for (i = 0; i < nc; ++i) {
                c = fmt.charAt(i);
                if ('%' !== c) {
                    // Normal character
                    aRet.push(c);
                    continue;
                }
                // Substitution token
                var _argIdx = null, rightAligned = true, posPfx = "", padChar = '\xA0',
                    altForm = false, w = 0, prec = null, nBuf = "", 
                    j, f, numberMode = false, flagsDone = false, advArg = true, 
                    grouping = false, fmtObj = null, localeAware = false;
                for (j = i + 1; j < nc; j++) {
                    c = fmt.charAt(j);
                    
                    if (fRe.test(c)) {
                        // Found our field - finally!
                        f = c;
                        break;
                    }
                    if (nR1.test(c) && !numberMode) {
                        nBuf = c;
                        numberMode = true;
                        flagsDone = true;
                    }
                    else if (nR2.test(c) && numberMode) {
                        nBuf += c;
                    }
                    else if ('.' === c) {
                        // Start of the precision specification
                        if (nBuf) {
                            // Any numbers are the width
                            w = parseInt(nBuf, 10);
                        }
                        nBuf = c;
                        numberMode = true;
                        flagsDone = true;
                    }
                    else if ('$' === c && nBuf) {
                        // For example, %2$d - use the second argument; this precedes flags
                        // so we need to unset flagsDone
                        _argIdx = parseInt(nBuf, 10);
                        advArg = false;
                        numberMode = false;
                        flagsDone = false;
                        nBuf = "";
                    }
                    else if ('*' === c) {
                        if ("number" !== __typ(arguments[argIdx])) {
                            throw new TypeError("Dynamic value requires a numeric argument at index " + argIdx); 
                        }
                        // Wildcard means use the next argument for a dynamic width / precision
                        if ('.' === nBuf.charAt(0)) {
                            // Precision
                            nBuf = '.' + arguments[argIdx].toString();
                        }
                        else {
                            nBuf = arguments[argIdx].toString();
                        }
                        numberMode = false;
                        ++argIdx;
                    }
                    else if (flagsR.test(c) && !flagsDone) {
                        // Display flag
                        switch (c) {
                            case '-':
                                rightAligned = false;
                                break;
                            case '+':
                                posPfx = '+';
                                break;
                            case ' ':
                                if (!posPfx) {
                                    posPfx = '\xA0';
                                }
                                break;
                            case '0':
                                padChar = '0';
                                break;
                            case ',':
                                // Use grouping for formatting numbers
                                grouping = true;
                                break;
                            case '#':
                                altForm = true;
                                break;
                        }
                    }
                    else {
                        // Not something we expect to see
                        throw new TypeError("Unexpected character " + c + " in field at offset " + j);
                    }
                }
                
                if (nBuf) {
                    // This will either be the width or precision
                    if ('.' === nBuf.charAt(0)) {
                        if ('.' === nBuf) {
                            prec = 0;
                        }
                        else {
                            var _prec = parseInt(nBuf.substring(1, nBuf.length), 10);
                            if (_prec >= 0) {
                                prec = _prec;
                            }
                        }
                    }
                    else {
                        // Field width
                        w = Math.max(parseInt(nBuf, 10), 0);
                    }
                }
                
                if (null === prec && fpR.test(f)) {
                    // Apply default precision
                    prec = 6;
                }
                
                var fmtOpts;
                if ("Number" in _u) {
                    if (f === 'f' || f === 'd') {
                        fmtOpts = {
                            useGrouping : grouping,
                            maximumFractionDigits : 0
                        };
                        if (f === 'f') {
                            fmtOpts.minimumFractionDigits = fmtOpts.maximumFractionDigits = prec;
                        }
                        fmtObj = new _u.Number.Format(null, fmtOpts);
                        localeAware = true;
                    }
                }
                else if (f === 'd') {
                    // Fall back to non-locale
                    f = 'i';
                }
                
                var encoded;
                if ('%' == f) {
                    // %% - a percent character
                    encoded = '%';
                    advArg = false;
                }
                else {
                    // Positional parameter takes precedence
                    var idx = _argIdx || argIdx;
                    // Get the value to format
                    var v = arguments[idx];
                    // Check the argument type
                    var expected = "number";
                    if ('s' === f) {
                        expected = "string";
                    }
                    var t = __typ(v);
                    if (t !== expected) {
                        throw new TypeError("Expected " + expected + " argument at offset " + 
                            idx + "; got " + t);
                    }
                    
                    if ('i' === f) {
                        // Convert to signed integer
                        v >>= 0;
                    }
                    
                    if (uR.test(f)) {
                        // Unsigned integer
                        v >>>= 0;
                    }
                    
                    // Adjust field width if we're going to apply a prefix to a 0-padded number
                    if (w && '0' === padChar && sR.test(f) && posPfx) {
                        --w;
                    }

                    if (!rightAligned) {
                        // Only use ' ' as the padding character
                        padChar = '\xA0';
                    }
                    
                    // Get the base encoded field value
                    switch (f) {
                        case 'b':
                        case 'B':
                            // Binary
                            encoded = v.toString(2);
                            break;
                            
                        case 'u':
                        case 'i':
                            // Base 10
                            encoded = v.toString(10);
                            break;
                            
                        case 'd':
                            // Locale-aware, always
                            encoded = fmtObj.format(v);
                            break;

                        case 'f':
                            // Floating point
                            if (localeAware) {                                
                                encoded = fmtObj.format(v);
                            }
                            else {
                                encoded = v.toFixed(prec);
                            }
                            break;

                        case 'o':
                            // Octal
                            encoded = v.toString(8);
                            break;
                            
                        case 'x':
                        case 'X':
                            // Hex
                            encoded = v.toString(16);
                            break;
                            
                        case 's':
                            if (null !== prec && prec < v.length) {
                                // Truncate the string
                                encoded = v.substring(0, prec);
                            }
                            else {
                                encoded = v;
                            }                            
                            if (null !== w) {
                                // Pad the string
                                encoded = _u.pad(encoded, w, padChar, !rightAligned);
                            }
                            break;
                            
                        case 'e':
                        case 'E':
                            // Exponential
                            encoded = v.toExponential(prec);
                            break;
                            
                        case 'c':
                            // Character specified by code point
                            encoded = _u.fromCodePoint(v);
                            break;
                                                  
                    }
                    
                    // Exponent should have a minimum of two digits
                    if (/e[+-]\d$/.test(encoded)) {
                        var d = encoded.charAt(encoded.length - 1);
                        encoded = encoded.substring(0, encoded.length - 1) + '0' + d;
                    }
                    
                    if (localeAware) {
                        // Is the number right aligned?
                        var nn = numberOpts.nn;
                        // Split the negative pattern around %d
                        var parts = nn.split("%1"), reneg = false;                        
                        if (v < 0 && w > 1 && '0' === padChar) {
                            // Strip off the negative sign
                            if (parts[0]) {
                                encoded = encoded.substring(parts[0].length, encoded.length);
                            }
                            if (parts[1]) {
                                encoded = encoded.substring(0, encoded.length - parts[1].length);
                            }
                            --w;
                            // We'll have make the number negative again after padding
                            reneg = true;
                        }
                        if (w > 0 && '0' === padChar) {
                            // Apply padding before adding the sign back in
                            if (numberOpts.digits) {
                                // Use localized 0
                                padChar = numberOpts.digits.charAt(0);
                            }
                            encoded = _u.pad(encoded, w, padChar, !rightAligned);
                            w = 0;
                        }
                        if (posPfx) {
                            // Replace the negative number sign in nn pattern
                            // with the prefix and apply the nn pattern
                            nn = nn.replace(/[-\u2212]/, posPfx);
                            reneg = true;
                        }
                        if (reneg) {
                            encoded = nn.replace("%1", encoded);
                        }
                        
                        if (w > 0) {
                            // Apply padding after the sign
                            encoded = _u.pad(encoded, w, padChar, !rightAligned);
                            w = 0;
                        }
                    }
                    else if (v < 0 && '0' === padChar) {
                        // Remove the negative sign so we can pad
                        encoded = encoded.substring(1, encoded.length);
                        --w;
                        posPfx = '-';
                    }
                    
                    var basePfx = {
                        b : "0b",
                        B : "0B",
                        o : "0",
                        x : "0x",
                        X : "0x"
                    }
                    
                    // Now apply field width, where appropriate
                    if (nfRe.test(f)) {
                        if (baseR.test(f) && '0' === padChar && altForm) {
                            // Reduce padding width by the length of the prefix
                            w -= basePfx[f].length;
                        }
                        if ('\xA0' === padChar) {
                            // Apply prefix before padding
                            switch (f) {
                                case 'b':
                                case 'B':
                                case 'o':
                                case 'x':
                                case 'X':
                                    if (altForm) {
                                        encoded = basePfx[f] + encoded;
                                    }
                                    break;
                                   
                                case 'i':
                                case 'e':
                                case 'E':
                                case 'g':
                                case 'G':
                                    encoded = posPfx + encoded;
                                    break
                            }
                        }
                        if (w > 0 && nfRe.test(f)) {
                            // If the number is right aligned, it needs to be left-padded
                            // and vice-versa
                            encoded = _u.pad(encoded, w, padChar, !rightAligned);
                        }
                        if ('0' === padChar) {
                            // Apply prefix after padding
                            switch (f) {
                                case 'b':
                                case 'B':
                                case 'o':
                                case 'x':
                                case 'X':
                                    if (altForm) {
                                        encoded = basePfx[f] + encoded;
                                    }
                                    break;
                                    
                                case 'i':
                                case 'e':
                                case 'E':
                                case 'g':
                                case 'G':
                                    encoded = posPfx + encoded;
                                    break;
                                                                       
                                    break;
                            }
                        }
                    }
                    
                    if ('X' === f || 'B' === f) {
                        // Field value is uppercase
                        encoded = encoded.toUpperCase();
                    }
                    else if ('G' === f || 'E' === f) {
                        // Exponential in uppercase
                        encoded = encoded.replace(/e/, "E");
                    }
                    
                }
                aRet.push(encoded);
                
                // Advance the argument, if appropriate
                if (advArg) {
                    ++argIdx;
                }    
                    
                // Skip the field
                i = j;
            }
            if (i < fmt.length) {
                // Haven't consumed the entire string
                aRet.push(fmt.substring(i, fmt.length));
            }
            return aRet.join("");
        },
        
        /**
         * Counts the characters in a string. Carefully.
         * @param s {String} The string to evaluate
         * @return {Number} The length of the string
         */
        /*strlen : function(s) {
            if (!s) {
                if (0 === s) {
                    return 1;
                }
                return 0;
            }
            s = "" + s;
            var n = s.length, ret = 0, i, cp;
            for (i = 0; i < n; ++i) {
                cp = _u.codePointAt.call(s, i);
                if (_isCombining(cp)) {
                    // This doesn't count as a character in its own right
                    continue;
                }
                ++ret;
                if (cp >= 0x10000) {
                    // Uses two 16-bit characters in its encoding
                    ++i;
                }
            }
            return ret;
        },*/

        encode : {
            /**
             * Transforms a Unicode string to a sequence of UTF-8 encoded
             * bytes for example, to use in an AJAX call
             * @param s {String} The string to encode
             * @return {String} The UTF-8 encoded bytes
             */
            toUtf8 : function(s) {
                var a = [], unknownCP = [0xef, 0xbf, 0xbd], pos = 0, b2 = 1 << 11,
                    b3 = 1 << 16, cp, mask6 = 0x3f, i, utf8;
                while (pos < s.length) {
                    cp = _u.codePointAt.call(s, pos++);
                    if (cp < 0x80) {
                        // ASCII character
                        utf8 = [cp];
                    }
                    else if (cp >= 0xD800 && cp <= 0xDFFF) {   // Half of a surrogate pair
                        utf8 = unknownCP;
                    }
                    else { 
                        var utf8 = [0xc0, 0x80]; // 110xxxxx 10xxxxxx; two byte sequence
                        if (cp >= b2) {
                            // Three bytes required
                            utf8[0] |= 32; // 00010000
                            utf8.push(0x80);
                        }
                        if (cp >= b3) {
                            // Fourth byte
                            utf8[0] |= 16; // 00001000
                            utf8.push(0x80);
                            // And we've consumed an extra character in the input
                            ++pos;
                        }
                        // Go left along the array; for each item bitwise OR the bottom 6
                        // bits of cp in with the value at that slot then shift cp right by 6
                        for (i = utf8.length - 1; i >= 0; i--) {
                            utf8[i] |= cp & mask6;
                            cp >>= 6;
                        }
                    }
                    // Each item in utf8 is now the character code that we want
                    for (i = 0; i < utf8.length; i++) {
                        a.push(String.fromCharCode(utf8[i]));
                    }
                }
                return a.join("");
            },
            /**
             * Transforms UTF-8 encoded data into a Unicode string
             */
            fromUtf8 : function(s) {
                var a = [], unknownCP = 0xFFFD, pos = 0, b = [0, 194, 224, 240],
                    inv1 = 0xC0, inv2 = 0xC1, inv3 = 0xF5, cont = [0x80, 0xBF], c, i, mask,
                    invCP = 0x110000, mask6 = 0x3F, cp, seqLen;
                while (pos < s.length) {
                    c = s.charCodeAt(pos);
                    cp = invCP;
                    // If we find ourselves in the middle of a sequence or at an invalid 
                    // start byte, skip to the next start sequence
                    if ((c >= cont[0] && c <= cont[1]) || // Continuation byte
                        c === inv1 || c === inv2 ||       // Start of an overlong sequence
                        c >= inv3) {                      // Start of codepoint > 0x10ffff
                        pos = _skipBadUtf8(s, pos + 1);
                    }
                    else {
                        ++pos;
                        seqLen = 1;
                        // How many bytes in this sequence?
                        mask = 7; // 11110xxx - the first byte of a four-byte sequence
                        for (i = b.length - 1; i >= 0; --i) {
                            if (c >= b[i]) {
                                break;
                            }
                            // Another bit in the first byte is significant
                            mask = (mask << 1) | 1;
                        }
                        if (i) {
                            cp = c & mask;
                            while (i && pos < s.length) {
                                c = s.charCodeAt(pos);
                                if (c < cont[0] || c > cont[1]) {
                                    // Not a continuation byte
                                    break;
                                }
                                // The lower six bits contain data of interest
                                cp = (cp << 6) | (c & mask6);
                                --i;
                                ++pos;
                                ++seqLen;
                            }
                            if (i) {
                                // Didn't get a complete sequence
                                cp = invCP;
                            }
                        }
                        else {
                            // ASCII character
                            cp = c;
                        }
                    }
                    if (cp >= invCP ||                      // Outside permitted range
                        (cp >= 0xD800 && cp <= 0xDFFF) ||   // Half of a surrogate pair
                        (seqLen >= 2 && cp < 0x80) ||       // Should have been 1
                        (seqLen >= 3 && cp < 0x800) ||      // Should have been 2
                        (seqLen >= 4 && cp < 0x10000)       // Should have been 3
                    ) {
                        // Represent the character with the replacement character
                        cp = unknownCP;
                    }
                    a.push(_u.fromCodePoint(cp));
                }
                return a.join("");
            },

            // Newline canonicalization, either '\n' (Unix) or '\r\n' (DOS)
            crlf : function(s) {
                return String(s).replace(/\r/g, "").split("\n").join("\r\n");
            },
            lf : function(s) {
                return String(s).replace(/\r/g, "");
            }
        },
        escape : {
            /**
             * Does basic HTML escaping on the input:
             *  & -> &amp;
             *  < -> &lt;
             * Note that this function should only be used to escape data
             * that you trust. Untrusted strings can contain HTML script
             * tags encoded in ways that this function will not mask. If
             * in doubt, use document.createTextNode so that the string is
             * plain data.
             * @param s {String} The string to escape
             * @return {String} The escaped string
             */
            html : function(s) {
                return String(s).replace(/&/g, "&amp;").
                    replace(/</g,  "&lt;").
                    replace(/>/g,  "&gt;").
                    replace(/"/g,  "&quot;").
                    replace(/'/g,  "&#x27;").
                    replace(/\//g, "&#x2f;");
            },
            /**
             * Escapes characters tht would otherwise be interpreted by the
             * Javascript interpreter:
             * Backslash escapes quote characters, \t\r\n and the backslash
             * character itself.
             * Otherwise, any characters outside the printable ASCII range
             * are turned into '\xNN', '\uxxxx' or '\u{ ... }' sequences
             * @param s {String} The string to escape
             * @return {String} The escaped string
             */
            js : function(s) {
                s = String(s);
                // Whitelisted characters - alphanumerics
                var wl = /[A-Za-z0-9]/, xmax = 0xff, ret = [], c, ch, n = s.length;
                for (var i = 0; i < n; i++) {
                    c = _cpEscaping ? _u.codePointAt.call(s, i) : s.charCodeAt(i);
                    ch = s.charAt(i);
                    if (wl.test(ch)) {
                        // Alpha
                        ret.push(ch);
                    }
                    else if (c <= xmax) {
                        // Represent this using a \xNN sequence
                        ret.push("\\x" + UsefulJS.pad(c.toString(16), 2, "0"));
                    }
                    else if (_cpEscaping) {
                        // Use a \u{ ... } escape sequence
                        ret.push("\\u{" + c.toString(16) + "}");
                    }
                    else {
                        // Use a \uXXXX unicode escape sequence
                        ret.push("\\u" + 
                            UsefulJS.pad(c.toString(16), 4, "0"));
                    }
                    if (c >= 0x10000) {
                        // Two "characters"
                        ++i;
                    }
                }
                return ret.join("");
            },
            /**
             * Escapes characters that are significant when included in a
             * regular expression.
             * The following characters are backslash-escaped:
             *  \.-[]{}()^$|+?*
             * @param {String} s The string to escape
             * @return {String} The escaped string
             */
            regex : function(s) {
                var metaChars = "\\.-[]{}()^$|+?*", re, rep,
                    ret = String(s);
                for (var i = 0; i < metaChars.length; i++) {
                    rep = "\\" + metaChars.charAt(i);
                    re = new RegExp(rep, "g");
                    ret = ret.replace(re, rep);
                }
                return ret;
            }
        }
    };
})();

