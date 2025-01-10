function WordList() {
    "use strict";
    this.version = 3.01;
    this.loadedFromLocal = false;
    this.listText = "";
    this.listArray = [];
    this.scriptURL = "wordlist-data.js";
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
        let tempWordData = [];

        return entryList.map(function (entry) {
            temp = entry.split("\t");
            tempWordData = temp[0].split(/\+/g);
            return {
                word: tempWordData[0],
                controversial: tempWordData[1] != "0",
                frequency: parseInt(tempWordData[2], 10),
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
