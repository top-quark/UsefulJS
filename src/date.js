/**
 * Date formatting and parsing and time/date utilities
 * Author: Christopher Williams
 */

UsefulJS.Date = (function() {
    "use strict";

    // Detect UTC errors
    var _u = UsefulJS, _l = _u.Locale, __typ = _u._typeof, __def = _u.defined,
        _utcms = Date.UTC(1970, 0, 1, 12, 0, 0, 0),
        expected = 43200000, UTCCORRECTION = _utcms - expected,
        UTCFN = Date.UTC;
    var _tzCode = "",
        _timezoneSupport = (function() {
        // Look for something like "(BST)" at the end of the string
        var ts = (new Date()).toString(),
            re = /\(([^\)]*)\)$/,
            match = re.exec(ts);
        if (match) {
            _tzCode = match[1];
            return true;
        }
        return false;
    })();


    // format / parse macros; others are defined in the Locale objects
    var SMACROS = {
        "%D" : "%m/%d/%y",
        "%F" : "%Y-%m-%d",
        "%R" : "%H:%M",
        "%T" : "%H:%M:%S",
        // O and E modifiers expand to nothing
        "%O" : "%",
        "%E" : "%"
    };

    // Standard format strings
    var _stdFormats = {
        iso8601_ext : "%FT%T.%/Z",
        iso8601 : "%FT%TZ",
        isoweek : "%G-W%V-%u",
        isoordinal : "%Y-%j",
        rfc2822 : "%a, %d %b %Y %T %z"
    };

    // Set properties in featureSupport in the core
    _u.featureSupport.date = {
        timezone : _timezoneSupport,
        tzCode : _tzCode
    };

    // format / parse support functions

    // gets the date of the first Sunday of the year
    var _getFirstSunday = function(y) {
        var dt = new Date(y, 0, 1, 12, 0, 0);
        var d = dt.getDay(), ret = 1;
        if (d) {
            while (d++ <= 6) {
                ++ret;
            }
        }
        return ret;
    },
    // gets the date of the first Monday of the year
    _getFirstMonday = function(y) {
        var dt = new Date(y, 0, 1, 12, 0, 0);
        var d = dt.getDay(), ret = 1;
        while (d !== 1) {
            if (++d > 6) {
                d = 0;
            }
            ++ret;
        }
        return ret;
    },
    // gets the week number for the %U and %W tokens
    _date2yweek = function(y, m, d, d1, yd) {
        // Get the date of the first day of week 1, taking the value of d1
        // (0 or 1) into account
        var d1w1 = d1 ? _getFirstMonday(y) : _getFirstSunday(y),
            ret = 0, c = d1w1;
        if (yd < d1w1) {
            return ret;
        }
        while (c <= yd) {
            ++ret;
            c += 7;
        }
        return ret;
    },
    // gets the week number for the %V token
    _date2yweek_v = function(y, m, d, wd, yd) {
        var d1w1 = _getFirstMonday(y), offs = 0, jan1Offs = d1w1 - 1;
        if (jan1Offs > 0 && jan1Offs < 4) {
            // Fri, Sat, Sun before the first Monday will be week 53 of the
            // previous year
            offs = jan1Offs;
        }
        var ydCorrected = yd - offs;
        if (ydCorrected < 1) {
            return 0;
        }
        return Math.ceil(ydCorrected / 7);
    },
    // gets the meridiem code for the hour
    _hour2meridiem = function(h, hd) {
        var idx = -1, i, t = 0;
        for (i = 0; i < hd.length; i++) {
            t = hd[i];
            if (t > h) {
                break;
            }
            ++idx;
        }
        return idx;
    },
    // given the nth week of the year and the mth day of the week,
    // computes the month and date
    _yweek2date = function(yw, wd, dProps, fd) {
        if (null === wd) {
            if (0 === yw) {
                // Insufficient information to do anything
                return;
            }
            // Assume first day of the week
            wd = fd;
        }
        else if (fd && wd === 0) {
            // Monday-based week
            wd = 7;
        }
        var yd = 1, i;
        // Get the day number of 1st January
        var dt = new Date(dProps.yy, 0, 1, 12, 0, 0);
        var d = dt.getDay(), offs = 0;
        if (fd) {
            if (wd === 0) {
                wd = 7;
            }
            // Count forward to next Monday (start of week 1)
            while (d !== 1) {
                if (++d > 6) {
                    d = 0;
                }
                ++offs;
            }
        }
        else if (d) {
            // Count forward to next Sunday
            while (d++ < 7) {
                ++offs;
            }
        }
        // Weeks (yw == 0 means a negative correction) and then the weekday
        offs += (yw - 1) * 7;
        if (fd) {
            offs += (wd - 1);
        }
        else {
            offs += wd;
        }
        dt.setTime(dt.getTime() + offs * 86400000);
        dProps.dd = dt.getDate();
        dProps.mm = dt.getMonth();
    },
    // Calculates date from %G-%V-%u/%w info
    _yweek2date_v = function(yw, wd, dProps) {
        if (null === wd) {
            // Assume Monday
            wd = 1;
        }
        var dt = new Date(dProps.yy, 0, 1),
            // The further away from Thursday, the greater the
            // correction needed
            dCorrection = [3, -3, -2, -1, 0, 1, 2][wd];
        // Get the first Thursday; this will be week 1
        var d = dt.getDay();
        while (d !== 4) {
            if (++d > 6) {
                d = 0;
            }
            ++dCorrection;
        }
        var offs = (yw - 1) * 7 + dCorrection;
        dt.setTime(dt.getTime() + offs * 86400000);
        dProps.yy = dt.getFullYear();
        dProps.dd = dt.getDate();
        dProps.mm = dt.getMonth();
    };

    // Gets a lookup key into the predefined format strings for the locale;
    // also populates an array with strftime codes for option combinations
    // that don't make sense so that we return *something*
    var _processOpts = function(opts, optList, resolved, codes) {
        var ret = "";
        var m = {
            weekdayt : "%A", yearn : "%Y", montht : "%B", monthn : "%N",
            dayn : "%e", hourn : "%k", minuten : "%M", secondn : "%S"
        };
        _u.forEach(optList, function(optName) {
            if (!opts.hasOwnProperty(optName)) {
                ret += "-";
                return;
            }
            var optVal = opts[optName];
            if ("narrow" === optVal) {
                // Don't support these
                optVal = "short";
            }
            if (optName === "minute" || optName === "second") {
                // Only 2 digits makes sense
                optVal = "2-digit";
            }
            resolved[optName] = optVal;
            var k = optName;
            if (optVal === "short" || optVal === "long") {
                k += "t";
                ret += "t";
            }
            else {
                k += "n";
                ret += "n";
            }
            codes.push(m[k]);
        });
        if (!codes.length) {
            ret = "";
        }
        return ret;
    };

    // Processes DateTimeFormat options to determine the format string to use
    var _getFormatString = function(opts, resolved) {
        var ranges = {
            weekday : " narrow short long ",
            year : " numeric 2-digit ",
            month : " numeric 2-digit narrow short long ",
            day :  " numeric 2-digit ",
            hour :  " numeric 2-digit ",
            minute :  " numeric 2-digit ",
            second :  " numeric 2-digit ",
            timeZoneName : " short long ",
            era : " narrow short long "
        };
        // Check that any options are within range
        _u.forEach(ranges, function(range, key) {
            if (!opts.hasOwnProperty(key)) {
                return;
            }
            var testVal = opts[key];
            if (-1 === range.indexOf(' ' + testVal + ' ')) {
                throw new RangeError("Value " + testVal + 
                    " out of range for dateformat options property " + key);
            }
        });
        var dOpts = ["weekday", "year", "month", "day"],
            tOpts = ["hour", "minute", "second"],
            dCodes = [], tCodes = [], dKey, tKey;
        dKey = _processOpts(opts, dOpts, resolved, dCodes);
        tKey = _processOpts(opts, tOpts, resolved, tCodes);
        if (!(dKey || tKey)) {
            // Return numeric date
            dKey = "-nnn";
        }
        var dFmts = opts.dfmt, tFmts = opts.tfmt, dFmt, tFmt,
            hr12 = opts.hour12;
        if (dKey) {
            if (dFmts.hasOwnProperty(dKey)) {
                dFmt = dFmts[dKey];
            }
            else {
                // Won't necessarily make sense but then neither did the input
                dFmt = dCodes.join(' ');
            }
        }
        if (tKey) {
            if (tFmts.hasOwnProperty(tKey)) {
                tFmt = tFmts[tKey];
            }
            else {
                // Won't necessarily make sense but then neither did the input
                tFmt = tCodes.join(' ');
            }
        }
        if (tFmt) {
            if (hr12) {
                // AM/PM - substitute 12-hour code for 24-hour one
                tFmt = tFmt.replace("%k", "%l");
                // And stick it in the AM/PM pattern
                tFmt = opts.time12.replace("{t}", tFmt);
            }
            // Always defined because a default value is a locale property
            resolved.hour12 = hr12;
            if (opts.timeZoneName) {
                // Only support the form GMT+0000
                resolved.timeZoneName = "long";
                tFmt = opts.timetz.replace("{t}", tFmt);
            }
            if ("2-digit" === resolved.hour) {
                // Use a 2-digit format code
                if (hr12) {
                    tFmt = tFmt.replace("%l", "%I");
                }
                else {
                    tFmt = tFmt.replace("%k", "%H");
                }
            }
        }
        if (dFmt) {
            if ("short" === resolved.weekday) {
                dFmt = dFmt.replace("%A", "%a");
            }
            if ("2-digit" === resolved.year) {
                dFmt = dFmt.replace("%Y", "%y");
            }
            if ("short" === resolved.month) {
                dFmt = dFmt.replace("%B", "%b");
            }
            else if ("2-digit" === resolved.month) {
                dFmt = dFmt.replace("%N", "%m");
            }
            if ("2-digit" === resolved.day) {
                dFmt = dFmt.replace("%e", "%d");
            }
            // Only support short era names
            if (opts.era) {
                resolved.era = "short";
                dFmt = opts.dateera.replace("{d}", dFmt);
            }
        }
        var ret;
        if (dFmt) {
            if (tFmt) {
                ret = opts.datetime.replace("{d}", dFmt).replace("{t}", tFmt);
            }
            else {
                ret = dFmt;
            }
        }
        else {
            ret = tFmt;
        }
        if ("latn" !== opts.ddigits) {
            // Need to prefix all numeric fields with 'O'
            ret = ret.replace(/%([zYySNMmlkIHed])/g, '%O$1');
        }
        resolved.numberingSystem = opts.ddigits;
        if ("UTC" === opts.timeZone) {
            resolved.timeZone = "UTC";
            opts.utc = true;
        }
        return ret;
    };

    /**
     * Date formatter that uses format formatting codes to control the
     * output. See, for example,
     * http://man7.org/linux/man-pages/man3/format.3.html
     * for more details.
     * Compatability note: this function implements the extensions to
     * the ANSI C standard marked SU, C99, TZ and GNU.
     * It does not support additional flag and field-width modifiers 
     * between the '%' and format code 
     * To make them more suitable for human presentation, the %l, %k and %e
     * codes are NOT padded; use %H and %d if you need fixed width
     * It provides an extension to allow for millisecond precision:
     *  %/
     * Available codes are:
     * %a ; Abbreviated weekday name (for example, Thu)
     * %A : Full weekday name (or example, Thursday)
     * %b : Abbreviated month name (for example, Aug)
     * %B : Full month name (for example, August)
     * %c : Date and time (for example, Thu Aug 23 14:55:02 2001)
     * %C : Century (year / 100, rounded down)
     * %d : The day of the month, 0-padded (for example, 23)
     * %D : Fixed date; equivalent to "%m/%d/%y"; %x is better
     * %e : Day of the month, unpadded (for example, "1")
     * %E : Modifier for other codes, accepted but not used
     * %F : ISO 8601 date: %Y-%m-%d
     * %g : Two digit year; if the ISO 8601 week for the date is week 53
     *       of the previous year, then the previous year is output
     * %G : Like %g, but the full calendar year is output
     * %h : Same as %b
     * %H : Hour using 24 hour clock, 0-padded (for example, 23)
     * %I : Hour using 12 hour clock, (for example, 11)
     * %j : Day of the year (001 - 366)
     * %k : Hour using 24 hour clock, unpadded (for example, "2")
     * %l : Hour using 12 hour clock, unpadded
     * %m : The month as a decimal number, 01 - 12
     * %M : The minute as a decimal number, 00 - 59
     * %n : Newline character '\n'
     * %N : The month as an unpadded number, 1-12
     * %O : Modifier for numeric fields; uses locale digits
     * %p : AM / PM (or locale equivalent)
     * %P : am / pm (or locale equivalent)
     * %r : Time in am/pm notation (for example, 01:30:45 PM)
     * %R : Fixed time format: %H:%M
     * %s : Seconds since the epoch
     * %S : Seconds as a decimal, 00 - 60
     * %t : Tab character '\t'
     * %T : Fixed time format %H:%M:%S; %X is better
     * %u : Day of the week, 1 to 7; Monday is 1
     * %U : The week number of the year (00-53), where the first Sunday of
     *       January is the first day of week 1; days prior to this are
     *       week 0
     * %V : The ISO 8601 week number of the year (01-53), where week 1 is
     *       the first week that has four days in the year; dates before
     *       this are considered to lie in week 53 of the PREVIOUS year
     * %w : Day of the week, 0 - 6, Sunday is 0
     * %W : Like %U, except that the first day of week 1 is the first
     *       Monday in January
     * %x : Preferred date representation for the locale
     * %X : Preferred time representation
     * %y : Two digit year
     * %Y : Year with century
     * %z : Hour offset from UTC; if the UsefulJS.Date.utc flag is true,
     *  this will be '+0000'
     * %Z : Time zone name (function attempts to get this from the
     *  "toString" representation)
     * %% : Percent character '%'
     * %/ : Milliseconds (3 digits, 0 - 999); specific to this
     *  implementation
     * %! : Era; specific to this implementation
     * Note that the %D, %R and %T codes are not locale-sensitive
     *
     * %O can be used before any numeric fields to output values in locale
     * digits rather than 0-9; if there are no alternate digits for the
     * locale, the modifier will have no effect.
     *
     * If you want to show AM/PM, note that this is not meaningful in many
     * locales; the %r macro takes this into account.
     * @param locales {String|Array} The requested locale or locales
     * @param opts {Object} The DateTimeFormat options; see Intl.DateTimeFormat
     *  for details
     */
    var DateTimeFormat = function(locales, opts) {
        var _opts = _l.dateOptions(locales, opts);
        var resolved = {
            locale : _opts.loc,
            calendar : _opts.cal,
            timeZone : undefined
        };
        _opts.fmt = _getFormatString(_opts, resolved);
        this.resolvedOptions = function() {
            return _u.clone(resolved);
        };
        this.opts = _opts;

        // Bind the format function to this instance so it can
        // be passed, for example, to Array.prototype.map
        this.format = _u.bindFunction(this.format, this);
        this.parse = _u.bindFunction(this.parse, this);
        this.getCalendar = function() {
            return _opts.calendarObj;
        };
    };

    DateTimeFormat.supportedLocalesOf = _l.supportedLocalesOf;

    DateTimeFormat.prototype.format = function(d, fmt) {
        if ("date" !== __typ(d)) {
            throw new TypeError("Date object expected");
        }
        var lOpts = this.opts, utc = lOpts.utc;
        if (!(fmt && "string" === __typ(fmt))) {
            // Use the configured format string
            fmt = lOpts.fmt;
        }
        // Get the macro map and mix the locale macros (false to
        // overwrite any locale-macros that are in the map)
        var macros = _u.mix(_u.clone(SMACROS), lOpts.sc, false);
        // Get properties out of the date object
        var yy = utc ? d.getUTCFullYear() : d.getFullYear(),
            cal = lOpts.calendarObj,
            // Convert Date object to calendar date
            dLocal = cal.dateToCalendarDate(d, utc),
            m = dLocal.mm,
            md = dLocal.dd,
            h24 = utc ? d.getUTCHours() : d.getHours(),
            h12 = h24 % 12,
            mins = utc ? d.getUTCMinutes() : d.getMinutes(),
            secs = utc ? d.getUTCSeconds() : d.getSeconds(),
            nz = utc ? 0 : d.getTimezoneOffset(),
            merid = _hour2meridiem(h24, lOpts.hd),
            ms = utc ? d.getUTCMilliseconds() : d.getMilliseconds(),
            wd = dLocal.wd,
            y4d = dLocal.yy,
            y2d = Math.abs(y4d) % 100,
            eraStr = cal.era[dLocal.en],
            wd7 = (0 === wd) ? 7 : wd,
            yweek_v, _y8601,
            // Which full month form are we using: nominative or genitive?
            fullMonths = /%O?[ed]/.test(fmt) ?
                lOpts.mf : lOpts.mn || lOpts.mf,
            ydOffs = cal.dayOffset(dLocal);
        if (0 === h12) {
            h12 = 12;
        }
        if (/%O?[VGg]/.test(fmt)) {
            // We're going to need the ISO 8601 week number
            yweek_v = _date2yweek_v(yy, m, md, wd7, ydOffs);
        }
        var aRet = [], lPad = function(n, w, p) {
            return _u.pad(String(n), w, p);
        }, nc = fmt.length, onc = nc, i, j, c, cc, fCode, sign, expCount = 0,
            O = false;
        for (i = 0; i < nc; i++) {
            c = fmt.charAt(i);
            if ('%' !== c) {
                aRet.push(c);
                continue;
            }
            if (i === (nc - 1)) {
                // Dangling '%' - ignore
                break;
            }
            // Peek ahead to get the formatting code
            cc = fmt.charAt(++i);
            fCode = c + cc;
            if (macros[fCode]) {
                // Splice the macro into the format string
                var f1 = fmt.substr(0, i - 1),
                    f2 = fmt.substr(i + 1, nc);
                fmt = f1 + macros[fCode] + f2;
                nc = fmt.length;
                if (++expCount > 1000) {
                    // Uh-oh; looks like a recursive pattern
                    throw new Error("format: Recursive pattern " + fCode);
                }
                // Rewind the pointer and continue
                i -= 2;
                if ('O' === cc) {
                    // Alt digits
                    O = true;
                }
                continue;
            }
            switch (cc) {
                case '/':
                    // Milliseconds
                    aRet.push(lPad(ms, 3, '0'));
                    break;

                case '%':
                    // Literal '%'
                    aRet.push(cc);
                    break;

                case 'a':
                    // Short day
                    aRet.push(lOpts.dc[wd]);
                    break;

                case 'A':
                    // Full day
                    aRet.push(lOpts.df[wd]);
                    break;

                case 'b':
                case 'h':
                    // Short month
                    aRet.push(lOpts.mc[m]);
                    break;

                case 'B':
                    // Full month
                    aRet.push(fullMonths[m]);
                    break;

                case 'C':
                    // Century number
                    sign = yy < 0 ? "-" : "";
                    aRet.push(sign + lPad(Math.floor(Math.abs(y4d) / 100), 2, '0'));
                    break;

                case 'd':
                    // Month date (fixed width)
                    if (fullMonths === lOpts.mn) {
                        // We're liable to output an ungrammatical date
                        // string
                        return this.format(d, fmt);
                    }
                    aRet.push(lPad(md, 2, '0'));
                    break;

                case 'e':
                    // Month date (unpadded)
                    if (fullMonths === lOpts.mn) {
                        // We're liable to output an ungrammatical date
                        // string
                        return this.format(d, fmt);
                    }
                    aRet.push(md.toString());
                    break;

                case 'g':
                case 'G':
                    // ISO 8601 year values; can be the previous year if
                    // the date falls before the first full week
                    _y8601 = y4d;
                    if (yweek_v < 1) {
                        // Previous year
                        --_y8601;
                    }
                    if ('g' === cc) {
                        // Two digit
                        aRet.push(lPad(Math.abs(_y8601) % 100, 2, '0'));
                    }
                    else {
                        aRet.push(cal.formatYear(_y8601));
                    }
                    break;

                case 'H':
                    // 24-hour hour value
                    aRet.push(lPad(h24, 2, '0'));
                    break;

                case 'I':
                    // 12-hour hour value (zero padded)
                    aRet.push(lPad(h12, 2, '0'));
                    break;

                case 'j':
                    // Day offset into the year (1 - 366, zero padded)
                    aRet.push(lPad(ydOffs, 3, '0'));
                    break;

                case 'k':
                    // 24-hour hour value (unpadded)
                    aRet.push(h24.toString());
                    break;

                case 'l':
                    // 12-hour hour value, unpadded
                    aRet.push(h12.toString());
                    break;

                case 'm':
                    // Ordinal month number
                    aRet.push(lPad(m + 1, 2, '0'));
                    break;

                case 'M':
                    // Minute value
                    aRet.push(lPad(mins, 2, '0'));
                    break;

                case 'n':
                    aRet.push('\n');
                    break;

                case 'N':
                    // Ordinal month number, unpadded
                    aRet.push((m + 1).toString());
                    break;

                case 'p':
                    // Meridian value, upper case
                    if (lOpts.um) {
                        aRet.push(lOpts.um[merid]);
                    }
                    break;

                case 'P':
                    // Meridian value, lower case
                    if (lOpts.lm) {
                        aRet.push(lOpts.lm[merid]);
                    }
                    break;

                case 's':
                    // Epoch seconds
                    aRet.push(String(Math.floor(d.getTime() / 1000)));
                    break;

                case 'S':
                    // Second value
                    aRet.push(lPad(secs, 2, '0'));
                    break;

                case 't':
                    aRet.push('\t');
                    break;

                case 'u':
                    // Day of the week, 1-7, Monday is 1
                    aRet.push(String(wd7));
                    break;

                case 'U':
                    // Week number counting from the first Sunday in
                    // January (00-53)
                    aRet.push(lPad(_date2yweek(yy, m, md, 0, ydOffs), 2, '0'));
                    break;

                case 'V':
                    // ISO 8601 week number; if yweek_w is 0, this is
                    // interpreted as week 53 of the previous year
                    aRet.push(lPad(yweek_v || 53, 2, '0'));
                    break;

                case 'w':
                    // Day of the week, 0-6
                    aRet.push(String(wd));
                    break;

                case 'W':
                    // Week number counting from the first Monday in
                    // January (00-53)
                    aRet.push(lPad(_date2yweek(yy, m, md, 1, ydOffs), 2, '0'));
                    break;

                case 'y':
                    // Year without century
                    aRet.push(lPad(y2d, 2, '0'));
                    break;

                case 'Y':
                    // Year with century
                    aRet.push(cal.formatYear(y4d));
                    break;

                case 'z':
                    if (utc) {
                        if (cal.isIso) {
                            // Indicate UTC with a 'Z'
                            aRet.push('Z');
                        }
                        else {
                            aRet.push("+0000");
                        }
                    }
                    else {
                        // Offset from UTC
                        var zabs = Math.abs(nz),
                            zm = zabs % 60;
                        zabs -= zm;
                        var zh = zabs / 60;
                        // Negative timezone offset means that we're
                        // ahead of GMT
                        sign = (nz <= 0) ? "+" : "-";
                        aRet.push(sign + lPad(zh, 2, '0') +
                            lPad(zm, 2, '0'));
                    }
                    break;

                case 'Z':
                    // Timezone code
                    if (utc) {
                        aRet.push("UTC");
                    }
                    else if (_tzCode) {
                        aRet.push(_tzCode);
                    }
                    break;

                case '!':
                    // Era
                    aRet.push(eraStr);
                    break;

                default:
                    throw new Error("format: " + fCode);
            }
            if (O && lOpts.digits && aRet.length && /[YyWwVUuSNMmlkIHedz]/.test(cc)) {
                // O modification - replace the digits of the last item
                // with the alternate digits for the locale
                var _nStr = aRet.pop(), _d, re = /\d/;
                for (j = 0; j < _nStr.length; j++) {
                    c = _nStr.charAt(j);
                    if (re.test(c)) {
                        _d = Number(c);
                        aRet.push(lOpts.digits.charAt(_d));
                    }
                    else {
                        aRet.push(c);
                    }
                }
            }
            O = false;
        }
        return aRet.join("");
    };

    /**
     * Creates a calendar for the given month and year
     * @param dLocal {Object} (Optional) broken-down calendar time for the
     *  month
     * @param fd {Number} (optional) The first day of the week, overriding
     *  the value for the locale
     * @return {Array} Up to seven rows (depending on how many weeks the
     *  month spans; the first row is the day names in abbreviated form
     */
    DateTimeFormat.prototype.cal = function(dLocal, fd) {
        var lOpts = this.opts, cal = lOpts.calendarObj, defs = cal.defs;
        if (!dLocal) {
            dLocal = {
                yy : defs[0],
                mm : defs[1],
                en : defs[3]
            };
        }
        else {
            if (!(__def(dLocal.yy) && __def(dLocal.mm))) {
                throw new TypeError("Year and month required");
            }
            if (!__def(dLocal.en)) {
                dLocal.en = defs[3];
            }
        }
        // Need to set the date to 1 and then construct a Date object
        // so that we can get the weekday for the 1st of the month
        var dP = { yy : dLocal.yy, mm : dLocal.mm, en : dLocal.en, dd : 1 };
        cal.fromCalendarDate(dP);
        var fdom = (new Date(dP.yy, dP.mm, dP.dd)).getDay(),
            monthDays = cal.months(dLocal.yy, dLocal.en),
            dc = monthDays[dLocal.mm], ret = [];
        if (!("number" === __typ(fd) && fd >= 0)) {
            fd = lOpts.fd;
        }
        // Construct the first row with the days of the week
        var i, fdPos,
            workingRow = [], j = fd, ldigits = lOpts.digits,
            sp = "\u00a0",
            days = lOpts.da || lOpts.dc;
        for (i = 0; i < 7; i++) {
            workingRow.push(days[j]);
            if (j === fdom) {
                fdPos = i;
            }
            if (++j > 6) {
                j = 0;
            }
        }
        ret.push(workingRow);
        workingRow = [];
        // Pad the first week up to the first day
        for (i = 0; i < fdPos; i++) {
            workingRow[i] = sp;
        }
        for (i = 1; i <= dc; i++) {
            if (7 === workingRow.length) {
                ret.push(workingRow);
                workingRow = [];
            }
            var s;
            if (ldigits) {
                var d1 = i % 10, d2 = Math.floor(i / 10);
                s = ldigits.charAt(d1);
                if (d2) {
                    s = ldigits.charAt(d2) + s;
                }
            }
            else {
                s = i.toString();
            }
            workingRow.push(s);
        }
        if (workingRow.length) {
            // Pad out the last row
            for (i = workingRow.length; i < 7; i++) {
                workingRow[i] = sp;
            }
        }
        ret.push(workingRow);
        return ret;
    };

    /**
     * The counterpart to format - parses a date string that is the
     * result of formatting a Date object with the specified fmt string.
     * Whitepace in both the date string and format string is insignificant
     * and case comparison for month and day names is case-insensitive.
     * The "%z" code will accept 'Z' (for UTC) as well as the HHMM form.
     * See, for example:
     * http://pubs.opengroup.org/onlinepubs/007908799/xsh/parse.html
     * for additional information
     * @param s {String} The formatted date string
     * @param fmt {String} (optional) A string containing format escape
     *  sequences (see format above for details)
     * @throws {TypeError} s or fmt are null or the empty string
     * @throws {Error} The format string is not entirely consumed when
     *  parsing the date string
     * @throws {Error} The format string contains unrecognized or
     *  unsupported format codes
     * @throws {Error} The date string contains values that cannot be
     *  matched against the format string (for example no digits where a
     *  numeric field is expected)
     * @throws {RangeError} A field is not within the appropriate range
     *  (for example, month number <1 or >months in year)
     * Note: This function is asymmetric with regards to format in that
     *  the %V, %G and %g tokens are not supported
     */
    DateTimeFormat.prototype.parse = function(s, fmt) {
        if (!(s && "string" === __typ(s))) {
            throw new TypeError("parse: bad date string");
        }
        var lOpts = this.opts, utc = lOpts.utc;
        if (!(fmt && "string" === __typ(fmt))) {
            // Use the configured format string
            fmt = lOpts.fmt;
        }
        // Remove trailing whitespace from the input strings
        s = s.replace(_u.RE_WS_END, "");
        fmt = fmt.replace(_u.RE_WS_END, "");
        // Initialize pointers into the strings and the terminal conditions
        var sPtr = 0, fPtr = 0, ns = s.length,
            nf = fmt.length, onf = nf, expCount = 0,
            cal = lOpts.calendarObj;
        // Date properties
        var dProps = {
            yy : null, mm : null, dd : null,
            hh : null, mins : null, secs : null,
            offs : null, merid : null, ms : null,
            en : null
        }, defs = {
            yy : cal.defs[0], mm : cal.defs[1], dd : cal.defs[2],
            hh : 0, mins : 0, secs : 0, ms : 0, en : cal.defs[3]
        };
        // Additional values of interest
        var _ms = null, _c = null, _cMul = 1, _2digy = null, _wday = null,
            _yday = null, _yweek_u = null, _yweek_w = null, _yweek_v = null;
        // Get the macro map and mix in the locale macros (false to
        // overwrite any locale-macros that are in the map)
        var macros = _u.mix(_u.clone(SMACROS), lOpts.sc, false),
            cc, fCode, tokLen, badLen, badRange, i, arr, t,
            token, mult, n, _token, j, p;
        // Need to treat %a/%A and %b/%B tokens as the same thing; search
        // the longer tokens first to avoid false positives from the
        // shorter ones
        var days = lOpts.df.concat(lOpts.dc), dpw = days.length / 2,
            months = lOpts.mf.concat(lOpts.mc), mpy = months.length / 2;
        if (lOpts.mn) {
            // Alternate nominative and genitive forms
            months = lOpts.mn.concat(months);
            mpy = months.length / 3;
        }
        var fieldWidths = cal.fieldWidths;

        // Advances through the format and date strings until we come to
        // the next token
        var _nextToken = function() {
            var ws = _u.RE_WS;
            while (sPtr < ns && ws.test(s.charAt(sPtr))) {
                ++sPtr;
            }
            while (fPtr < nf && ws.test(fmt.charAt(fPtr))) {
                ++fPtr;
            }
            // Advance past non-tokens at the front of the format string
            while (fPtr < nf && "%" !== fmt.charAt(fPtr)) {
                ++fPtr;
                if (sPtr < ns) {
                    // Non-code characters in the format should match
                    // characters in the date string
                    ++sPtr;
                }
            }
            // We may have exposed leading whitespace in the date string
            while (sPtr < ns && ws.test(s.charAt(sPtr))) {
                ++sPtr;
            }
        };
        // Gets a numeric token from the date string
        var _nToken = function(len) {
            var _nPtr = sPtr, re = /[0-9]/,
                rDigits = lOpts.rdigits || {}, a = [], c;
            while (_nPtr < ns) {
                c = s.charAt(_nPtr);
                if (re.test(c)) {
                    a.push(c);
                }
                else if (rDigits[c]) {
                    a.push(rDigits[c]);
                }
                else {
                    break;
                }
                ++_nPtr;
                if (len && (_nPtr - sPtr === len)) {
                    break;
                }
            }
            var ret = a.join("");
            if (!ret.length) {
                throw new Error("parse: Number expected at offset " + sPtr);
            }
            return ret;
        };
        // Gets the sign bit when a field can take a negative number
        var _signBit = function() {
            var sig = 1;
            if (sPtr < ns && /[+-]/.test(s.charAt(sPtr))) {
                if ("-" === s.charAt(sPtr)) {
                    sig =- 1;
                }
                ++sPtr;
            }
            return sig;
        };
        // Attempt to go through the entire format string; we do not stop
        // at the end of the input string because there may be tokens at
        // the end of the format string (such as %Z or %p in a locale that
        // does not use AM/PM) that can be satisfied by nothing.
        while (fPtr < nf) {
            _nextToken();
            if (fPtr >= nf) {
                break;
            }
            if (fPtr === (nf - 1)) {
                // Dangling '%'
                break;
            }
            ++fPtr;
            cc = fmt.charAt(fPtr++);
            fCode = '%' + cc;
            if (macros[fCode]) {
                // Splice the macro into the format string
                var oFmt = fmt;
                var f1 = fmt.substr(0, fPtr - 2),
                    f2 = fmt.substr(fPtr, nf);
                fmt = f1 + macros[fCode] + f2;
                nf = fmt.length;
                if (++expCount > 1000) {
                    throw new Error("parse: Recursive pattern " + fCode);
                }
                // Rewind the pointer and continue
                fPtr -= 2;
                continue;
            }
            tokLen = null;
            token = null;
            badRange = false;
            switch (cc) {
                case '%':
                    // Escaped character
                    tokLen = 1;
                    break;

                case 'n':
                case 't':
                    // Should have gone past the whitespace already
                    tokLen = 0;
                    break;

                case 'a':
                case 'A':
                    n = null;
                    for (i = 0; i < days.length; i++) {
                        t = days[i].toLocaleLowerCase();
                        _token = s.substring(sPtr, sPtr + t.length).toLocaleLowerCase();
                        if (_token === t) {
                            // We want the longest match, not the first
                            // match, for example "Cumartesi" rather than
                            // "Cuma"
                            if (!token || token.length < _token.length) {
                                token = _token;
                                tokLen = token.length;
                                n = i % dpw;
                            }
                        }
                    }
                    _wday = n;
                    if (null === tokLen) {
                        // Didn't find a match
                        token = null;
                    }
                    break;

                case 'b':
                case 'h':
                case 'B':
                    // Month name
                    n = null;
                    for (i = 0; i < months.length; i++) {
                        t = months[i].toLocaleLowerCase();
                        _token = s.substring(sPtr, sPtr + t.length).toLocaleLowerCase();
                        if (_token === t) {
                            if (!token || token.length < _token.length) {
                                token = _token;
                                tokLen = token.length;
                                n = i % mpy;
                            }
                        }
                    }
                    dProps.mm = n;
                    if (null === tokLen) {
                        // Didn't find a match
                        token = null;
                    }
                    break;

                case 'C':
                    // Century number
                    mult = _signBit();
                    token = _nToken();
                    i = mult * parseInt(token, 10);
                    _c = i;
                    // Record the sign bit for years in the 1st century BCE
                    _cMul = mult;
                    break;

                case 'd':
                case 'e':
                    // Month date
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i < 1 || i > 31) {
                        badRange = true;
                        break;
                    }
                    dProps.dd = i;
                    break;

                case 'H':
                case 'I':
                case 'k':
                case 'l':
                    // Hour value (12 or 24 hour)
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 23) {
                        badRange = true;
                        break;
                    }
                    dProps.hh = i;
                    break;

                case 'j':
                    // Nth day of the year
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i < 1 || i > 366) {
                        badRange = true;
                        break;
                    }
                    _yday = i;
                    break;

                case 'm':
                case 'N':
                    // Ordinal month number
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10) - 1;
                    if (i < 0 || i >= mpy) {
                        badRange = true;
                        break;
                    }
                    dProps.mm = i;
                    break;

                case 'M':
                    // Minutes
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 59) {
                        badRange = true;
                        break;
                    }
                    dProps.mins = i;
                    break;

                case 'p':
                case 'P':
                    // Meridiem value
                    arr = ('p' === cc) ? lOpts.um : lOpts.lm;
                    if (arr) {
                        for (i = arr.length - 1; i >= 0; --i) {
                            t = arr[i].toLocaleLowerCase();
                            _token = s.substring(sPtr, sPtr + t.length).toLocaleLowerCase();
                            if (_token === t) {
                                token = _token;
                                tokLen = token.length;
                                n = i;
                                break;
                            }
                        }
                        dProps.merid = n;
                    }
                    else {
                        // AM/PM not relevant for the locale - we don't
                        // expect to find anything
                        tokLen = 0;
                    }
                    break;

                case 's':
                    // Epoch seconds
                    mult = _signBit() * 1000;
                    token = _nToken();
                    i = mult * parseInt(token, 10);
                    _ms = i;
                    break;

                case 'S':
                    // Seconds
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 60) { // 60 because leap second is possible
                        badRange = true;
                        break;
                    }
                    dProps.secs = i;
                    break;

                case '/':
                    // Milliseconds
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 999) {
                        badRange = true;
                        break;
                    }
                    dProps.ms = i;
                    break;

                case 'u': // 1-7
                case 'w': // 0-6
                    // Day of the week
                    var min = ('w' === cc) ? 0 : 1,
                        max = ('w' === cc) ? 6 : 7;
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i < min || i > max) {
                        badRange = true;
                        break;
                    }
                    if ('u' === cc && i === 7) {
                        i = 0; // 0-6 again
                    }
                    _wday = i;
                    break;

                case 'U':
                case 'W':
                case 'V':
                    // Nth week of the year (1st day Monday for %W)
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 53) {
                        badRange = true;
                        break;
                    }
                    if ('U' === cc) {
                        _yweek_u = i;
                    }
                    else if ('V' === cc) {
                        _yweek_v = i;
                    }
                    else {
                        _yweek_w = i;
                    }
                    break;

                case 'y':
                case 'g':
                    // Two digit year
                    token = _nToken(fieldWidths[cc]);
                    i = parseInt(token, 10);
                    if (i > 99) {
                        badRange = true;
                        break;
                    }
                    if (null === dProps.yy) {
                        dProps.yy = i;
                        _2digy = true;
                    }
                    break;

                case 'Y':
                case 'G':
                    // Four (or more) digit year
                    mult = _signBit();
                    token = _nToken(fieldWidths[cc]);
                    i = mult * parseInt(token, 10);
                    dProps.yy = i;
                    _2digy = null;
                    break;

                case 'z':
                    // UTC offset
                    if (s.charAt(sPtr) === 'Z') {
                        tokLen = 1;
                        i = 0;
                    }
                    else {
                        // Sense for tz offset is reversed; a '+' means that
                        // a negative adjustment needs to be made for the
                        // final time value
                        mult = -1 * _signBit();
                        token = _nToken(4);
                        if (token.length !== 4) {
                            // Let this show up as an unresolved token
                            token = null;
                            break;
                        }
                        i = mult * parseInt(token, 10);
                    }
                    dProps.offs = i;
                    // Since we've been told an offset from UTC, we need to
                    // work in UTC and adjust
                    utc = true;
                    break;

                case 'Z':
                    // Timezone code; useless junk but needs to be consumed
                    var term = null;
                    // Determine which character ends the timezone code
                    if (fPtr < nf) {
                        term = fmt.charAt(fPtr);
                        while (sPtr < ns && s.charAt(sPtr) !== term) {
                            ++sPtr;
                        }
                    }
                    tokLen = 0;
                    break;

                case '!':
                    // Era (e.g., AD or BC)
                    dProps.en = -1;
                    for (i = 0; i < cal.era.length; i++) {
                        t = cal.era[i].toLocaleLowerCase();
                        _token = s.substring(sPtr, sPtr + t.length).toLocaleLowerCase();
                        if (_token === t) {
                           if (!token || token.length < _token.length) {
                                token = _token;
                                tokLen = token.length;
                                dProps.en = i;
                            }
                        }
                    }
                    if (null === tokLen) {
                        token = null;
                    }
                    else {
                        if (-1 === dProps.en) {
                            badRange = true;
                        }
                    }
                    break;
            }
            if (badRange) {
                throw new Error("parse: Unexpected field value for " + fCode);
            }
            if (null === tokLen && null !== token) {
                tokLen = token.length;
            }
            if (null === tokLen) {
                throw new Error("parse: Unresolved or unrecognized code " + fCode);
            }
            sPtr += tokLen;
        }
        // Have we matched the entire format string?
        if (fPtr < nf) {
            throw new Error("parse: Unmatched content at the end of fmt, " +
                fmt.substring(fPtr));
        }

        // Finally! Start constructing a return value
        if (__def(_ms)) {
            // We have an epoch time; overrides anything else
            return new Date(_ms);
        }
        // Sort out any irregularities in the year field
        var _yy, tmp, yc = cal.years;
        if (__def(dProps.yy) && _2digy && __def(_c)) {
            _yy = dProps.yy;
            // Got a century
            if (_cMul > 0) {
                _yy = _c * 100 + _yy;
            }
            else {
                _yy = _c * 100 - _yy;
            }
            dProps.yy = _yy;
            _2digy = false;
        }
        if (!__def(dProps.yy)) {
            if (_c) {
                // Use the best information available to us
                if (!_c) {
                    dProps.yy = (_cMul > 0) ? 1 : -1; // No year 0
                }
                else {
                    dProps.yy = _c * 100;
                }
            }
            else {
                if (cal.isLeapDay(dProps.mm, dProps.dd) ||
                    _yday === cal.leapYearDays()) {
                    // Avoid silent corrections to leap year values by setting
                    // the year to a known leap-year
                    while (cal.isLeapYear(defs.yy, defs.en) === false) {
                        --defs.yy;
                    }
                }
                dProps.yy = defs.yy;
                dProps.en = defs.en;
            }
        }
        if (!(__def(dProps.mm) && __def(dProps.dd))) {
            if (_yday) {
                // Derive the month and date from the year day value
                cal.monthAndDate(_yday, dProps);
            }
            else if (__def(_yweek_w)) {
                // Derive the month and date from the year week number
                _yweek2date(_yweek_w, _wday, dProps, 1);
            }
            else if (__def(_yweek_u)) {
                _yweek2date(_yweek_u, _wday, dProps, 0);
            }
            else if (__def(_yweek_v)) {
                _yweek2date_v(_yweek_v, _wday, dProps);
            }
        }
        if (__def(dProps.mm) && !__def(dProps.dd)) {
            // Month but no date; assume 1st
            defs.dd = 1;
        }
        if (dProps.hh) {
            // Correct the hours if the input was twelve hours and we know
            // the meridian value
            if (dProps.hh <= 12 && __def(dProps.merid)) {
                if (lOpts.hd[dProps.merid] >= 12 &&
                    dProps.hh + 12 >= lOpts.hd[dProps.merid] &&
                    dProps.hh < 12) {
                    dProps.hh += 12;
                }
                else if (12 === dProps.hh && lOpts.hd[dProps.merid] < 12) {
                    dProps.hh = 0;
                }
            }
        }
        // Fill in gaps in dProps
        for (p in defs) {
            if (null === dProps[p]) {
                dProps[p] = defs[p];
            }
        }
        // Turn the calendar date into a local date
        cal.fromCalendarDate(dProps, _2digy);
        var ret;
        // Construct a return value
        if (utc) {
            var utcms = UTCFN(dProps.yy, dProps.mm, dProps.dd, dProps.hh,
                dProps.mins, dProps.secs, dProps.ms) - UTCCORRECTION;
            if (dProps.offs) {
                // Correct for offset
                // Get the total number of minutes; ("0230" means 150 minutes)
                // and multiply up to milliseconds
                var zabs = Math.abs(dProps.offs),
                    zm = zabs % 100, zh = (zabs - zm) / 100,
                    zms = (zm + zh * 60) * 60000;
                if (dProps.offs < 0) {
                    zms *= -1;
                }
                utcms += zms;
            }
            ret = new Date(utcms);
        }
        else {
            ret = new Date(dProps.yy, dProps.mm, dProps.dd, dProps.hh,
                dProps.mins, dProps.secs, dProps.ms);
        }
        if (Math.abs(dProps.yy) < 100) {
            // Constructor value of 0 means 1900 AD, not 1 BC
            ret.setFullYear(dProps.yy);
        }
        // ...Aaaand return
        return ret;
    };
    
    // Julian date for Unix epoch (reference point for Julian date conversions)
    var jd0 = 2440587.5;
    
    /**
     * Fixes for this module
     * _date :
     *      now Add a "now" static method to Date (default true)
     *      toISOString / toRFC822String Adds fixed format output methods to
     *       Date prototype (default true for toISOString, false for
     *       toRFC822String)
     *      intl_DateTimeFormat : Add Intl.DateTimeFormat when the environment
     *       doesn't support it (default true)
     */
    UsefulJS.fixes._date = function(_u, optsIn, optsOut, all, none) {
        var mName, m, protoObj = Date.prototype;

        mName = "now";
        if (!(false === optsIn[mName] || none)) {
            m = function() {
                return (new Date()).getTime();
            };
            optsOut[mName] = _u._protoAdd(Date, mName, m, false);
        }
        mName = "toISOString";
        if (!(false === optsIn[mName] || none)) {
            m = function() {
                return new DateTimeFormat("en-u-ca-iso8601", { timeZone : "UTC" }).format(
                    this, _stdFormats.iso8601_ext);
            };
            optsOut[mName] = _u._protoAdd(protoObj, mName, m, false);
        }
        mName = "toRFC822String";
        if (true === optsIn[mName] || all) {
            m = function() {
                // The output should be local time with offset information;
                // output should be in the English locale
                return new DateTimeFormat("en").format(
                    this, _stdFormats.rfc2822);
            };
            optsOut[mName] = _u._protoAdd(protoObj, mName, m, false);
        }

        var propsName = "intl_DateTimeFormat";
        if (!(false === optsIn[propsName] || none)) {
            _u._protoAdd(_u.globalObject, "Intl", {}, false);
            optsOut[propsName] = _u._protoAdd(_u.globalObject.Intl, "DateTimeFormat",
                DateTimeFormat, false);
        }
    };

    return {
        // Predefined date / time formats
        formats : _stdFormats,

        /**
         * Wrapper for Date.UTC when that function produces inaccurate results
         */
        UTC : (function() {
            if (UTCCORRECTION) {
                return function(y, m, d, h, mm, s, ms) {
                    return UTCFN(y, m, d, h, mm, s, ms) - UTCCORRECTION;
                };
            }
            return UTCFN;
        })(),

        /**
         * Gets date format string from DateTimeFormat options
         * @param opts {Object} Options returned from
         *  UsefulJS.Locale.dateOptions
         * @param resolved {Object} container to hold resolved options
         * @return {String} strftime format string
         * @throws {RangeError} one or more options have invalid values
         */
        getFormatString : _getFormatString,
        
        /**
         * Computes the Julian day value for a given date
         * @param d {Date} the moment of interest
         * @return {Number} the decimal day count since the Julian epoch
         * @throws {TypeError} input is not a Date
         */
        toJulianDay : function(d) {
            if ("date" !== __typ(d)) {
                throw new TypeError("Input must be a Date object");
            }
            return jd0 + d.getTime() / 86400000  
        },
        
        /**
         * Converts a Julian day value to a Date object
         * @param jd {Number} the decimal day count since the Julian epoch
         * @return {Date} the date in Native format
         * @throws {TypeError} input is not a finite number
         */
        fromJulianDay : function(jd) {
            jd = Number(jd);
            if (!isFinite(jd)) {
                throw new TypeError("Input must be a finite number");
            }
        
            var epochMs = (jd - jd0) * 86400000;
            return new Date(epochMs);
        },

        Format : DateTimeFormat
    };
})();

