/**
 * English speaking locales
 * Author: Christopher Williams
 */

(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        "en-GB" : {
            n : "English (GB)",
            base : "def",
            cc : "GBP",
            sc : {
                "%x" : "%d/%m/%y"
            },
            fd : 0        
        },
        "en-CA" : {
            n : "English (Canada)",
            base : "en-GB",
            cc : "CAD",
            cu : {
                USD : "US$",
                CAD : "$"
            },
            hour12 : true,
            sc : {
                "%X":"%r"
            }            
        },
        "en-AU" : {
            n : "English (Australian)",
            base : "en-GB",
            cc : "AUD",
            cu : {
                AUD : "$",
                USD : "US$"
            }
        },
        "en-NZ" : {
            n : "English (New Zealand)",
            base : "en-GB",
            cc : "NZD",
            cu : {
                USD : "US$",
                NZD : "$"
            }
        },
        "en-SG" : {
            n : "English (Singapore)",
            base : "def",
            cc : "SGD",
            cu : {
                USD : "US$",
                SGD : "$"
            }
        },
        "en-IE" : {
            n : "English (Ireland)",
            base : "en-GB",
            cc : "EUR"
        },
        "en-JM" : {
            n : "English (Jamaica)",
            base : "en-GB",
            cc : "JMD",
            cu : {
                USD : "US$",
                JMD : "$"
            }
        },
        ga : {
            n : "Gaeilge",
            base : "en-IE",
            mc : ["Ean.", "Feabh.", "Már.", "Aib.",
                "Beal.", "Meith.", "Iúil", "Lún.",
                "M.F.", "D.F.", "Samh.", "Noll."],
            mf : ["Eanáir", "Feabhra", "Márta", "Aibreán",
                "Bealtaine", "Meitheamh", "Iúil", "Lúnasa",
                "Meán Fómhair", "Deireadh Fómhair", "Samhain", "Nollaig"],
            da : ["Do", "Lu", "Má", "Cé", "De", "Ao", "Sa"],
            dc : ["Domh.", "Luan", "Máirt", "Céad.", "Déar.", "Aoine", "Sath."],
            df : ["Domhnaigh", "Luain", "Máirt", "Céadaoin",
                "Déardaoin", "Aoine", "Sathairn"]       
        },
        cy : {
            n : "Cymraeg",
            base : "en-GB",
            mc : ["Ion", "Chwe", "Maw", "Ebr",
                "Mai", "Meh", "Gor", "Aws",
                "Med", "Hyd", "Tach", "Rhag"],
            mf : ["Ionawr", "Chwefror", "Mawrth", "Ebrill",
                "Mai", "Mehefin", "Gorffenaf", "Awst", 
                "Medi", "Hydref", "Tachwedd", "Rhagfyr"],
            da : ["Su", "Ll", "Ma", "Me", "Ia", "Gw", "Sa"],
            dc : ["Sul", "Llun", "Maw", "Mer", "Iau", "Gwe", "Sad"],
            df : ["Dydd Sul", "Dydd Llun", "Dydd Mawrth", "Dydd Mercher",
                "Dydd Iau", "Dydd Gwener", "Dydd Sadwrn"],
            um : null,
            lm : ["y.b.", "y.p.", "y.h."],
            hd : [0, 12, 18],
            gregory : {
                era : ["OC", "CC"]
            }        
        } 
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
    _loc.alias("en-GB", "en-AG");
})(UsefulJS);


