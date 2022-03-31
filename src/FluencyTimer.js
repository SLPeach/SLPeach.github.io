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
            dysfluentSyllables: 0,
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
        
        let dysfluentLengths = [];
        let syllable = {};
        
        for (let index in this.syllableLog) {
            syllable = this.syllableLog[index];
            
            if (syllable.type == "fluent") {
                this.results.fluentSyllables++;
            } else {
                this.results.dysfluentSyllables++;
                dysfluentLengths.push(syllable.time);
            }
        }
        
        let sortedLengths = dysfluentLengths.sort();
        this.results.mean3Longest = (sortedLengths[0] + sortedLengths[1] + sortedLengths[2]) / 3.0;
    }
    
    outputResults() {
        console.log(`Time: ${this.results.sampleTime}\nFluent: ${this.results.fluentSyllables}\nDysfluent: ${this.results.dysfluentSyllables}\nMean: ${this.results.mean3Longest}`)
        this.resultsArea.innerHTML = `<table><tr><th>Sample Time</th><th>Fluent</th><th>Dysfluent</th><th>Mean 3 Longest</th></tr>
<tr><td>${this.results.sampleTime}</td><td>${this.results.fluentSyllables}</td><td>${this.results.dysfluentSyllables}</td><td>${this.results.mean3Longest}</td></tr></table>`;
    }
}