/**
 * Number formatting and parsing
 * Mathematical routines
 * Author: Christopher Williams
 */

UsefulJS.Number = (function() {
    "use strict";

    var _u = UsefulJS, _l = _u.Locale, __typ = _u._typeof,
        __def = _u.defined, __sep = "\xA0×\xA0", 
        INF = Number.POSITIVE_INFINITY, NINF = Number.NEGATIVE_INFINITY, NAN = Number.NaN;
    // Get the EPSILON (smallest interval between distinguishable numbers)
    // value for this system
    var _epsilon = (function() {
        if ("EPSILON" in Number) {
            return Number.EPSILON;
        }
        var eps = 1;
        // Halve epsilon until we can no longer distinguish
        // 1 + (eps / 2) from 1
        do {
            eps /= 2;
        }
        while (1 + (eps / 2) != 1);
        return eps;
    })();
    
    var _maxSafeInt = Math.pow(2, 53) - 1, _minSafeInt = -_maxSafeInt;

    // Scales in powers of 10
    var _scales = {
        Y : 24,
        Z : 21,
        E : 18,
        P : 15,
        T : 12,
        G : 9,
        M : 6,
        k : 3,
        K : 3,
        h : 2,
        da : 1,
        d : -1,
        c : -2,
        m : -3,
        // "µ" is hard to type so the scale may be specified as "micro"
        "µ" : -6,
        n : -9,
        p : -12,
        f : -15,
        a : -18,
        z : -21,
        y : -24
    };

    // Scales in powers of 2
    var _bscales = {
        Y : 80,
        Z : 70,
        E : 60,
        P : 50,
        T : 40,
        G : 30,
        M : 20,
        K : 10
    };

    // SI-units
    var _units = {
        // Basic
        metre : "m",
        kilogram : "kg",
        second : "s",
        ampere : "A",
        kelvin : "K",
        mole : "mol",
        candela : "cd",
        // Derived
        radian : "rad",
        steradian : "sr",
        hertz : "Hz",
        newton : "N",
        pascal : "Pa",
        joule : "J",
        watt : "W",
        coulomb : "C",
        volt : "V",
        farad : "F",
        ohm : "Ω",
        siemens : "S",
        weber : "Wb",
        tesla : "T",
        henry : "H",
        celsius : "°C",
        lumen : "lm",
        lux : "lx",
        becquerel : "Bq",
        gray : "Gy",
        sievert : "Sv",
        katal : "kat",
        // Non-SI units
        gram : "g",
        minute : "min",
        hour : "h",
        day : "d",
        year : "y",
        degree : "°",
        arcminute : "\u2032", // PRIME
        arcsecond : "\u2033", // DOUBLE PRIME
        hectare : "ha",
        litre : "l",
        tonne : "t",
        angstrom : "Å",
        // Unit when dealing with file size, memory capacity, etc.
        bytes : "B",
        // Alternate spellings
        meter : "m",
        liter : "L"
    };

    var _maxInt = 999999999999999;
    
    // Rounding algorithms
    var _ralgs = {
        HALF_UP : 0,
        AWAY_FROM_0 : 1,
        TO_EVEN : 2
    };

    // Trims the fractional portion of a number string to a fixed width;
    // Handles tiny errors caused by _round and enables, e.g.,
    // a minimum of two fractional digits for currency format
    var _trimFraction = function(s, minFd, maxFd) {
        var splitPoint = s.indexOf('.'), _u = UsefulJS, i = s, j, f = "";
        if (splitPoint === -1 && minFd === 0) {
            return s;
        }
        if (!__def(minFd)) {
            minFd = 0;
        }
        if (!__def(maxFd)) {
            maxFd = 2;
        }
        if (splitPoint >= 0) {
            f = s.substring(splitPoint + 1, s.length);
            i = s.substring(0, splitPoint);
        }
        if (minFd) {
            for (j = f.length; j < minFd; j++) {
                f += '0';
            }
        }
        else {
            f = f.substring(minFd, maxFd).replace(/0+$/, "");
        }
        if (f) {
            return i + '.' + f;
        }
        return i;
    };
    
    // Stringifies numbers, paying attention to very large and very small quantities
    var _toString = function(n) {
        var parts = n.toExponential().split("e"), mag = parseInt(parts[1], 10), 
            _n = parts[0];
        parts = _n.split(".");
        var iPart = parts[0], dPart = parts[1] || "", sig, ret;
        if (n < 0) {
            iPart = iPart.substring(1, iPart.length);
            sig = '-';
        }
        if (mag > 0) {
            ret = iPart + dPart;
            if (ret.length < mag + 1) {
                // Pad to the right with zeroes
                ret = _u.pad(ret, mag + 1, '0', true);
            }
            else {
                // Need to insert the decimal place at the right point
                iPart = ret.substring(0, 1 + mag);
                dPart = ret.substring(1 + mag, ret.length);
                ret = iPart;
                if (dPart) {
                    ret += '.' + dPart;
                }
            }
        }
        else if (mag < 0) {
            mag = -mag;
            // 0.0 followed by mag-1 x '0' followed by iPart + dPart
            ret = _u.pad("0.", mag + 1, '0', true) + iPart + dPart;
        }
        else {
            return _n;
        }
        if (sig) {
            ret = sig + ret;
        }
        return ret;
    };
    
    /*** APPROXIMATE ROUNDING ALGORITHMS ***/
    
    /*var _round2PlusInfinity = function(n, fd) {
        // Basic algorithm is floor(n + 0.5)
        // However, floating point error can cause result to be floor(n) 
        // even when (n + 0.5) >= ceil(n) so take the relative error into account
        var scale = Math.pow(10, fd),
            inter = n * scale + 0.5, _inter = Math.round(inter),
            relativeErr = Math.abs(Math.abs(_inter - inter) / inter);
        if (relativeErr <= _epsilon) {
            // Assume the rounded value is correct
            inter = _inter;
        }
        else {
            // floor(n + 0.5) gives the right answer
            inter = Math.floor(inter);
        }
        return _toString(inter / scale);
    };*/
    
    // Implementation of round half to even
    /*var _roundTowardsEven = function(n, fd) {
        var neg = false;
        if (n < 0) {
            // Round half to even is symmetric
            neg = true;
            n = -n;
        }
        var scale = Math.pow(10, fd), _bigger = n * scale,
            inter = _bigger + 0.5, _inter, 
            _r = Math.round(inter), relativeErr = Math.abs(Math.abs(_r - inter) / inter);
        if (relativeErr <= _epsilon) {
            // Exactly half way (to all intents and purposes); round towards the even number
            var _interUp = Math.ceil(_bigger);
            _inter = (_interUp % 2) ? _interUp - 1 : _interUp;
        }
        else {
            _inter = Math.round(_bigger);
        }
        var rounded = _inter / scale;
        if (neg) {
            rounded = -rounded;
        }
        return _toString(rounded);
    };*/
    
    /*** EXACT ROUNDING ALGORITHMS ***/
    
    // The numeric value of the '0' character
    var _zero = '0'.charCodeAt(0),
    // For suppressing -0
        _likeZero = /^0(?:\.0*)?$/;
    
    // Numerically increments a string
    var _incStr = function(s, pos) {
        if (pos >= 0) {
            var p1 = s.substring(0, pos), p2 = s.substring(pos, pos + 1);
            if ('.' === p2.charAt(0)) {
                return _incStr(p1, pos - 1) + '.';
            }
            var d = s.charCodeAt(pos) - _zero + 1;            
            if (d >= 10) {
                d -= 10;
                // Carry 1
                p1 = _incStr(p1, pos - 1);
            }
            p2 = String.fromCharCode(d + _zero);
            return p1 + p2;
        }
        // We've incremented off the left edge of the string so do the final carry
        return '1' + s;
    };
    
    // Implementation of round to plus infinity (exact)
    var _round2PlusInfinity = function(n, fd) {
        var s = _toString(Math.abs(n));
        var pos = s.indexOf('.');
        // _toString gives x or x.yyy not .yyy
        if (pos >= 1) {
            var nd = s.length, rpos = pos + fd + 1;
            if (rpos < nd) {
                var d = s.charCodeAt(rpos) - _zero, up = d >= 5;
                if (d === 5 && n < 0) {
                    up = false;
                }                
                if (up) {
                    // Round up
                    s = _incStr(s.substring(0, rpos), rpos - 1);
                }
                else {
                    // Simply truncate
                    s = s.substring(0, rpos);
                }
            }
        }
        if (n < 0 && !_likeZero.test(s)) {
            s = '-' + s;
        }
        return s;
    };
    
    // Implementation of round half to even (exact)
    var _roundTowardsEven = function(n, fd) {
        var neg = false;
        if (n < 0) {
            // Round half to even is symmetric
            neg = true;
            n = -n;
        }
        var s = _toString(Math.abs(n));
        var pos = s.indexOf('.');
        if (pos >= 1) {
            var nd = s.length, rpos = pos + fd + 1;
            if (rpos < nd) {
                var d = s.charCodeAt(rpos) - _zero, up = d > 5;
                if (d === 5) {
                    // Check the previous digit
                    var c, _rp = rpos, _d;
                    do {
                        c = s.charAt(--_rp);
                    }
                    while (c === '.');
                    _d = s.charCodeAt(_rp) - _zero + 1;
                    // Up if the previous digit will be even
                    up = (0 === _d % 2);
                }                
                if (up) {
                    // Round up
                    s = _incStr(s.substring(0, rpos), rpos - 1);
                }
                else {
                    // Simply truncate
                    s = s.substring(0, rpos);
                }
            }
        }
        if (neg && !_likeZero.test(s)) {
            s = '-' + s;
        }
        return s;
    };
    
    // Implementation of round half away from zero
    var _roundAwayFromZero = function(n, fd) {
        if (n >= 0) {
            return _round2PlusInfinity(n, fd);
        }
        var ret = _round2PlusInfinity(-n, fd);
        if (!_likeZero.test(ret)) {
            ret = '-' + ret;
        }
        return ret;
    };
    
    // Rounding function with algorithm specified
    var _round = function(n, fd, alg) {
        fd >>>= 0;
        switch (alg) {
            case _ralgs.HALF_UP:
                return _round2PlusInfinity(n, fd);
                
            case _ralgs.AWAY_FROM_0:
                return _roundAwayFromZero(n, fd);
                
            default:
                return _roundTowardsEven(n, fd);
        }
    };

    // Applies significant digits
    var _significantDigits = function(s, opts) {
        var minSd = opts.minSd, sd = opts.sd, t;
        if (!(__def(minSd) || __def(sd))) {
            // Nothing to do
            return s;
        }
        sd >>>= 0;
        if (sd > 1) {
            t = parseFloat(Number(s).toPrecision(sd)).toString();
            if (t !== s) {
                return t;
            }
        }
        minSd >>>= 0;
        if (minSd > 1) {
            // Get the position of the decimal point and the
            // first significant digit
            t = s;
            var dPos = t.indexOf('.');
            if (dPos > 0) {
                t = t.replace('.', "");
            }
            else {
                dPos = t.length;
            }
            var nPos = t.search(/[1-9]/), p1 = "", p2;
            if (nPos > 0) {
                p1 = t.substring(0, nPos);
                t = t.substring(nPos, t.length);
            }
            t = p1 + _u.pad(t, minSd, '0', true);
            p1 = t.substring(0, dPos);
            p2 = t.substring(dPos, t.length);
            if (p2) {
                t = p1 + '.' + p2;
            }
            return t;
        }
        return s;
    };

    // Format helper function. Does grouping of the integer part
    var _formatDigits = function(n, opts) {
        // Apply minimumIntegerDigits
        n = _u.pad(n, opts.minId, '0');
        // Split i into individual digits and reverse them
        var i, d = n.split("").reverse(), r = [],
            gc = opts.gc || [], gs = opts.gs, g = 3, gIdx = 0, max;
        while (d.length) {
            // Get the next group count if available
            if (gIdx < gc.length) {
                g = gc[gIdx++];
            }
            max = d.length;
            for (i = 0; (i < g && i < max); i++) {
                // Push onto the front of r so that the digits are
                // in the correct order
                r.unshift(d.shift());
            }
            if (d.length) {
                // Need to insert a group separator
                r.unshift(gs);
            }
        }
        return r.join("");
    };

    // Currency format helper function
    var _currencyFormat = function(n, opts, ralg) {
        var p,
            cPattern = (n < 0) ? opts.patterns[1] : opts.patterns[0],
            fd = opts.fd, minFd = opts.minFd;
        if (opts.cr) {
            p = _trimFraction(opts.cr(Math.abs(n), fd), minFd, fd);
        }
        else {
            p = _trimFraction(_round(n, fd, ralg), minFd, fd);
            if (n < 0) {
                // Don't want a leading '-'
                p = p.substring(1, p.length);
            }
        }
        p = _significantDigits(p, opts);
        // Separate out the integer and fraction portion
        var f = "",
            re = /(\d+)\.(\d+)/, parts = p.match(re);
        if (parts) {
            p = parts[1];
            f = parts[2];
            if (f.length && f.length < opts.cd) {
                // Want $10.10 rather than $10.1
                f = _u.pad(f, opts.cd, '0', true);
            }
        }
        var nFormatted = _formatDigits(p, opts);
        if (f) {
            nFormatted += opts.ds + f;
        }
        // Substitute the locale currency symbol and then stick the
        // formatted number in the placeholder
        return cPattern.replace("$", opts.cs).replace("%1", nFormatted);
    };

    // Percent format helper function
    var _percentFormat = function(n, opts, ralg) {
        var minFd = opts.minFd, fd = opts.fd;
        // Percent format is an implicit scaling by 100: 0.85 -> 85%
        var p = _trimFraction(
            _round(n * 100, fd, ralg), minFd, fd),
            pcPattern = (n < 0) ? opts.patterns[1] : opts.patterns[0];
        p = _significantDigits(p, opts);
        // Separate out the integer and fraction portion
        var f = "",
            re = /(\d+)\.(\d+)/, parts = p.match(re);
        if (parts) {
            p = parts[1];
            f = parts[2];
        }
        var nFormatted = _formatDigits(p, opts);
        if (f) {
            nFormatted += opts.ds + f;
        }
        return pcPattern.replace("%1", nFormatted);
    };

    // Helper function for formatting; scales the input value and returns
    // the scaled value, scale symbol and unit as a triplet (unit because
    // displaying kilograms may involve a correction to "gram" so that we
    // don't end up with something like "mkg" as the unit)
    var _scale = function(n, scale, unit, mag, base10) {
        var scaleValues = _scales, i, scaleOrder = "YZEPTGMk0mµnpfazy",
            sLen = scaleOrder.length, scaleValue, nabs = Math.abs(n), base = 10;
        if (scale === "micro") {
            scale = "µ";
        }
        switch (unit) {
            case "kelvin":
            case "celsius":
            case "radian":
            case "steradian":
            case "minute":
            case "hour":
            case "day":
            case "degree":
            case "arcminute":
            case "arcsecond":
                // These will look silly and wrong if formatted as "mega
                // whatever" so, just return the input, no scale and the
                // relevant unit
                return [n, "", unit];

            case "bytes":
                if (!base10) {
                    scaleValues = _bscales;
                    base = 2;
                }
                scaleOrder = "YZEPTGMK0";
                if (scale === "k") {
                    scale = "K";
                }
                break;

            case "metre":
            case "litre":
            case "meter":
            case "liter":
                // "centi" is a sensible scale so use that for autoscaling
                scaleOrder = "k0cmµnpfazy";
                break;

            case "kilogram":
                // Mg, Gg, etc. looks silly, smaller units are scales of
                // gram. not kilogram so let's make this easier on ourselves
                if (nabs >= 0.001) {
                    // Since we've been asked for kilograms, keep it as
                    // kilograms, i.e. "0.01 kg" rather than "10 g"
                    scaleValue = 1;
                    scale = "";
                    break;
                }
                else if (scale) {
                    n *= 1000;
                    nabs *= 1000;
                    unit = "gram";
                    scaleOrder = "k0mµnpfazy";
                }
                break;

            case "gram":
                scaleOrder = "k0mµnpfazy";
                break;

            default:
                break;
        }
        if (unit === "angstrom") {
            // Fixed scale value
            scaleValue = 1e-10;
            scale = "";
        }
        else if (scale === "auto") {
            var _scale, _scaleValue;
            for (i = 0; i < sLen; i++) {
                scale = scaleOrder.charAt(i);
                scaleValue = Math.pow(base, (scaleValues[scale] || 0) * mag);
                if (scaleValue <= nabs) {
                    break;
                }
            }
        }
        else {
            scaleValue = Math.pow(base, (scaleValues[scale] || 0) * mag);
        }
        if (scaleValue === 1) {
            scale = "";
        }
        else {
            n /= scaleValue;
        }
        return [n, scale, unit];
    };

    // Helper function; turns digits that will be in the exponent into
    // nicely formatted Unicode
    var _expNotation = function(expStr) {
        // Unicode lookup table for the exponent digits
        var eTable = {
            "-" : "⁻", "0" : "⁰", "1" : "¹",
            "2" : "²", "3" : "³", "4" : "⁴",
            "5" : "⁵", "6" : "⁶", "7" : "⁷",
            "8" : "⁸", "9" : "⁹"
        };
        var eDigits = expStr.split("");
        for (var i = 0; i < eDigits.length; i++) {
            eDigits[i] = eTable[eDigits[i]];
        }
        return eDigits.join("");
    };

    // Scientific / engineering notation worker function
    var _sciFormat = function(n, eng, opts, ralg) {
        // We want a string of the form 1e+30
        var t = n.toExponential(), coeff, exp;
        // Extract coefficient and exponent
        var re = /(\-?[1-9]\.?[\d]*)e([+-][\d]+)/;
        var matches = t.match(re);
        if (matches) {
            coeff = parseFloat(matches[1]);
            exp = parseInt(matches[2], 10);
        }
        else {
            // ?
            return t;
        }
        if (eng && (exp % 3) !== 0) {
            // Multiply coeeficient and reduce magnitude of the exponent
            // to get a multiple of 3
            var a = Math.abs(exp), j = (exp < 0) ? (3 - a % 3) : a % 3,
                mult = (j === 2) ? 100 : 10;
            coeff *= mult;
            if (exp < 0) {
                // Go up to the next multiple of three and restore sign
                a = (a + j) * -1;
            }
            else {
                // Down to the previous multiple of 3
                a -= j;
            }
            exp = a;
        }
        // Build up the result
        var ret = "", minFd = opts.minFd, fd = opts.fd;
        var s = _trimFraction(_round(coeff, fd, ralg), minFd, fd);
        // _round may have rounded the coefficient up so that
        // it is no longer in the range 1 <= n < [max]
        var max = eng ? 1000 : 10;
        if (parseInt(s, 10) >= max) {
            s = _trimFraction(_round(coeff / 10, fd, ralg));
            ++exp;
        }
        s = _significantDigits(s, opts);
        if (opts.keep1 || exp === 0 || s !== "1") {
            // We want the coefficient in the output
            ret = s.replace(/\./, opts.ds);
            if (n < 0) {
                // Use locale negative number pattern
                ret = opts.nn.replace("%1", ret.substring(1));
            }
        }
        if (exp !== 0) {
            var eStr = "10" + _expNotation(exp.toString());
            var xStr = ret ? __sep : "";
            ret += xStr + eStr;
        }
        return ret;
    };

    /**
     * Joins a quantity, scale and unit into a single string, observing the
     * SI rules for expressing quantities
     * @param s {String} The numeric string without units
     * @param scale {String} The magnitude of the unit
     * @param unitList {Array} The names of units; used as lookup into
     * the "units" Object above
     * @return {String} The string with units added
     */
    var _formatQuantity = function(s, scale, unitList) {
        if (!unitList) {
            unitList = [];
        }
        // Turn the "micro" scale into the correct sysmbol
        if (scale === "micro") {
            scale = "µ";
        }
        // Units that are not written with an intervening space -
        // Basically, degrees. minutes and seconds
        var nonSpaceUnits = {
            "°" : 1, "\u2032" : 1, "\u2033" : 1
        };
        var ret = s;
        var addSpace = !!(scale || unitList.length), i, unit, unitSymbol,
            unitMag, pos;
        for (i = unitList.length - 1; i >= 0; i--) {
            unit = unitList[i];
            if (!unit) {
                unitList.splice(i, 1);
                continue;
            }
            unitMag = "1";
            pos = unit.search(/[\+\-]/);
            if (pos >= 0) {
                unitMag =
                    unit.substring(pos, unit.length).replace(/^\+/, "");
                unit = unit.substring(0, pos);
            }
            unitSymbol = _units[unit] || unit;
            if (i === 0 && nonSpaceUnits[unitSymbol]) {
                // No break between the value and units
                addSpace = false;
            }
            if (unitMag && "1" !== unitMag) {
                unitSymbol += _expNotation(unitMag);
            }
            unitList[i] = unitSymbol;
        }
        if (addSpace) {
            ret += "\xA0"; // Non-breaking space
        }
        return ret + scale + unitList.join('·');
    };

    // Format worker function
    var _format = function(n, opts, ralg) {
        // Sanity test;
        // Cross browser support: need to use weak equality testing for
        // infinte values
        if (isNaN(n)) {
            return "NaN";
        }
        else if (INF == n) {
            return opts.patterns ? opts.patterns[0].replace("%1", "∞") : "∞";
        }
        else if (NINF == n) {
            var negPattern = opts.patterns ? opts.patterns[1] : opts.nn;
            return negPattern.replace("%1", "∞");
        }
        if (opts.currency) {
            return _currencyFormat(n, opts, ralg);
        }

        if (opts.percent) {
            return _percentFormat(n, opts, ralg);
        }
        var m = Math.abs(n);

        var scale = "", unit = opts.unit || "", unitList = [],
            mag = 1, pos;
        if (opts.scale || unit) {
            if (unit) {
                unitList = unit.split(/\s+/);
                unit = unitList[0];
                pos = unit.search(/[\+\-]/);
                if (pos >= 0) {
                    mag = Number(unit.substring(pos, unit.length));
                    unit = unit.substring(0, pos);
                }
            }
            var scaled = _scale(n, opts.scale, unit, mag, opts.base10);
            n = scaled[0];
            scale = scaled[1];
            unit = scaled[2];
            if (unit) {
                // Substitute back into the unit list
                var _unit = unitList[0];
                pos = _unit.search(/[\+\-]/);
                if (pos >= 0) {
                    _unit = unit + _unit.substring(pos, _unit.length);
                    unitList[0] = _unit;
                }
                else {
                    unitList[0] = unit;
                }
            }
            m = Math.abs(n);
        }
        var sci = !!opts.scientific, eng = !!opts.engineering,
            minFd = opts.minFd, fd = opts.fd;
        var nFormatted;
        if (!m) {
            nFormatted = "0";
        }
        else if (sci || eng) {
            nFormatted = _sciFormat(n, eng, opts, ralg);
        }
        else {
            // Get as many fractional digits as required
            var p;
            p = _trimFraction(_round(n, fd, ralg), minFd, fd);
            if (n < 0) {
                // Lose the sign - we'll add it back in at the end
                p = p.substring(1, p.length);
            }
            p = _significantDigits(p, opts);
            
            // Separate out the integer and fraction portion
            var f = "",
                re = /(\d+)\.(\d+)/, parts = p.match(re);
            if (parts) {
                p = parts[1];
                f = parts[2];
            }
            nFormatted = _formatDigits(p, opts);
            if (f) {
                nFormatted += opts.ds + f;
            }
            if (n < 0) {
                // SI notation, use prefix regardless of locale settings
                if (opts.unit || opts.scale) {
                    nFormatted = '-' + nFormatted;
                }
                else {
                    // Get the negative number format for the locale
                    nFormatted = opts.nn.replace("%1", nFormatted);
                }
            }
        }
        return _formatQuantity(nFormatted, scale, unitList);
    };

    // Our NumberFormat object; compatible API with Intl.NumberFormat
    var NumberFormat = function(locales, opts) {
        var _opts = _l.numericOptions(locales, opts);
        opts = _u.clone(opts || {});
        // Default precision values
        var fmDef = 0, fMDef = 3;
        var st;
        switch (opts.style) {
            case "currency":
            case "percent":
            case "scientific":
            case "engineering":
                st = opts.style;
                _opts[st] = true;
                break;

            default:
                st = "decimal";
                break;
        }
        var resolved = {
            locale : _opts.loc,
            numberingSystem : _opts.ndigits,
            style : st
        };
        if ("currency" === st) {
            var cSt = "symbol";
            resolved.currency = _opts.cCode;
            if ("name" === opts.currencyDisplay ||
                "code" === opts.currencyDisplay) {
                cSt = "code";
            }
            resolved.currencyDisplay = cSt;
            // Fractional digits should be the currency digits
            fMDef = _opts.cd;
        }
        else if ("percent" === st) {
            // Default precision is 0
            fMDef = 0;
        }
        var defs = {
            minimumFractionDigits : fmDef,
            maximumFractionDigits : fMDef,
            minimumIntegerDigits : 1
        };
        if (opts.hasOwnProperty("minimumSignificantDigits") ||
            opts.hasOwnProperty("maximumSignificantDigits")) {
            defs.minimumSignificantDigits = 1;
            defs.maximumSignificantDigits = 21;
            // Significant digits are orthogonal to other properties
            defs.maximumFractionDigits = 21;
            delete(opts.minimumFractionDigits);
            delete(opts.maximumFractionDigits);
            delete(opts.minimumIntegerDigits);
        }
        _u.forEach(defs, function(def, key) {
            var v = def;
            if (opts.hasOwnProperty(key)) {
                var _v = Number(opts[key]);
                if (_v >= 0 && _v !== v) {
                    v = _v;
                }
            }
            opts[key] = v;
        });
        // Stupidity filter
        var saneValues = {
            maximumFractionDigits : opts.minimumFractionDigits,
            minimumIntegerDigits : 1,
            maximumSignificantDigits : opts.minimumSignificantDigits
        };
        _u.forEach(saneValues, function(v, key) {
            if (opts.hasOwnProperty(key) && opts[key] < v) {
                opts[key] = v;
            }
        });
        // Put things in our own properties - the input property names
        // are *way* too verbose
        var _m = {
            minimumFractionDigits : "minFd",
            maximumFractionDigits : "fd",
            minimumIntegerDigits : "minId",
            minimumSignificantDigits : "minSd",
            maximumSignificantDigits : "sd"
        };
        _u.forEach(_m, function(oKey, rKey) {
            if (opts.hasOwnProperty(rKey)) {
                _opts[oKey] = (resolved[rKey] = opts[rKey]);
            }
        });
        resolved.useGrouping = (false !== opts.useGrouping);

        // Copy properties for our own number formats
        _u.forEach(["unit", "scale", "keep1", "SI", "base10"], function(p) {
            if (opts.hasOwnProperty(p)) {
                _opts[p] = opts[p];
            }
        });

        this.resolvedOptions = function() {
            return _u.clone(resolved);
        };
        this.opts = _opts;

        // Bind the format function to this instance so it can
        // be passed, for example, to Array.prototype.map
        this.format = _u.bindFunction(this.format, this);
        this.parse = _u.bindFunction(this.parse, this);
    };

    NumberFormat.supportedLocalesOf = _l.supportedLocalesOf;

    // Formats a number
    NumberFormat.prototype.format = function(n) {
        var nFormatted = _format(Number(n), this.opts, UsefulJS.Number.rounding), 
            digits = this.opts.digits;
        // Final stage - substitute digits, if required
        if (digits) {
            // Protect any exponent
            var parts = nFormatted.split(__sep);
            nFormatted = parts[0];
            var a = [], i, c;
            for (i = 0; i < nFormatted.length; i++) {
                c = nFormatted.charAt(i);
                if (/\d/.test(c)) {
                    a.push(digits.charAt(Number(c)));
                }
                else {
                    a.push(c);
                }
            }
            nFormatted = a.join("");
            if (parts.length > 1) {
                // Restore the exponent
                nFormatted += __sep + parts[1];
            }
        }
        return nFormatted;
    };

    // Helper function to check for currency / percentage pattern
    var _parseLocalePattern = function(s, opts) {
        // If supplied, replace opts.cs with '$' so that we can match
        // currency
        if (opts.cs) {
            s = s.replace(opts.cs, '$');
        }
        var i, fmtPattern, parts, t, tResult;
        for (i = opts.patterns.length - 1; i >= 0; i--) {
            fmtPattern = opts.patterns[i];
            t = s;
            // Split around the value placeholder in the currency pattern
            parts = fmtPattern.split("%1");
            if (parts[0]) {
                t = t.substring(parts[0].length, t.length);
            }
            if (parts[1]) {
                t = t.substring(0, t.length - parts[1].length);
            }
            // Compare the assembled parts to the input; if they're
            // equal, we've recovered a number string from the pattern
            tResult = parts[0] + t + parts[1];
            if (tResult === s) {
                // Odd-numbered patterns represent a negative number
                if (i % 2) {
                    t = '-' + t;
                }
                return t;
            }
        }
        return s;
    };

    // Parsing worker function for scientific / engineering format
    var _parseSci = function(s, opts) {
        // Translation table
        var tt = {
            "-" : "-", "\xA0" : "", "×" : "e", "⁻" : "-",
            "⁰" : "0", "¹" : "1", "²" : "2", "³" : "3",
            "⁴" : "4", "⁵" : "5", "⁶" : "6", "⁷" : "7",
            "⁸" : "8", "⁹" : "9", "+" : "", "." : "."
        }, a = [], c, i, re = /\d/, ePos = 0, start = 0;
        tt[opts.ds] = ".";
        var parts = s.split(__sep);
        if (parts.length > 1) {
            // Look for a negative coefficent
            var coeff = _parseLocalePattern(parts[0], opts);
            s = coeff + __sep + parts[1];
        }
        for (i = start; i < s.length; i++) {
            c = s.charAt(i);
            if (c in tt) {
                c = tt[c];
                if (c) {
                    a.push(c);
                    if ('e' === c) {
                        // Record the position - we'll need it in a bit
                        ePos = a.length;
                    }
                }
            }
            else if (re.test(c)) {
                a.push(c);
            }
            else {
                return NAN;
            }
        }
        if (0 === ePos) {
            // Input took the form "10⁹"
            a.splice(ePos, 2, '1', 'e');
        }
        else {
            // We'll have e,1,0 which will screw up parseFloat
            a.splice(ePos, 2);
        }
        return parseFloat(a.join(""));
    };

    /**
     * Turns a human-readable numeric string into a number
     * @param s {String} The string to parse
     * @return {Number} the parsed number (Number.NaN if the input is
     *  silly)
     */
    NumberFormat.prototype.parse = function(s) {
        var _t = __typ(s);
        if (_t === "number") {
            return s;
        }
        if (!(s && _t === "string")) {
            return NAN;
        }
        var opts = this.opts, i, c, t;
        // Trim the input
        s = s.replace(_u.RE_WS_START, "").replace(_u.RE_WS_END, "");

        if (opts.digits) {
            // Turn the digts that aren't 0-9 into 0-9; it'll make the rest
            // a LOT easier
            var _rd = [], _rm = opts.rdigits;
            for (i = 0; i < s.length; i++) {
                c = s.charAt(i);
                if (_rm[c]) {
                    _rd.push(_rm[c]);
                }
                else {
                    _rd.push(c);
                }
            }
            s = _rd.join("");
        }

        // Check for specific locale patterns
        s = _parseLocalePattern(s, opts);
        if (s === "∞") {
            return INF;
        }
        if (s === "-∞") {
            return NINF;
        }

        var scaleValue = 0;
        if (opts.percent) {
            // Divide by 100 to recover the original value
            scaleValue = -2;
        }
        // We need to isolate the scale and units from the numeric part of
        // the input
        var searchIdx = s.indexOf(__sep);
        t = s;
        if (searchIdx >= 0) {
            // Start looking for units after the exponent
            searchIdx += __sep.length;
            t = s.substring(searchIdx);
        }
        else {
            searchIdx = 0;
        }
        var u = [], splitPoint = t.search(/\u00a0\D/), _n,
            base = 10, mag = 1;
        if (-1 === splitPoint) {
            // Angle units are adjacent to the value
            splitPoint = t.search(/[°\u2032\u2033]/);
        }
        if (splitPoint >= 1) {
            splitPoint += searchIdx;
            // Get the units (handle the angle unit case by getting more
            // than we're likely to need and then trimming)
            var unit =
                s.substring(splitPoint, s.length).replace(_u.RE_WS_START, ""),
                scaleValues = _scales;
            // Isolate the numeric part
            s = s.substring(0, splitPoint);
            // If the unit is compound, we only want the first part
            splitPoint = unit.indexOf("·");
            if (splitPoint >= 0) {
                unit = unit.substring(0, splitPoint);
            }
            // Isolate the magnitude
            var parts = unit.match(/([µA-Za-z]+)(⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/),
                _mag;
            if (parts) {
                unit = parts[1];
                _mag = parts[2];
            }
            if (_mag) {
                // Transform to ASCII
                var tt = {
                    "⁻" : "-", "⁰" : "0", "¹" : "1", "²" : "2",
                    "³" : "3", "⁴" : "4", "⁵" : "5", "⁶" : "6",
                    "⁷" : "7", "⁸" : "8", "⁹" : "9"
                }, _m = [];
                for (i = 0; i < _mag.length; i++) {
                    _m.push( tt[_mag.charAt(i)] );
                }
                mag = Number(_m.join(""));
            }
            if (/^[YZEPTGMK]?B$/.test(unit) && !opts.base10) {
                // Byte units: scales are powers of two
                scaleValues = _bscales;
                base = 2;
            }
            var oUnit = this.opts.unit || "";
            // Remove any scale and additional units from the one
            // obtained from opts - we only need it for disambiguation
            if (oUnit) {
                oUnit = oUnit.split(_u.RE_WS)[0];
                oUnit = oUnit.replace(/([\+\-]\d*)/, "");
                // Finally, look up its symbol
                oUnit = _units[oUnit] || oUnit;
            }
            if (unit.length && unit !== oUnit) {
                var scale = unit.charAt(0);
                if (!oUnit) {
                    // Handle possible false positives: we don't want to
                    // misinterpret "min" as "milli-ins"
                    switch (unit) {
                        case "m":   // metres
                        case "Pa":  // Pascals
                        case "min": // minutes
                        case "mol": // moles
                        case "T":   // Tesla
                        case "Gy":  // Gray, not "giga year"
                        case "kat": // katals
                        case "d":   // days
                        case "y":   // years
                        case "h":   // hours
                        case "ha":  // hectares
                            scale = "";
                            break;

                        default:
                            break;
                    }
                }
                if (scale === 'd' && unit.length > 1 &&
                    unit.charAt(1) === 'a') {
                    // Assume deka scale
                    scale = "da";
                }
                if (scaleValues.hasOwnProperty(scale)) {
                    scaleValue = scaleValues[scale];
                    if (unit.length > scale.length &&
                        unit.charAt(scale.length) === "g") {
                        // Prefer to return a value in kilograms
                        scaleValue -= 3 * mag;
                    }
                }
            }
        }

        c = s.charAt(s.length - 1);
        if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(c)) {
            // Scientific notation
            _n = _parseSci(s, opts);
        }
        else {
            try {
                // Normal(ish) number, although if it contains unexpected
                // characters we'll return NaN
                var a = [], re = /\d/, start = 0;
                // Check for an initial sign character
                if ('-' === s.charAt(0)) {
                    a.push('-');
                    start = 1;
                }
                else if ('+' === s.charAt(0)) {
                    // Ignore
                    start = 1;
                }
                for (i = start; i < s.length; i++) {
                    c = s.charAt(i);
                    if (re.test(c)) {
                        a.push(c);
                    }
                    else if (opts.gs === c || _u.RE_WS.test(c)) {
                        // Group separator
                        continue;
                    }
                    else if (opts.ds === c) {
                        a.push('.');
                    }
                    else {
                        // We'll try parseFloat in the exception handler
                        throw new Error();
                    }
                }
                _n = parseFloat(a.join(""));
            }
            catch(e) {
                // Can it be parsed natively?
                _n = parseFloat(s);
            }
        }
        scaleValue *= mag;
        if (!isNaN(_n) && scaleValue !== 0) {
            // Upscale the value to recover an approximation of the
            // original
            _n *= Math.pow(base, scaleValue);
        }
        return _n;
    };
    
    // Truncation function
    var _trunc = "trunc" in Math ? Math.trunc : function(v) {
        // < 0 => ceil; >0 floor
        return (v < 0) ? Math.ceil(v) : Math.floor(v);
    };
    
    /**
     * Adds ES6 math methods
     */
    UsefulJS.fixes._math = function(_u, optsIn, optsOut, all, none) {
        var _exp = Math.exp, _log = Math.log, _sqrt = Math.sqrt;
        
        // Pre-compute 8-bit lookup table for clz32
        var clzTbl8 = [8, 7, 6, 6, 5, 5, 5, 5], i = 8, bc = 4, j, m = 16;
        for (j = 3; j < 8; j++, --bc, m += m) {
            for (; i < m; ++i) {
                clzTbl8[i] = bc;
            }
        }
        
        // Support for fround
        var fr = null;
        try {
            fr = new Float32Array(1);
        }
        catch(e) {
            // fround can't be implemented
        }
        
        // Implementation of expm1; used for implementation of hyperbolic functions
        var _expm1 = function(v) {
            v = Number(v);
            // Outside a certain range we can use e^x - 1 without loss of accuracy
            if (v < -0.25 || v > 0.25 || v !== v) {
                return _exp(v) - 1;
            }
            // Calculate Taylor series: v + v^2/2! + v^3/3! + ...
            var i = 1, fact = 1, ret = 0, div, n = v;
            for (; ; ++i, fact *= i, n *= v) {
                div = n / fact;
                ret += div;
                if (div < 0) {
                    div = -div;
                }
                if (div < _epsilon) {
                    break;
                }
            }
            return ret;
        };
        
        var sMethods = {
            acosh : function(v) {
                // acosh(x) = log(x + (x^2 - 1)^1/2)
                // Minimum value of cosh(x) is 1
                if (v < 1) {
                    return NAN;
                }
                return _log(v + _sqrt(v * v - 1));
            },
            asinh : function(v) {
                // asinh(x) = log(x + (x^2 + 1)^1/2)
                if (v > 0.01 || v < -0.01) {
                    // Should be good enough
                    return _log(v + _sqrt(v * v + 1));
                }
                // Taylor series: x - 1.x^3 + 1.3.x^5 - 1.3.5.x^7 ...
                //                    - ---   --- ---   ----- ---
                //                    2  3    2.4  5    2.4.6  7
                var ret = v, i = 1, j = 2, k = 3, uf = 1, lf = 1, 
                    sq = v * v, n = v * sq, mul = -1, div;
                for (; ; i += 2, j += 2, k += 2, n *= sq, mul *= -1) {
                    uf *= i;
                    lf *= j;
                    div = mul * (uf * n) / (lf * k);
                    ret += div;
                    if (div < 0) {
                        div = -div;
                    }
                    if (div < _epsilon) {
                        break;
                    }
                }
                return ret;
            },
            atanh : function(v) {
                // 0.5 * log((x + 1) / (x - 1))
                // Max abs value is 1
                if (v > 1 || v < -1) {
                    return NAN;                    
                }
                if (v > 0.01 || v < -0.01) {
                    // Should be good enough
                    return 0.5 * _log((1 + v) / (1 - v));
                }
                // Taylor series: x + x^3/3 + x^5/5 + ...
                var sq = v * v, i = 3, ret = v, div, n = v * sq;
                for (; ; i += 2, n *= sq) {
                    div = n / i;
                    ret += div;
                    if (div < 0) {
                        div = -div;
                    }
                    if (div < _epsilon) {
                        break;
                    }
                }
                return ret;
            },
            cbrt : function(v) {
                // (-x)^1/3 = -[x]^1/3
                var n = Math.pow(((v < 0) ? -v : v), 1/3);
                return (v < 0) ? -n : n;
            },
            clz32 : function(v) {
                // Convert to 32-bit unsigned
                v >>>= 0;
                var ret = 0;
                if ((v & 0xFFFF0000) === 0) {
                    ret += 16; 
                    v <<= 16;
                }
                if ((v & 0xFF000000) === 0) {
                    ret += 8; 
                    v <<= 8;
                }
                // Lookup top 8-bits
                return ret + clzTbl8[v >>> 24];
            },
            cosh : function(v) {
                // 0.5 * (e^x + e^-x)
                var y = _exp(v);
                return (y + 1/y) / 2;
            },
            expm1 : _expm1,
            hypot : function(a, b) {
                var i = 0, nArgs = arguments.length, r;
                if (0 === nArgs) {
                    return 0;
                }
                a = Number(arguments[0]);
                if (a < 0) {
                    a = -a;
                }
                if (a !== a || a === INF) {
                    return a;
                }
                while (++i < nArgs) {
                    b = Number(arguments[i]);
                    if (b !== b) {
                        return b;
                    }
                    if (b < 0) {
                        b = -b;
                    }
                    if (b === INF) {
                        return b;
                    }
                    // To avoid overflow in the intermediate calculation of a * a or b * b,
                    // order a, b so that the larger of the two is in a and then calculate
                    // abs(a) * sqrt(1 + (b/a)^2)
                    if (a < b) {
                        // Swap
                        r = a;
                        a = b;
                        b = r;
                    }
                    if (a === 0) {
                        continue; // b must be 0 as well and we don't want 0/0 to give NaN
                    }
                    r = b / a;
                    a = a * _sqrt(1 + r * r);                    
                }
                return a;
            },
            imul : function(a, b) {
                // Convert a and b into signed integers
                a >>= 0;
                b >>= 0;
                // Turn a and b into ushort, ushort pairs
                var ah = (a >>> 16) & 0xffff, al = a & 0xffff,
                    bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
                // Do the higher bits as an unsigned operation and then convert to
                // signed at the end
                return ((((ah * bl + al * bh) << 16) >>> 0) + al * bl) >> 0;   
            },
            log1p : function(v) {
                v = Number(v);
                // Outside a certain range we can use log(1 + x) without loss of accuracy
                if (v < -0.1 || v > 0.1 || v !== v) {
                    return _log(v + 1);
                }
                // Calculate Taylor series: v - v^2/2 + v^3/3 - v^4/4 ...
                var i = 1, mul = 1, ret = 0, div, n = v;
                for (; ; ++i, mul *= -1, n *= v) {
                    div = n / i;
                    ret += div * mul;
                    if (div < 0) {
                        div = -div;
                    }
                    if (div < _epsilon) {
                        break;
                    }
                }
                return ret;
            },
            log10 : function(v) {
                return _u.Math.logn(v, 10);
            },
            log2 : function(v) {
                return _u.Math.logn(v, 2);
            },
            sign : function(v) {
                v = Number(v);
                // 0 => 0, -0 => -0, NaN => NaN, >0 => 1, <0 => -1
                if (v > 0) {
                    return 1;
                }
                if (v < 0) {
                    return -1;
                }
                return v;
            },
            sinh : function(v) {
                if (v < -0.25 || v > 0.25) {
                    var y = _exp(v);
                    return 0.5 * (y - 1/y);
                }
                // Use the form (e^2x - 1)/2e^x
                return 0.5 * _expm1(2 * v) / _exp(v)
            },
            tanh : function(v) {
                // (e^2x - 1) / (e^2x + 1)
                switch (v) {
                    case INF:
                        return 1;
                        
                    case NINF:
                        return -1;
                
                    default:
                        break;
                }
                v *= 2;
                return _expm1(v) / (_exp(v) + 1);
            },
            trunc : _trunc
        }, mName;
        
        if (fr) {
            sMethods.fround = function(v) {
                // This will cast v to a single precision float
                fr[0] = v;
                return fr[0];
            }
        }
        
        for (mName in sMethods) {
            if (!(false === optsIn[mName] || none)) {
                optsOut[mName] = _u._protoAdd(Math,
                    mName, sMethods[mName], false);
            }
        }
    };

    // Mathematical functions
    UsefulJS.Math = {
        /**
         * Calculates the logarithm to the base n of x
         * @param x {Number} the number whose logarithm you want to take
         * @param n {Number} the base of the logarithm (for example, 10)
         * @return {Number} the logarithm of x to the base n
         * @throws {RangeError} n is negative or not finite
         * NOTE: usual semantics of log apply: x === 0 returns -Infinity,
         * x < 0 returns NaN; x or n === 1 returns Infinity
         */
        logn : function(x, n) {
            var divisor, _log = Math.log;
            switch (n) {
                case 10:
                    divisor = Math.LN10;
                    break;
                    
                case 2:
                    divisor = Math.LN2;
                    break;
                    
                case Math.E:
                    return _log(x);
                    
                case 1:
                    if (x === 0) {
                        return NINF;
                    }
                    return (x === 1) ? NAN : // 0/0
                        INF;
                        
                default:
                    if (!(isFinite(n) && n >= 0)) {
                        throw new RangeError("Base must be a positive number");
                    }
                    divisor = _log(n);
                    break;
                    
            }
        
            // Handle degenerate cases
            if (x === 0) {
                return (n === 0) ? NAN : NINF;
            }
            else if (x === 1) {
                return 0;
            }
            else if (!isFinite(x)) {
                return x;
            }
            
            // Simply using, for example, log(x) / log(10) can give unexpected results so scale
            // the input up or down until we have a number between 1 and n; this ensures
            // that the relative error in log(n) is minimized
            var ret = 0
            if (x >= n) {
                for (; x >= n; x /= n, ++ret) {}
            }
            else if (x < 1) {
                for (; x < n; x *= n, --ret) {}
            }
            return ret + _log(x) / divisor;
        },

        /**
         * Converts degrees, minutes, seconds into radians
         * @param degrees {Number} The number of degrees
         * @param minutes {Number} (optional) Minutes (0-60)
         * @param seconds {Number} (optional) Seconds (0-60)
         * @return {Number} The equivalent angle in radians
         * @throws {TypeError} any of the arguments cannot be converted to a
         *  finite number.
         */
        rad : function() {
            // Use a multiplier of 180 so that the return value is a
            // multiplication by Math.PI rather than 2*Math.PI
            var d = 0, m = 0, s = 0, mult = 180, divisor = 1, mul = 1;
            if (arguments.length) {
                d = Number(arguments[0]);
                if (d < 0) {
                    d = -d;
                    mul = -1;
                }
                if (arguments.length > 1) {
                    m = Number(arguments[1]);
                    if (arguments.length > 2) {
                        s = Number(arguments[2]);
                    }
                }
            }
            if (!(isFinite(d) && isFinite(m) && isFinite(s))) {
                throw new TypeError("Non-finite argument");
            }
            // Constrain minutes and seconds to the range 0 <= m < 60
            m %= 60;
            s %= 60;
            if (s) {
                d *= 3600;
                divisor = 3600;
                m *= 60;
            }
            else if (m) {
                d *= 60;
                divisor = 60;
            }
            var angle = d + m + s;
            if (0 === angle) {
                return 0;
            }
            var x = angle / (mult * divisor);
            return x * Math.PI * mul;
        },

        /**
         * Converts an angle expressed in radians into degrees
         * @param r {Number} The angle in radians
         * @return {Number} The angle in degrees
         * @throws {TypeError} Input is not finite when converted to a number
         */
        deg : function(r) {
            r = Number(r);
            if (!isFinite(r)) {
                throw new TypeError("Non-finite argument");
            }
            if (0 === r) {
                return 0;
            }
            // Again, (360 / 2 PI) === (180 / PI)
            return r * 180 / Math.PI;
        },

        /**
         * Converts radians to degrees, minutes, seconds
         * @param r {Number} The angle in radians
         * @return {Array} a d,m,s triplet
         * @throws {TypeError} input is not finite
         */
        dms : function(r) {
            // Get the decimal angle
            var dec = _u.Math.deg(r);
            // Truncate to get the degrees part
            var d = _trunc(dec);
            // Multiply out and round to get the angle in seconds;
            // then reduce to get the minutes
            var secs = Math.abs(dec * 3600), s = secs % 60;
            var mins = (secs - s) / 60, m = mins % 60;
            return [d, m, s];
        },

        /**
         * Corrects rounding errors; works on the assumption
         * that something like 0.30000000000000004 (the sum of
         * 0.1 and 0.2) is not the "correct" answer
         * @param n {Number} The value to check
         * @param p {Number} The precision to use check when
         *  checking; 0 means integer checking, 1 means to
         *  one decimal place, etc.
         * @return {Number} The value corrected for rounding error
         */
        fcorrect : function(n, p) {
            n = Number(n);
            if (!isFinite(n) || 0 === n) {
                return n;
            }
            p = Number(p);
            if (!(p && isFinite(p) && p > 0)) {
                p = 0;
            }
            else {
                p = Math.floor(p); // Truncate to an integer
            }
            for (; p >= 0; p--) {
                // Get the relative difference between the input
                // (scaled up as required) and the result of rounding it
                var scale = p ? Math.pow(10, p) : 1,
                    _n = p ? n * scale : n, _r = Math.round(_n),
                    relativeErr = Math.abs((_r - _n) / _n);
                if (relativeErr <= _epsilon) {
                    // Assume floating-point error
                   return p ? (_r / scale) : _r;
                }
            }
            return n;
        }
    };

    /**
     * Add in the "fixes" for this module
     * Options are:
     *  _number :
     *      EPSILON : add "EPSILON" static property (the smallest interrval
     *       between distinct numbers) to Number (default true)
     *      _toFixed : add _toFixed drop in replacement to Number.prototype;
     *       gives more accurate results than toFixed and allows control over
     *       the minimum number of fractional digits as well as the rounding
     *       method (default true)
     *      fixToLocaleString : patch Number.prototype.toLocaleString so that
     *       it can take a locale and format options, like on systems that
     *       support Intl.NumberFormat (default true)
     *      intl_NumberFormat : Add Intl.NumberFormat when the environment
     *       doesn't support it (default true)
     *      intl_NumberParser : make UsefulJS.Number.Parser available in the
     *       Intl namespace (default false)
     */
    UsefulJS.fixes._number = function(_u, optsIn, optsOut, all, none) {
        var m, mName;

        var sMethods = {
            EPSILON : _u.Number.EPSILON,
            MAX_SAFE_INTEGER : _maxSafeInt,
            MIN_SAFE_INTEGER : _minSafeInt
        };
        for (mName in sMethods) {
            if (!(false === optsIn[mName] || none)) {
                optsOut[mName] = _u._protoAdd(Number,
                    mName, sMethods[mName], false);
            }
        }

        var pMethods = {
            /**
             * Drop in replacement for toFixed with more control over output,
             * more accurate results and choice of rounding method
             * @param maxFd {Number} The maximum number of fractional digits
             *  needed; defaults to 0; maximum is 15 (less than the native
             *  toFixed which will provide 18 fractional digits for Math.PI)
             * @param minFd {Number} The minimum number of fractional digits
             *  needed (e.g. when dealing with monetary values; defaults to 0
             */
            _toFixed : function(maxFd, minFd) {
                var _u = UsefulJS, _N = _u.Number;
                // Handle crappy inputs; sometimes the temptation to just
                // raise exceptions with obscene error messages is strong
                if (!isFinite(this)) {
                    return this.toString();
                }
                // Require numbers >= 0
                if (!(__def(maxFd) &&
                    "number" === __typ(maxFd) && maxFd >= 0)) {
                    maxFd = 0;
                }
                if (!(__def(minFd) &&
                    "number" === __typ(minFd) && minFd >= 0)) {
                    minFd = 0;
                }
                if (minFd > maxFd) {
                    minFd = maxFd;
                }
                // We can do the actual work in a couple of lines
                return _trimFraction(_round(this, maxFd, _N.rounding), minFd, maxFd);
            }

        }, protoObj = Number.prototype;

        for (mName in pMethods) {
            if (!(false === optsIn[mName] || none)) {
                optsOut[mName] = _u._protoAdd(protoObj,
                    mName, pMethods[mName], false);
            }
        }

        // See whether toLocaleString needs patching
        var patch = !(false === optsIn.fixToLocaleString || none);
        if (patch) {
            try {
                // Invalid language tag should throw
                (0.1).toLocaleString("i");
                // Patch it
                protoObj.toLocaleString = function(loc, opts) {
                    return new UsefulJS.Number.Format(loc, opts).format(this);
                };
                optsOut.toLocaleStringFixed = true;
            }
            catch(e) {
            }
        }

        var propsName = "intl_NumberFormat";
        if (!(false === optsIn[propsName] || none)) {
            _u._protoAdd(_u.globalObject, "Intl", {}, false);
            optsOut[propsName] = _u._protoAdd(_u.globalObject.Intl, "NumberFormat",
                NumberFormat, false);
        }
    };

    return {
        // The smallest interval between distinguishable numbers
        EPSILON : _epsilon,

        // The largest integer number (note: for compatibility with
        // Intl.NumberFormat this is smaller than the real value)
        MAX_INT : _maxInt,

        // Rounding methods
        ROUND_HALF_TO_PLUS_INFINITY : _ralgs.HALF_UP,
        ROUND_HALF_AWAY_FROM_ZERO : _ralgs.AWAY_FROM_0,
        ROUND_HALF_TOWARDS_EVEN : _ralgs.TO_EVEN,
        
        // Default rounding method to ROUND_HALF_TOWARDS_EVEN
        rounding : _ralgs.TO_EVEN,

        // SI units and their symbols
        units : _units,

        scales : _scales,

        byte_scales : _bscales,

        // Separator between coefficient and exponent
        _sep : __sep,
        
        Format : NumberFormat
    };
})();

