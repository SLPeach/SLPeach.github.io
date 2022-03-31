class FluencyTimer {

	constructor () {
        this.fluentKeydownTime = 0;
        this.disfluentKeydownTime = 0;
        this.startTime = 0;
        this.stopTime = 0;
        this.syllableLog = [];
        this.results = {
            sampleTime: 0,
            fluentSyllables: 0,
            disfluentSyllables: 0,
            mean3Longest: 0
        };
	}
    
    init (outputLog, resultsArea, startButton, stopButton) {
        let that = this;
        
        this.logOutput = outputLog;
        this.resultsArea = resultsArea;

        startButton.onclick = (e) => {
            that.startTime = Date.now(); 
        };

        stopButton.onclick = (e) => {
            that.stopTime = Date.now();
            that.calculateResults();
            that.outputResults();
        };

        this.logOutput.value = "";
        
        document.addEventListener("keydown", (e) => {
            let t = Date.now();
            if (!e.repeat) {
                switch (e.code) {
                    case "Digit1":
                        that.fluentKeydownTime = t;
                        break;
                    case "Digit2":
                    case "Digit0":
                        that.disfluentKeydownTime = t;
                        break;
                }
            }
        });
        
		document.addEventListener("keyup", (e) => {
            let t = Date.now();
            switch (e.code) {
                case "Digit1":
                    that.logSyllable("fluent", t - that.fluentKeydownTime);
                    break;
                case "Digit2":
                case "Digit0":
                    that.logSyllable("disfluent", t - that.disfluentKeydownTime);
                    break;
            }
        });
    }
    
    logSyllable (syllableType, eventTime) {
        this.syllableLog.push({type: syllableType, time: eventTime});
        this.logOutput.value += syllableType + "\t" + eventTime + "\n";
        this.logOutput.scrollTop = this.logOutput.scrollHeight;
    };
    
    calculateResults() {
        this.results.sampleTime = this.stopTime - this.startTime;
        
        let disfluentLengths = [];
        let syllable = {};
        
        for (let index in this.syllableLog) {
            syllable = this.syllableLog[index];
            
            if (syllable.type == "fluent") {
                this.results.fluentSyllables++;
            } else {
                this.results.disfluentSyllables++;
                disfluentLengths.push(syllable.time);
            }
        }
        
        let sortedLengths = disfluentLengths.sort();
        this.results.mean3Longest = (sortedLengths[0] + sortedLengths[1] + sortedLengths[2]) / 3.0;
    }
    
    outputResults() {
        this.resultsArea.innerHTML = `<table>
<tr><th>Sample Time</th><td>${ (this.results.sampleTime / 1000.0).toFixed(1)}s</td></tr>
<tr><th>Fluent</th><td>${this.results.fluentSyllables}</td></tr>
<tr><th>Disfluent</th><td>${this.results.disfluentSyllables}</td></tr>
<tr><th>Mean 3 Longest</th><td>${ (this.results.mean3Longest / 1000.0).toFixed(1)}s</td></tr>
</table>`;
    }
}