/**
 * African locales
 * Author: Christopher Williams
 */

(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        sw : {
            n : "Kiswahili",
            base : "def",
            cc : "KES",
            cu : {
                KES : "Ksh",
                TZS : "Tsh"
            },
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mf : ["Januari", "Februari", "Machi", "Aprili", 
                "Mei", "Juni", "Julai", "Agosti",
                "Septemba", "Oktoba", "Novemba", "Decemba"],
            mc : ["Jan", "Feb", "Mac", "Apr",
                "Mei", "Jun", "Jul", "Ago",
                "Sep", "Okt", "Nov", "Dec"],
            df : ["Jumapili", "Jumatatu", "Jumanne", "Jumatano",
                "Alhamisi", "Ijumaa", "Jumamosi"],
            dc : ["J2", "J3", "J4", "J5", "Alh", "Ij", "J1"],
            da : ["P", "T", "N", "T", "A", "I", "M"],
            lm : ["usiku", "alfajiri", "asubuhi", "mchana", "jioni", "usiku"],
            um : null,
            hd : [0, 4, 7, 12, 16, 19],
            hour12 : true,
            sc : {
                "%c" : "%e %B %Y %X",
                "%X" : "%r"
            },
            gregory : {
                era : ["BK", "KK"]
            }
        },
        "sw-TZ" : {
            n : "Kiswahili (Tanzania)",
            base : "sw",
            cc : "TZS",
            cf : ["$%1", "-$%1"]
        },
        "en-NG" : {
            n : "English (Nigeria)",
            base : "def",
            cc : "NGN",
            cu : {
                NGN : "₦"
            },
            sc : {
                "%r" : "%X"
            },
            fd : 0
        },
        ha : {
            n : "Hausa",
            base : "en-NG",
            mf : ["Janairu", "Fabrairu", "Maris", "Afirilu",
                "Mayu", "Yuni", "Yuli", "Agusta",
                "Satumba", "Oktoba", "Nuwamba", "Disamba"],
            mc : ["Jan", "Fab", "Mar", "Afr",
                "May", "Yun", "Yul", "Agu",
                "Sat", "Okt", "Nuw", "Dis"],
            df : ["Lahadi", "Litinin", "Talata", "Laraba",
                "Alhamis", "Juma'a", "Asabar"],
            dc : ["Lah", "Lit", "Tal", "Lar", "Alh", "Jum", "Asa"],
            da : ["La", "Li", "Ta", "La", "Al", "Ju", "As"],
            sc : {
                "%c" : "ranar %A, %d ga %B cikin %X"
            },
            lm : ["Safe", "Yamma"],
            um : null
        },
        yo : {
            n : "Yorùbà",
            base : "en-NG",
            mf : ["Ṣé\u0323é\u0323ré\u0323", "Èrèlé", "Ẹré\u0323nà", "Igbe", 
                "Èbìbí", "Okúdù", "Agẹmọ", "Ògún",
                "Owéwè", "Owàrà", "Bélú", "Ò\u0323pe"],
            mc : ["Ṣé\u0323é\u0323", "Èrè", "Ẹré\u0323", "Igb",
                "Èbì", "Okú", "Agẹ", "Ògú",
                "Ọwé", "Ò\u0323wà", "Bel", "Ò\u0323pe"],
            df : ["Àìkú", "Ajé", "Ìṣégun", "Ọjórú",
                "Ọjóbo", "Ẹtì", "Àbáméta"],
            dc : ["Ai", "Aj", "Iṣ", "Ọr", "Ọb", "Ẹt", "Ab"],
            da : null,
            lm : ["Òru", "Ààrò\u0323", "Ò\u0323án",
                "Ìrò\u0323lé\u0323", "Alé\u0323"],
            um : null,
            hd : [0, 5, 12, 16, 19]
        },
        "en-ZA" : {
            n : "English (South Africa)",
            base : "def",
            cc : "ZAR",
            cu : {
                ZAR : "R"
            },
            sc : {
                "%x" : "%Y/%m/%d"
            },
            ddfmt : {
                // weekday, year, month, day
                "tnnn" : "%A, %Y/%N/%e",
                // Year, month, day
                "-nnn" : "%Y/%N/%e",
                // Year, month
                "-nn-" : "%Y/%N",
                // Month, day
                "--nn" : "%N/%e"
            },
            fd : 0
        },
        af : {
            n : "Afrikaans",
            base : "en-ZA",
            ds : ',',
            gs : '\u00a0',
            mc : ["Jan.", "Feb.", "Mrt.", "Apr.",
                "Mei", "Jun.", "Jul.", "Aug.",
                "Sep.", "Okt.", "Nov.", "Des."],
            mf : ["Januarie", "Februarie", "Maart", "April",
                "Mei", "Junie", "Julie", "Augustus",
                "September", "Oktober", "November", "Desember"],
            dc : ["So.", "Ma.", "Di.", "Wo.", "Do.", "Vr.", "Sa."],
            da : ["So", "Ma", "Di", "Wo", "Do", "Vr", "Sa"],
            df : ["Sondag", "Maandag", "Dinsdag", "Woensdag",
                "Donderdag", "Vrydag", "Saterdag"],
            um : ["VM.", "NM."],
            lm : ["vm.", "nm."],
            sc : {
                "%r" : "%I:%M:%S %P"
            },
            gregory : {
                era : ["n. Chr.", "v. Chr."]
            }
        }    
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
})(UsefulJS);


