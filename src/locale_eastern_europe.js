/**
 * Eastern European locales
 * Author: Christopher Williams
 */

(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        pl : {
            n : "Polski",
            base : "def",
            ds : ",",
            gs : "\u00a0",
            cc : "PLN",
            cu : {
                PLN : "zł"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mc : ["sty", "lut", "mar", "kwi",
                "maj", "cze", "lip", "sie",
                "wrz", "paź", "lis", "gru"],
            // Month names are in genitive form; given how they are likely
            // to be used ("16 października 2013"), this is more useful than
            // the nominative
            mf : ["stycznia", "lutego", "marca", "kwietnia",
                "maja", "czerwca", "lipca", "sierpnia",
                "września", "października", "listopada", "grudnia"],
            // And the nominative forms for when the months are not going to 
            // be used in context
            mn : ["styczeń", "luty", "marzec", "kwiecień", 
                "maj", "czerwiec", "lipiec", "sierpień",
                "wrzesień", "październik", "listopad", "grudzień"],
            da : ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
            dc : ["niedz.", "pon.", "wt.", "śr.",
                "czw.", "pt.", "sob."],
            df : ["niedziela", "poniedziałek", "wtorek", "środa",
                "czwartek", "piątek", "sobota"],
            sc : {
                "%c" : "%a, %e %b %Y, %X",
                "%x" : "%d.%m.%Y",
                "%r" : "%T"
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
            },
            gregory : {
                era : ["n.e.", "p.n.e."]
            }
        },
        cs : {
            n : "Čeština",
            base : "pl",
            cc : "CZK",
            cu : {
                CZK : "Kč"
            },
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            // Not recommended, but Roman numerals for abbreviated month names are
            // acceptable
            mc : ["I", "II", "III", "IV", "V", "VI",
                "VII", "VIII", "IX", "X", "XI", "XII"],
            mf : ["ledna", "února", "března", "dubna", 
                "května", "června", "července", "srpna",
                "září", "října", "listopadu", "prosince"],
            mn : ["leden", "únor", "březen", "duben", 
                "květen", "červen", "červenec", "srpen",
                "září", "říjen", "listopad", "prosinec"],
            da : null,
            dc : ["ne", "po", "út", "st", "čt", "pá", "so"],
            df : ["neděle", "pondělí", "úterý", "středa",
                "čtvrtek", "pátek", "sobota"],
            um : null,
            lm : ["dop.", "odp."],
            sc : {
                "%c" : "%a %e.\u00a0%B %Y, %X"
            },
            dfmt : {
                // Year, month, day
                "-ntn" : "%e. %B %Y",
                // Month, day
                "--tn" : "%e. %B"
            },
            gregory : {
                era : ["po Kr.", "př.Kr."]
            }
        },
        sk : {
            n : "Slovenčina",
            base : "cs",
            cc : "EUR",
            pc : ["%1%", "-%1%"],
            mf : ["januára", "februára", "marca", "apríla",
                "mája", "júna", "júla", "avgusta",
                "septembra", "októbra", "novembra", "decembra"],
            mn : ["január", "február", "marec", "apríl",
                "máj", "jún", "júl", "avgust",
                "september", "október", "november", "december"],
            dc : ["ne", "po", "ut", "st", "št", "pi", "so"],
            df : ["nedeľa", "pondelok", "utorok", "streda",
                "štvrtok", "piatok", "sobota"],
            um : null,
            lm : ["dopoludnia", "popoludní"],
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e. %B %Y",
                // Month, day
                "--nn" : "%e.%N."
            },
            gregory : {
                era : ["n.l.", "pred n.l."]
            }
        },
        hu : {
            n : "Magyar",
            base : "cs",
            cc : "HUF",
            cu : {
                HUF : "Ft"
            },
            // Negative values use the EN DASH character
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%1%", "-%1%"],
            mf : ["január", "február", "március", "április",
                "május", "június", "július", "augusztus",
                "szeptember", "október", "november", "december"],
            mc : ["jan.", "febr.", "márc.", "ápr.",
                "máj.", "jún.", "júl.", "aug.",
                "szept.", "okt.", "nov.", "dec."],
            mn : null,
            dc : ["V.", "H.", "K.", "Sze.", "Cs.", "P.", "Szo."],
            df : ["vasárnap", "hétfő", "kedd", "szerda",
                "csütörtök", "péntek", "szombat"],
            lm : ["de.", "du."],
            um : ["DE.", "DU."],
            sc : {
                "%c" : "%a %b %e %T %Y",
                "%x" : "%Y.%m.%d.",
                "%r" : "%I:%M:%S %P"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Y %B %e., %A",
                "tnnn" : "%Y.%N.%e., %A",
                // Year, month, day
                "-ntn" : "%Y %B %e.",
                "-nnn" : "%Y.%N.%e.",
                // Year, month
                "-nt-" : "%Y %B",
                "-nn-" : "%Y.%N",
                // Month, day
                "--tn" : "%B %e.",
                "--nn" : "%N.%e."
            },
            gregory : {
                era : ["i. sz.", "i. e."]
            }
        },
        ro : {
            n : "Română",
            base : "def",
            ds : ",",
            gs : '.',
            cc : "RON",
            cu : {
                RON : "lei"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mf : ["ianuarie", "februarie", "martie", "aprilie",
                "mai", "iunie", "iulie", "august",
                "septembrie", "octombrie", "noiembrie", "decembrie"],
            mc : ["ian.", "feb.", "mar.", "apr.",
                "mai.", "iun.", "iul.", "aug.",
                "sep.", "oct.", "nov.", "dec."],
            df : ["duminică", "luni", "marţi", "miercuri",
                "joi", "vineri", "sâmbătă"],
            dc : ["D", "L", "Ma", "Mi", "J", "V", "S"],
            da : null,
            sc : {
                "%c" : "%a %d %b %Y %T %z",
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
            },
            datetime : "{d}, {t}",
            gregory : {
                era : ["d.Hr.", "î.Hr."]
            }
        },
        ru : {
            n : "Русский",
            base : "pl",
            cc : "RUB",
            cu : {
                RUB : "руб.",
                UAH : "₴"
            },
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mc : ["янв", "фев", "мар", "апр",
                "май", "июн", "июл", "авг",
                "сен", "окт", "ноя", "дек"],
            mf : ["января", "февраля", "марта", "апреля", 
                "мая", "июня", "июля", "августа",
                "сентября", "октября", "ноября", "декабря"],
            mn : ["Январь", "Февраль", "Март", "Апрель", 
                "Май", "Июнь", "Июль", "Август",
                "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            da : null,
            dc : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            df : ["воскресенье", "понедельник", "вторник", "среда",
                "четверг", "пятница", "суббота"],
            sc : {
                "%c" : "%A, %e %B %Y г. %X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e %B %Y г.",
                // Year, month, day
                "-ntn" : "%e %B %Y г."
            },
            gregory : {
                era : ["н.э.", "до н.э."]
            }
        },
        uk : {
            n : "українська",
            base : "ru",
            cc : "UAH",
            pc : ["%1%", "-%1%"],
            mf : ["січня", "лютого", "березня", "квітня",
                "травня", "червня", "липня", "серпня",
                "вересня", "жовтня", "листопада", "грудня"],
            mn : ["Січень", "Лютий", "Березень", "Квітень",
                "Травень", "Червень", "Липень", "Серпень",
                "Вересень", "Жовтень", "Листопад", "Грудень"],
            mc : ["січ", "лют", "бер", "кві",
                "тра", "чер", "лип", "сер",
                "вер", "жов", "лис", "гру"],
            df : ["неділя", "понеділок", "вівторок", "середа",
                "четвер", "п'ятниця", "субота"],
            dc : ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
            da : null,
            sc : {
                "%c" : "%a, %d-%b-%Y %X %z"
            },
            dfmt : {
                "tntn" : "%A, %e %B %Y р.",
                "-ntn" : "%e %B %Y р."
            },
            gregory : {
                era : ["н.е.", "до н.е."]
            }
        },
        bg : {
            n : "Български",
            base : "ru",
            cc : "BGN",
            cu : {
                USD : "щ.д.",
                BGN : "лв.",
                UAH : "UAH"
            },
            pc : ["%1%", "-%1%"],
            mf : ["януари", "февруари", "март", "април", 
                "май", "юни", "юли", "август",
                "септември", "октомври", "ноември", "декември"],
            mn : null,
            mc : ["янр", "фев", "мар", "апр",
                "май", "юни", "юли", "авг",
                "сеп","окт", "ное", "дек"],
            df : ["неделя", "понеделник", "вторник", "сряда",
                "четвъртък", "петък", "събота"],
            dc : ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
            sc : {
                "%c" : "%x (%a) %X",
                "%x" : "%e.%m.%Y",
                "%X" : "%k:%M:%S",
                "%r" : "%X"
            },
            timetz : "{t} Гринуич%z",
            gregory : {
                era : ["от н. е.", "пр. н. е."]
            }
        },
        el : {
            n : "Ελληνικά",
            base : "def",
            ds : ",",
            gs : ".",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mc : ["Ιαν", "Φεβ", "Μαρ", "Απρ",
                "Μαϊ", "Ιουν", "Ιουλ", "Αυγ",
                "Σεπ", "Οκτ", "Νοε", "Δεκ"],
            mf : ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου",
                "Μαΐου", "Ιουνίου", "Ιουλίου", "Αυγούστου",
                "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"],
            mn : ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος",
                "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος",
                "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
            da : ["Κυ", "Δε", "Τρ", "Τε", "Πε", "Πα", "Σά"],
            dc : ["Κυρ.", "Δευτ.", "Τρ.", "Τετ.", "Πεμ.", "Παρ.", "Σαβ."],
            df : ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη",
                "Πέμπτη", "Παρασκευή", "Σάββατο"],
            um : ["ΠΜ", "ΜΜ"],
            lm : ["πμ","μμ"],
            hour12 : true,
            sc : {
                "%c" : "%a %d %b %Y %r",
                "%X" : "%r",
                "%r" : "%I:%M:%S %P"
            },
            time12 : "{t} %P",
            gregory : {
                era : ["μ.Χ.", "π.Χ."]
            }
        },
        hr : {
            n : "Hrvatski",
            base : "def",
            ds : ",",
            gs : ".",
            cc : "HRK",
            cu : {
                HRK : "kn"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mc : ["sij", "vlj", "ožu", "tra",
                "svi", "lip", "srp", "kol",
                "ruj", "lis", "stu", "pro"],
            mf : ["siječnja", "veljače", "ožujka", "travnja",
                "svibnja", "lipnja", "srpnja", "kolovoza",
                "rujna", "listopada", "studenog", "prosinca"],
            mn : ["siječanj", "veljača", "ožujak", "travanj",
                "svibanj", "lipanj", "srpanj", "kolovoz",
                "rujan", "listopad", "studeni", "prosinac"],
            da : ["ne", "po", "ut", "sr", "če", "pe", "su"],
            dc : ["ned", "pon", "uto", "sri", "čet", "pet", "sub"],
            df : ["nedjelja", "ponedjeljak", "utorak", "srijeda",
                "četvrtak", "petak", "subota"],
            sc : {
                "%x" : "%d.%m.%Y",
                "%r" : "%X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e %B %Y",
                "tnnn" : "%A, %e %N. %Y",
                // Year, month, day
                "-ntn" : "%e. %B %Y",
                "-nnn" : "%e. %N. %Y",
                // Year, month
                "-nt-" : "%B. %Y",
                "-nn-" : "%N. %Y",
                // Month, day
                "--tn" : "%e. %B",
                "--nn" : "%e. %N."
            },
            gregory : {
                era : ["A. D.", "p. n. e."]
            }
        },
        sr : {
            n : "Српски",
            base : "hr",
            cc : "RSD",
            cu : {
                HRK : "HRK",
                RSD : "Дин."
            },
            mc : ["јан", "феб", "мар", "апр",
                "мај", "јун", "јул", "авг",
                "сеп", "окт", "нов", "дец"],
            mf : ["јануар", "фебруар", "март", "април",
                "мај", "јун", "јул", "август",
                "септембар", "октобар", "новембар", "децембар"],
            mn : null,
            da : ["не", "по", "ут", "ср", "че", "пе", "су"],
            dc : ["нед", "пон", "уто", "сре",
                "чет", "пет", "суб"],
            df : ["недеља", "понедељак", "уторак", "среда",
                "четвртак", "петак", "субота"],
            sc : {
                "%x" : "%d.%m.%Y."
            },
            dfmt : {
                "-nnn" : "%e.%N.%Y."
            },
            gregory : {
                era : ["н. е.", "п. н. е."]
            }
        },
        "sr-Latn" : {
            n : "Srpski",
            base : "sr",
            cu : {
                RSD : "din."
            },
            mc : ["jan", "feb", "mar", "apr",
                "maj", "jun", "jul", "avg",
                "sep", "okt", "nov", "dec"],
            mf : ["januar", "februar", "mart", "april",
                "maj", "jun", "jul", "avgust",
                "septembar", "oktobar", "novembar", "decembar"],
            da : ["ne", "po", "ut", "sr", "če", "pe", "su"],
            dc : ["ned", "pon", "uto", "sre", "čet", "pet", "sub"],
            df : ["nedelja", "ponedeljak", "utorak", "sreda",
                "četvrtak", "petak", "subota"],
            gregory : {
                era : ["n. e.", "p. n. e."]
            }
        },
        sl : {
            n : "Slovenski",
            base : "sr-Latn",
            cc : "EUR",
            mf : ["januar", "februar", "marec", "april",
                "maj", "junij", "julij", "avgust",
                "september", "oktober", "november", "december"],
            da : ["ne", "po", "to", "sr", "če", "pe", "so"],
            dc : ["ned", "pon", "tor", "sre", "čet", "pet", "sob"],
            df : ["nedelja", "ponedeljek", "torek", "sreda",
                "četrtek", "petek", "sobota"],
            sc : {
                "%x" : "%d. %m. %Y"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %e. %B %Y",
                "tnnn" : "%A, %e. %N. %Y",
                // Year, month, day
                "-ntn" : "%e. %B %Y",
                "-nnn" : "%e. %N. %Y",
                // Year, month
                "-nt-" : "%B. %Y",
                "-nn-" : "%N. %Y"
            },
            gregory : {
                era : ["po Kr.", "pr. n. št."]
            }
        },
        tr : {
            n : "Türkçe",
            base : "def",
            ds : ",",
            gs : ".",
            cc : "TRY",
            cu : {
                TRY : "₺"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            pc : ["%\u00a0%1", "-%\u00a0%1"],
            mc : ["Oca", "Şub", "Mar", "Nis",
                    "May", "Haz", "Tem", "Ağu",
                    "Eyl", "Eki", "Kas", "Ara"],
            mf : ["Ocak", "Şubat", "Mart", "Nisan",
                    "Mayis", "Haziran", "Temmuz", "Ağustos",
                    "Eylül", "Ekim", "Kasım", "Aralık"],
            da : ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"],
            dc : ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
            df : ["Pazar", "Pazartesi", "Salı", "Çarşamba",
                    "Perşembe", "Cuma", "Cumartesi"],
            um : ["ÖÖ", "ÖS"],
            lm : null,
            sc : {
                "%x" : "%d.%m.%Y",
                "%r" : "%X"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%e %B %Y %A",
                "tnnn" : "%e.%N.%Y %A",
                // Year, month, day
                "-nnn" : "%e.%N.%Y",
                // Year, month
                "-nn-" : "%N.%Y",
                // Month, day
                "--nn" : "%e.%N"
            },
            gregory : {
                era : ["MS", "MÖ"]
            }
        }
        
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
    // Montenegro
    _loc.alias("sr", "sr-Cyrl-ME");
    _loc.alias("sr-Latn", "sr-Latn-ME");
})(UsefulJS);


