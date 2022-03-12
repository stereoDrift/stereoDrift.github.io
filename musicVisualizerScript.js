/* To-dos and potential improvements:
- How to improve latency when using the microphone to record audio?
- Allow users to "create" their own music video -- add text, choose colours, upload music, export the file, etc...
- Add for gradient / "textured" backgrounds?
- Feature to import audio from Spotify or YouTube URL?
- Mobile formatting (menu, shape sizes, etc.)
- Readme file
*/

var visualizationMenu = document.getElementById("visualizationMenu");
var visualizationChoice = String(visualizationMenu.value);

var colourMenu = document.getElementById("colourMenu");
var colourChoice = String(colourMenu.value);

var svgContainerDiv = document.getElementById("svgContainerDiv");
var mainSvg = document.getElementById("mainSvg");

var svg = d3.select("#mainSvg");

var userInputArray = document.getElementsByClassName("userInput");

var playAudioFileButton = document.getElementById("playAudioFileButton");
var pauseAudioFileButton = document.getElementById("pauseAudioFileButton");
var rewindAudioFileButton = document.getElementById("rewindAudioFileButton");

var demoTrackInput = document.getElementById("demoTrackInput");
var trackChoice = "";
var previousTrackChoice = "";

var audioElementInitialized = false;

var audioElement = document.getElementById('audioElement');

var micrphoneButton = document.getElementById("micrphoneButton");

var microphoneOnFlag = false;
var localStream;

var demoTrackRadio = document.getElementById("demoTrackRadio");
var uploadTrackRadio = document.getElementById("uploadTrackRadio");

var demoTrackDiv = document.getElementById("demoTrackDiv");
var uploadTrackDiv = document.getElementById("uploadTrackDiv");

var volumeMultiplier = 1;

var toggleMenuButton = document.getElementById("toggleMenuButton");
var showMenu = true;

var menuTable = document.getElementById("menuTable");

var delayInMilliseconds = 0;

var navMenuHeight = document.getElementById('navMenuDiv').clientHeight;

var svgHeight = svgContainerDiv.clientHeight;
var svgWidth = svgContainerDiv.clientWidth;

//Visualization Inputs
var barPadding = 1;
var numBars = 400;
var numCircles = 25;
var numCircles2 = 75;
var numCircles3 = 400;
var circles3Cols = 40;
var circles3Rows = numCircles3 / circles3Cols;
var circles3BottomMargin = 100;

var numDancingCircles = 200;
var dancingCirclesData = d3.range(0, 2 * Math.PI, 2 * Math.PI / numDancingCircles);

var wavesRows = 8;
var wavesCols = 3;
var wavesData = d3.range(1, wavesRows);

var wireData = d3.range(-4 * Math.PI, 4 * Math.PI, 0.01);

var barsFrequencyData = new Uint8Array(numBars);
var circlesFrequencyData = new Uint8Array(numCircles);
var circles2FrequencyData = new Uint8Array(numCircles2);
var circles3FrequencyData = new Uint8Array(numCircles3);
var dancingCirclesFrequencyData = new Uint8Array(numDancingCircles);
var wavesFrequencyData = new Uint8Array(wavesRows);
var wireFrequencyData = new Uint8Array(1);


//Colour palettes -- background, shape fill, shape outline
var palette1 = ["#78B7C5", "#EBCC2A", "rgb(59,154,178)"];
var palette2 = ['#F4ECFF', "#57EBF5", "#FFAAF6"];
var palette3 = ["rgb(0,0,0)", "rgb(255,255,255)", "rgb(100,100,100)"];
var palette4 = ["#5B1A18", "#FD6467", "#F1BB7B"];
var palette5 = ["#2f5575", "#94f0dc", "rgb(255,255,255)"];
var palette6 = ["#f1faee", "#e63946", "#a8dadc"];
var palette7 = ["#e0c3fc", "#4d194d", "#b5179e"];
var palette8 = ["#652EC7", "#FFD300", "#DE38C8"];
var palette9 = ["#B2FAFF", "#FF9472", "#FC6E22"];

var backgroundColour;
var fillColour;
var strokeColour;

console.log("SVG height: "+svgHeight);
console.log("Visualization choice: "+visualizationChoice);

//main method
addEventListeners();
getUserInputs();
setSvgSize();
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioSrc;
var analyser = audioCtx.createAnalyser();

//event listeners for user input menus
function addEventListeners(){

    for(i=0; i<userInputArray.length; i++){
        userInputArray[i].addEventListener("change", refresh);
        console.log ("add refresh event listener");
    }

    document.getElementById("microphoneButton").addEventListener("click", useMicrophone);
    
    //demo track vs upload track menu
    demoTrackRadio.addEventListener("click", showDemoTrackMenu);
    uploadTrackRadio.addEventListener("click", showUploadTrackMenu);

    //Play button functionality
    playAudioFileButton.addEventListener("click", clickPlayButton);

    //Pause button functionality
    pauseAudioFileButton.addEventListener("click", clickPauseButton);

    //Rewind button functionality
    rewindAudioFileButton.addEventListener("click", clickRewindButton);

    //toggle menu button
    toggleMenuButton.addEventListener("click", toggleMenu);

}

function setSvgSize(){
    setTimeout(function() {
        navMenuHeight = document.getElementById('navMenuDiv').clientHeight;
    
        svgContainerDiv.style.height = (window.innerHeight - navMenuHeight - 12)+"px";
        mainSvg.style.height = (window.innerHeight - navMenuHeight - 12)+"px";
        
        console.log("Window innerHeight: "+window.innerHeight);
        console.log("navMenuHeight: "+navMenuHeight);
        console.log("svgContainerDivHeight: "+svgContainerDiv.style.height);

        svgHeight = svgContainerDiv.clientHeight;
        svgWidth = svgContainerDiv.clientWidth;
        
    }, delayInMilliseconds);
}

function toggleMenu(){
    if(showMenu == true){
        menuTable.classList.add("hide");
        toggleMenuButton.innerHTML = "Show Menu <i class=\"fa-solid fa-eye\"></i>";
        showMenu = false;
        setSvgSize();
    } else {
        menuTable.classList.remove("hide");
        toggleMenuButton.innerHTML = "Hide Menu <i class=\"fa-solid fa-eye-slash\"></i>";
        showMenu = true;
        setSvgSize();
    }
}

function showDemoTrackMenu(){
    demoTrackDiv.classList.remove("hide");
    uploadTrackDiv.classList.add("hide");
}

function showUploadTrackMenu(){
    demoTrackDiv.classList.add("hide");
    uploadTrackDiv.classList.remove("hide");
}

function getUserInputs(){
    trackChoice = String(demoTrackInput.value);
    var trackChanged = false;

    console.log("Previous track choice: "+previousTrackChoice+", current track choice: "+trackChoice);

    if(trackChoice != previousTrackChoice){
        trackChanged = true;
    }

    previousTrackChoice = trackChoice;

    if(trackChoice == "Homeshake" && trackChanged){
        console.log("change track");
        audioElement.setAttribute('src', './audio/Homeshake - Like Mariah.mp3');
    } else if(trackChoice == "MenITrust" && trackChanged){
        console.log("change track");
        audioElement.src = "./audio/Men I Trust - Seven.mp3";
    } else if(trackChoice == "Guaraldi" && trackChanged){
        console.log("change track");
        audioElement.src = "./audio/Vince Guaraldi - Rain Rain Go Away.mp3";
    } else if(trackChoice == "Kikagaku" && trackChanged){
        console.log("change track");
        audioElement.src = "./audio/Kikagaku Moyo - Nazo Nazo.mp3";
    } else if(trackChoice == "Cibo" && trackChanged){
        console.log("change track");
        audioElement.src = "./audio/CIBO MATTO - Moonchild.mp3";
    } else if(trackChoice == "userUpload"){

    }

    visualizationChoice = String(visualizationMenu.value);
    colourChoice = String(colourMenu.value);

    console.log("Track choice: " +trackChoice);
    console.log("Colour choice: " +colourChoice);
    console.log("Visualization choice: "+visualizationChoice);
}

function refresh(){
    
    console.log("refresh");

    getUserInputs();

    //try to cancel all outstanding animation frame requests
    for(i=0; i<100000; i++){
        window.cancelAnimationFrame(i);
    }

    d3.selectAll('*').transition();
    svg.selectAll('*').remove();
    
    runVisualization();

}

function useMicrophone(){

    volumeMultiplier = 1;

    //toggle flag true/false each time the button is pressed
    if(microphoneOnFlag == false){
        microphoneOnFlag = true;
        microphoneButton.innerHTML = "Mic <i class=\"fa-solid fa-microphone-lines-slash\"></i>";
        microphoneButton.style.border = "2px solid rgb(117, 62, 219)";
    } else {
        microphoneOnFlag = false;
        microphoneButton.innerHTML = "Mic   <i class=\"fa-solid fa-microphone-lines\"></i>";
        microphoneButton.style.border = "2px solid rgb(180, 180, 180)";
    }

    if(microphoneOnFlag == true){

        audioCtx.resume().then(() => {
            console.log('Playback resumed successfully');
        });

        navigator.mediaDevices.getUserMedia ({
            audio: {
                latency: 0.02,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                mozNoiseSuppression: false,
                mozAutoGainControl: false},
            video: false})

        .then(function(stream) {
        
            localStream = stream;

            audioSrc = audioCtx.createMediaStreamSource(stream);
            
            // Bind our analyser to the media element source.
            audioSrc.connect(analyser);
            
            //The line below would connect the audio source to the "destination" (i.e., computer speakers)
            //This causes audio feedback when recording without having headphones plugged in
            //audioSrc.connect(audioCtx.destination);

            runVisualization();
        })

    } else {
        localStream.getTracks()[0].stop();
    }
}

function readFile(files) {
    var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        fileReader.onload = function(e) {
            
            audioElement.setAttribute('src', URL.createObjectURL(files[0]));
            audioElement.load();

            console.log(("Filename: '" + files[0].name + "'"), ( "(" + ((Math.floor(files[0].size/1024/1024*100))/100) + " MB)" ));

            trackChoice = "userUpload";
            
            //playAudioFile(e.target.result);
            clickPlayButton();

        }

}

function clickPlayButton(){
    
    playAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    pauseAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    useAudioFile();

}

function clickPauseButton(){
    playAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    pauseAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    audioElement.pause();
}

function clickRewindButton(){
    playAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    pauseAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    audioElement.currentTime=0;
    audioElement.play();
}

function useAudioFile(){
    
    console.log("Use audio file");

    //Change volume for demo and uploaded tracks, to equalize volume with user mic
    volumeMultiplier = 0.8;

    /* One-liner below is to resume playback when user interacted with the page.
    This is needed because Google does not allow audio to play until the user has interacted with the page
    https://developer.chrome.com/blog/autoplay/#webaudio */
    audioCtx.resume().then(() => {
        console.log('Playback resumed successfully');
    });

    if(audioElementInitialized == false){
        audioSrc = audioCtx.createMediaElementSource(audioElement);
        audioElementInitialized = true;
    }

    // Bind our analyser to the media element source.
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);

    audioElement.play();

    runVisualization();

}

function changeDemoTrack(){
    refresh();
    //clickPauseButton();
    clickPlayButton();
}


/*
function playAudioFile(file) {
    
    audioCtx.decodeAudioData(file, function(buffer) {
        audioSrc = audioCtx.createBufferSource();
        audioSrc.buffer = buffer;
        audioSrc.loop = false;
        audioSrc.connect(audioCtx.destination);
        audioSrc.start(0);
        audioSrc.connect(analyser);
    });

    //audioSrc = audioCtx.createMediaElementSource(file);

    // Bind our analyser to the media element source.
    //audioSrc.connect(audioCtx.destination);

    runVisualization();
}
*/


function runVisualization() {

    if(colourChoice == "Zissou"){
        backgroundColour = palette1[0];
        fillColour = palette1[1];
        strokeColour = palette1[2];
    } else if(colourChoice == "Vapor"){
        backgroundColour = palette2[0];
        fillColour = palette2[1];
        strokeColour = palette2[2];
    } else if(colourChoice == "Noir"){
        backgroundColour = palette3[0];
        fillColour = palette3[1];
        strokeColour = palette3[2];
    } else if(colourChoice == "Budapest"){
        backgroundColour = palette4[0];
        fillColour = palette4[1];
        strokeColour = palette4[2];
    } else if(colourChoice == "Sea"){
        backgroundColour = palette5[0];
        fillColour = palette5[1];
        strokeColour = palette5[2];
    } else if(colourChoice == "Cherry"){
        backgroundColour = palette6[0];
        fillColour = palette6[1];
        strokeColour = palette6[2];
    } else if(colourChoice == "Violet"){
        backgroundColour = palette7[0];
        fillColour = palette7[1];
        strokeColour = palette7[2];
    } else if(colourChoice == "Lakers"){
        backgroundColour = palette8[0];
        fillColour = palette8[1];
        strokeColour = palette8[2];
    } else if(colourChoice == "Tangerine"){
        backgroundColour = palette9[0];
        fillColour = palette9[1];
        strokeColour = palette9[2];
    }

    //set background colour
    svgContainerDiv.style.backgroundColor = backgroundColour;

    if(visualizationChoice == "bars"){

        console.log("Run bars visualization");

        analyser.smoothingTimeConstant = 0.8;

        // Create our initial D3 chart.
        svg.selectAll('rect')
        .data(barsFrequencyData)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return i * (svgWidth / barsFrequencyData.length);
        })
        .attr('width', svgWidth / barsFrequencyData.length - barPadding);
    
        // Continuously loop and update chart with frequency data.
        function renderBarChart() {
            requestAnimationFrame(renderBarChart);
        
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(barsFrequencyData);
        
            var heightMultiplier = 2.25;

            // Update d3 chart with new data.
            svg.selectAll('rect')
                .data(barsFrequencyData)
                .attr('y', function(d) {
                    //return svgHeight - d;
                    return svgHeight/2 - d*heightMultiplier*volumeMultiplier/2;
                })
                .attr('height', function(d) {
                    //return d;
                    return d*heightMultiplier*volumeMultiplier;
                })
                .attr('fill', fillColour);
        }
    
        // Run the loop
        renderBarChart();

    }

    else if(visualizationChoice == "circles"){
        console.log("Run circles visualization");

        analyser.smoothingTimeConstant = 0.8;

        // Create our initial D3 chart.
        svg.selectAll('circle')
        .data(circlesFrequencyData)
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return i * (svgWidth / circlesFrequencyData.length);
        })
        .attr('cy', function (d, i) {
            return svgHeight - (i * (svgHeight / circlesFrequencyData.length));
            //return svgHeight/2;
        })
        .attr('r', '2')
        .attr('stroke', strokeColour)
        .attr('stroke-width', '2')
        .attr('opacity',function (d, i) {
            return Math.random()+0.05;
        });
    
        // Continuously loop and update chart with frequency data.
        function renderCircleChart() {
            requestAnimationFrame(renderCircleChart);
        
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circlesFrequencyData);
        
            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circlesFrequencyData)
                .attr('r', function(d) {
                    return Math.pow(d*volumeMultiplier,0.85)*1.5;
                })
                .attr('fill', fillColour);
        }
    
        // Run the loop
        renderCircleChart();
        
    }

    else if(visualizationChoice == "circles2"){
        console.log("Run circles2 visualization");

        svg.selectAll("circle").remove();

        analyser.smoothingTimeConstant = 0.75;

        // Create our initial D3 chart.
        svg.selectAll('circle')
            .data(circles2FrequencyData)
            .enter()
            .append('circle')
            .attr('cx', function (d, i) {
                return i * (svgWidth / circles2FrequencyData.length);
            })
            .attr('cy', function (d, i) {
                return Math.random() * svgHeight;
                //return svgHeight/2;
            })
            .attr('r', '2')
            .attr('stroke', strokeColour)
            .attr('stroke-width', '2')
            .attr('opacity',function (d, i) {
                return Math.random()+0.25;
            });
    
        // Continuously loop and update chart with frequency data.
        function renderCircle2Chart() {
            requestAnimationFrame(renderCircle2Chart);
        
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circles2FrequencyData);
        
            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circles2FrequencyData)
                .attr('r', function(d) {
                    return Math.pow(d*volumeMultiplier,1.1)*0.2;
                })
                .attr('fill', fillColour);
        }
    
        // Run the loop
        renderCircle2Chart();
    }

    else if(visualizationChoice == "circles3"){
        console.log("Run circles3 visualization");

        svg.selectAll("circle").remove();
        analyser.smoothingTimeConstant = 0.8;

        // Create our initial D3 chart.
        svg.selectAll('circle')
            .data(circles3FrequencyData)
            .enter()
            .append('circle')
            .attr('cx', function (d, i) {
                return (i % circles3Cols) * (svgWidth / circles3Cols);
            })
            .attr('cy', function (d, i) {
                return (svgHeight - circles3BottomMargin) - (Math.floor(i / circles3Cols) * (svgHeight / circles3Rows));
            })
            .attr('r', '2')
            .attr('stroke', strokeColour)
            .attr('stroke-width', '2');
    
        // Continuously loop and update chart with frequency data.
        function renderCircle3Chart() {
            requestAnimationFrame(renderCircle3Chart);
        
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circles3FrequencyData);
        
            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circles3FrequencyData)
                .attr('r', function(d) {
                    return Math.max(Math.pow(d*volumeMultiplier,1.1)*0.4-60,0);
                })
                .attr('fill', fillColour);
        }
    
        // Run the loop
        renderCircle3Chart();
    }

    else if(visualizationChoice == "dancingCircles"){
        console.log("Run dancing circles visualization");

        var count = d3.selectAll("circle").size()
        console.log("# of circles: "+count);

        analyser.smoothingTimeConstant = 0.85;

        svg.selectAll("circle")
            .data(dancingCirclesData)
            .enter().append("circle")
            .attr("r",20)
            .attr("fill", fillColour)
            .attr("stroke", strokeColour)
            .attr("fill-opacity", 0.65);
    
        /*
        timer = d3.timer(function(t) {
            console.log("run timer function");
            timerFlag = true;

            if(visualizationChoice == "dancingCircles"){
                t /= 10000;

                svg.selectAll("circle").attr("cx", function(d) {
                    return 565 * Math.sin(3 * d * t) + svgWidth/2;
                });
    
                svg.selectAll("circle").attr("cy", function(d) {
                    return 300 * Math.sin(2 * d * t) + svgHeight/2;
                });
            }

        });
        */

        count = d3.selectAll("circle").size()
        console.log("# of circles: "+count);

        // Continuously loop and update chart with frequency data.
        function renderdancingCirclesChart() {
            requestAnimationFrame(renderdancingCirclesChart);
        
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(dancingCirclesFrequencyData);
        
            // Update d3 chart with new data.

            animateDancingCircles();

            svg.selectAll("circle")
                .attr('r', function(d, i) {
                    if(visualizationChoice == "dancingCircles"){
                        return Math.max( 0, Math.pow(dancingCirclesFrequencyData[i] * volumeMultiplier,0.95) -60 );
                    } else {
                        return 0;
                    }
                });
        }
    
        // Run the loop
        renderdancingCirclesChart();

    }
    
    else if(visualizationChoice == "waves"){
        console.log("Run waves visualization");

        analyser.smoothingTimeConstant = 0.92;

        var g = svg.selectAll("g")
            .data(wavesData)
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + [0, (d - 1) * svgHeight / wavesRows] + ")";
            });

        var paths = g.append("path")
            .attr("fill", strokeColour)
            .attr("fill-opacity", 0.25);

        // Overlay bars onto the chartt
        svg.selectAll('rect')
        .data(barsFrequencyData)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return i * (svgWidth / barsFrequencyData.length);
        })
        .attr('width', svgWidth / barsFrequencyData.length - barPadding);
    
        // Continuously loop and update chart with frequency data.
        function renderWavesChart() {
            requestAnimationFrame(renderWavesChart);

            // Copy frequency data to frequencyData array.
            //analyser.getByteFrequencyData(wavesFrequencyData);

            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(barsFrequencyData);

            var heightMultiplier = 2.25;

            // Update d3 chart with new data.        
            var t = performance.now();
            //var t = d3.now();
            //console.log("animate -- d3.now() = "+d3.now());

            paths.attr("d", function(r) {
                return d3.area()
                    .curve(d3.curveBasis)
                    .y0(svgHeight)
                    .y1(function(d, i) {
                        var bounce = 0;
                        //bounce = Math.pow(wavesFrequencyData[i],0.70)*10;
                    
                        return 600 * (i % 2) - 150 + 20 * Math.sin(r + t / 1500000) - bounce;
                    })
                    .x(function(d) { return (r * t / 20) % (svgWidth / (wavesCols - 2)) + d * svgWidth / (wavesCols - 1); })
                    (d3.range(-3, wavesCols + 2));
            });

            /*
            svg.selectAll("path")
            .attr('fill-opacity', function(d, i) {
                return 0.25;
                //return 0.01 + wavesFrequencyData[i]/600;
                //return wavesFrequencyData[i]/2000;                
            });
            */

            svg.selectAll('rect')
                .data(barsFrequencyData)
                .attr('y', function(d) {
                    //return svgHeight - d;
                    return svgHeight/2 - d*heightMultiplier*volumeMultiplier/2;
                })
                .attr('height', function(d) {
                    //return d;
                    return d*heightMultiplier*volumeMultiplier;
                })
                .attr('fill', fillColour);

        }
    
        // Run the loop
        renderWavesChart();

    }

    else if(visualizationChoice == "wire"){
        console.log("Run wire visualization");

        analyser.smoothingTimeConstant = 0.8;

        var spiral = svg.append("path")
            .attr("transform", "translate(" + [svgWidth / 2, svgHeight / 2] + ")")
            .attr("fill", "none")
            .attr("stroke", fillColour)
            .attr("opacity", 1)
            .attr("stroke-width", 0.5);

        // Continuously loop and update chart with frequency data.
        function renderWireChart() {
            requestAnimationFrame(renderWireChart);

            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(wireFrequencyData);
        
            // Update d3 chart with new data.

            var t = performance.now();
            //var t = d3.now();
            //console.log("animate -- d3.now() = "+d3.now());

            var d = "M";

            var frequencySum = 0;
            for(var i=0; i<wireFrequencyData.length; i++){
                frequencySum += wireFrequencyData[i];
            }

            //console.log("wireData length: "+wireFrequencyData.length);
            //console.log("Frequency Sum: "+frequencySum);

            for (var i = 0; i < wireData.length; i++) {
                var p = wireData[i];
                d += 0.23 * svgWidth * (Math.sin((2 + 0.2 * Math.cos(t / 12000))  * p) + Math.sin(4.02 * p));
                d += ",";
                d += 0.23 * svgHeight * (Math.sin((3 + 0.2 * Math.cos(t / 12000)) * p) + Math.sin(6.02 * p));
                if (i != wireData.length - 1) d += "L";
            }

            d.length--;
            spiral.attr("d", d);


            svg.selectAll("path")
                .attr('stroke-width',Math.max(1,Math.min(8,1+Math.pow(frequencySum/80,2.5))));       

        }
    
        // Run the loop
        renderWireChart();

    }
    
}

function animateDancingCircles(){

    var t = performance.now();
    //var t = d3.now();
    //console.log("animate -- d3.now() = "+d3.now());

    if(visualizationChoice == "dancingCircles"){

        t /= 40000;

        svg.selectAll("circle").attr("cx", function(d) {
            return svgWidth/2.4 * Math.sin(3 * d * t) + svgWidth/2;
        });

        svg.selectAll("circle").attr("cy", function(d) {
            return svgHeight/2.4 * Math.sin(2 * d * t) + svgHeight/2;
        });
    } else {

    }
}


/*
function flushAllD3Transitions() {
    var now = performance.now;
    performance.now = function() { return Infinity; };
    d3.timerFlush();
    performance.now = now;
}
*/