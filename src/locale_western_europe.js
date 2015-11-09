/**
 * Northern European locales
 * Author: Christopher Williams
 */

(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        fr : {
            n : "Français",
            base : "def",
            ds : ",",
            gs : "\u00a0",
            cu : {
                USD : "$US",
                ARS : "$AR",
                AUD : "$AU",
                CAD : "$CA",
                CNY : "¥CN",
                HKD : "$HK",
                MXN : "$MX",
                TWD : "$TW",
                XPF : "FCFP"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mc : ["jan", "fév", "mar", "avr",
                    "mai", "juin", "juil", "aoû",
                    "sept", "oct", "nov", "déc"],
            mf : ["janvier", "février", "mars", "avril",
                    "mai", "juin", "juillet", "août",
                    "septembre", "octobre", "novembre", "décembre"],
            da : ["di", "lu", "ma", "me", "je", "ve", "sa"],
            dc : ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
            df : ["dimanche", "lundi", "mardi", "mercredi",
                    "jeudi", "vendredi", "samedi"],
            sc : {
                "%r" : "%T"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A %e %B %Y",
                "tnnn" : "%A %e/%N/%Y"
            },
            timetz : "{t} UTC%z",
            gregory : {
                era : ["ap. J.-C.", "av. J.-C."]
            }
        },
        "fr-CA" : {
            n : "Français (Canada)",
            base : "fr",
            cc : "CAD",
            cu : {
                CAD : "$"
            },
            cf : ["%1\u00a0$", "(%1\u00a0$)"],
            cs : "$",
            sc : {
                "%x" : "%Y-%m-%d"
            },
            dfmt : {
                // weekday, year, month, day
                "tnnn" : "%A %Y-%N-%e",
                // Year, month, day
                "-nnn" : "%Y-%N-%e",
                // Year, month
                "-nn-" : "%Y-%e",
                // Month, day
                "--nn" : "%N-%e"
            },
            fd : 0
        },
        "fr-BE" : {
            n : "Français (Belgique)",
            base : "fr",
            gs : ".",
            cf : ["$\u00a0%1", "$\u00a0-%1"],
            dsc : {
                "%x" : "%d/%m/%y"
            }
        },
        /*br : {
            n : "Brezhoneg",
            base : "fr",
            mc : ["Gen.", "C'hwe.", "Meur.", "Ebr.",
                "Mae", "Mezh.", "Goue.", "Eost",
                "Gwen.", "Here", "Du", "Kzu"],
            mf : ["Genver", "C'hwevrer", "Meurzh", "Ebrel",
                "Mae", "Mezheven", "Gouere", "Eost",
                "Gwengolo", "Here", "Du", "Kerzu"],
            da : ["Su", "Lu", "Mz", "Mc", "Ya", "Gw", "Sa"],
            dc : ["Sul", "Lun", "Meu.", "Mer.",
                "Yaou", "Gwe.", "Sad."],
            df : ["Sul", "Lun", "Meurzh", "Merc'her",
                "Yaou", "Gwener", "Sadorn"],
            gregory : {
                era : ["g. J.-K.", "p. J.-K."]
            }
        },*/
        de : {
            n : "Deutsch",
            base : "def",
            ds : ",",
            gs : ".",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mc : ["Jan", "Feb", "Mrz", "Apr",
                    "Mai", "Jun", "Jul", "Aug",
                    "Sep", "Okt", "Nov", "Dez"],
            mf : ["Januar", "Februar", "März", "April", 
                    "Mai", "Juni", "Juli", "August", 
                    "September", "Oktober", "November", "Dezember"],
            da : null,
            dc : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            df : ["Sonntag", "Montag", "Dienstag", "Mittwoch",
                    "Donnerstag", "Freitag", "Samstag"],
            um : null,
            lm : ["vorm.", "nachm."],
            sc : {
                "%x" : "%d.%m.%Y",
                "%r" : "%T"
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
                "--nn" : "%e.%N."
            },
            gregory : {
                era : ["n. Chr.", "v. Chr."]
            }
        },
        es : {
            n : "Español",
            base : "def",
            ds : ",",
            gs : ".",
            cu : {
                ARS : "AR$"
            },
            cf : ["$\u00a0%1", "-$\u00a0%1"],
            mc : ["ene", "feb", "mar", "abr", 
                    "may", "jun", "jul", "ago",
                    "sep", "oct", "nov", "dic"],
            mf : ["enero", "febrero", "marzo", "abril", 
                    "mayo", "junio", "julio", "agosto", 
                    "septiembre", "octubre", "noviembre", "diciembre"],
            da : ["do", "lu", "ma", "mi", "ju", "vi", "sá"],
            dc : ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
            df : ["domingo", "lunes", "martes", "miércoles",
                    "jueves", "viernes", "sábado"],
            um : null,
            lm : ["a.m.", "p.m."],
            sc : {
                "%x" : "%d/%m/%y",
                "%r" : "%T"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A %e de %B de %Y",
                "tnnn" : "%A %e/%N/%Y",
                // Year, month, day
                "-ntn" : "%e de %B de %Y"
            },
            gregory : {
                era : ["d.C.", "a.C."]
            }
        },
        "es-MX" : {
            n : "Español (México)",
            base : "es",
            ds : ".",
            gs : ",",
            cc : "MXN",
            cu : {
                USD : "US$",
                MXN : "$"
            },
            fd : 0
        },
        "es-AR" : {
            n : "Español (Argentina)",
            base : "es",
            cc : "ARS",
            cu : {
                USD : "US$",
                ARS : "$"
            },
            cf : ["$\u00a0%1", "$\u00a0-%1"]
        },
        "es-VE" : {
            n : "Español (Venezuela)",
            base : "es-AR",
            cc : "VEF",
            cu : {
                ARS : "AR$",
                VEF : "Bs.F."
            }
        },
        "es-CL" : {
            n : "Español (Chile)",
            base : "es",
            cc : "CLP",
            cu : {
                USD : "US$",
                CLP : "$"
            },
            sc : {
                "%x" : "%d-%m-%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tnnn" : "%A %e-%N-%Y",
                // Year, month, day
                "-nnn" : "%e-%N-%Y",
                // Year, month
                "-nn-" : "%N-%Y",
                // Month, day
                "--nn" : "%e-%N"
            }
        },
        "es-CO" : {
            n : "Español (Colombia)",
            base : "es",
            cc : "COP",
            cu : {
                USD : "US$",
                COP : "$"
            },
            cf : ["$\u00a0%1", "($\u00a0%1)"]
        },
        "es-BO" : {
            n : "Español (Bolivia)",
            base : "es-CO",
            cc : "BOB",
            cu : {
                BOB : "Bs",
                COP : "COP"
            }
        },
        "es-EC" : {
            n : "Español (Ecuador)",
            base : "es-CO",
            cc : "USD",
            cu : {
                USD : "$",
                COP : "COP"
            }
        },
        "es-PY" : {
            n : "Español (Paraguay)",
            base : "es-CO",
            cc : "PYG",
            cu : {
                COP : "COP",
                PYG : "₲"
            }
        },
        "es-UY" : {
            n : "Español (Uruguay)",
            base : "es-CO",
            cc : "UYU",
            cu : {
                COP : "COP",
                UYU : "$"
            }
        },
        "es-CR" : {
            n : "Español (Costa Rica)",
            base : "es",
            cc : "CRC",
            cu : {
                CRC : "₡"
            },
            cf : ["$%1", "($%1)"]
        },
        "es-CU" : {
            n : "Español (Cuba)",
            base : "es",
            cc : "CUP",
            cu : {
                CUP : "$"
            }
        },
        "es-SV" : {
            n : "Español (El Salvador)",
            base : "es",
            cc : "USD",
            ds : '.',
            gs : ','
        },
        "es-GT" : {
            n : "Español (Guatemala)",
            base : "es-SV",
            cc : "GTQ",
            cu : {
                GTQ : "Q"
            },
            cf : ["$%1", "($%1)"]
        },
        "es-DO" : {
            n : "Español (República Dominicana)",
            base : "es-GT",
            cc : "DOP",
            cu : {
                DOP : "$",
                GTQ : "GTQ"
            }
        },
        "es-PE" : {
            n : "Español (Perú)",
            base : "es",
            ds : '.',
            gs : ',',
            cc : "PEN",
            cu : {
                PEN : "S/."
            },
            cf : ["$\u00a0%1", "$\u00a0-%1"]
        },
        "es-HN" : {
            n : "Español (Honduras)",
            base : "es-SV",
            cc : "HNL",
            cu : {
                HNL : "L"
            }
        },
        "es-NI" : {
            n : "Español (Nicaragua)",
            base : "es-SV",
            cc : "NIO",
            cu : {
                HNL : "C$"
            }
        },
        "es-PA" : {
            n : "Español (Panamá)",
            base : "es-SV",
            cc : "PAB",
            cu : {
                PAB : "B/."
            }
        },
        it : {
            n : "Italiano",
            base : "def",
            ds : ",",
            gs : ".",
            cf : ["$\u00a0%1", "-$\u00a0%1"],
            mc : ["jen", "feb", "mar", "apr",
                    "mag", "giu", "lug", "ago",
                    "set", "ott", "nov", "dic"],
            mf : ["gennaio", "febbraio", "marzo", "aprile",
                    "maggio", "giugno", "luglio", "agosto",
                    "settembre", "ottobre", "novembre", "dicembre"],
            da : ["do", "lu", "ma", "me", "gi", "ve", "sa"],
            dc : ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
            df : ["domenica", "lunedì", "martedì", "mercoledì",
                    "giovedì", "venerdì", "sabato"],
            sc : {
                "%r" : "%T"
            },
            gregory : {
                era : ["dC", "aC"]
            }
        },
        pt : {
            n : "Português",
            base : "def",
            ds : ",",
            gs : ".",
            cu : {
            },
            mc : ["jan", "fev", "mar", "abr",
                "mai", "jun", "jul", "ago",
                "set", "out", "nov", "dez"],
            mf : ["janeiro", "fevereiro", "março", "abril",
                "maio", "junho", "julho", "agosto",
                "setembro", "outubro", "novembro", "dezembro"],
            da : ["D", "S", "T", "Q", "Q", "S", "S"],
            dc : ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
            df : ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
                "quinta-feira", "sexta-feira", "sábado"],
            sc : {
                "%x" : "%d-%m-%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e de %B de %Y",
                // Year, month, day
                "-ntn" : "%e de %B de %Y",
                // Year, month
                "-nt-" : "%B de %Y",
                // Month, day
                "--tn" : "%e de %B"
            },
            gregory : {
                era : ["d.C.", "a.C."]
            }
        },
        "pt-BR" : {
            n : "Português (Brasil)",
            base : "pt",
            cc : "BRL",
            cf : ["$\u00a0%1", "-$\u00a0%1"]
        },
        nl : {
            n : "Nederlands",
            base : "def",
            ds : ",",
            gs : ".",
            cf : ["$\u00a0%1", "$\u00a0-%1", "$\u00a0%1", "$\u00a0%1-"],
            mc : ["jan", "feb", "mrt", "apr",
                "mei", "jun", "jul", "aug",
                "sep", "okt", "nov", "dec"],
            mf : ["januari", "februari", "maart", "april",
                "mei", "juni", "juli", "augustus",
                "september", "oktober", "november", "december"],
            dc : ["zo", "ma", "di", "wo", "do", "vr", "za"],
            da : null,
            df : ["zondag", "maandag", "dinsdag", "woensdag",
                "donderdag", "vrijdag", "zaterdag"],
            sc : {
                "%x" : "%d-%m-%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A %e %B %Y",
                "tnnn" : "%A %e-%N-%Y",
                // Year, month, day
                "-nnn" : "%e-%N-%Y",
                // Year, month
                "-nn-" : "%N-%Y",
                // Month, day
                "--nn" : "%e-%N"
            },
            gregory : {
                era : ["n. Chr.", "v. Chr."]
            }
        },
        "nl-BE" : {
            n : "Nederlands (België)",
            base : "nl",
            sc : {
                "%x" : "%d/%m/%Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tnnn" : "%A %e/%N/%Y",
                // Year, month, day
                "-nnn" : "%e/%N/%Y",
                // Year, month
                "-nn-" : "%N/%Y",
                // Month, day
                "--nn" : "%e/%N"
            }
        }
    
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
    _loc.alias("es-GT", "es-PR");
})(UsefulJS);

// Swiss locales (German, French, Italian)
(function(_u) {
    "use strict";
    var baseProps = {
        n : "Deutsch (Schweiz)",
        base : "de",
        gs : "'",
        cc : "CHF",
        cu : {
            CHF : "Fr."
        },
        cf : ["$\u00a0%1", "$-%1"]
    }, _L = _u.Locale;

    // German
    _L["de-CH"] = baseProps;
    _L.alias("de-CH", "de-LI"); // Lichtenstein

    // Main difference from base locales for fr is the date separator
    var fProps = {
        n : "Français (Suisse)",
        base : "fr",
        sc : {
            "%x" : "%d.%m.%Y"
        },
        dfmt : {
            "tnnn" : "%A %e.%N.%Y",
            "-nnn" : "%e.%N.%Y",
            "-nn-" : "%N.%Y",
            "--nn" : "%e.%N"
        }
    };
    // Mix in the base properties
    _u.mix(fProps, baseProps, true);
    _L["fr-CH"] = fProps;

    var iProps = {
        n : "Italiano (Svizzera)",
        base : "it",
        sc : {
            "%x" : "%d.%m.%Y"
        },
        dfmt : {
            "tnnn" : "%A, %e.%N.%Y",
            "-nnn" : "%e.%N.%Y",
            "-nn-" : "%N.%Y",
            "--nn" : "%e.%N"
        }
    };
    _u.mix(iProps, baseProps, true);
    _L["it-CH"] = iProps;
})(UsefulJS);
