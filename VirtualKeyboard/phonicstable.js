var PhonicsTable = (function () {
    "use strict";
    function PT() {
        const separators = {Internal: "", IPA: "", Diacritics: "", ARPAbet: " ", URLPhonics: "-"};
        const phonicsMap = [
            {Internal: "θ", IPA: "θ", Diacritics: "ᴛʜ", ARPAbet: "th", URLPhonics: "TH", Keyword: "[th]ink"},
            {Internal: "ð", IPA: "ð", Diacritics: "ᴅʜ", ARPAbet: "dh", URLPhonics: "DH", Keyword: "[th]is"},
            {Internal: "ʃ", IPA: "ʃ", Diacritics: "sʜ", ARPAbet: "sh", URLPhonics: "SH", Keyword: "[sh]oe"},
            {Internal: "ʒ", IPA: "ʒ", Diacritics: "ᴢʜ", ARPAbet: "zh", URLPhonics: "ZH", Keyword: "[g]enre"},
            {Internal: "ŋ", IPA: "ŋ", Diacritics: "ɴɢ", ARPAbet: "ng", URLPhonics: "NG", Keyword: "thi[ng]"},
            {Internal: "ʧ", IPA: "t͡ʃ", Diacritics: "ᴄʜ", ARPAbet: "ch", URLPhonics: "CH", Keyword: "[ch]ild"},
            {Internal: "ɚ", IPA: "ə˞", Diacritics: "ᴇʀ", ARPAbet: "er", URLPhonics: "ER", Keyword: "p[urr]"},
            {Internal: "h", IPA: "h", Diacritics: "h", ARPAbet: "hh", URLPhonics: "HH", Keyword: "[h]ome"},
            {Internal: "ʤ", IPA: "d͡ʒ", Diacritics: "j", ARPAbet: "jh", URLPhonics: "JH", Keyword: "[j]ob"},
            {Internal: "p", IPA: "p", Diacritics: "p", ARPAbet: "p", URLPhonics: "P", Keyword: "[p]ear"},
            {Internal: "b", IPA: "b", Diacritics: "b", ARPAbet: "b", URLPhonics: "B", Keyword: "[b]oy"},
            {Internal: "t", IPA: "t", Diacritics: "t", ARPAbet: "t", URLPhonics: "T", Keyword: "[t]oy"},
            {Internal: "d", IPA: "d", Diacritics: "d", ARPAbet: "d", URLPhonics: "D", Keyword: "[d]ad"},
            {Internal: "k", IPA: "k", Diacritics: "k", ARPAbet: "k", URLPhonics: "K", Keyword: "[c]at"},
            {Internal: "g", IPA: "g", Diacritics: "g", ARPAbet: "g", URLPhonics: "G", Keyword: "[g]ame"},
            {Internal: "f", IPA: "f", Diacritics: "f", ARPAbet: "f", URLPhonics: "F", Keyword: "[f]ish"},
            {Internal: "v", IPA: "v", Diacritics: "v", ARPAbet: "v", URLPhonics: "V", Keyword: "[v]an"},
            {Internal: "s", IPA: "s", Diacritics: "s", ARPAbet: "s", URLPhonics: "S", Keyword: "[s]o"},
            {Internal: "z", IPA: "z", Diacritics: "z", ARPAbet: "z", URLPhonics: "Z", Keyword: "[z]ipper"},
            {Internal: "m", IPA: "m", Diacritics: "m", ARPAbet: "m", URLPhonics: "M", Keyword: "[m]om"},
            {Internal: "n", IPA: "n", Diacritics: "n", ARPAbet: "n", URLPhonics: "N", Keyword: "[n]ew"},
            {Internal: "l", IPA: "l", Diacritics: "l", ARPAbet: "l", URLPhonics: "L", Keyword: "[l]ike"},
            {Internal: "r", IPA: "r", Diacritics: "r", ARPAbet: "r", URLPhonics: "R", Keyword: "[r]ight"},
            {Internal: "w", IPA: "w", Diacritics: "w", ARPAbet: "w", URLPhonics: "W", Keyword: "[w]e"},
            {Internal: "j", IPA: "j", Diacritics: "y", ARPAbet: "y", URLPhonics: "Y", Keyword: "[y]es"},
            {Internal: "e", IPA: "e͡ɪ", Diacritics: "ā", ARPAbet: "ey", URLPhonics: "EY", Keyword: "b[ay]"},
            {Internal: "o", IPA: "o͡ʊ", Diacritics: "ō", ARPAbet: "ow", URLPhonics: "OW", Keyword: "s[o]"},
            {Internal: "I", IPA: "a͡ɪ", Diacritics: "ī", ARPAbet: "ay", URLPhonics: "AY", Keyword: "t[ie]"},
            {Internal: "Y", IPA: "ɔ͡ɪ", Diacritics: "ᴏɪ", ARPAbet: "oy", URLPhonics: "OY", Keyword: "t[oy]"},
            {Internal: "W", IPA: "a͡ʊ", Diacritics: "ᴀᴜ", ARPAbet: "aw", URLPhonics: "AW", Keyword: "c[ow]"},
            {Internal: "æ", IPA: "æ", Diacritics: "a", ARPAbet: "ae", URLPhonics: "AE", Keyword: "c[a]t"},
            {Internal: "ɛ", IPA: "ɛ", Diacritics: "e", ARPAbet: "eh", URLPhonics: "EH", Keyword: "[e]gg"},
            {Internal: "ɪ", IPA: "ɪ", Diacritics: "i", ARPAbet: "ih", URLPhonics: "IH", Keyword: "[i]gloo"},
            {Internal: "ɑ", IPA: "ɑ", Diacritics: "ä", ARPAbet: "aa", URLPhonics: "AA", Keyword: "c[o]t"},
            {Internal: "ə3", IPA: "ə³", Diacritics: "ə³", ARPAbet: "ah 0", URLPhonics: "AH-3", Keyword: "[a]bout"},
            {Internal: "ə1", IPA: "ʌ¹", Diacritics: "ŭ¹", ARPAbet: "ah 1", URLPhonics: "AH-1", Keyword: "[u]pward"},
            {Internal: "ə2", IPA: "ʌ²", Diacritics: "ŭ²", ARPAbet: "ah 2", URLPhonics: "AH-2", Keyword: "[u]nderline"},
            {Internal: "ə", IPA: "ə", Diacritics: "ə", ARPAbet: "ah", URLPhonics: "AH", Keyword: "[a]bout"},
            {Internal: "i", IPA: "i", Diacritics: "ē", ARPAbet: "iy", URLPhonics: "IY", Keyword: "b[ee]"},
            {Internal: "u", IPA: "u", Diacritics: "ū", ARPAbet: "uw", URLPhonics: "UW", Keyword: "n[ew]"},
            {Internal: "ɔ", IPA: "ɔ", Diacritics: "ô", ARPAbet: "ao", URLPhonics: "AO", Keyword: "c[o]re"},
            {Internal: "ʊ", IPA: "ʊ", Diacritics: "ö", ARPAbet: "uh", URLPhonics: "UH", Keyword: "b[oo]k"},
            {Internal: "1", IPA: "¹", Diacritics: "¹", ARPAbet: "1", URLPhonics: "1", Keyword: "(primary)"},
            {Internal: "2", IPA: "²", Diacritics: "²", ARPAbet: "2", URLPhonics: "2", Keyword: "(secondary)"},
            {Internal: "3", IPA: "³", Diacritics: "³", ARPAbet: "0", URLPhonics: "3", Keyword: "(tertiary)"}
        ];
        /*
         * Returns an array with the names of the available alphabets
         */
        this.availableAlphabets = () => Object.keys(phonicsMap[0]);
        this.canConvert = (from, to) => phonicsMap[0].hasOwnProperty(from) && phonicsMap[0].hasOwnProperty(to);
        var converters = this.availableAlphabets().reduce(function (acc, cur) {
            acc[cur] = {};
            return acc;
        }, {});
        this.getAlphabet = function (name) {
            return phonicsMap.map((mapping) => mapping[name]).sort((a, b) => b.length - a.length);
        };
        this.getSeparator = function (name) {
            return separators[name];
        };
        /*
         * Returns a function (str) that converts str in alphabet "from" and returns a new string in alphabet "to".
         */
        this.getConverter = function (fromPhonics, toPhonics) {
            if (!this.canConvert(fromPhonics, toPhonics)) {
                return null;
            }
            
            if (converters[fromPhonics].hasOwnProperty(toPhonics)) {
                return converters[fromPhonics][toPhonics];
            }

            var fromToMap = {};

            var from = "", to = "";
            var fromSeparator = separators[fromPhonics],
                toSeparator = separators[toPhonics];
            var diffSeperators = fromSeparator !== toSeparator;

            // Creates a key-value pair for each sound that's represented differently in the two alphabets
            phonicsMap.forEach(function (mapping) {
                from = mapping[fromPhonics];
                to = mapping[toPhonics];
                if (diffSeperators || from !== to) {
                    fromToMap[from] = to;
                }
            });

            // Matches all of the from elements that need to be converted, sorted by length to reduce collisions
            var fromRegex = new RegExp("(" + Object.keys(fromToMap).sort((a, b) => (b.length - a.length)).join("|") + ")", "g");
            
            var converter = null;
            
            if (diffSeperators) {
                converter = function (str) {
                    var convStr = str.match(fromRegex).map((elem) => fromToMap[elem] || elem).join(toSeparator);
                    if (toPhonics === "ARPAbet" || toPhonics === "URLPhonics") {
                        return convStr.replace(/\s([012])/g, (ignore, $1) => $1);
                    }
                    return convStr;
                };
            } else {
                converter = (str) => str.replace(fromRegex, ($1) => fromToMap[$1]);
            }
            
            converters[fromPhonics][toPhonics] = converter;
            
            return converter;
        };
    }
    return new PT();
}());