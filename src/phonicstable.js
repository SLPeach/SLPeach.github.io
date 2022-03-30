var PhonicsTable = (function () {
    "use strict";
    function PT() {
        const separators = {Internal: "", IPA: "", Diacritics: "", ARPAbet: " ", URLPhonics: "-"};
        const phonicsMap = [
            {Internal: "θ", IPA: "θ", Diacritics: "ᴛʜ", ARPAbet: "th", URLPhonics: "th", Keyword: "[th]ink"},
            {Internal: "ð", IPA: "ð", Diacritics: "ᴅʜ", ARPAbet: "dh", URLPhonics: "dh", Keyword: "[th]is"},
            {Internal: "ʃ", IPA: "ʃ", Diacritics: "sʜ", ARPAbet: "sh", URLPhonics: "sh", Keyword: "[sh]oe"},
            {Internal: "ʒ", IPA: "ʒ", Diacritics: "ᴢʜ", ARPAbet: "zh", URLPhonics: "zh", Keyword: "[g]enre"},
            {Internal: "ŋ", IPA: "ŋ", Diacritics: "ɴɢ", ARPAbet: "ng", URLPhonics: "ng", Keyword: "thi[ng]"},
            {Internal: "ʧ", IPA: "t͡ʃ", Diacritics: "ᴄʜ", ARPAbet: "ch", URLPhonics: "ch", Keyword: "[ch]ild"},
            {Internal: "ɚ", IPA: "ə˞", Diacritics: "ᴇʀ", ARPAbet: "er", URLPhonics: "er", Keyword: "p[urr]"},
            {Internal: "h", IPA: "h", Diacritics: "h", ARPAbet: "hh", URLPhonics: "hh", Keyword: "[h]ome"},
            {Internal: "ʤ", IPA: "d͡ʒ", Diacritics: "j", ARPAbet: "jh", URLPhonics: "jh", Keyword: "[j]ob"},
            {Internal: "p", IPA: "p", Diacritics: "p", ARPAbet: "p", URLPhonics: "p", Keyword: "[p]ear"},
            {Internal: "b", IPA: "b", Diacritics: "b", ARPAbet: "b", URLPhonics: "b", Keyword: "[b]oy"},
            {Internal: "t", IPA: "t", Diacritics: "t", ARPAbet: "t", URLPhonics: "t", Keyword: "[t]oy"},
            {Internal: "d", IPA: "d", Diacritics: "d", ARPAbet: "d", URLPhonics: "d", Keyword: "[d]ad"},
            {Internal: "k", IPA: "k", Diacritics: "k", ARPAbet: "k", URLPhonics: "k", Keyword: "[c]at"},
            {Internal: "g", IPA: "g", Diacritics: "g", ARPAbet: "g", URLPhonics: "g", Keyword: "[g]ame"},
            {Internal: "f", IPA: "f", Diacritics: "f", ARPAbet: "f", URLPhonics: "f", Keyword: "[f]ish"},
            {Internal: "v", IPA: "v", Diacritics: "v", ARPAbet: "v", URLPhonics: "v", Keyword: "[v]an"},
            {Internal: "s", IPA: "s", Diacritics: "s", ARPAbet: "s", URLPhonics: "s", Keyword: "[s]o"},
            {Internal: "z", IPA: "z", Diacritics: "z", ARPAbet: "z", URLPhonics: "z", Keyword: "[z]ipper"},
            {Internal: "m", IPA: "m", Diacritics: "m", ARPAbet: "m", URLPhonics: "m", Keyword: "[m]om"},
            {Internal: "n", IPA: "n", Diacritics: "n", ARPAbet: "n", URLPhonics: "n", Keyword: "[n]ew"},
            {Internal: "l", IPA: "l", Diacritics: "l", ARPAbet: "l", URLPhonics: "l", Keyword: "[l]ike"},
            {Internal: "r", IPA: "r", Diacritics: "r", ARPAbet: "r", URLPhonics: "r", Keyword: "[r]ight"},
            {Internal: "w", IPA: "w", Diacritics: "w", ARPAbet: "w", URLPhonics: "w", Keyword: "[w]e"},
            {Internal: "j", IPA: "j", Diacritics: "y", ARPAbet: "y", URLPhonics: "y", Keyword: "[y]es"},
            {Internal: "e", IPA: "e͡ɪ", Diacritics: "ā", ARPAbet: "ey", URLPhonics: "ey", Keyword: "b[ay]"},
            {Internal: "o", IPA: "o͡ʊ", Diacritics: "ō", ARPAbet: "ow", URLPhonics: "ow", Keyword: "s[o]"},
            {Internal: "I", IPA: "a͡ɪ", Diacritics: "ī", ARPAbet: "ay", URLPhonics: "ay", Keyword: "t[ie]"},
            {Internal: "Y", IPA: "ɔ͡ɪ", Diacritics: "ᴏɪ", ARPAbet: "oy", URLPhonics: "oy", Keyword: "t[oy]"},
            {Internal: "W", IPA: "a͡ʊ", Diacritics: "ᴀᴜ", ARPAbet: "aw", URLPhonics: "aw", Keyword: "c[ow]"},
            {Internal: "æ", IPA: "æ", Diacritics: "a", ARPAbet: "ae", URLPhonics: "ae", Keyword: "c[a]t"},
            {Internal: "ɛ", IPA: "ɛ", Diacritics: "e", ARPAbet: "eh", URLPhonics: "eh", Keyword: "[e]gg"},
            {Internal: "ɪ", IPA: "ɪ", Diacritics: "i", ARPAbet: "ih", URLPhonics: "ih", Keyword: "[i]gloo"},
            {Internal: "ɑ", IPA: "ɑ", Diacritics: "ä", ARPAbet: "aa", URLPhonics: "aa", Keyword: "c[o]t"},
            {Internal: "ə3", IPA: "ə³", Diacritics: "ə³", ARPAbet: "ah 0", URLPhonics: "ah 0", Keyword: "[a]bout"},
            {Internal: "ə1", IPA: "ʌ¹", Diacritics: "ŭ¹", ARPAbet: "ah 1", URLPhonics: "ah 1", Keyword: "[u]pward"},
            {Internal: "ə2", IPA: "ʌ²", Diacritics: "ŭ²", ARPAbet: "ah 2", URLPhonics: "ah 2", Keyword: "[u]nderline"},
            {Internal: "ə", IPA: "ə", Diacritics: "ə", ARPAbet: "ah", URLPhonics: "ah", Keyword: "[a]bout"},
            {Internal: "i", IPA: "i", Diacritics: "ē", ARPAbet: "iy", URLPhonics: "iy", Keyword: "b[ee]"},
            {Internal: "u", IPA: "u", Diacritics: "ū", ARPAbet: "uw", URLPhonics: "uw", Keyword: "n[ew]"},
            {Internal: "ɔ", IPA: "ɔ", Diacritics: "ô", ARPAbet: "ao", URLPhonics: "ao", Keyword: "c[o]re"},
            {Internal: "ʊ", IPA: "ʊ", Diacritics: "ö", ARPAbet: "uh", URLPhonics: "uh", Keyword: "b[oo]k"},
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