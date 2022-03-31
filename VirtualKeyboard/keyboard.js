class Keyboard {
    constructor(phonicAlphabet = "IPA") {
        this.modifiers = {
            caps: false,
            shift: false,
            alt: false
        };
        
        this.htmlElements = {
            target: null,
            container: document.createElement("div"),
            keyboard: null,
            keyButtons: new Map()
        };
        
        this.selection = {
            range: null,
            start: 0,
            end: 0
        };
        
        this.htmlElements.container.classList.add("keyboard");
        this.htmlElements.container.classList.add("hidden");
        this.htmlElements.container.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                event.preventDefault();
                this.handleButtonClicks(event.target.value.slice(4), event.target.innerHTML);
            }
        });
        
        this.createAllKeys();
        
        this.updatePhonicAlphabet(phonicAlphabet);
        
        this.setKeyboard("base");
        
        document.body.appendChild(this.htmlElements.container);
        
        this.isEnabled = true;
        
        /*
         * Add event listeners to each input item with the "use-keyboard-input" class.
         */
        document.querySelectorAll(".use-keyboard-input").forEach(elem => {
            elem.addEventListener("focus", (event) => {
                if (this.isEnabled) {
                    this.open(event.currentTarget);
                }
            });
        });
        
        /*
         * Update selection if 
         */
        window.addEventListener("select", (event) => {
            if (event.target.tagName === "INPUT") {
                const sel = window.getSelection();
                const range = window.getSelection().getRangeAt(0);
                if (range.startContainer === range.endContainer) {
                    this.selection = {
                        range: range,
                        start: range.startOffset,
                        end: range.endOffset
                    };
                    return;
                }
            }
            this.selection = {
                range: null
            };
        });
    }
    
    enable(useKeyboard = true) {
        this.isEnabled = useKeyboard;
        /*if (useKeyboard) {
            document.querySelectorAll(".use-keyboard-input").forEach(elem => {
                elem.readOnly = true;
            });
        } else {
            document.querySelectorAll(".use-keyboard-input").forEach(elem => {
                elem.readOnly = false;
            });
            this.close();
        }*/
    }
    
    open(targetElement) {
        this.htmlElements.target = targetElement;
        this.htmlElements.container.classList.remove("hidden");
    }
    
    close() {
        this.htmlElements.target = null;
        this.htmlElements.container.classList.add("hidden");
    }
    
    handleButtonClicks(buttonName, buttonText) {
        const target = this.htmlElements.target,
              currentText = target.value,
              length = currentText.length,
              start = this.selection.start,
              end = this.selection.end;
        const capsButton = this.htmlElements.keyButtons.get("caps");
        const altButton = this.htmlElements.keyButtons.get("alt");
        let newKeyboard = "";
        
        const updateSelection = (loc) => {
            this.selection = {
                range: null,
                start: loc,
                end: loc
            };
        };
        
        switch (buttonName) {
            case "blank":
                break;
            case "backspace":
                if (start === end) {
                    const bkspStart = Math.max(start - 1, 0);
                    target.value = currentText.slice(0, bkspStart) + currentText.slice(end, length);
                    updateSelection(bkspStart);
                } else {
                    target.value = currentText.slice(0, start) + currentText.slice(end, length);
                    updateSelection(start);
                }
                break;
            case "tab":
                // FILL-IN:
                break;
            case "caps":
                const isCaps = !this.modifiers.caps;
                newKeyboard = isCaps ? "shift" : "base";
                this.modifiers.caps = isCaps;
                if (isCaps) {
                    capsButton.classList.add("active");
                    this.modifiers.alt = false;
                    altButton.classList.remove("active");
                } else {
                    capsButton.classList.remove("active");
                }
                this.setKeyboard(newKeyboard);
                break;
            case "return":
                target.dispatchEvent(new KeyboardEvent("keyup", {bubbles: true,
                                                                 key: "Enter",
                                                                 code: "Enter"}));
                break;
            case "alt":
                const isAlt = !this.modifiers.alt;
                newKeyboard = isAlt ? "alt" : "base";
                this.modifiers.alt = isAlt;
                if (isAlt) {
                    altButton.classList.add("active");
                    this.modifiers.caps = false;
                    capsButton.classList.remove("active");
                } else {
                    altButton.classList.remove("active");
                }
                this.setKeyboard(newKeyboard);
                break;
            case "dismiss":
                this.close();
                break;
            default:
                target.value = currentText.slice(0, start) + buttonText + currentText.slice(end, length);
                updateSelection(start + buttonText.length);
        }
        target.dispatchEvent(new Event("change"));
    }
    
    setKeyboard(keySetName = "base") {
        const lineBreaks = ["tab", "caps", "alt", "space"];
        const breakLine = (keyName) => lineBreaks.indexOf(keyName) !== -1;
        const keyLayout = this.getKeyLayout(keySetName);
        
        let keyboard = document.createElement("div");
        keyboard.classList.add("keys");
        
        keyLayout.forEach(keyName => {
            if (breakLine(keyName)) {
                keyboard.appendChild(document.createElement("br"));
            }
            if (keyName === "") {
                keyboard.appendChild(this.htmlElements.keyButtons.get(keyName).cloneNode(true));
            } else {
                keyboard.appendChild(this.htmlElements.keyButtons.get(keyName));
            }
        });
        
        this.htmlElements.container.innerHTML = "";
        this.htmlElements.keyboard = keyboard;
        this.htmlElements.container.appendChild(keyboard);
    }
    
    /**
     * Updates the alt keyboard layout and the hover text for all layouts to match the new phonic alphabet
     */
    updatePhonicAlphabet(newAlphabet) {
        this.phonicAlphabet = newAlphabet;
        let converter = PhonicsTable.getConverter("Internal", newAlphabet);        
        this.getKeyLayout("alt").forEach(keyID => {
            if (!this.isSpecialKey(keyID)) {
                // Locate the key button element, convert the ID (w/o "phonic_") to create the label text
                this.htmlElements.keyButtons.get(keyID).innerHTML = converter(keyID.slice(7));
            }
        });
        
        const phonicsList = PhonicsTable.getAlphabet(this.phonicAlphabet);
        const getHintText = PhonicsTable.getConverter(this.phonicAlphabet, "Keyword");
        const isPhonicElement = (keyID) => phonicsList.indexOf(keyID) !== -1;
        
        this.htmlElements.keyButtons.forEach((key) => {
            if (isPhonicElement(key.innerHTML)) {
                key.title = getHintText(key.innerHTML);
            } else {
                key.title = "";
            }
        });
    }
    
    isSpecialKey(keyID) {
        return ["", "backspace", "tab", "caps", "return", "shift", "alt", "space", "dismiss"].indexOf(keyID) !== -1;
    }
    
    getKeyLayout(keySet) {
        const keySets = {
            base: ["dismiss", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                   "tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", ";",
                   "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "return",
                   "alt", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
                   "space"],
            shift: ["dismiss", "!", "@", "#", "$", "_", "-", "+", "*", "(", ")", "backspace",
                    "tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", ":",
                    "caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "return",
                    "alt", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?",
                    "space"],
            // Commented out stress symbols because not currently implemented for input
            alt: ["dismiss", /*"1", "2", "3",*/ "", "", "", "e", "", "", "W", "I", "Y", "o", "backspace",
                  "tab", "ɑ", "ə", "ɛ", "ɚ", "θ", "u", "ʊ", "ɪ", "ɔ", "", "",
                  "caps", "æ", "ʃ", "ð", "", "", "", "ʤ", "", "", "return",
                  "alt", "ʒ", "", "ʧ", "", "", "ŋ", "", /*"ə1", "ə2", "ə3",*/ "", "", "",
                  "space"]
        };
        
        if (keySet === "alt") {
            return keySets.alt.map(keyID => this.isSpecialKey(keyID) ? keyID : "phonic_"+keyID);
        } else {
            return keySets[keySet];
        }
    }
    
    /**
     * Creates 
     */
    createAllKeys() {
        const createKey = (keyName, keyText, widthClass = "standard") => {
            let elem = document.createElement("button");
            elem.classList.add("key", widthClass);
            elem.value = keyName;
            elem.innerHTML = keyText;
            return elem;
        };
        
        let keySet = new Set();
        this.getKeyLayout("base").forEach(keyID => keySet.add(keyID));
        this.getKeyLayout("shift").forEach(keyID => keySet.add(keyID));
        this.getKeyLayout("alt").forEach(keyID => keySet.add(keyID));
        /*
         * ⌘ ✲ ⎈ ^ ⌃ ❖ ⎇ ⌥ ◆ ◇ ✦ ✧ ⇧ ⇪ 🄰 🅰 ⇪ ⇫ ⇬ ⇮ ⇯ 🔠 🔡 ⇭ 🔢 🔤 ↩ ↵ ⏎
         * ⮰ ⌤ ⎆ ▤ ☰ 𝌆 ⎄ ⭾ ↹ ⇄ ⇤ ⇥ ↤ ↦ ⎋ ⌫ ⟵ ⌦ ⎀ ⎚ ⌧ ↖ ↘ ⇤ ⇥ ⤒ ⤓ ⇱ ⇲
         * ⇞ ⇟ △ ▽ ▲ ▼ ⎗ ⎘ ↑ ↓ ← → ◀ ▶ ▲ ▼ ◁ ▷ △ ▽ ⇦ ⇨ ⇧ ⇩ ⬅ ➡ ⬆ ⬇ ⎉ ⎊ ⎙ ⍰ ❓
         * ❔ ℹ 🛈 ☾ ⏏ ✉ 🏠 🏡 ⌂ ✂ ✄ ⎌ ↶ ↷ ⟲ ⟳ ↺ ↻ 🔍 🔎 🔅 🔆 🔇 🔈 🔉 🔊 🕨 🕩 🕪 ◼
         * ⏯ ⏮ ⏭ ⏪ ⏩ ⏫ ⏬ 
         */
        let key = null;
        keySet.forEach(keyID => {
            switch (keyID) {
                case "backspace":
                    key = createKey("key_backspace", "⌫");
                    break;
                case "tab":
                    key = createKey("key_tab", "⇥");
                    break;
                case "caps":
                    key = createKey("key_caps", "⇪", "wide");
                    key.classList.add("activatable");
                    break;
                case "return":
                    key = createKey("key_return", "↵", "wide");
                    break;
                case "alt":
                    key = createKey("key_alt", "⎇", "extraWide");
                    key.classList.add("activatable");
                    break;
                case "dismiss":
                    key = createKey("key_dismiss", "⏏");
                    key.classList.add("raised");
                    break;
                case "space":
                    key = createKey("key_space", " ", "ultraWide");
                    break;
                case "":
                    key = createKey("key_blank", "");
                    break;
                default:
                    key = createKey("key_"+keyID, keyID);
            }
            this.htmlElements.keyButtons.set(keyID, key);
        });
    }
}