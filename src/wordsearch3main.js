/* exported wordSearchController */

const searchPatternTypes = [
    "orthographic",
    "phonetic",
    "syllabic",
    "minimalPair"
];

const phoneticPatternTypes = [
    "phonetic",
    "minimalPair"
];

const documentIds = {
    syllableCount: {
        use: "useSyllableCount",
        count: "syllableCount"
    },
    orthographic: {
        use: "useOrthographic",
        position: "orthographicPosition",
        pattern: "orthographicInput"
    },
    phonetic: {
        use: "usePhonetic",
        position: "phoneticPosition",
        pattern: "phoneticInput"
    },
    syllabic: {
        use: "useSyllablePattern",
        position: "syllablePatternPosition",
        pattern: "syllablePatternInput"
    },
    minimalPair: {
        use: "useMinPair",
        position: "minPairPosition",
        pattern: "minPairInput"
    },
    wordListLimit: "wordListLimit",
    resultsLimit: "maxWordCount",
    phonicsAlphabet: "phonicsAlphabet",
    showPronunciation: "showPhonics",
    showStress: "showStress",
    enableKeyboard: "enableKeyboard",
    searchLink: "searchLink",
};

class WordSearchController {
    constructor () {
        this.rawInputValues = new Map();
        this.wordSearch = new WordSearch();
        
        var wordList = new WordList();
        wordList.load(() => this.wordSearch.setWords(wordList.listArray));
        
        this.keyboard = null;
    }
    
    initiate (inputFormId, optionsFormId, searchButtonId, resultsFormId,
               resultsCountId) {
        const updateInput = (event) => {
            let target = event.target;
            if (target.type === "checkbox") {
                this.rawInputValues.set(target.id, target.checked);
            } else { /* ot.type === "text" or "select-one" */
                this.rawInputValues.set(target.id, target.value);
            }
        };
        
        const runSearch = () => {
            if (!this.wordSearch.ready) {
                console.log("No wordlist loaded.");
                return;
            }
            this.searchValues = this.preprocessInput();
            this.results = this.wordSearch.executeSearch(this.searchValues);
            this.displayResults();
            searchPatternTypes.forEach((type) => {
                let condensedPattern = WordSearchController.condensePattern(
                    type, this.searchValues[type].pattern);
                this.searchValues[type].pattern = condensedPattern;
            });
            this.setSearchValuesToDOM();
            this.setSearchURL();
        };
        
        document.getElementById(searchButtonId).addEventListener("click", runSearch);
        
        this.divSearchInputForm = document.getElementById(inputFormId);
        this.divSearchInputForm.addEventListener("change", updateInput, true);
        
        this.divResults = document.getElementById(resultsFormId);
        this.divResultsCount = document.getElementById(resultsCountId);
        
        this.divOptionsForm = document.getElementById(optionsFormId);
        // Update the display if only changing an option
        this.divOptionsForm.addEventListener("change", (event) => {
            event.stopImmediatePropagation();
            
            // TODO: maintain typed, but not executed search values across alphabet changes
            const oldPhoneticValues = {
                phoneticPattern: this.searchValues.phonetic.pattern,
                phoneticUse: this.searchValues.phonetic.use,
                minPairPattern: this.searchValues.minimalPair.pattern,
                minPairUse: this.searchValues.minimalPair.use
            };
            
            updateInput(event);
            
            this.searchValues = this.preprocessInput();
            
            // Reset the processed phonetic patterns to the interpreted results with the previous input
            this.searchValues.phonetic.pattern = oldPhoneticValues.phoneticPattern;
            this.searchValues.minimalPair.pattern = oldPhoneticValues.minPairPattern;
            this.searchValues.phonetic.use = oldPhoneticValues.phoneticUse;
            this.searchValues.minimalPair.use = oldPhoneticValues.minPairUse;
            
            this.setSearchValuesToDOM();
            
            this.keyboard.updatePhonicAlphabet(this.searchValues.phonicsAlphabet);
            this.keyboard.enable(this.searchValues.enableKeyboard);
            
            if (this.results && this.results.length > 0) {
                this.displayResults();
            }
        }, true);
        
        // Ever so slightly hacky kludge for when Firefox saves the form's previous state
        this.keyboard = new Keyboard(document.getElementById(documentIds.phonicsAlphabet).value);
        
        const enabledKeyboard = document.getElementById(documentIds.enableKeyboard).checked;
        this.keyboard.enable(enabledKeyboard);
        if (enabledKeyboard) {
            const focus = document.activeElement;
            if (focus.classList.contains("use-keyboard-input")) {
                this.keyboard.open(focus);
            }
        }
        
        this.divSearchInputForm.addEventListener("keyup", (event) => {
            if (event.key) {
                if (event.key === "Enter") {
                    runSearch();
                }
            } else {
                let key = (event.keyCode || event.which);
                if (key === 13) {
                    runSearch();
                }
            }
        }, false);
        
        // Run searches any time the URL hashtag is changed
        window.addEventListener("hashchange", () => {
            if (this.parseSearchURL()) {
                this.setSearchValuesToDOM();
                this.parseInputForm();
                this.keyboard.enable(this.searchValues.enableKeyboard);
                runSearch();
            }
        });
        
        /*this.searchValues = this.preprocessInput();
        this.setSearchValuesToDOM();*/
        if (this.parseSearchURL()) {
            this.setSearchValuesToDOM();
        }
        this.parseInputForm();
        runSearch();
    }
    
    /**
     * Replaces literal elements (i.e., custom token definitions, literal
     * strings) using phonicsConverter.
     * Returns defined and custom token names without change.
     * @param {string} token Token to be converted.
     * @param {function} phonicsConverter Function used convert between
     * phonetic alphabets.
     */
    static convertTokenPhonics (token, phonicsConverter = (x) => x) {
        const definedTokenRegex = WordSearch.getDefinedTokenRegex();
        const customTokenRegex = WordSearch.getCustomTokenRegex();
        
        if (definedTokenRegex.test(token)) {
            return token;
        } else if (customTokenRegex.test(token)) {
            let customElements = token.match(customTokenRegex);
            let tokenName = customElements[1];
            let definition = customElements[2].split(",").map((s) => phonicsConverter(s)).join(",");
            return `(${tokenName}: ${
                definition})`;
        } else {
            return phonicsConverter(token);
        }
    }
    
    parseInputForm () {
        this.rawInputValues = new Map();
        
        var nodeListInputs = this.divSearchInputForm.getElementsByTagName("input");
        for (let node of nodeListInputs) {
            if (node.type === "checkbox") {
                this.rawInputValues.set(node.id, node.checked);
            } else {
                this.rawInputValues.set(node.id, node.value);
            }
        }
        
        var nodeListSelects = this.divSearchInputForm.getElementsByTagName("select");
        for (let node of nodeListSelects) {
            this.rawInputValues.set(node.id, node.value);
        }
    }
    
    /**
     * Replaces shorthands (e.g., C => (consonant)) in the input
     */
    static expandPattern (inputType, inputText) {
        const shorthands = {
            "orthographic": {
                "C": "(consonant)",
                "V": "(vowel)"
            },
            // Absolutely NO {I, Y, W} (used for internal IPA)
            "phonetic": {
                "C": "(consonant)",
                "V": "(vowel)",
                "S": "(short_vowel)",
                "L": "(long_vowel)",
                "D": "(diphthong)",
                "+V": "(voiced_consonant)",
                "-V": "(voiceless_consonant)",
                "P": "(stop)",
                "F": "(fricative)",
                "A": "(affricate)"
            },
            "syllabic": {
                "C": "(closed)",
                "O": "(open)",
                "R": "(r_controlled)",
                "L": "(consonant_le)",
                "V": "(vowel_team)",
                "T": "(vowel_team)",
                "S": "(silent_e)",
                "E": "(silent_e)"
            },
            "minimalPair": {
                "O": "(empty)",
                "0": "(empty)"
            }
        };
        const shortandRegex = /\([^(]+?\)|[^A-Z()+-0]+|([A-Z+-0]+)/g;
        
        return inputText.replace(shortandRegex, (match, shorthandMatch) => {
            if (!shorthandMatch) {
                return match;
            }
            return shorthandMatch.replace(/[+-]?[A-Z0]/g, (s) =>
                shorthands[inputType].hasOwnProperty(s) ? shorthands[inputType][s] : s);
        });
    }
    
    static condensePattern (inputType, inputText) {
        const reverseShorthands = {
            "orthographic": {
                "(consonant)": "C",
                "(vowel)": "V"
            },
            // Absolutely NO {I, Y, W} (used for internal IPA)
            "phonetic": {
                "(consonant)": "C",
                "(vowel)": "V",
                "(short_vowel)": "S",
                "(long_vowel)": "L",
                "(diphthong)": "D",
                "(voiced_consonant)": "+V",
                "(voiceless_consonant)": "-V",
                "(stop)": "P",
                "(fricative)": "F",
                "(affricate)": "A"
            },
            "syllabic": {
                "(closed)": "C",
                "(open)": "O",
                "(r_controlled)": "R",
                "(consonant_le)": "L",
                "(vowel_team)": "T",
                "(silent_e)": "E"
            },
            "minimalPair": {
                "(empty)": "0"
            }
        };
        const tokenRegex = WordSearch.getDefinedTokenRegex(false);
        return inputText.replace(tokenRegex, (match) => {
            let lowercaseMatch = match.toLowerCase();
            if (reverseShorthands[inputType].hasOwnProperty(lowercaseMatch)) {
                return reverseShorthands[inputType][lowercaseMatch];
            } else {
                return match;
            }
        });
    }
    
    preprocessInput() {
        // @todo replace with functional programming using {@link documentIds}
        let searchValues = {
            syllableCount: {
                use: this.rawInputValues.get("useSyllableCount"),
                count: this.rawInputValues.get("syllableCount")
            },
            orthographic: {
                use: this.rawInputValues.get("useOrthographic"),
                position: this.rawInputValues.get("orthographicPosition"),
                pattern: this.rawInputValues.get("orthographicInput")
            },
            phonetic: {
                use: this.rawInputValues.get("usePhonetic"),
                position: this.rawInputValues.get("phoneticPosition"),
                pattern: this.rawInputValues.get("phoneticInput")
            },
            syllabic: {
                use: this.rawInputValues.get("useSyllablePattern"),
                position: this.rawInputValues.get("syllablePatternPosition"),
                pattern: this.rawInputValues.get("syllablePatternInput")
            },
            minimalPair: {
                use: this.rawInputValues.get("useMinPair"),
                position: this.rawInputValues.get("minPairPosition"),
                pattern: this.rawInputValues.get("minPairInput")
            },
            wordListLimit: this.rawInputValues.get("wordListLimit"),
            resultsLimit: this.rawInputValues.get("maxWordCount"),
            phonicsAlphabet: this.rawInputValues.get("phonicsAlphabet"),
            showPronunciation: this.rawInputValues.get("showPhonics"),
            showStress: this.rawInputValues.get("showStress"),
            enableKeyboard: this.rawInputValues.get("enableKeyboard")
        };
        
        let inputToInternalPhonics = PhonicsTable.getConverter(searchValues.phonicsAlphabet, "Internal");
        
        let phoneticInputTypesRegex = WordSearch.getPhoneticInputTypesRegex(searchValues.phonicsAlphabet);
        
        searchPatternTypes.forEach((type) => {
            searchValues[type].pattern =
                WordSearchController.expandPattern(
                    type,
                    searchValues[type].pattern
            );
        });
        
        phoneticPatternTypes.forEach((type) => {
            searchValues[type].pattern = searchValues[type].pattern.replace(
                phoneticInputTypesRegex,
                (segment) => WordSearchController.convertTokenPhonics(
                    segment, inputToInternalPhonics));
        });
        
        /*
         * Disable search type if the pattern is invalid
         * Must first convert literal phonetics in input fields
         */
        const patternValidators = {
            orthographic: /^(?:\([a-zA-Z0-9_]+\)|\([a-zA-Z0-9_]+:[a-z\s,]+\)|[a-z]+)+$/g,
            phonetic: /^(?:\([a-zA-Z0-9_]+\)|\([a-zA-Z0-9_]+:[pbtdkgfvθðszʃʒhmnŋlrwjʧʤæɛɪɑəeiouɔʊɚIYW\s,]+\)|[pbtdkgfvθðszʃʒhmnŋlrwjʧʤæɛɪɑəeiouɔʊɚIYW])+$/g,
            minimalPair: /^(?:[pbtdkgfvθðszʃʒhmnŋlrwjʧʤæɛɪɑəeiouɔʊɚIYW]+|\(empty\))\/(?:[pbtdkgfvθðszʃʒhmnŋlrwjʧʤæɛɪɑəeiouɔʊɚIYW]+|\(empty\))$/g,
            syllabic: /^(?:\((?:closed|open|silent_e|r_controlled|consonant_le|vowel_team|any)\))+$/gi
        };
        
        searchPatternTypes.forEach((type) => {
            searchValues[type].use = searchValues[type].use &&
                patternValidators[type].test(searchValues[type].pattern);
        });
        
        return searchValues;
    }
    
    /**
     * Does exactly what it says on the box.
     * Displays WordSearchController#searchValues to the document
     */
    setSearchValuesToDOM () {
        if (!this.searchValues) {
            return;
        }
        
        // Deep copy so the deprocessed input doesn't become the input
        let searchValues = JSON.parse(JSON.stringify(this.searchValues));
        
        // Convert internal phonetics to display phonetics
        let internalToOutputPhonics = PhonicsTable.getConverter("Internal", this.searchValues.phonicsAlphabet);
        let phoneticInputTypesRegex = WordSearch.getPhoneticInputTypesRegex("Internal");
        
        phoneticPatternTypes.forEach((type) => {
            searchValues[type].pattern = searchValues[type].pattern.replace(
                phoneticInputTypesRegex,
                (segment) => WordSearchController.convertTokenPhonics(
                    segment, internalToOutputPhonics));
        });
        
        function setValue(name, value, ids = documentIds) {
            let element = document.getElementById(ids[name]);
            if (element.tagName === "SELECT") {
                element.nodeValue = value;
            } else if (element.tagName === "INPUT") {
                if (element.type === "checkbox") {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            } else {
                console.error("Unrecognized input type " + element.tagName);
            }
        }
        
        for (let name in searchValues) {
            let value = searchValues[name];
            if (typeof value === "object") {
                for (let subName in value) {
                    let subValue = value[subName];
                    setValue(subName, subValue, documentIds[name]);
                }
            } else {
                setValue(name, value);
            }
        }
    }
    
    /**
     * Creates a URL for WordSearchController#searchValues by converting them
     * into a JSON string and appending them to [pageURL] + "#q="
     * Converts phonetic tokens to URLPhonics
     */
    setSearchURL () {
        if (!this.searchValues) {
            return;
        }
        // FIXME: shallow copy => deep copy
        let searchValues = JSON.parse(JSON.stringify(this.searchValues));
        /*let inputToURLPhonics = PhonicsTable.getConverter(searchValues.phonicsAlphabet, "URLPhonics");
        let phoneticInputTypesRegex = WordSearch.getPhoneticInputTypesRegex(searchValues.phonicsAlphabet);*/
        let inputToURLPhonics = PhonicsTable.getConverter("Internal", "URLPhonics");
        let phoneticInputTypesRegex = WordSearch.getPhoneticInputTypesRegex("Internal");
        
        phoneticPatternTypes.forEach((type) => {
            searchValues[type].pattern = searchValues[type].pattern.replace(
                phoneticInputTypesRegex,
                (segment) => WordSearchController.convertTokenPhonics(
                    segment, inputToURLPhonics));
        });
        
        let queryURL = `${window.location.protocol}//${window.location.host}${
            window.location.pathname}#q=${JSON.stringify(searchValues)}`;
        document.getElementById(documentIds.searchLink).href = queryURL;
    }
    
    /**
     * Loads search values from URL
     * @return true if a valid URL was converted; false otherwise 
     */
    parseSearchURL () {
        const queryRegex = /#q=(\{.+\})/;
        let queryMatch = decodeURIComponent(document.documentURI).match(queryRegex);
        
        if (queryMatch) {
            this.searchValues = JSON.parse(queryMatch[1]);
            
            let urlPhonicsToInternal = PhonicsTable.getConverter("URLPhonics", this.searchValues.phonicsAlphabet);
            let phoneticInputTypesRegex = WordSearch.getPhoneticInputTypesRegex("URLPhonics");

            phoneticPatternTypes.forEach((type) => {
                this.searchValues[type].pattern = this.searchValues[type].pattern.replace(
                    phoneticInputTypesRegex,
                    (segment) => WordSearchController.convertTokenPhonics(
                        segment, urlPhonicsToInternal));
            });
            
            return true;
        }
        return false;
    }
    
    displayResults () {
        this.divResultsCount.innerHTML = `(${this.results.length} results)`;
        
        if (this.results === null || this.results.length === 0) {
            this.divResults.innerHTML = "";
            return;
        }
        
        let phonicsConverter = PhonicsTable.getConverter("Internal",
            this.searchValues.phonicsAlphabet);
        
        function formatPronunciation(p) {
            return `<span class="wordPronunciation ipa">/${phonicsConverter(p)}/</span>`;
        }
        
        let formatWord;
        if (this.debug) {
            formatWord = (word, wordClass) =>
`<div class="word">
    <span class="${wordClass}">${word.word}</span>
    ${(word.pronunciationSyllables.map(p => p.join("-")).map((p) => formatPronunciation(p))).join(" ")}
</div>`;
        } else if (this.searchValues.showPronunciation) {
            if (this.searchValues.showStress) {
                formatWord = (word, wordClass) =>
`<div class="word">
    <span class="${wordClass}">${word.word}</span>
    ${(word.pronunciationsWithStress.map((p) => formatPronunciation(p))).join(" ")}
</div>`;
            } else {
                // FIXME: returns stressed /ʌ/ as /ə/ b/c w/o stress there's no programmatic way to distinguish them
                formatWord = (word, wordClass) =>
`<div class="word">
    <span class="${wordClass}">${word.word}</span>
    ${(word.pronunciations.map((p) => formatPronunciation(p))).join(" ")}
</div>`;
            }
        } else {
            formatWord = (word, wordClass) =>
`<div class="word">
    <span class="${wordClass}">${word.word}</span>
</div>`;
        }
        
        let cutResults = this.results.slice(0, this.searchValues.resultsLimit);
        
        if (this.searchValues.minimalPair.use) {
            let formattedWords = cutResults.map(function (headWord) {
                let minPairArray = [...headWord.minPairs];
                return formatWord(headWord, "headWord") + minPairArray.map((pairWord) => formatWord(pairWord, "subWord")).join(" ");
            });
            this.divResults.innerHTML = formattedWords.join("");
        } else {
            this.divResults.innerHTML = cutResults.map((word) => formatWord(word, "headWord")).join("");
        }
    }
}

var wordSearchController = new WordSearchController();