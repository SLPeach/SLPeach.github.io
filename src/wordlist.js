function WordList() {
    "use strict";
    this.version = 2.6;
    this.loadedFromLocal = false;
    this.listText = "";
    this.listArray = [];
//    this.scriptURL = (window.location.protocol === "file:")
//        // Local copy, must be in same directory
//        ? "src/wordlist-data.js"
//        // Remote copy
//        : "https://sites.google.com/site/slptoolsdata/wordsearch3/wordlist-data.js";
    this.scriptURL = "src/wordlist-data.js";
}

WordList.prototype = {
    get text() {
        return this.listText;
    },
    get list() {
        return this.listArray;
    },
    parseList: function (txt) {
        // Divide into word-pronunciation pairs
        let entryList = txt.split(/[\r\n]/g);
        let temp = [];

        return entryList.map(function (entry) {
            temp = entry.split("\t");
            return {
                word: temp[0],
                pronunciations: temp[1].replace(/\d+/g, "").split(/,/g),
                pronunciationsWithStress: temp[1].split(/,/g)
            };
        });
    },

    load: function (onComplete) {
        const wordListName = "WordListFile";
        const wordListVersionName = "WordListVersion";
        const hasLocalStorage = localStorage !== "undefined";

        if (hasLocalStorage) {
            let storedVersion = parseFloat(localStorage.getItem(wordListVersionName) || "0");
            if (storedVersion >= this.version) {
                this.listText = localStorage.getItem(wordListName);
                this.listArray = this.parseList(this.listText);
                console.log("Loaded word list version " + this.version + " from local storage.");
                onComplete();
                return;
            }
        }

        // Load remote copy of the word list
        DynamicJS.loadScript(this.scriptURL, () => {
            this.listText = getWordListFile();
            this.listArray = this.parseList(this.listText);
            try {
                if (hasLocalStorage) {
                    localStorage.setItem(wordListVersionName, this.version);
                    localStorage.setItem(wordListName, this.listText);
                    console.log("Stored word list version " + this.version + ".");
                } else {
                    console.log("No local storage");
                }
            }
            catch (err) {
                console.error(err.message);
                if (hasLocalStorage) {
                    localStorage.clear();
                }
            }
            onComplete();
        });
    }
};