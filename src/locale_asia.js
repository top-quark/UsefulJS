/**
 * Asian locales
 * Author: Christopher Williams
 */
(function(_u) {
    "use strict";
    var _loc = _u.Locale;
    _u.forEach({
        zh : {
            n : "中文",
            base : "def",
            cc : "CNY",
            cu : {
                CNY : "￥"
            },
            mf : ["一月", "二月", "三月", "四月",
                    "五月", "六月", "七月", "八月",
                    "九月", "十月", "十一月", "十二月"],
            mc : ["1月", "2月", "3月", "4月",
                    "5月", "6月", "7月", "8月",
                    "9月", "10月", "11月", "12月"],
            da : ["日", "一", "二", "三", "四", "五", "六"],
            dc : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            df : ["星期日", "星期一", "星期二", "星期三",
                    "星期四", "星期五", "星期六"],
            um : ["上午", "下午"],
            lm : null,
            sc : {
                "%c" : "%Y年%m月%d日 %A %H时%M分%S秒",
                "%x" : "%Y年%m月%d日",
                "%X" : "%H时%M分%S秒",
                "%r" : "%p%I时%M分%S秒"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Y年%N月%e日%A",
                "tnnn" : "%Y年%N月%e日%A",
                // Year, month, day
                "-ntn" : "%Y年%N月%e日",
                "-nnn" : "%Y年%N月%e日",
                // Year, month
                "-nt-" : "%Y年%N月",
                "-nn-" : "%Y-%N",
                // Month, day
                "--tn" : "%N月%e日",
                "--nn" : "%N-%e"
            },
            dateera : "%!{d}",
            time12 : "%p{t}",
            timetz : "{t} 格林尼治标准时间%z",
            gregory : {
                era : ["公元", "公元前"]
            },
            fd : 0
        },
        "zh-Hans-SG" : {
            n : "中文(新加坡)",
            base : "zh",
            cc : "SGD",
            cu : {
                USD : "US$",
                SGD : "$"
            },
            sc : {
                "%c" : "%Y年%m月%d %H时%M分%S"
            }
        },
        "zh-Hant-TW" : {
            n : "中文(台灣)",
            base : "zh",
            cc : "TWD",
            cs : "NT$",
            dc : ["週日","週一","週二","週三","週四","週五","週六"],
            sc : {
                "%c" : "%!%Y年%m月%d日 (%A) %H時%M分%S秒",
                "%x" : "%!%Y年%m月%d日",
                "%r" : "%p %I:%M:%S"
            },
            dfmt : {
                // Year, month
                "-nn-" : "%Y/%N",
                // Month, day
                "--nn" : "%N/%e"
            },
            hour12 : true,
            timetz : "GMT%z {t}",
            gregory : {
                era : ["西元", "西元前"]
            },
            roc : {
                era : ["民國", "民國前"]
            }
        },
        "zh-Hant-HK" : {
            n : "中文(香港特別行政區)",
            base : "zh-TW",
            cc : "HKD",
            cu : {
                HKD : "$"
            },
            sc : {
                "%c" : "%Y年%m月%d日 %A %T",
                "%x" : "%Y年%m月%d日 %A"
            }
        },
        "en-HK" : {
            n : "English (Hong Kong)",
            base : "def",
            cc : "HKD",
            cu : {
                USD : "US$",
                HKD : "$"
            },
            hour12 : true,
            sc : {
                "%c" : "%A, %B %d, %Y %r",
                "%x" : "%A, %B %d, %Y",
                "%X" : "%I:%M:%S %Z"
            }
        },
        ja : {
            n : "日本語",
            base : "def",
            cc : "JPY",
            cu : {
                CNY : "元"
            },
            mf : ["1月", "2月", "3月", "4月", 
                    "5月", "6月", "7月", "8月",
                    "9月", "10月", "11月", "12月"],
            mc : null,
            df : ["日曜日", "月曜日", "火曜日", "水曜日", 
                "木曜日", "金曜日", "土曜日"],
            dc : ["日", "月", "火", "水", "木", "金", "土"],
            da : null,
            um : ["午前", "午後"],
            lm : null,
            sc : {
                "%c" : "%Y年%m月%d日 %H時%M分%S秒",
                "%x" : "%Y年%m月%d日",
                "%X" : "%H時%M分%S秒",
                "%r" : "%p%I時%M分%S秒"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Y年%N月%e日(%A)",
                "tnnn" : "%Y年%N月%e日%A",
                // Year, month, day
                "-ntn" : "%Y年%N月%e日",
                "-nnn" : "%Y/%N/%e",
                // Year, month
                "-nt-" : "%Y年%N月",
                "-nn-" : "%Y/%N",
                // Month, day
                "--tn" : "%N月%e日",
                "--nn" : "%N/%e"
            },
            dateera : "%!{d}",
            time12 : "%p{t}",
            gregory : {
                era : ["西暦", "紀元前"]
            },
            japanese : {
                era : ["明治", "大正", "昭和", "平成"]
            },
            fd : 0
        },
        ko : {
            n : "한국어",
            base : "def",
            cc : "KRW",
            mf : ["1월", "2월", "3월", "4월",
                "5월", "6월", "7월", "8월",
                "9월", "10월", "11월", "12월"],
            mc : null,
            df : ["일요일", "월요일", "화요일", "수요일",
                "목요일", "금요일", "토요일"],
            dc : ["일", "월", "화", "수", "목", "금", "토"],
            da : null,
            um : ["오전", "오후"],
            lm : null,
            sc : {
                "%c" : "%x (%a) %r",
                "%x" : "%Y년 %m월 %d일",
                "%X" : "%H시 %M분 %S초",
                "%r" : "%p %I시 %M분 %S초"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%Y년 %N월 %e일 %A",
                "tnnn" : "%Y년 %N월 %e일 %A",
                // Year, month, day
                "-ntn" : "%Y년 %N월 %e일",
                "-nnn" : "%Y년 %N월 %e일",
                // Year, month
                "-nt-" : "%Y년 %N월",
                "-nn-" : "%Y. %N.",
                // Month, day
                "--tn" : "%N월 %e",
                "--nn" : "%N. %e"
            },
            time12 : "%p {t}",
            gregory : {
                era : ["서기", "기원전"]
            }
        },
        "en-IN" : {
            n : "English (India)",
            base : "def",
            gc : [3,2],
            cc : "INR",
            cf : ["$\u00a0%1", "$\u00a0-%1"],
            hour12 : true,
            sc : {
                "%c" : "%x %r",
                "%x" : "%A %d %B %Y",
                "%X" : "%r"
            }
        },
        hi : {
            n : "हिंदी",
            base : "en-IN",
            ndigits : "deva",
            cf : ["$\u00a0%1", "-$\u00a0%1", "रु.\u00a0%1", "-रु.\u00a0%1"],
            mf : ["जनवरी", "फरवरी", "मार्च", "अप्रैल",
                "मई", "जून", "जुलाई", "अगस्त",
                "सितम्बर", "अक्तूबर", "नवम्बर", "दिसम्बर"],
            mc : null,
            df : ["रविवार", "सोमवार", "मंगलवार", "बुधवार",
                "गुरुवार", "शुक्रवार", "शनिवार"],
            dc : ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
            da : ["र", "स", "म", "ब", "ग", "श", "श"],
            um : ["पूर्वाह्न", "अपराह्न"],
            lm : null,
            dfmt : {
                "tntn" : "%A, %e %B, %Y",
                "tnnn" : "%A, %e/%N/%Y",
                "-ntn" : "%e %B, %Y"
            },
            gregory : {
                era : ["सन", "ईसापूर्व"]
            },
            indian : {
                mf : ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़",
                    "श्रावण", "भाद्र", "अश्विन", "कार्तिक",
                    "अग्रहायण", "पौष", "माघ", "फाल्गुन"],
                era : ["साका युग"]
            }
        },
        /*pa : {
            n : "ਪੰਜਾਬੀ (ਭਾਰਤ)",
            base : "hi",
            ndigits : "guru",
            pc : ["%1\u00a0%", "-%1\u00a0%"],
            mf : ["ਜਨਵਰੀ", "ਫ਼ਰਵਰੀ", "ਮਾਰਚ", "ਅਪ੍ਰੈਲ",
                "ਮਈ", "ਜੂਨ", "ਜੁਲਾਈ", "ਅਗਸਤ",
                "ਸਤੰਬਰ", "ਅਕਤੂਬਰ", "ਨਵੰਬਰ", "ਦਸੰਬਰ"],
            df : ["ਐਤਵਾਰ", "ਸੋਮਵਾਰ", "ਮੰਗਲਵਾਰ", "ਬੁੱਧਵਾਰ",
                "ਵੀਰਵਾਰ", "ਸ਼ੁੱਕਰਵਾਰ", "ਸ਼ਨਿੱਚਰਵਾਰ"],
            dc : ["ਐਤ.", "ਸੋਮ.", "ਮੰਗਲ.", "ਬੁੱਧ.", "ਵੀਰ.", "ਸ਼ੁਕਰ.", "ਸ਼ਨਿੱਚਰ."],
            da : ["ਐ", "ਸ", "ਮ", "ਬ", "ਵ", "ਸ਼", "ਸ਼"],
            um : ["ਸਵੇਰ", "ਸ਼ਾਮ"],
            gregory : {
                era : ["ਸੰਨ", "ਈਸਾਪੂਰਵ"]
            }
        },*/
        bn : {
            n : "বাংলা (ভারত)",
            base : "hi",
            ndigits : "beng",
            cf : ["$%1", "-$%1"],
            mf : ["জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল",
                "মে","জুন", "জুলাই", "আগস্ট", 
                "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
            mc : ["জানু:", "ফেব্রু:", "মার্চ", "এপ্রি:",
                "মে", "জুন", "জুলা:", "আগ:", 
                "সেপ্টে:", "অক্টো:", "নভে:", "ডিসে:"],
            df : ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার",
                "বৃহস্পতিবার", "শুক্রবার", "শনিবার"],
            dc : ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"],
            da : ["র", "স", "ম", "ব", "ব", "শ", "শ"],
            um : ["পুর্বাহ্ন", "অপরাহ্ন"],
            timetz : "{t} গ্রীনিচ মান সময়%z",
            gregory : {
                era : ["খৃষ্টাব্দ", "খৃষ্টপূর্ব"]
            }
        },
        "bn-BD" : {
            n : "বাংলা (বাংলাদেশ)",
            base : "bn",
            cc : "BDT",
            cu : {
                BDT : "৳"
            },
            cf : ["$\u00a0%1", "$\u00a0-%1"],
            ddigits : "beng",
            mc : ["জানু.", "ফেব্রু.", "মার্চ", "এপ্রি.",
                "মে", "জুন", "জুলা.", "আগ.", 
                "সেপ্টে.", "অক্টো.", "নভে.", "ডিসে."],
            dc : ["রবি.", "সোম.", "মঙ্গল.", "বুধ.", "বৃহ.", "শুক্র.", "শনি."],
            sc : {
                "%x" : "%A %Od %b %OY",
                "%r" : "%Ol:%OM:%OS %p"
            }
        },
        /*ta = {
            n : "தமிழ் (இந்தியா)",
            base : "hi",
            ndigits : "latn",
            mf : ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", 
                "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", 
                "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
            df : ["ஞாயிற்றுக்கிழமை", "திங்கள்கிழமை", "செவ்வாய்கிழமை", "புதன்கிழமை",
                "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"],
            dc : ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்",
                "வியாழன்", "வெள்ளி", "சனி"],
            da : ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"],
            um : ["காலை", "மாலை"],
            gregory : {
                era : ["கிபி", "கிமு"]
            }
        },*/
        ur : {
            n : "اُردو",
            base : "def",
            cc : "PKR",
            cu : {
                PKR : "Rs"
            },
            cf : ["$\u00a0%1", "-$\u00a0%1"],
            mf : ["جنوری", "فروری", "مارچ", "اپریل",
                "مئی", "جون", "جولائی", "اگست",
                "ستمبر", "اکتوبر", "نومبر", "دسمبر"],
            mc : null,
            df : ["اتوار", "پير", "منگل",
                "بدھ", "جمعرات" , "جمعه" , "هفته"],
            dc : null,
            da : ["ا", "پ", "م", "ب", "ج", "ج", "ه"],
            um : ["ص", "ش"],
            lm : null,
            sc : {
                "%c" : "و %T ت %d %B %Y",
                "%x" : "%d/%m/%Y",
                "%r" : "%P %I:%M:%S"
            },
            dfmt : {
                "-ntn" : "ء\u200e%Y %B\u200e %e"
            },
            time12 : "%p {t}",
            gregory : {
                era : ["عیسوی", "قبل مسیح"]
            }
        },
        vi : {
            n : "Tiếng Việt",
            base : "def",
            ds : ',',
            gs : '.',
            cc : "VND",
            cf : ["%1\u00a0$", "-%1\u00a0$"],
            mf : ["tháng một", "tháng hai", "tháng ba", "tháng tư",
                "tháng năm", "tháng sáu", "tháng bảy", "tháng tám",
                "tháng chín", "tháng mười", "tháng mười một", "tháng mười hai"],
            mc : ["th1", "th2", "th3", "th4",
                "th5", "th6", "th7", "th8",
                "th9", "th10", "th11", "th12"],
            df : ["chủ nhật", "thứ hai", "thứ ba", "thứ tư",
                "thứ năm", "thứ sáu", "thứ bảy"],
            dc : ["cn", "t2", "t3", "t4", "t5", "t6", "t7"],
            da : null,
            um : ["SA", "CH"],
            lm : ["sa", "ch"],
            sc : {
                "%c" : "%A, %d %B năm %Y %T",
                "%r" : "%I:%M %p"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, ngày %e %B năm %Y",
                // Year, month, day
                "-ntn" : "ngày %e %B năm %Y"
            },
            datetime : "{t} {d}",
            gregory : {
                era : ["sau CN", "tr. CN"]
            }
        },
        ms : {
            n : "Bahasa Melayu",
            base : "def",
            cc : "MYR",
            cu : {
                MYR : "RM"
            },
            cf : ["$%1", "($%1)"],
            mf : ["Januari", "Februari", "Mac", "April", 
                "Mei", "Jun", "Julai", "Ogos",
                "September", "Oktober", "November", "Disember"],
            mc : ["Jan", "Feb", "Mac", "Apr",
                "Mei", "Jun", "Jul", "Ogos",
                "Sept", "Okt", "Nov", "Dis"],
            df : ["Ahad", "Isnin", "Selasa", "Rabu",
                "Khamis", "Jumaat", "Sabtu"],
            dc : ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"],
            da : ["A", "I", "S", "R", "K", "J", "S"],
            lm : ["pagi", "petang", "malam"],
            um : ["Pagi", "Petang", "Malam"],
            hd : [0, 12, 19],
            hour12 : true,
            sc : {
                "%c" : "%x %X",
                "%X" : "%r",
                "%x" : "%A %d %b %Y",
                "%r" : "%I:%M:%S %p"
            },
            gregory : {
                era : ["CE", "BCE"]
            }
        },
        id : {
            n : "Bahasa Indonesia",
            base : "def",
            ds : ',',
            gs : '.',
            cc : "IDR",
            cu : {
                IDR : "Rp"
            },
            mf : ["Januari", "Februari", "Maret", "April", 
                "Mei", "Juni", "Juli", "Agustus",
                "September", "Oktober", "Nopember", "Desember"],
            mc : ["Jan", "Feb", "Mar", "Apr",
                "Mei", "Jun", "Jul", "Agust",
                "Sep", "Okt", "Nop", "Des"],
            df : ["Minggu", "Senin", "Selasa", "Rabu",
                "Kamis", "Jumat", "Sabtu"], 
            dc : ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
            da : ["M", "S", "S", "R", "K", "J", "S"],
            sc : {
                "%x" : "%d/%m/%y",
                "%r" : "%T"
            },
            gregory : {
                era : ["M", "SM"]
            }
        },
        fil : {
            n : "Filipino",
            base : "en",
            cc : "PHP",
            cu : {
                PHP : "₱"
            },
            cf : ["$%1", "-$%1", "₱\u00a0%1", "-₱\u00a0%1"],
            mf : ["Enero", "Pebrero", "Marso", "Abril", 
                "Mayo", "Hunyo", "Hulyo", "Agosto",
                "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
            mc : ["Ene", "Peb", "Mar", "Abr",
                "May", "Hun", "Hul", "Ago",
                "Set", "Okt", "Nob", "Dis"],
            df : ["Linggo", "Lunes", "Martes", "Miyerkules",
                "Huwebes", "Biyernes", "Sabado"],
            dc : ["Lin", "Lun", "Mar", "Miy", "Huw", "Biy", "Sab"],
            da : ["L", "L", "M", "M", "H", "B", "S"],
            lm : ["n.u.", "n.h.", "n.g."],
            um : ["N.U.", "N.H.", "N.G."],
            hd : [0, 12, 18],
            sc : {
                "%c" : "%a %d %b %Y %r",
                "%x" : "%m-%d-%Y",
                "%X" : "%r"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "%A, %B %e, %Y",
                "tnnn" : "%A, %N-%e-%Y",
                // Year, month, day
                "-ntn" : "%B %e, %Y",
                "-nnn" : "%N-%e-%Y",
                // Year, month
                "-nt-" : "%Y %B",
                "-nn-" : "%Y-%N",
                // Month, day
                "--nn" : "%N-%e"
            },
            gregory : {
                era : ["CE", "BCE"]
            }
        },
        th : {
            n : "ไทย",
            base : "def",
            cc : "THB",
            cf : ["$%1", "$-%1"],
            mf : ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
                "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
                "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
            mc : ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
                "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
                "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
            df : ["อาทิตย์", "จันทร์", "อังคาร", "พุธ",
                "พฤหัสบดี", "ศุกร์", "เสาร์"],
            dc : ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
            da : ["อ", "จ", "อ", "พ", "พ", "ศ", "ส"],
            um : ["ก่อนเที่ยง", "หลังเที่ยง"],
            lm : null,
            sc : {
                "%c" : "%a %e %b %Y %T"
            },
            dfmt : {
                // weekday, year, month, day
                "tntn" : "วัน%Aที่ %e %B %Y",
                "tnnn" : "ที่%Aที่ %e/%N/%Y"
            },
            datetime : "{d}, {t}",
            gregory : {
                era : ["ค.ศ.", "ปีก่อน ค.ศ."]
            },
            buddhist : {
                era : ["พ.ศ."]
            },
            calendar : "buddhist"
        }
    
    }, function(lProps, loc) {
        _loc[loc] = lProps;
    });
    _loc.alias("zh", "zh-CN", "zh-Hans-CN", "zh-Hans");
    _loc.alias("zh-Hans-SG", "zh-SG");
    _loc.alias("zh-Hant-TW", "zh-Hant", "zh-TW");
    _loc.alias("zh-Hant-HK", "zh-HK");
})(UsefulJS);


