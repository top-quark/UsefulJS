
UsefulJS.Locale.xx = (function() {
    "use strict";
    var lProps = {
        n : "English (Somewhere)",
        base : null,
        ndigits : "latn",
        ddigits : "latn",
        ds : ".",
        gs : ",",
        gc : [3],
        nn : "-%1",
        cc : "EUR",
        cf : ["$%1", "-$%1"],
        pc : ["%1%", "-%1%"],
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
        sc : {
            "%c" : "%a %e %b %X %Y",
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
            // Hour, minute, second, ampm
            "nnn" : "%k:%M:%S",
            // Hour, minute
            "nn-" : "%k:%M"
        },
        hour12 : false,
        datetime : "{d} {t}",
        dateera : "{d} %!",
        time12 : "{t} %p",
        timetz : "{t} GMT%z",
        fd : 1,
        calendar : "gregory",
        gregory : {
            era : ["AD", "BC"]
        }
    };
    // UsefulJS.Locale.alias("xx", "yy", "zz");
    return lProps;
})();
