class WordSearch {
    constructor() {
        this.results = [];
        this.words = undefined;
        this.ready = false;
    }
    
    setWords (words) {
        this.words = words;
        this.words.forEach((word) => word.pronunciationSyllables =
                word.pronunciationsWithStress.map((p) =>
                    WordSearch.syllabify(p).split("-")));
        this.ready = true;
    }
    
    /**
     * Returns a regex that matches all phonetic input elements of alphabet:
     * {defined_token}, {custom_token: a, b, ...}, (any series of letters from
     * the alphabet)
     * @param {string} alphabet Name of the alphabet to match.
     * @returns {RegExp} Regex that matches
     */
    static getPhoneticInputTypesRegex (alphabet) {
        let inputSeparator = PhonicsTable.getSeparator(alphabet);
        let phonicsPattern;
        if (inputSeparator === "") {
            phonicsPattern = `(?:${PhonicsTable.getAlphabet(alphabet).join("|")})+`;
        } else {
            phonicsPattern = `(?:${PhonicsTable.getAlphabet(alphabet).join("|")}|${inputSeparator})+`;
        }
        return new RegExp(`(?:\\([a-zA-Z0-9_]+\\))|(?:\\([a-zA-Z0-9_]+:[^)]+\\))|${phonicsPattern}`, "g");
    }
    
    /**
     * Returns a regex that matches defined tokens {defined_tokens}.
     * The first submatch is the token name.
     * @param {boolean} wholeString If true, match only whole strings (/^...$/)
     * @returns {RegExp} Global regex, as above.
     */
    static getDefinedTokenRegex (wholeString = true) {
        return wholeString ? /^\(([a-zA-Z0-9_]+)\)$/ : /\(([a-zA-Z0-9_]+)\)/g;
    }
    
    /**
     * Returns a regex that matches custom tokens {custom_token: a, b, ...}.
     * The first submatch is the token name and the second is the token
     * definition.
     * @param {boolean} wholeString If true, match only whole strings (/^...$/)
     * @returns {RegExp} Global regex, as above.
     */
    static getCustomTokenRegex (wholeString = true) {
        return wholeString ? /^\(([a-zA-Z0-9_]+):\s*([^)]+?)\)$/ :
            /\(([a-zA-Z0-9_]+):\s*([^)]+?)\)/g;
    }
    
    /**
     * Returns a new array of words containing those in searchWords that have
     * exactly count syllables.
     * @param {Array} searchWords List of words to filter by syllable count.
     * @param {number} count Target syllable count.
     * @returns {Array} Filtered word list.
     */
    static getSyllableCountMatches (searchWords, count) {
        return searchWords.filter((word) => word.pronunciationSyllables.some(
            (syllables) => syllables.length == count));
    }
    
    /**
     * Creates a new RegExp of pattern that searches the target string only in position.
     * @param {string} pattern
     * @param {string} position "begin", "end", "whole", "anywhere"
     * @example
     * // Returns /^[aeiouy]$/
     * buildSearchRegex("[aeiouy]", "whole");
     * @example
     * // Returns /(ch|j)/g
     * buildSearchRegex("(ch|j)", "anywhere");
     * @returns {RegExp} New regular expression for pattern.
     */
    static getSearchRegexBuilder (position) {
        switch (position) {
        case "begin": return (pattern) => new RegExp(`^${pattern}`);
        case "end": return (pattern) => new RegExp(`${pattern}$`);
        case "whole": return (pattern) => new RegExp(`^${pattern}$`);
        case "anywhere": return (pattern) => new RegExp(pattern);
        default:
            console.error(`Unrecognized search position ${position}, defaulting to anywhere.`);
            return WordSearch.getSearchRegexBuilder("anywhere");
        }
    }
    
    /**
     * Processes custom token definitions in the form (name: defA, defB)
     * @param {string} input Text of input patterns
     * @returns {object} tokenName: definition
     */
    static processCustomTokens (input) {
        const customTokenRegex = WordSearch.getCustomTokenRegex(false);
        let customTokenDefinitions = Object.create(null);
        let match;
        while ((match = customTokenRegex.exec(input)) !== null) {
            let [tokenName, definition] = [match[1], match[2]];
            customTokenDefinitions[tokenName] =
                `(?:${definition.split(/(?:\s|,)+/g).join("|")})`;
        }
        return customTokenDefinitions;
    }
    
    /**
     * Returns a new array of words containing those in searchWords that match
     * the orthographic (spelling) pattern described by input and position.
     * @param {Array} searchWords List of words to filter by spelling pattern.
     * @param {string} input String of tokens describing the target pattern:
     * {defined_token}{custom_token: a, b, ...}literals
     * For example: c{current_vowels: a, o}{consonant}
     * @param {string} position Location within the word to match:
     * {begin, end, whole, anywhere}
     * @returns {Array} Filtered word list.
     */
    static getOrthographicMatches (searchWords, input, position) {
        const defaultPatterns = {
            consonant: "[bcdfghjklmnpqrstvwxyz]",
            vowel: "[aeiouy]"
        };
        const definedTokenRegex = WordSearch.getDefinedTokenRegex(false);
        const customTokenRegex = WordSearch.getCustomTokenRegex(false);
        /*
         * NOTE: this parameter order means the default patterns can be
         * overwritten. Switching them would prevent that.
         */
        let patterns = Object.assign(defaultPatterns,
            WordSearch.processCustomTokens(input));
        
        let searchPattern = input.replace(definedTokenRegex,
            (ignore, tokenName) => patterns[tokenName.toLowerCase()]).replace(
                customTokenRegex, (ignore, customTokenName) =>
                    patterns[customTokenName.toLowerCase()]);
        let searchRegex = WordSearch.getSearchRegexBuilder(position)(searchPattern);
        return searchWords.filter((word) => searchRegex.test(word.word));
    }
    
    /**
     * Returns a new array of words containing those in searchWords that match
     * the phonetic (sound) pattern described by input and position.
     * Ignores syllable stress.
     * @param {Array} searchWords List of words to filter by sound pattern.
     * @param {string} input String of tokens describing the target pattern.
     * {defined_token}{custom_token: a, b, ...}literals
     * For example: k{current_vowels: æ, ɑ}{consonant}
     * Literal substrings (in custom token definitions and literal tokens) must
     * be in the Internal phonetic alphabet as in phonicstable.js.
     * @param {string} position Location within the word to match:
     *                  {begin, end, whole, anywhere}
     * @returns {Array} Filtered word list.
     */
    static getPhoneticMatches (searchWords, input, position) {
        const defaultPatterns = {
            consonant: "[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]",
            vowel: "(?:ju|[æɛɪɑəeiouɔʊɚIYW])",
            long_vowel: "(?:ju|[eiIou])",
            short_vowel: "[æɛɪɑə]",
            diphthong: "[eoIYW]",
            voiced_consonant: "[bdgvðzʒmnŋlrwjʤ]",
            voiceless_consonant: "(?:hw|[ptkfθsʃhʧ])",
            stop: "[pbtdkg]",
            fricative: "[fvθðszʃʒh]",
            affricate: "[ʧʤ]"
        };
        const definedTokenRegex = WordSearch.getDefinedTokenRegex(false);
        const customTokenRegex = WordSearch.getCustomTokenRegex(false);
        /*
         * NOTE: this parameter order means the default patterns can be
         * overwritten. Switching them would prevent that.
         */
        let patterns = Object.assign(defaultPatterns,
            WordSearch.processCustomTokens(input));
        let searchPattern = input.replace(definedTokenRegex,
            (ignore, tokenName) => patterns[tokenName.toLowerCase()]).replace(
                customTokenRegex, (ignore, customTokenName) =>
                    patterns[customTokenName.toLowerCase()]);
        let searchRegex = WordSearch.getSearchRegexBuilder(position)(searchPattern);
        return searchWords.filter((word) => word.pronunciations.some(
            (pron) => searchRegex.test(pron)));
    }
    
    /**
     * Syllabifies phonetic sequence (in internal condensed IPA) by adding
     * "-" between each syllable.
     * Note: not intended to be wholly correct (e.g., "kɔrkscru" is best
     * syllabified as "kɔrk-scru" rather than "kɔrks-cru"). This is good enough
     * for distinguishing regular/irregular spellings.
     * @param {string} phonetics English phonetic sequence (in internal IPA)
     * @returns {string} phon, with syllables separated by "-"
     */
    /*
     * FIXME: special alignment for consonant-le syllables
     */
    static syllabify (phonetics) {
        // Create array of consonant sequences and vowels
        let sequenceCV = phonetics.match(/[θðʃʒŋʧhʤpbtdkgfvszmnlrwj]+|[ɚeoIYWæɛɪɑəiuɔʊ][123]?/g);
        const isVowel = (seg) => (/^[ɚeoIYWæɛɪɑəiuɔʊ][123]?$/.test(seg));
        // FIXME: Optionally separate schwa(r)-vowel from unstressed vowel
        const isShortVowel = (seg) => (/^[æɛɪɑɚə][123]?$/.test(seg));
        // Removed: /ŋg/ - only occurred in "animating," "kong," and "dong"
        // Those are data errors
        const codaClusterPattern = "(?:(?:ŋkst|kst|[lm]pt|n[dt]θ|ŋk[tθ])s?|mpst?|(?:[mr]f|[lnŋrs]k|[lmrs]p|[fklnprs]t|[dfknŋprt]θ)s?|(?:mpf|[lnrtv]sk|(?:ks|lf|nd|ŋk|rm)θ)|(?:l[bdmntv]|mp|nd|r[bdglmnv])z?|(?:ks|l[fkpsʧ]|m[fp]|n[sʧ]|ŋk|[pt]s|r[fkpsʧ]|s[kp])t?|(?:l[ʤmv]|n[ʤz]|r[bʤlmnv])d?|[dfklnŋprt]θ|l[bʤfkmpʃʧv]|m[fp]|n[ʤʧ]|ŋk|pf|r[bʤfklmnpʃʧv]|s[kpt]|zm|[θðʃʒŋʧʤpbtdkgfvszmnlr])";
        // Removed: [n]j (nyet and dialectal neuro-)
        const onsetClusterPattern = "(?:s(?:k[lrw]|p[jlr]|tr)|[bdfhkmpt]j|[bfgkpsʃv]l|[dksʃ]m|[sʃ]n|[bdfgkpsʃtθ]r|[ft]s|[bdghkpsʃtzʒθ]w|s[fkpt]|[θðʃʒʧhʤpbtdkgfvszmnlrwj])";
        const lazyCodaRegex = new RegExp(`^(${codaClusterPattern}??)(${onsetClusterPattern}?)$`);
        const greedyCodaRegex = new RegExp(`^(${codaClusterPattern}?)(${onsetClusterPattern}?)$`);
        let isPossibleRVowel = false,
            lastSegmentVowel = false,
            lastSegmentShortVowel = false,
            syllabifiedSegments = [];

        sequenceCV.forEach(function (segment, index) {
            if (isVowel(segment)) {
                isPossibleRVowel = (segment[0] === "ɑ") || (segment[0] === "ɔ") || (segment[0] === "ɛ");
                lastSegmentShortVowel = isShortVowel(segment);
                // Add the syllable, including a separator if the last segment was a vowel, too
                syllabifiedSegments.push((lastSegmentVowel ? "-" : "") + segment);
                lastSegmentVowel = true;
            } else {
                // Add the whole consonant sequence at the beginning and end
                if (index === 0 || index === sequenceCV.length - 1) {
                    syllabifiedSegments.push(segment);
                // Put a syllable separator (.) between the coda and onset, even if one of those doesn't exist
                // For short syllables and r-controlled syllables, use the greedy coda regex to ensure a consonant is captured as the syllable coda
                } else if ((isPossibleRVowel && segment[0] === "r") || (lastSegmentShortVowel)) {
                    syllabifiedSegments.push(segment.replace(greedyCodaRegex, "$1-$2"));
                } else {
                    syllabifiedSegments.push(segment.replace(lazyCodaRegex, "$1-$2"));
                }
                lastSegmentVowel = false;
            }
        });

        return syllabifiedSegments.join("");
    }
    
    /**
     * Finds all words in the list that match the provided syllable type
     * pattern, using the six basic syllable types:
     *   * closed (short vowel + consonant)
     *   * open (long vowel + no consonant)
     *   * silent-e (long vowel + consonant + silent e)
     *   * r-controlled (ar, or, er, ur, and ir)
     *   * consonant-le (consonant + le), with "le" pronounced schwa + l
     *   * vowel team (long vowel + second written vowel)
     * @param {array} searchWords List of words to search
     * @param {string} input String of syllable type tokens
     * @param {string} position {begin, end, anywhere, whole}
     * @returns {array} Filtered list of words.
     */
    /*
     * Optimization:
     * DONE: Single largest time sink is syllabify - store that data.
     * Next up: construct spelling, probably slowed down by vowel switches
     *   - could combine vowels into spelling map, but that might break with options
     * Per-execution, could store Map objects of syllables => spellings
     *   - future options might prevent storing them long-term
     */
    static getSyllableTypeMatches (searchWords, input, position) {
        let consonantSpellings = {
            "kw": "(?:qu|kw)",
            "ks": "(?:x|ks)",
            "θ": "th",
            "ð": "th",
            "ʃ": "sh",
            "ʒ": "zh",
            "ŋ": "(?:ng?|n(?=g))",
            "ʧ": "ch",
            "ɚ": "[eiu]r",
            "h": "h",
            "ʤ": "j", // also g(?=[yie])
            "p": "p",
            "b": "b",
            "t": "t",
            "d": "d",
            "k": "(?:k|c(?![yie]))", // also c(?![yie])
            "g": "g(?![yie])",
            "f": "f",
            "v": "v",
            "s": "s", // also c(?=[yie])
            "z": "z",
            "m": "m",
            "n": "n",
            "l": "l",
            "r": "r",
            "w": "w",
            "j": "y" // need to match "ju" => "u" first
        };
        /*
         * Add optional spelling rules here
         */
        let consonantRegex = new RegExp(`(?:${
            Object.keys(consonantSpellings).join("|")})`, "g");
        
        function spellClosed(syllable) {
            let spelling = syllable.replace(/([æɛɪɑɔəʌ])[123]?/g, (ignore, vowel) => {
                switch (vowel) {
                case "æ": return "a";
                case "ɛ": return "e";
                case "ɪ": return "i";
                case "ɑ": return "o";
                case "ɔ": return "o";
                case "ə": return "u";
                case "ʌ": return "u";
                default: return "⚠";
                }
            }).replace(consonantRegex, (consonant) => consonantSpellings[consonant]);
            return spelling;
        }
        function spellOpen(syllable) {
            let spelling = syllable.replace(/(ju|[eiIou])[123]?/g, (ignore, vowel) => {
                switch (vowel) {
                case "ju": return "u"; // Needs to be a better way to handle "yule" and "yugoslavia"
                case "e": return "a";
                case "i": return "e";
                case "I": return "i";
                case "o": return "o";
                case "u": return "u";
                default: return "⚠";
                }
            }).replace(consonantRegex, (consonant) => consonantSpellings[consonant]);
            return spelling;
        }
        function spellSilent_E(syllable) {
            let spelling = syllable.replace(/(ju|[eiIou])[123]?/g, (ignore, vowel) => {
                switch (vowel) {
                case "ju": return "u"; // Needs to be a better way to handle "yule" and "yugoslavia"
                case "e": return "a";
                case "i": return "e";
                case "I": return "i";
                case "o": return "o";
                case "u": return "u";
                default: return "⚠";
                }
            }).replace(consonantRegex, (consonant) => consonantSpellings[consonant]);
            return spelling + "e"; // Will need modification to allow for suffixes like -ing and -y
        }
        function spellR_Controlled(syllable) {
            let spelling = syllable.replace(/((?:[ɑɔʊ][123]?r)|ɚ[123]?)/g, (ignore, vowel) => {
                vowel = vowel.replace(/[123]/g, "");
                switch (vowel) {
                case "ɑr": return "ar";
                case "ɔr": return "or";
                case "ʊr": return "or";
                case "ɚ": return "[eiu]r";
                default: return "⚠";
                }
            }).replace(consonantRegex, (consonant) => consonantSpellings[consonant]);
            return spelling;
        }
        function spellConsonant_le(syllable) {
            return syllable.replace(/ə[123]l/, "le").replace(consonantRegex,
                (consonant) => consonantSpellings[consonant]);
        }
        function spellVowelTeam(syllable) {
            let spelling = syllable.replace(/(ju|[eiIou])[123]?/g, (ignore, vowel) => {
                switch (vowel) {
                case "ju": return "u[aeiouy]";
                case "e": return "a[aeiouy]";
                case "i": return "e[aeiouy]";
                case "I": return "i[aeiouy]";
                case "o": return "o[aeiouy]";
                case "u": return "u[aeiouy]";
                default: return "⚠";
                }
            }).replace(consonantRegex, (consonant) => consonantSpellings[consonant]);
            return spelling;
        }
        
        const patterns = {
            closed: {
                // {consonant}*?{short_vowel}[123]?{consonant}+
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?[æɛɪɑɔə][123]?[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]+$/,
                spell: spellClosed
            },
            open: {
                // {consonant}*?{long_vowel}[123]?
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?(?:ju|[eiIou])[123]?$/,
                spell: spellOpen
            },
            silent_e: {
                // {consonant}*?{long_vowel}[123]?{consonant}
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?(?:ju|[eiIou])[123]?[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]$/,
                spell: spellSilent_E
            },
            r_controlled: {
                // {consonant}*?(?:ɑr|ɔr|ʊr|ɚ)[123]?{consonant}*?
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?(?:(?:[ɑɔʊ][123]?r)|(?:ɚ[123]?))[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?$/,
                spell: spellR_Controlled
            },
            // Needs?: handle doubled letters in "middle," "bottle," struggle
            // Rule-based: SCle => VCCle, but not consistent, so no worries
            consonant_le: {
                // {consonant}ə[123]?l
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]ə[123]?l[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?$/,
                spell: spellConsonant_le
            },
            vowel_team: {
                // {consonant}*?{long_vowel}[123]?{consonant}*?
                phoneticRegex: /^[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?(?:ju|[eiIou])[123]?[pbtdkgfvθðszʃʒhmnŋlrwjʧʤ]*?$/,
                spell: spellVowelTeam
            }
        };
        
        const definedTokenRegex = WordSearch.getDefinedTokenRegex(false);
        let searchPattern = input.match(definedTokenRegex).map(
            (token) => patterns[token.slice(1, -1).toLowerCase()]);
        let searchSyllableCount = searchPattern.length;
        
        /**
         * @param {array} syllabes Syllables to spell. syllables.length must
         * equal searchSyllableCount
         * @returns {string} pattern for a regular expression of the spelling
         */
        function constructSpellingPattern(syllables) {
            console.assert(syllables.length == searchSyllableCount,
                "Incorrect syllable count");
            let spelledSyllables = syllables.map((syl, index) =>
                searchPattern[index].spell(syl));
            return spelledSyllables.join("");
        }
        
        function positionSlice(syllables) {
            switch (position) {
            case "whole": return syllables;
            case "begin": return syllables.slice(0, searchSyllableCount);
            case "end": return syllables.slice(-searchSyllableCount);
            default:
                return undefined;
            }
        }
        
        let regexBuilder = WordSearch.getSearchRegexBuilder(position);
        
        function checkSyllablesSpelling(syllables, spelling) {
            if (syllables.length != searchSyllableCount) {
                return false;
            }
            if (syllables.every((syl, index) =>
                searchPattern[index].phoneticRegex.test(syl))) {
                let spellingRegex = regexBuilder(constructSpellingPattern(
                    syllables));
                return spellingRegex.test(spelling);
            }
            return false;
        }
        
        function hasTargetSpelling(word) {
            if (position === "anywhere") {
                return word.pronunciationSyllables.some((syllables) => {
                    let subsetCount = syllables.length - searchSyllableCount + 1;
                    for (let i = 0; i < subsetCount; i += 1) {
                        let subset = syllables.slice(i, i + searchSyllableCount);
                        if (checkSyllablesSpelling(subset, word.word)) {
                            return true;
                        }
                    }
                    return false;
                });
            } else {
                return word.pronunciationSyllables.some((syllables) => {
                    let subset = positionSlice(syllables);
                    return checkSyllablesSpelling(subset, word.word);
                });
            }
        }
        
        return searchWords.filter((word) => hasTargetSpelling(word));
    }
    
    /**
     * Returns a new array of words containing those in searchWords that have
     * minimal pair matches in pairWords
     * @param {Array} searchWords List of words to filter by those.
     * @param {Array} pairWords List of potential minimal pair words.
     * @param {string} input String describing the minimal pair pattern:
     * Two tokens in Internal phonetic alphabet (phonicstable.js), or one
     * empty token {empty} representing an empty string.
     * For example: t/k; t/{empty}
     * @param {string} position Location within the word to match:
     *                  {begin, end, whole, anywhere}
     * @returns {Array} Filtered searchWords, with word.minPairs a Set containing
     * the list of minimal pair matches.
     */
    static getMinPairMatches (searchWords, pairWords, input, position) {
        const patterns = { empty: "" };
        const definedTokenRegex = WordSearch.getDefinedTokenRegex();
        
        searchWords.forEach((word) => word.minPairs = new Set());
            
        let minPairTokens = input.split("/");
        let minPairSource;
        let minPairTarget;

        if (minPairTokens && minPairTokens[0] === "(empty)") {
            minPairSource = minPairTokens[1];
            minPairTarget = minPairTokens[0];
        } else if (minPairTokens) {
            minPairSource = minPairTokens[0];
            minPairTarget = minPairTokens[1];
        } else {
            console.error(`Invalid MinPair search string: "${input}".`);
        }
        
        let regexBuilder = WordSearch.getSearchRegexBuilder(position);
        
        let targetPattern = minPairTarget.replace(definedTokenRegex, (ignore, tokenName) => patterns[tokenName.toLowerCase()]);
        let targetRegex = regexBuilder(targetPattern);
        let possiblePairMap = new Map();
        for (let word of pairWords) {
            for (let p of word.pronunciations) {
                // Possible optimization: if targetPattern === "", then there's no need to test the pronunciation
                if (targetRegex.test(p)) {
                    let currentPairSet = possiblePairMap.get(p) || new Set();
                    currentPairSet.add(word);
                    possiblePairMap.set(p, currentPairSet);
                }
            }
        }

        let sourcePattern = minPairSource.replace(definedTokenRegex, (ignore, tokenName) => this.patterns.minimalPair[tokenName]);
        
        // Possible optimization: start by creating a Map of pronunciations => Set.words, then map those pronunciations to the target pronunciations, performing unions as needed
        if (position !== "anywhere") {
            let sourceRegex = regexBuilder(sourcePattern);//WordSearch.buildSearchRegex(sourcePattern, this.searchValues.minPairPosition);
            for (let word of searchWords) {
                for (let p of word.pronunciations) {
                    if (sourceRegex.test(p)) {
                        let currentPairs = word.minPairs;
                        let targetPronunciation = p.replace(sourceRegex, targetPattern);
                        let newPairs = possiblePairMap.get(targetPronunciation);
                        if (newPairs) {
                            word.minPairs = new Set([...currentPairs, ...newPairs]);
                        }
                    }
                }
            }
        } else {
            let sourceRegex = new RegExp(sourcePattern, "g");
            for (let word of searchWords) {
                for (let p of word.pronunciations) {
                    if (sourceRegex.test(p)) {
                        let currentPairs = word.minPairs;
                        let pronunciationSegments = p.split(sourceRegex);

                        for (let i = 1; i < pronunciationSegments.length; i += 1) {
                            let preSegments = pronunciationSegments.slice(0, i).join(sourcePattern);
                            let postSegments = pronunciationSegments.slice(i, pronunciationSegments.length).join(sourcePattern);
                            let newPairs = possiblePairMap.get(preSegments + targetPattern + postSegments);
                            if (newPairs) {
                                word.minPairs = new Set([...currentPairs, ...newPairs]);
                            }
                        }
                    }
                }
            }
        }
        
        return searchWords.filter((word) => word.minPairs.size > 0);
    }
    
    /**
     * 
     */
    executeSearch (searchValues) {
        // Debug output:
        console.log(`Running search on ${searchValues.wordListLimit.replace("0000", "0,000")} words:
    ${searchValues.syllableCount.use ? "+" : "-"} Syllable Count: ${searchValues.syllableCount.count}
    ${searchValues.orthographic.use ? "+" : "-"} Orthographic: "${searchValues.orthographic.pattern}" - ${searchValues.orthographic.position}
    ${searchValues.phonetic.use ? "+" : "-"} Phonetic: "${searchValues.phonetic.pattern}" - ${searchValues.phonetic.position}
    ${searchValues.syllabic.use ? "+" : "-"} Syllabic: "${searchValues.syllabic.pattern}" - ${searchValues.syllabic.position}
    ${searchValues.minimalPair.use ? "+" : "-"} MinimalPair: "${searchValues.minimalPair.pattern}" - ${searchValues.minimalPair.position}
`);
        if (!(searchValues.syllableCount.use ||
              searchValues.orthographic.use ||
              searchValues.phonetic.use ||
              searchValues.syllabic.use ||
              searchValues.minimalPair.use)) {
            console.error("No valid search type.");
            return;
        }
        let results = this.words.slice(0, searchValues.wordListLimit);
        
        if (searchValues.syllableCount.use) {
            results = WordSearch.getSyllableCountMatches(
                results,
                searchValues.syllableCount.count);
        }
        
        if (searchValues.orthographic.use) {
            results = WordSearch.getOrthographicMatches(
                results,
                searchValues.orthographic.pattern,
                searchValues.orthographic.position);
        }
        
        if (searchValues.phonetic.use) {
            results = WordSearch.getPhoneticMatches(
                results,
                searchValues.phonetic.pattern,
                searchValues.phonetic.position);
        }
        
        if (searchValues.syllabic.use) {
            results = WordSearch.getSyllableTypeMatches(
                results,
                searchValues.syllabic.pattern,
                searchValues.syllabic.position);
        }
        
        if (searchValues.minimalPair.use) {
            // OPTIONAL: currently finds pairs only in the current results.
            // Could be modified (see commented this.words) to search against the entire word list.
            results = WordSearch.getMinPairMatches(
                results,
                results/*this.words*/,
                searchValues.minimalPair.pattern,
                searchValues.minimalPair.position);
        }
        
        return results;
    }
}