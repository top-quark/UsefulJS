/**
 * Northern European locales
 * Author: Christopher Williams
 */

(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        sv : {
            n : "Svenska",
            base : "def",
            ds : ",",
            gs : "\u00a0",
            nn : "\u2212%1",
            cc : "SEK",
            cu : {
                DKK : "DKr",
                ISK : "Ikr",
                NOK : "Nkr",
                SEK : "kr"
            },
            cf : ["%1\u00a0$", "\u2212%1\u00a0$"],
            pc : ["%1\u00a0%", "\u2212%1\u00a0%"],
            mc : ["jan", "feb", "mar", "apr",
                    "maj", "jun", "jul", "aug",
                    "sep", "okt", "nov", "dec"],
            mf : ["januari", "februari", "mars", "april", 
                    "maj", "juni", "juli", "augusti", 
                    "september", "oktober", "november", "december"],
            dc : ["sö", "må", "ti", "on", "to", "fr", "lö"],
            da : null,
            df : ["söndag", "måndag", "tisdag", "onsdag",
                    "torsdag", "fredag", "lördag"],
            sc : {
                "%c" : "%a %e %b %Y %X",
                "%x" : "%Y-%m-%d",
                "%X" : "%H.%M.%S",
                "%r" : "%X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A den %e:e %B %Y",
                "tnnn" : "%A, %Y-%N-%e",
                // Year, month, day
                "-nnn" : "%Y-%N-%e",
                // Year, month
                "-nt-" : "%B %Y",
                "-nn-" : "%Y-%N",
                // Month, day
                "--tn" : "%e:e %B",
                "--nn" : "%e-%N"
            },
            tfmt : {
                // Hour, minute, second, ampm
                "nnn" : "%k.%M.%S",
                // Hour, minute
                "nn-" : "%k.%M"
            },
            gregory : {
                era : ["e.Kr.", "f.Kr."]
            }
        },
        da : {
            n : "Dansk",
            base : "sv",
            ds : ",",
            gs : ".",
            nn : "-%1",
            cc : "DKK",
            cu : {
                DKK : "kr",
                SEK : "Skr"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mc : ["jan", "feb", "mar", "apr",
                    "maj", "jun", "jul", "aug",
                    "sep", "okt", "nov", "dec"],
            mf : ["januar", "februar", "marts", "april", 
                    "maj", "juni", "juli", "august", 
                    "september", "oktober", "november", "december"],
            dc : ["sø", "ma", "ti", "on", "to", "fr", "lø"],
            df : ["søndag", "mandag", "tisdag", "onsdag",
                    "torsdag", "fredag", "lørdag"],
            sc : {
                "%x" : "%d-%m-%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A den %e. %B %Y",
                "tnnn" : "%A. %e/%N/%Y",
                // Year, month, day
                "-ntn" : "%e. %B %Y",
                "-nnn" : "%e-%N-%Y",
                // Year, month
                "-nn-" : "%N-%Y",
                // Month, day
                "--tn" : "%e. %B",
                "--nn" : "%e-%N"
            }
        },
        nb : {
            n : "Norsk (Bokmål)",
            base : "da",
            gs : "\u00a0",
            cc : "NOK",
            cu : {
                DKK : "DKr",
                NOK : "kr"
            },
            cf : ["$\u00a0%1","-$\u00a0%1"],
            mc : ["jan", "feb", "mar", "apr",
                    "mai", "jun", "jul", "aug",
                    "sep", "okt", "nov", "des"],
            mf : ["januar", "februar", "mars", "april", 
                    "mai", "juni", "juli", "august", 
                    "september", "oktober", "november", "desember"],
            dc : ["søn", "man", "tir", "ons", "tor", "fre", "lør"],
            df : ["søndag", "mandag", "tirsdag", "onsdag",
                    "torsdag", "fredag", "lørdag"],
            sc : {
                "%c" : "%a %d. %b %Y kl. %H.%M %z",
                "%x" : "%d. %b %Y",
                "%X" : "kl. %H.%M %z"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A %e. %B %Y",
                "tnnn" : "%A %e/%N/%Y",
                // Year, month, day
                "-nnn" : "%e.%N.%Y",
                // Year, month
                "-nn-" : "%N %Y",
                // Month, day
                "--nn" : "%e.%N"
            }
        },
        nn : {
            n : "Norsk (Nynorsk)",
            base : "nb",
            dc : ["søn", "mån", "tys", "ons", "tor", "fre", "lau"],
            df : ["søndag", "måndag", "tysdag", "onsdag",
                    "torsdag", "fredag", "laurdag"]
        },
        fi : {
            n : "Suomi",
            base : "def",
            ds : ",",
            gs : "\u00a0",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mc : ["tammi", "helmi", "maalis", "huhti",
                    "touko", "kesä", "heinä", "elo",
                    "syys", "loka", "marras", "joulu"],
            mf : ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu",
                    "toukokuu", "kesäkuu", "heinäkuu", "elokuu",
                    "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
            dc : ["su", "ma", "ti", "ke", "to", "pe", "la"],
            da : null,
            df : ["sunnuntai", "maanantai", "tiistai", "keskiviikko",
                    "torstai", "perjantai", "lauantai"],
            um : null,
            lm : ["ap.", "ip."],
            sc : {
                "%c" : "%a %e. %Bta %Y %X",
                "%x" : "%d.%m.%Y",
                "%X" : "%H.%M.%S",
                "%r" : "%X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Ana %e. %Bta %Y",
                "tnnn" : "%Ana %e.%N.%Y",
                // Year, month, day
                "-ntn" : "%e. %Bta %Y",
                "-nnn" : "%e.%N.%Y",
                // Year, month
                "-nn-" : "%N.%Y",
                // Month, day
                "--tn" : "%e. %B",
                "--nn" : "%e.%N."
            },
            tfmt : {
                // Hour, minute, second, ampm
                "nnn" : "%k.%M.%S",
                // Hour, minute
                "nn-" : "%k.%M"
            },
            timetz : "{t} UTC%z",
            gregory : {
                era : ["jaa", "eaa"]
            }
        },
        "sv-FI" : {
            n : "Svenska (Finland)",
            base : "sv",
            cc : "EUR",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            sc : {
                "%c" : "%a %e. %B %Y %X",
                "%x" : "%d.%m.%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tnnn" : "%A, %e.%N.%Y",
                // Year, month, day
                "-nnn" : "%e.%N.%Y",
                // Year, month
                "-nn-" : "%N.%Y",
                // Month, day
                "--nn" : "%e.%N"
            }
        },
        et : {
            n : "Eesti",
            base : "def",
            ds : ",",
            gs : "\u00a0",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mf : ["jaanuar", "veebruar", "märts", "aprill",
                "mai", "juuni", "juuli", "august",
                "september", "oktoober", "november", "detsember"],
            mc : ["jaan", "veebr", "märts", "apr",
                "mai", "juuni", "juuli", "aug",
                "sept", "okt", "nov", "dets"],
            df : ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev",
                "neljapäev", "reede", "laupäev"],
            dc : ["P", "E", "T", "K", "N", "R", "L"],
            da : null,
            /*um : null,
            lm : ["enne keskpäeva", "pärast keskpäeva"],*/
            sc : {
                "%x" : "%d.%m.%Y",
                "%r" : "%X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e. %B %Y",
                "tnnn" : "%A, %e.%N.%Y",
                // Year, month, day
                "-ntn" : "%e. %B %Y",
                "-nnn" : "%e.%N.%Y",
                // Year, month
                "-nn-" : "%N.%Y",
                // Month, day
                "--tn" : "%e. %B",
                "--nn" : "%e.%N"
            },
            gregory : {
                era : ["m.a.j.", "e.m.a."]
            }
        },
        is : {
            n : "Íslenska",
            base : "nb",
            gs : ".",
            cc : "ISK",
            cu : {
                ISK : "kr",
                NOK : "Nkr"
            },
            cf : ["$.\u00a0%1", "$.\u00a0-%1"],
            pc : ["%1%", "-%1%"],
            mc : ["jan", "feb", "mar", "apr",
                "maí", "jún", "júl", "ágú",
                "sep", "okt", "nóv", "des"],
            mf : ["janúar", "febrúar", "mars", "apríl",
                "maí", "júní", "júlí", "ágúst",
                "september", "október", "nóvember", "desember"],
            dc : ["sun", "mán", "þri", "mið",
                "fim", "fös", "lau"],
            df : ["sunnudagur", "mánudagur", "þriðjudagur", "miðvikudagur",
                "fimmtudagur", "föstudagur", "laugardagur"],
            da : ["su", "má", "þr", "mi", "fi", "fö", "la"],
            um : null,
            lm : ["fh", "eh"],
            sc : {
                "%c" : "%a %e.%b %Y, %T",
                "%X" : "%T"
            },
            tfmt : {
                // Hour, minute, second, ampm
                "nnn" : "%k:%M:%S",
                // Hour, minute
                "nn-" : "%k:%M"
            }
        },
        lv : {
            n : "Latviešu",
            base : "et",
            nn : "\u2212%1",
            cf : ["%1\u00a0$", "\u2212%1\u00a0$"],
            pc : ["%1%", "\u2212%1%"],
            mf : ["janvārī", "februārī", "martā", "aprīlī",
                "maijā", "jūnijā", "jūlijā", "augustā",
                "septembrī", "oktobrī", "novembrī", "decembrī"],
            mc : ["jan", "feb", "mar", "apr",
                "mai", "jūn", "jūl", "aug",
                "sep", "okt", "nov", "dec"],
            mn : ["janvāris", "februāris", "marts", "aprīlis",
                "maijs", "jūnijs", "jūlijs", "augusts",
                "septembris", "oktobris", "novembris", "decembris"],
            df : ["svētdiena", "pirmdiena", "otrdiena", "trešdiena",
                "ceturtdiena", "piektdiena", "sestdiena"],
            dc : ["sv", "pr", "ot", "tr", "ce", "pk", "se"],
            da : ["Sv", "P", "O", "T", "C", "Pk", "S"],
            /*um : null,
            lm : ["priekšpusdienā", "pēcpusdienā"],*/
            sc : {
                "%c" : "%A, %Y. gada %e. %B, %X",
                "%x" : "%Y.%m.%d."
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %Y. gada %e. %B",
                "tnnn" : "%A, %Y.%N.%e",
                // Year, month, day
                "-ntn" : "%Y. gada %e. %B",
                "-nnn" : "%Y.%N.%e",
                // Year, month
                "-nt-" : "%Y. g. %B",
                "-nn-" : "%Y.%N",
                // Month, day
                "--tn" : "%e. %B",
                "--nn" : "%N.%e."
            },
            gregory : {
                era : ["m.ē.", "p.m.ē."]
            }
        },
        lt : {
            n : "Lietuvių",
            base : "lv",
            mf : ["sausio", "vasario", "kovo", "balandžio", 
                "gegužės", "birželio", "liepos", "rugpjūčio",
                "rugsėjo", "spalio", "lapkričio", "gruodžio"],
            mc : ["sau", "vas", "kov", "bal",
                "geg", "bir", "lie", "rgp",
                "rgs", "spl", "lap", "grd"],
            mn : ["sausis", "vasaris", "kovas", "balandis", 
                "gegužė", "birželis", "liepa", "rugpjūtis",
                "rugsėjis", "spalis", "lapkritis", "gruodis"],
            df : ["sekmadienis", "pirmadienis", "antradienis", "trečiadienis", 
                "ketvirtadienis", "penktadienis", "šeštadienis"],
            dc : ["Sk", "Pr", "An", "Tr", "Kt", "Pn", "Št"],
            da : ["S", "P", "A", "T", "K", "Pn", "Š"],
            /*um : null,
            lm : ["priešpiet", "popiet"],*/
            sc : {
                "%c" : "%Y m. %B %e d. %X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Y m. %B %e d., %A",
                "tnnn" : "%Y.%N.%e %A",
                // Year, month, day
                "-ntn" : "%Y m. %B %e d.",
                "-nnn" : "%Y.%N.%e",
                // Year, month
                "-nt-" : "%Y %B",
                "-nn-" : "%Y.%N",
                // Month, day
                "--tn" : "%B-%e",
                "--nn" : "%N.%e"
            },
            gregory : {
                era : ["po Kr.", "pr. Kr."]
            }
        }
        
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
})(UsefulJS);


