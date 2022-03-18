/* To-dos and potential improvements:
- How to improve latency when using the microphone to record audio?
- Allow users to "create" their own music video -- add text, choose colours, upload music, export the file, etc...
- Add gradient / "textured" backgrounds?
- Feature to import audio from Spotify or YouTube URL?
- Auto-play next demo track after one track finishes?
- Reduce animation frame rate to improve performance / reduce compute?
- Less sensitivity to bass&percussion / more sensitivity to individual notes?
- Add "advanced options" menu with toggles for sensitivity, etc...?
- Grid visual: doesn't re-draw after show/hide menu toggle
- Spiral visual: active circles duplicated behind regular circles on first play (fixed after colour change?)
*/

var visualizationMenu = document.getElementById("visualizationMenu");
var visualizationChoice = String(visualizationMenu.value);

var colourMenu = document.getElementById("colourMenu");
var colourChoice = String(colourMenu.value);

var svgContainerDiv = document.getElementById("svgContainerDiv");
var mainSvg = document.getElementById("mainSvg");

var grainOpacityValue = 0.05;

var grainOptions = {
    animate: false,
    patternWidth: 400,
    patternHeight: 400,
    grainOpacity: grainOpacityValue,
    grainDensity: 1.5,
    grainWidth: 2.5,
    grainHeight: 2.0,
};

grained('#svgContainerDiv',grainOptions);

var isGrainOn = true;
var grainArray = document.getElementsByClassName("grained");


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

var initialVolumeMultiplier = 0.80;
var microphoneVolumeMultiplier = 0.92;
var volumeMultiplier = initialVolumeMultiplier;

var toggleMenuButton = document.getElementById("toggleMenuButton");
var showMenu = true;

var menuTable = document.getElementById("menuTable");

var delayInMilliseconds = 0;

var navMenuHeight = document.getElementById('navMenuDiv').clientHeight;

var svgHeight = svgContainerDiv.clientHeight;
var svgWidth = svgContainerDiv.clientWidth;

var infoMenuTable = document.getElementById("infoMenuTable");

var isAudioPlaying = false;

//var fps = 30;

//Visualization Inputs
var barPadding = 1;
var numBars = 400;
var numCircles = 25;
var numCircles2 = 100;
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

var joyPlotN = 360;
var joyPlotRows = 3;
var joyPlotCols = joyPlotN / joyPlotRows;

var numCellWidth = 25;
var numCellHeight = 20;
var numCells = numCellHeight * numCellWidth;
var maxCellStrokeWidth = 7;

var numRings = 10;

var barsFrequencyData = new Uint8Array(numBars);
var circlesFrequencyData = new Uint8Array(numCircles);
var circles2FrequencyData = new Uint8Array(numCircles2);
var circles3FrequencyData = new Uint8Array(numCircles3);
var dancingCirclesFrequencyData = new Uint8Array(numDancingCircles);
var wavesFrequencyData = new Uint8Array(wavesRows);
var wireFrequencyData = new Uint8Array(1);
var joyPlotFrequencyData = new Uint8Array(joyPlotN);
var ringsFrequencyData = new Uint8Array(numRings);

var shapeSizeMultiplier = 1;


//Colour palettes -- background, shape fill, shape outline
var palette1 = ["#78B7C5", "#EBCC2A", "rgb(59,154,178)"];
var palette2 = ['#F4ECFF', "#57EBF5", "#FFAAF6"];
var palette3 = ["rgb(0,0,0)", "#FFFFFF", "rgb(100,100,100)"];
var palette4 = ["#5B1A18", "#FD6467", "#F1BB7B"];
var palette5 = ["#2f5575", "#94f0dc", "rgb(255,255,255)"];
var palette6 = ["#f1faee", "#e63946", "#a8dadc"];
var palette7 = ["#e0c3fc", "#4d194d", "#b5179e"];
var palette8 = ["#652EC7", "#FFD300", "#DE38C8"];
var palette9 = ["#B2FAFF", "#FF9472", "#FC6E22"];
var palette10 = ["#C6FFF1", "#FF36AB", "#6153CC"];
var palette11 = ["#f6d166", "#287e87", "#df2d2d"];

var backgroundColour;
var fillColour;
var strokeColour;

console.log("SVG height: "+svgHeight);
console.log("Visualization choice: "+visualizationChoice);

// Keep track of clicked keys
var isKeyPressed = {
    'c': false, // ASCII code for 'c'
    'v': false,
    'm': false,
    'p': false,
    'r': false,
    'g': false,

};
 
document.onkeydown = (keyDownEvent) => {
  
    //Prevent default key actions, if desired
    //keyDownEvent.preventDefault();
        
    // Track down key click
    isKeyPressed[keyDownEvent.key] = true;
        
    // Check described custom shortcut
    if (isKeyPressed["c"]) {
        changeColour();
    }

    if (isKeyPressed["v"]) {
        changeVisualization();
    }

    if (isKeyPressed["m"]) {
        toggleMenu();
    }

    if (isKeyPressed["p"]) {
        toggleAudioPlay();
    }
    
    if (isKeyPressed["r"]) {
        clickRewindButton();
    }

    if (isKeyPressed["g"]) {
        toggleGrain();
    }
};
     
document.onkeyup = (keyUpEvent) => {
    
    // Prevent default key actions, if desired
    //keyUpEvent.preventDefault();
        
    // Track down key release
    isKeyPressed[keyUpEvent.key] = false;

};

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
        navMenuHeight = document.getElementById('navMenuDiv').clientHeight;
    
        svgContainerDiv.style.height = (window.innerHeight - navMenuHeight - 0)+"px";
        mainSvg.style.height = (window.innerHeight - navMenuHeight - 0)+"px";
        
        console.log("Window innerHeight: "+window.innerHeight);
        console.log("navMenuHeight: "+navMenuHeight);
        console.log("svgContainerDivHeight: "+svgContainerDiv.style.height);

        svgHeight = svgContainerDiv.clientHeight;
        svgWidth = svgContainerDiv.clientWidth;
}

function toggleMenu(){
    if(showMenu == true){

        menuTable.classList.add('zeroOpacity');
        infoMenuTable.classList.add('zeroOpacity');

        setTimeout(function () {
            menuTable.classList.add("hide");
            infoMenuTable.classList.add("hide");
            toggleMenuButton.innerHTML = "Show Menu <i class=\"fa-solid fa-eye\"></i>";
            showMenu = false;
            setSvgSize();
        }, 200);

    } else {
        menuTable.classList.remove("hide");
        infoMenuTable.classList.remove("hide");

        setTimeout(function () {
            menuTable.classList.remove("zeroOpacity");
            infoMenuTable.classList.remove("zeroOpacity");
            toggleMenuButton.innerHTML = "Hide Menu <i class=\"fa-solid fa-eye-slash\"></i>";
            showMenu = true;
            setSvgSize();
        }, 50);

    }
}

function toggleGrain(){
    
    console.log("toggle grain function");
    console.log(grainArray);

    if(isGrainOn == true){
        grainOptions = {
            grainOpacity: 0.00,
        };

        isGrainOn = false;

    } else{
        grainOptions = {
            animate: false,
            patternWidth: 400,
            patternHeight: 400,
            grainOpacity: grainOpacityValue,
            grainDensity: 1.5,
            grainWidth: 2.5,
            grainHeight: 2.0,
        };

        isGrainOn = true;

    }

    grained('#svgContainerDiv',grainOptions);

    refresh();

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
    } else if(trackChoice == "Aphex" && trackChanged){
        console.log("change track");
        audioElement.src = "./audio/Aphex Twin - SsbA.mp3";
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
    for(i=0; i<50000; i++){
        window.cancelAnimationFrame(i);
    }

    d3.selectAll('*').transition();
    svg.selectAll('*').remove();

    setSvgSize();
    runVisualization();

}

function changeColour(){
    console.log("change colour function");

    var colourOptions = [];
    var selectedColour;
    var selectedPosition;
    var nextColour;

    for(var i=0; i < colourMenu.options.length; i++){
        var current = colourMenu.options[i].value;        
        colourOptions.push(current);

        if(colourMenu.value == current){
            selectedColour = current;
            selectedPosition = i;
            
            if(selectedPosition == colourMenu.options.length-1){
                nextColour = colourMenu.options[0].value
            } else{
                nextColour = colourMenu.options[selectedPosition+1].value;
            }
        }

    }

    console.log("Selected colour: "+selectedColour);
    console.log("Next colour: "+nextColour);

    colourMenu.value = nextColour;
    refresh();

}

function changeVisualization(){
    console.log("change visualization function");

    var visualizationOptions = [];
    var selectedVisualization;
    var selectedPosition;
    var nextVisualization;

    for(var i=0; i < visualizationMenu.options.length; i++){
        var current = visualizationMenu.options[i].value;        
        visualizationOptions.push(current);

        if(visualizationMenu.value == current){
            selectedVisualization = current;
            selectedPosition = i;
            
            if(selectedPosition == visualizationMenu.options.length-1){
                nextVisualization = visualizationMenu.options[0].value
            } else{
                nextVisualization = visualizationMenu.options[selectedPosition+1].value;
            }
        }

    }

    console.log("Selected visualization: "+selectedVisualization);
    console.log("Next visualization: "+nextVisualization);

    visualizationMenu.value = nextVisualization;
    refresh();

}

function useMicrophone(){

    refresh();

    //toggle flag true/false each time the button is pressed
    if(microphoneOnFlag == false){
        microphoneOnFlag = true;
        volumeMultiplier = microphoneVolumeMultiplier;
        microphoneButton.innerHTML = "Mic <i class=\"fa-solid fa-microphone-lines-slash\"></i>";
        microphoneButton.style.border = "2px solid rgb(117, 62, 219)";
    } else {
        volumeMultiplier = initialVolumeMultiplier;
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
    
    isAudioPlaying = true;

    playAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    pauseAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    useAudioFile();

}

function clickPauseButton(){
    
    isAudioPlaying = false;

    playAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    pauseAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    audioElement.pause();

}

function clickRewindButton(){

    isAudioPlaying = true;
    
    playAudioFileButton.style.border = "2px solid rgb(117, 62, 219)";
    pauseAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";
    rewindAudioFileButton.style.border = "2px solid rgb(180, 180, 180)";

    audioElement.currentTime=0;
    
    clickPlayButton();
    //audioElement.play();

}

function toggleAudioPlay(){
    if(isAudioPlaying == true){
        clickPauseButton();
    } else{
        clickPlayButton();
    }
}

function useAudioFile(){
    
    console.log("Use audio file");

    refresh();

    //Change volume for demo and uploaded tracks, to equalize volume with user mic
    volumeMultiplier = initialVolumeMultiplier;

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
    isAudioPlaying = true;

    runVisualization();

}

function changeDemoTrack(){
    refresh();
    //clickPauseButton();
    clickPlayButton();
}


function runVisualization() {

    //reduce shape size on small screens & mobile devices

    if(svgWidth < 500){
        barPadding = 0;
        numBars = 200;
        numCircles = 15;
        numCircles2 = 50;
        numCircles3 = 175;
        circles3Cols = 25;
        circles3Rows = numCircles3 / circles3Cols;
        circles3BottomMargin = 50;
    
        numDancingCircles = 75;
        dancingCirclesData = d3.range(0, 2 * Math.PI, 2 * Math.PI / numDancingCircles);
    
        wavesRows = 8;
        wavesCols = 3;
        wavesData = d3.range(1, wavesRows);
    
        wireData = d3.range(-4 * Math.PI, 4 * Math.PI, 0.01);
    
        joyPlotN = 300;
        joyPlotRows = 3;
        joyPlotCols = joyPlotN / joyPlotRows;
    
        barsFrequencyData = new Uint8Array(numBars);
        circlesFrequencyData = new Uint8Array(numCircles);
        circles2FrequencyData = new Uint8Array(numCircles2);
        circles3FrequencyData = new Uint8Array(numCircles3);
        dancingCirclesFrequencyData = new Uint8Array(numDancingCircles);
        wavesFrequencyData = new Uint8Array(wavesRows);
        wireFrequencyData = new Uint8Array(1);
        joyPlotFrequencyData = new Uint8Array(joyPlotN);
    
        shapeSizeMultiplier = 0.45;
    }

    var maxCircleSize = Math.min(svgWidth * 0.09, svgHeight*0.09);

    //select colours based on user input
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
    } else if(colourChoice == "Berry"){
        backgroundColour = palette10[0];
        fillColour = palette10[1];
        strokeColour = palette10[2];
    } else if(colourChoice == "Retro"){
        backgroundColour = palette11[0];
        fillColour = palette11[1];
        strokeColour = palette11[2];
    }

    //convert fill colour HEX into RGB instead

    var fillR = parseInt(fillColour.substr(1,2), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
    var fillG = parseInt(fillColour.substr(3,2), 16);
    var fillB = parseInt(fillColour.substr(5,2), 16);

    //get Hue of RGB fill colour (first element of HSL -- Hue, Saturation, Lightness)
    var fillHue = rgbToHsl(fillR, fillG, fillB)[0] * 360;

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
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(barsFrequencyData);
        
            var heightMultiplier = 2.25;

            requestAnimationFrame(renderBarChart);

            // Update d3 chart with new data.
            svg.selectAll('rect')
                .data(barsFrequencyData)
                .attr('y', function(d) {
                    //return svgHeight - d;
                    return svgHeight/2 - d*heightMultiplier*volumeMultiplier/2;
                })
                .attr('height', function(d) {
                    //return d;
                    return d*heightMultiplier*volumeMultiplier*(shapeSizeMultiplier*0.8);
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
       
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circlesFrequencyData);


            requestAnimationFrame(renderCircleChart);

            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circlesFrequencyData)
                .attr('r', function(d) {
                    return Math.pow(d*volumeMultiplier*shapeSizeMultiplier,0.85)*1.5;
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
            .attr('opacity', 0.65);
    
        // Continuously loop and update chart with frequency data.
        function renderCircle2Chart() {
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circles2FrequencyData);


            requestAnimationFrame(renderCircle2Chart);


            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circles2FrequencyData)
                .attr('r', function(d) {
                    return Math.pow(d*volumeMultiplier*shapeSizeMultiplier,1.3)*0.08;
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
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(circles3FrequencyData);

            requestAnimationFrame(renderCircle3Chart);

            // Update d3 chart with new data.
            svg.selectAll('circle')
                .data(circles3FrequencyData)
                .attr('cx', function (d, i) {
                    return (i % circles3Cols) * (svgWidth / circles3Cols);
                })
                .attr('cy', function (d, i) {
                    return (svgHeight - circles3BottomMargin) - (Math.floor(i / circles3Cols) * (svgHeight / circles3Rows));
                })
                .attr('r', function(d) {
                    return Math.min(maxCircleSize, Math.max(Math.pow(d*volumeMultiplier*(shapeSizeMultiplier*1.2),1.05)*0.4-(50*shapeSizeMultiplier),0));
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
    
        count = d3.selectAll("circle").size()
        console.log("# of circles: "+count);

        // Continuously loop and update chart with frequency data.
        function renderDancingCirclesChart() {
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(dancingCirclesFrequencyData);

            requestAnimationFrame(renderDancingCirclesChart);

            // Update d3 chart with new data.

            animateDancingCircles();

            svg.selectAll("circle")
                .attr('r', function(d, i) {
                    if(visualizationChoice == "dancingCircles"){
                        return Math.min(maxCircleSize, Math.max(0, Math.pow(dancingCirclesFrequencyData[i] * volumeMultiplier * shapeSizeMultiplier,0.93) - (60*shapeSizeMultiplier) ));
                    } else {
                        return 0;
                    }
                });
        }
    
        // Run the loop
        renderDancingCirclesChart();

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
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(barsFrequencyData);

            requestAnimationFrame(renderWavesChart);

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
            
            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(wireFrequencyData);   


            requestAnimationFrame(renderWireChart);


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

    else if(visualizationChoice == "joyPlot"){
        console.log("Run joyPlot visualization");

        analyser.smoothingTimeConstant = 0.92;

        var frequencyMax = 255;
        var opacity = 1.0;
        var strokeWidth = 2;

        var offset1 = 0;
        var offset2 = 60;
        var offset3 = 120;

        var chartHeightMultiplier = 1.4;
        var joyPlotExponent = 0.92;

        var data1 = new Uint8Array(joyPlotCols);
        var data2 = new Uint8Array(joyPlotCols);
        var data3 = new Uint8Array(joyPlotCols);

        // X scale will fit all values from data[] within pixels 0-w
        var x = d3.scaleLinear().domain([0, joyPlotCols]).range([0, svgWidth+0]);
        // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
        var y = d3.scaleLinear().domain([0, frequencyMax*chartHeightMultiplier]).range([svgHeight, 0]);
            // automatically determining max range can work something like this
            // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

        /*
        // create a line function that can convert data[] into x and y points
        var line = d3.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                // return the X coordinate where we want to plot this datapoint
                return x(i); 
            })
            .y(function(d) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                // return the Y coordinate where we want to plot this datapoint
                return y(d); 
            })
            .curve(d3.curveBasis);


        /*
        svg.append("path")
            .attr("stroke",fillColour)
            .attr("stroke-width","2")
            .attr("fill","none")
            .attr("d", line(joyPlotFrequencyData));
        */

        // Add the area

        var path3 = svg.append("path")
            .datum(data3)
            .attr("fill", fillColour)
            .attr("fill-opacity",opacity-0.7)
            .attr("stroke", strokeColour)
            .attr("stroke-width", strokeWidth)
            .attr("d", d3.area()
                .x(function(d,i) { return x(i) })
                .y0(y(0))
                .y1(function(d) { return y(d+offset3) })
                .curve(d3.curveBasis)
            );

        var path2 = svg.append("path")
            .datum(data2)
            .attr("fill", fillColour)
            .attr("fill-opacity",opacity-0.6)
            .attr("stroke", strokeColour)
            .attr("stroke-width", strokeWidth)
            .attr("d", d3.area()
                .x(function(d,i) { return x(i) })
                .y0(y(0))
                .y1(function(d) { return y(d+offset2) })
                .curve(d3.curveBasis)
            );

        var path1 = svg.append("path")
            .datum(data1)
            .attr("fill", fillColour)
            .attr("fill-opacity",opacity)
            .attr("stroke", strokeColour)
            .attr("stroke-width", strokeWidth)
            .attr("d", d3.area()
                .x(function(d,i) { return x(i) })
                .y0(y(0))
                .y1(function(d) { return y(d) })
                .curve(d3.curveBasis)
            );

    
        // Continuously loop and update chart with frequency data.
        function renderJoyPlotChart() {
            
            x = d3.scaleLinear().domain([0, joyPlotCols]).range([0, svgWidth+10]);
            y = d3.scaleLinear().domain([0, frequencyMax*chartHeightMultiplier]).range([svgHeight, 0]);

            // Copy frequency data to frequencyData array.
            analyser.getByteFrequencyData(joyPlotFrequencyData);

            for(var i=0; i<joyPlotFrequencyData.length; i++){
                //console.log("allocate joyPlot frequency data");
                if(i < joyPlotFrequencyData.length*(1/3)){
                    data1[i] = Math.pow(joyPlotFrequencyData[i],joyPlotExponent);

                } else if(i < joyPlotFrequencyData.length*(2/3)){
                    data2[i-(joyPlotFrequencyData.length*(1/3))] = Math.pow(joyPlotFrequencyData[i],joyPlotExponent);
                
                } else{
                    data3[i-(joyPlotFrequencyData.length*(2/3))] = Math.pow(joyPlotFrequencyData[i],joyPlotExponent);
                
                }
            }

            requestAnimationFrame(renderJoyPlotChart);

            path1
                .attr("d", d3.area()
                    .x(function(d,i) { return x(i) })
                    .y0(y(0))
                    .y1(function(d) { return y(d) })
                    .curve(d3.curveBasis)
                )

            path2
                .attr("d", d3.area()
                    .x(function(d,i) { return x(i) })
                    .y0(y(0))
                    .y1(function(d) { return y(d+offset2) })
                    .curve(d3.curveBasis)
                )

            path3
                .attr("d", d3.area()
                    .x(function(d,i) { return x(i) })
                    .y0(y(0))
                    .y1(function(d) { return y(d+offset3) })
                    .curve(d3.curveBasis)
                )

        }

        // Run the loop
        renderJoyPlotChart();


    }

    else if(visualizationChoice == "grid"){
        console.log("Run grid visualization");

        analyser.smoothingTimeConstant = 0.94;

        if(svgWidth < 500){
            numCellWidth = 10;
            numCellHeight = 20;
            numCells = numCellHeight * numCellWidth;
            maxCellStrokeWidth = 3;
        }

        var cellWidth = svgWidth / numCellWidth;
        var cellHeight = svgHeight / numCellHeight;

        console.log("numCellHeight: "+numCellHeight+", cellHeight: "+cellHeight+", "+" svgHeight: "+svgHeight);

        var maxOpacity = 0.7;
        var minStrokeWidth = 0.0;

        var exponent = 7;

        var gridFrequencyData = new Uint8Array(numCells);

        //set max range of colours, based on frequency input 
        var hueRange = 80;
        var hueStart = fillHue - hueRange/2;
        var hueEnd = fillHue + hueRange/2;

        var hueScale = d3.scaleLinear()
            .domain([0, 255])
            .range([hueStart, hueEnd]);

        //draw initial cell grid
        var rects = svg.selectAll('rect')
            .data(gridFrequencyData)
            .enter()
            .append('rect')
            .attr("fill-opacity",maxOpacity)
            .attr("stroke", strokeColour)
            .attr("fill", fillColour)
            .attr("stroke-width", minStrokeWidth)
            .attr("height",cellHeight)
            .attr("width",cellWidth)
            .attr("x",function(d,i){
                return i % numCellWidth * cellWidth;
            })
            .attr("y",function(d,i){
                return svgHeight - ((Math.floor(i / numCellWidth)+1) * cellHeight);
            });

        // Continuously loop and update chart with frequency data.
        function renderGridChart() {
    
            // Copy frequency data to array.
            analyser.getByteFrequencyData(gridFrequencyData);

            requestAnimationFrame(renderGridChart);

            rects
                .data(gridFrequencyData)
                .attr("fill", function(d) {
                    if(colourChoice == "Noir"){
                        return "white";
                    } else {
                        return d3.hsl(hueScale(d), 1, 0.5);
                    }
                })
                .attr("stroke-width",function(d){return Math.min(maxCellStrokeWidth, d/30+minStrokeWidth)})
                .attr("fill-opacity",function(d) {
                    return Math.min(Math.pow(d,exponent)/(Math.pow(255,exponent-1)/4),1)*maxOpacity;
                });

        }

        // Run the loop
        renderGridChart();

    }

    else if(visualizationChoice == "rings"){
        console.log("Run rings visualization");

        //set max range of colours, based on frequency input 
        var hueRange = 250;
        var hueStart = fillHue - hueRange/2;
        var hueEnd = fillHue + hueRange/2;

        analyser.smoothingTimeConstant = 0.9;

        if(svgWidth < 500){

        }

        // Continuously loop and update chart with frequency data.
        function renderRingsChart() {
    
            // Copy frequency data to array.
            analyser.getByteFrequencyData(ringsFrequencyData);

            requestAnimationFrame(renderRingsChart);

            // scale things to fit
            var radiusScale = d3.scalePow()
                .exponent(1.10)    
                .domain([0, 255])
                .range([0, Math.min(svgHeight, svgWidth) /2 - Math.min(svgHeight, svgWidth)*0.05]);

            /*
            var radiusScale = d3.scaleLinear()
                .domain([0, 255])
                .range([0, svgHeight/2 - svgHeight*0.1]);
            */

            // d3.max(ringsFrequencyData)

            var hueScale = d3.scaleLinear()
                .domain([0, d3.max(ringsFrequencyData)])
                .range([hueStart, hueEnd]);

            // update d3 chart with new data
            var rings = svg.selectAll('circle')
                .data(ringsFrequencyData);

            rings.enter().append('circle');

            rings
                .attr("r", function(d) { return radiusScale(d); })
                .attr("cx", svgWidth / 2)
                .attr("cy", svgHeight / 2)
                .attr("fill", function(d){
                    if(colourChoice == "Noir"){
                        return "white";
                    } else {
                        return d3.hsl(hueScale(d), 1, 0.5);
                    }
                })
                .attr("fill-opacity",0.08)
                .attr("stroke-width", 4)
                .attr("stroke-opacity", 0.7)
                .attr("stroke", function(d) {
                    if(colourChoice == "Noir"){
                        return "white";
                    } else {
                        return d3.hsl(hueScale(d), 1, 0.5);
                    }
                });

            rings.exit().remove(); 

        }

        // Run the loop
        renderRingsChart();

    }


    else if(visualizationChoice == "spiral"){
        console.log("Run spiral visualization");

        var numSpiralCircles = 2000;
        var activeCircleSpacing = 12;
        var numActiveCircles = Math.floor(numSpiralCircles / activeCircleSpacing);
        var spiralAngle = 5.0;
        var spiralScalar = 10.0;
        var spiralSpeed = 0.2;
        var spiralXOffset = svgWidth / 2;
        var spiralYOffset = svgHeight / 2;
        var minRadius = 3;
        var maxRadius = 50;
        var opacity = 0.9;
        var strokeWidth = 1;
        var exponent = 2.1;
        var divisor = 3500;

        //set max range of colours, based on discussion from screen center
        var hueRange = 125;
        var hueStart = fillHue - hueRange/2;
        var hueEnd = fillHue + hueRange/2;

        var hueScale = d3.scaleLinear()
            .domain([0, svgHeight])
            .range([hueStart, hueEnd]);

        analyser.smoothingTimeConstant = 0.88;

        if(svgWidth < 500){
            numSpiralCircles = 1200;
            activeCircleSpacing = 12;
            numActiveCircles = Math.floor(numSpiralCircles / activeCircleSpacing);
            minRadius = 2;
            maxRadius = 30;
            exponent = 2.1;
            divisor = 7000;
        }

        var circleData = new Uint8Array(numSpiralCircles);
        var activeCircleFrequencyData = new Uint8Array(numActiveCircles);

        var circles = svg.selectAll('circles')
            .data(circleData)    
            .enter()    
            .append('circle')
            .attr("class", function(d,i) {
                if(i % activeCircleSpacing == 0){
                    return "activeCircles";
                }
            })
            .attr("fill-opacity",opacity)
            .attr("fill", function(d, i){
                if(colourChoice == "Noir"){
                    return "white";
                } else {
                    var yPosition = spiralYOffset + Math.sin(spiralAngle + spiralSpeed*i) * (spiralScalar + spiralSpeed*i);
                    var yOffset = Math.abs(yPosition - svgHeight/2);

                    var xPosition = spiralXOffset + Math.cos(spiralAngle + spiralSpeed*i) * (spiralScalar + spiralSpeed*i);
                    var xOffset = Math.abs(xPosition - svgWidth/2);

                    return d3.hsl(hueScale(yOffset + xOffset), 1, 0.5);
                }
            })
            .attr("r", minRadius)
            .attr("stroke", strokeColour)
            .attr("stroke-width", strokeWidth)
            .attr("cx",function(d,i){
                return spiralXOffset + Math.cos(spiralAngle + spiralSpeed*i) * (spiralScalar + spiralSpeed*i);
            })
            .attr("cy",function(d,i){
                return spiralYOffset + Math.sin(spiralAngle + spiralSpeed*i) * (spiralScalar + spiralSpeed*i);
            });

        var activeCircles = d3.selectAll(".activeCircles");


        // Continuously loop and update chart with frequency data.
        function renderSpiralChart() {
    
            // Copy frequency data to array.
            analyser.getByteFrequencyData(activeCircleFrequencyData);

            requestAnimationFrame(renderSpiralChart);

            // update d3 chart with new data
            activeCircles
                .data(activeCircleFrequencyData)
                .attr("r", function(d, i) {

                    return Math.min(maxRadius, Math.max(minRadius, Math.pow(d, exponent) / divisor ));
                        
                });  

                    
        }

        // Run the loop
        renderSpiralChart();

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

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
}

function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}


/*
function flushAllD3Transitions() {
    var now = performance.now;
    performance.now = function() { return Infinity; };
    d3.timerFlush();
    performance.now = now;
}
*/