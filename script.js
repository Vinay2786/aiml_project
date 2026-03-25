document.addEventListener("DOMContentLoaded", () => {
    
    const analyzeBtn = document.getElementById("analyzeBtn");
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    
    const loader = document.getElementById("loader");
    const awaitingMsg = document.getElementById("awaiting-msg");
    const resultsContainer = document.getElementById("results-container");
    const lowConfidenceAlert = document.getElementById("low-confidence-alert");
    const metricsGrid = document.getElementById("metrics-grid");
    
    const stateNameEl = document.getElementById("state-name");
    const confidenceTextEl = document.getElementById("confidence-text");
    const suggestionBox = document.getElementById("suggestion-box");
    
    let currentFileName = "";
    // Upload interaction
    dropzone.addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (e) => {
        if(e.target.files.length > 0) {
            currentFileName = e.target.files[0].name;
            dropzone.innerHTML = `<p>File Loaded: <strong>${currentFileName}</strong></p>`;
        }
    });

    // Analysis Mock Logic
    analyzeBtn.addEventListener("click", () => {
        if (!currentFileName) {
            alert("Please upload a file to initiate analysis.");
            return;
        }
        
        // UI Reset
        awaitingMsg.classList.add("hidden");
        resultsContainer.classList.add("hidden");
        lowConfidenceAlert.classList.add("hidden");
        metricsGrid.classList.remove("hidden");
        loader.classList.remove("hidden");
        
        // Mock a 1.5 second "inference" delay
        setTimeout(() => {
            loader.classList.add("hidden");
            resultsContainer.classList.remove("hidden");
            
            runInferenceMock();
        }, 1500);
    });

    function runInferenceMock() {
        let isLowConfidence, pred, maxProb;
        
        // Make results deterministic based on the uploaded file name length/chars
        if (currentFileName) {
            let hash = 0;
            for (let i = 0; i < currentFileName.length; i++) {
                hash = currentFileName.charCodeAt(i) + ((hash << 5) - hash);
            }
            let seededRandom = Math.abs(Math.sin(hash));
            
            isLowConfidence = seededRandom < 0.15;
            pred = Math.floor((seededRandom * 100) % 3);
            maxProb = 0.60 + (seededRandom % 0.38);
        } else {
            isLowConfidence = Math.random() < 0.15;
            pred = Math.floor(Math.random() * 3);
            maxProb = 0.60 + Math.random() * 0.38;
        }
        
        if (isLowConfidence) {
            lowConfidenceAlert.classList.remove("hidden");
            metricsGrid.classList.add("hidden");
            drawWaveform(); // Still draw waveform to show noise
            return;
        }
        
        // Pick class
        const states = ["Relaxed", "Moderate Workload", "High Workload"];
        const colors = ["#0f0", "#0ff", "#f0f"]; 
        
        // Update DOM
        stateNameEl.innerText = states[pred];
        stateNameEl.style.color = colors[pred];
        confidenceTextEl.innerText = `Confidence: ${(maxProb * 100).toFixed(2)}%`;
        
        // Handle Suggestions
        suggestionBox.className = "";
        if (pred === 0) {
            suggestionBox.className = "success-box";
            suggestionBox.innerHTML = "<strong>Suggestion:</strong> You seem to be in a comfortable mental state. You can continue your current task.";
        } else if (pred === 1) {
            suggestionBox.className = "warning-box";
            suggestionBox.innerHTML = "<strong>Suggestion:</strong> You seem moderately engaged. Continue working, but consider a short break if this continues for long.";
        } else {
            suggestionBox.className = "error-box";
            suggestionBox.innerHTML = "<strong>Suggestion:</strong> High mental workload detected. It is advisable to take a short rest or reduce task intensity.";
        }
        
        // Draw Charts
        drawGauge(maxProb, colors[pred]);
        drawWaveform(colors[pred]);
    }

    function drawGauge(score, color) {
        var data = [
            {
                type: "indicator",
                mode: "gauge+number",
                value: score * 100,
                title: { text: "Confidence Level", font: { color: color, family: 'Courier New' } },
                gauge: {
                    axis: { range: [null, 100], tickwidth: 1, tickcolor: color },
                    bar: { color: color },
                    bgcolor: "black",
                    borderwidth: 2,
                    bordercolor: color,
                }
            }
        ];

        var layout = {
            width: 300, height: 200, 
            margin: { t: 40, r: 25, l: 25, b: 20 },
            paper_bgcolor: "rgba(0,0,0,0)",
            font: { color: color, family: 'Courier New' }
        };

        Plotly.newPlot('gaugeChart', data, layout, {displayModeBar: false});
    }

    function drawWaveform(themeColor = "#0ff") {
        // Generate simulated EEG wave
        var x = [];
        var y1 = [], y2 = [], y3 = [];
        for(let i=0; i<500; i++) {
            x.push(i / 250); // 2 seconds at 250Hz
            y1.push(Math.sin(i * 0.1) * 10 + Math.random() * 5);
            y2.push(Math.cos(i * 0.12) * 10 + 50 + Math.random() * 5);
            y3.push(Math.sin(i * 0.08) * 10 + 100 + Math.random() * 5);
        }

        var trace1 = { x: x, y: y1, mode: 'lines', name: 'Ch 1', line: {width: 1} };
        var trace2 = { x: x, y: y2, mode: 'lines', name: 'Ch 2', line: {width: 1} };
        var trace3 = { x: x, y: y3, mode: 'lines', name: 'Ch 3', line: {width: 1} };

        var layout = {
            height: 300,
            margin: { t: 10, r: 10, l: 30, b: 30 },
            plot_bgcolor: "rgba(0,0,0,0)",
            paper_bgcolor: "rgba(0,0,0,0)",
            font: { color: themeColor, family: 'Courier New' },
            xaxis: { gridcolor: 'rgba(0,255,255,0.2)' },
            yaxis: { gridcolor: 'rgba(0,255,255,0.2)' },
            showlegend: false
        };

        Plotly.newPlot('waveformChart', [trace1, trace2, trace3], layout, {displayModeBar: false});
    }
});
