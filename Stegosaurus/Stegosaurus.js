function runStegosaurus() {
    const disallowedCharacters = /[^ -~\t\r\n]+/g;
    
    let text = document.getElementById("Input").value;
    
    /*
     * Break up composite characters, like 'á' or 'ñ'.
     * Remove accents and other disallowed characters.
     * Replace newlines with consistent Windows-style newline.
     * Replace spaces and tabs with a single space.
     */
    text = text.normalize("NFKD");
    text = text.replaceAll(disallowedCharacters,"");
    text = text.replaceAll(/\R+/g, "\r\n");
    text = text.replaceAll(/[ \t]+/g," ");
    
    document.getElementById("Output").value = text;
}

function highlightNonwords() {
    const allowedInfoCharacters = /[!-~]+/g;
    let text = document.getElementById("Output").value;
    
    text = text.replaceAll(allowedInfoCharacters, (word) => {
        if (stego_enwiki.test(word)) {
            return word;
        } else {
            return `**${word}**`;
        }
    });
    
    document.getElementById("Output").value = text;
}