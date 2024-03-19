/* To-dos and potential improvements:
- How to improve latency when using the microphone to record audio?
- Allow users to "create" their own music video -- add text, choose colours, upload music, export the file, etc...
- Add gradient / "textured" backgrounds?
- Feature to import audio from Spotify or YouTube URL? Check Spotify API
- Auto-play next demo track after one track finishes?
- Reduce animation frame rate to improve performance / reduce compute?
- Less sensitivity to bass&percussion / more sensitivity to individual notes?
- Add "advanced options" menu with toggles for sensitivity, etc...?
- Add Uma Mockingbird to demo track. Moonchild track is broken on live version?
- Change order of visuals (newer ones first, or hide some of the lower quality ones in the menu)
*/

var visualizationMenu = document.getElementById("visualizationMenu");
var visualizationChoice = String(visualizationMenu.value);

var colourMenu = document.getElementById("colourMenu");
var colourChoice = String(colourMenu.value);

var navMenuDiv = document.getElementById("navMenuDiv");
var svgContainerDiv = document.getElementById("svgContainerDiv");
var mainSvg = document.getElementById("mainSvg");

var svgHeight = svgContainerDiv.clientHeight;
var svgWidth = svgContainerDiv.clientWidth;

var grainOpacityValue = 0.025;

var grainOptions = {
    animate: false,
    patternWidth: 500,
    patternHeight: 500,
    grainOpacity: grainOpacityValue,
    grainDensity: Math.max(1.5, 1.5 * (1200 / svgWidth)),
    grainWidth: 2.5,
    grainHeight: 2,
};

grained('#svgContainerDiv',grainOptions);

var isGrainOn = true;
var grainArray = document.getElementsByClassName("grained");


var svg = d3.select("#mainSvg");

var userInputArray = document.getElementsByClassName("userInput");
var audioButtonArray = document.getElementsByClassName("audioButton");

var playAudioFileButton = document.getElementById("playAudioFileButton");
var pauseAudioFileButton = document.getElementById("pauseAudioFileButton");
var rewindAudioFileButton = document.getElementById("rewindAudioFileButton");

var demoTrackInput = document.getElementById("demoTrackInput");
var trackChoice = "";
var previousTrackChoice = "";

var audioElementInitialized = false;

var audioElement = document.getElementById('audioElement');

var microphoneButton = document.getElementById("microphoneButton");

var microphoneOnFlag = false;
var localStream;

var demoTrackRadio = document.getElementById("demoTrackRadio");
var uploadTrackRadio = document.getElementById("uploadTrackRadio");

var demoTrackDiv = document.getElementById("demoTrackDiv");
var uploadTrackDiv = document.getElementById("uploadTrackDiv");

var initialVolumeMultiplier = 0.80;
var microphoneVolumeMultiplier = 1.05;
var volumeMultiplier = initialVolumeMultiplier;

var toggleMenuButton = document.getElementById("toggleMenuButton");
var showMenu = true;

var menuTable = document.getElementById("menuTable");

var delayInMilliseconds = 0;

var navMenuHeight = document.getElementById('navMenuDiv').clientHeight;

var infoMenuTable = document.getElementById("infoMenuTable");

var isAudioPlaying = false;

var intervals = [];

//Visualization Inputs

var numCircles = 140;
var circlesCols = 20;
var circlesRows = numCircles / circlesCols;
var circlesBottomMargin = svgHeight * 0.08;


var wireData = d3.range(-4 * Math.PI, 4 * Math.PI, 0.01);

var joyPlotN = 150;
var joyPlotRows = 3;
var joyPlotCols = joyPlotN / joyPlotRows;

var numRings = 10;

var numSpiralCircles = 2000;
var activeCircleSpacing = 12;
var numActiveCircles = Math.floor(numSpiralCircles / activeCircleSpacing);

var circlesFrequencyData = new Uint8Array(numCircles);
var wireFrequencyData = new Uint8Array(1);
var joyPlotFrequencyData = new Uint8Array(joyPlotN);
var ringsFrequencyData = new Uint8Array(numRings);
var spiralCircleData = new Uint8Array(numSpiralCircles);
var activeSpiralCircleFrequencyData = new Uint8Array(numActiveCircles);

var shapeSizeMultiplier = 1;

//Colour palettes -- background, shape fill, shape outline
var palette1 = ["#78B7C5", "#EBCC2A", "#3B9AB2"];
var palette2 = ['#7909c3', "#f72585", "#42c7f0"];
var palette3 = ["#000000", "#FFFFFF", "#646464"];
var palette4 = ["#5B1A18", "#FD6467", "#F1BB7B"];
var palette5 = ["#2f5575", "#94f0dc", "#FFFFFF"];
var palette6 = ["#f1faee", "#e63946", "#a8dadc"];
var palette7 = ["#e0c3fc", "#4d194d", "#b5179e"];
var palette8 = ["#652EC7", "#FFD300", "#DE38C8"];
var palette9 = ["#B2FAFF", "#FF9472", "#FC6E22"];
var palette10 = ["#C6FFF1", "#FF36AB", "#6153CC"];
var palette11 = ["#f6d166", "#287e87", "#df2d2d"];
var palette12 = ["#1B1663", "#D3FFDD", "#F287BB"];
var palette13 = ["#1A1831", "#20615B", "#DECE9C"]; //analog
var palette14 = ["#FFFF00", "#0000FF", "#FF0000"]; //primary
var palette15 = ["#361944", "#86BFE7", "#B09060"]; //euphoria
var palette16 = ["#02190C", "#900C3F", "#FF7C60"]; //emerald
var palette17 = ["#141415", "#9F978D", "#B5C8BA"]; //slate
var palette18 = ["#FFB3A7", "#C93756", "#F7665A"]; //crimson

var backgroundColour;
var fillColour;
var strokeColour;

var backgroundHue;
var fillHue;
var strokeHue;

//console.log("SVG height: "+svgHeight);
console.log("Visualization choice: "+visualizationChoice);

// Keep track of clicked keys
var isKeyPressed = {
    'c': false, // ASCII code for 'c'
    'v': false,
    'm': false,
    " ": false,
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

    if (isKeyPressed[" "]) {
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

    for(var i=0; i<userInputArray.length; i++){
        userInputArray[i].addEventListener("change", refresh);
        console.log ("add refresh event listener");
    }

    /*
    for(var i=0; i<audioButtonArray.length; i++){
        audioButtonArray[i].addEventListener("click", refresh);
        console.log ("add refresh event listener");
    }
    */

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
        
        //console.log("Window innerHeight: "+window.innerHeight);
        //console.log("navMenuHeight: "+navMenuHeight);
        console.log("svgContainerDivHeight: "+svgContainerDiv.clientHeight);
        console.log("svgContainerDivWidth: "+svgContainerDiv.clientWidth);

        svgHeight = svgContainerDiv.clientHeight;
        svgWidth = svgContainerDiv.clientWidth;

        //resize grain
        if(isGrainOn == true){
            grainOptions = {
                animate: false,
                patternWidth: 500,
                patternHeight: 500,
                grainOpacity: grainOpacityValue,
                grainDensity: Math.max(1.5, 1.5 * (1200 / svgWidth)),
                grainWidth: 2.5,
                grainHeight: 2,
            };
            
            grained('#svgContainerDiv',grainOptions);
        
        } else{

        }

}

function toggleMenu(){
    if(showMenu == true){

        menuTable.classList.add('zeroOpacity');
        infoMenuTable.classList.add('zeroOpacity');

            menuTable.classList.add("hide");
            infoMenuTable.classList.add("hide");
            toggleMenuButton.innerHTML = "Show Menu <i class=\"fa-solid fa-eye\"></i>";
            showMenu = false;
            refresh();
            //setSvgSize();

    } else {
        menuTable.classList.remove("hide");
        infoMenuTable.classList.remove("hide");

            menuTable.classList.remove("zeroOpacity");
            infoMenuTable.classList.remove("zeroOpacity");
            toggleMenuButton.innerHTML = "Hide Menu <i class=\"fa-solid fa-eye-slash\"></i>";
            showMenu = true;
            refresh();
            //setSvgSize();


    }

    //setSvgSize();
}

function toggleGrain(){
    
    //console.log("toggle grain function");
    //console.log(grainArray);

    if(isGrainOn == true){
        grainOptions = {
            grainOpacity: 0.00,
        };

        isGrainOn = false;

    } else{
        grainOptions = {
            animate: false,
            patternWidth: 500,
            patternHeight: 500,
            grainOpacity: grainOpacityValue,
            grainDensity: Math.max(1.5, 1.5 * (1200 / svgWidth)),
            grainWidth: 2.5,
            grainHeight: 2,
        };
        
        isGrainOn = true;

    }

    grained('#svgContainerDiv',grainOptions);

    refresh();

}

function showDemoTrackMenu(){
    demoTrackDiv.classList.remove("hide");
    uploadTrackDiv.classList.add("hide");
    setSvgSize();

}

function showUploadTrackMenu(){
    demoTrackDiv.classList.add("hide");
    uploadTrackDiv.classList.remove("hide");
    setSvgSize();

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

    intervals.forEach(clearInterval);
    
    //d3.selectAll('*').transition();
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

    //refresh();

    //toggle flag true/false each time the button is pressed
    if(microphoneOnFlag == false){
        microphoneOnFlag = true;
        volumeMultiplier = microphoneVolumeMultiplier;
        microphoneButton.innerHTML = "Mic <i class=\"fa-solid fa-microphone-lines-slash\"></i>";
        microphoneButton.style.border = "2px solid rgb(117, 62, 219)";
        isAudioPlaying = true;
    } else {
        volumeMultiplier = initialVolumeMultiplier;
        microphoneOnFlag = false;
        microphoneButton.innerHTML = "Mic   <i class=\"fa-solid fa-microphone-lines\"></i>";
        microphoneButton.style.border = "2px solid rgb(180, 180, 180)";
        isAudioPlaying = false;
    }

    if(microphoneOnFlag == true){

        audioCtx.resume().then(() => {
            console.log('Playback resumed successfully');
        });

        navigator.mediaDevices.getUserMedia ({
            audio: {
                /*
                latency: 0.02,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                mozNoiseSuppression: false,
                mozAutoGainControl: false
                */
            },
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
    setSvgSize();

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

    setTimeout(function () {
        refresh();
    }, 800); //allow animations to finish

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

    //refresh();

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

    refresh();
}


function runVisualization() {

    //reduce shape size on small screens & mobile devices

    if(svgWidth < 500){

        numCircles = 140;
        circlesCols = 20;
        circlesRows = numCircles / circlesCols;
        circlesBottomMargin = svgHeight * 0.05;
    
        wireData = d3.range(-4 * Math.PI, 4 * Math.PI, 0.01);
    
        joyPlotN = 105;
        joyPlotRows = 3;
        joyPlotCols = joyPlotN / joyPlotRows;
    
        circlesFrequencyData = new Uint8Array(numCircles);
        wireFrequencyData = new Uint8Array(1);
        joyPlotFrequencyData = new Uint8Array(joyPlotN);
    
        shapeSizeMultiplier = 0.45;
    }

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
    } else if(colourChoice == "Mint"){
        backgroundColour = palette12[0];
        fillColour = palette12[1];
        strokeColour = palette12[2];
    } else if(colourChoice == "Analog"){
        backgroundColour = palette13[0];
        fillColour = palette13[1];
        strokeColour = palette13[2];
    } else if(colourChoice == "Primary"){
        backgroundColour = palette14[0];
        fillColour = palette14[1];
        strokeColour = palette14[2];
    } else if(colourChoice == "Euphoria"){
        backgroundColour = palette15[0];
        fillColour = palette15[1];
        strokeColour = palette15[2];
    } else if(colourChoice == "Emerald"){
        backgroundColour = palette16[0];
        fillColour = palette16[1];
        strokeColour = palette16[2];
    } else if(colourChoice == "Slate"){
        backgroundColour = palette17[0];
        fillColour = palette17[1];
        strokeColour = palette17[2];
    } else if(colourChoice == "Crimson"){
        backgroundColour = palette18[0];
        fillColour = palette18[1];
        strokeColour = palette18[2];
    }

    //change background colour of menu
    navMenuDiv.style.backgroundColor = backgroundColour;

    //convert fill colour HEX into RGB instead

    var fillR = parseInt(fillColour.substr(1,2), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
    var fillG = parseInt(fillColour.substr(3,2), 16);
    var fillB = parseInt(fillColour.substr(5,2), 16);

    //get Hue of RGB fill colour (first element of HSL -- Hue, Saturation, Lightness)
    fillHue = rgbToHsl(fillR, fillG, fillB)[0] * 360;

    var backgroundR = parseInt(backgroundColour.substr(1,2), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
    var backgroundG = parseInt(backgroundColour.substr(3,2), 16);
    var backgroundB = parseInt(backgroundColour.substr(5,2), 16);

    backgroundHue = rgbToHsl(backgroundR, backgroundG, backgroundB)[0] * 360;

    var fillHSL = d3.hsl(fillColour);
    var fillHexArray = [fillHSL.h, fillHSL.s, fillHSL.l];

    var backgroundHSL = d3.hsl(backgroundColour);
    var backgroundHexArray = [backgroundHSL.h, backgroundHSL.s, backgroundHSL.l];

    //console.log(backgroundHSL);
    //console.log(backgroundHSL.h);

    var strokeR = parseInt(strokeColour.substr(1,2), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
    var strokeG = parseInt(strokeColour.substr(3,2), 16);
    var strokeB = parseInt(strokeColour.substr(5,2), 16);

    strokeHue = rgbToHsl(strokeR, strokeG, strokeB)[0] * 360;

    var strokeHSL = d3.hsl(strokeColour);
    var strokeHexArray = [strokeHSL.h, strokeHSL.s, strokeHSL.l];


    //set background colour
    svgContainerDiv.style.backgroundColor = backgroundColour;

    if(isAudioPlaying == true){

        //if else statements to select visualization style
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
    
            var maxCircleSize = Math.min(svgWidth, svgHeight) * 0.06;

            analyser.smoothingTimeConstant = 0.88;
    
            // Create our initial D3 chart.
            svg.selectAll('circle')
                .data(circlesFrequencyData)
                .enter()
                .append('circle')
                .attr('cx', function (d, i) {
                    return (i % circlesCols) * (svgWidth / circlesCols);
                })
                .attr('cy', function (d, i) {
                    return (svgHeight - circlesBottomMargin) - (Math.floor(i / circlesCols) * (svgHeight / circlesRows));
                })
                .attr('r', '2')
                .attr('stroke', strokeColour)
                .attr('stroke-width', '2');
        
            // Continuously loop and update chart with frequency data.
            function renderCircleChart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(circlesFrequencyData);
    
                requestAnimationFrame(renderCircleChart);
    
                // Update d3 chart with new data.
                svg.selectAll('circle')
                    .data(circlesFrequencyData)
                    .attr('cx', function (d, i) {
                        return (i % circlesCols) * (svgWidth / circlesCols);
                    })
                    .attr('cy', function (d, i) {
                        return (svgHeight - circlesBottomMargin) - (Math.floor(i / circlesCols) * (svgHeight / circlesRows));
                    })
                    .attr('r', function(d) {
                        return Math.min(maxCircleSize, Math.max(Math.pow(d*volumeMultiplier*(shapeSizeMultiplier*1.2),1.05)*0.35-(50*shapeSizeMultiplier),0));
                    })
                    .attr('fill', fillColour);
            }
        
            // Run the loop
            renderCircleChart();
        }

        else if(visualizationChoice == "circles2"){
            
            var minDiameter = 50;
            var maxDiameter = 100;
            var targetNumDotWidth = 30;
            var dotDiameter = Math.min(maxDiameter, Math.max(minDiameter, svgWidth / targetNumDotWidth));

            if(svgWidth < 500){
                minDiameter = 40;
                maxDiameter = 80;
                targetNumDotWidth = 15;
                dotDiameter = Math.min(maxDiameter, Math.max(minDiameter, svgWidth / targetNumDotWidth));
            }

            //reset min diameter to the actual dot diameter, so that dots never shrink in the animation
            minDiameter = dotDiameter;
            maxDiameter = 2*minDiameter;

            var numDotsWidth = Math.ceil(svgWidth / dotDiameter);
            var numDotsHeight = Math.ceil(svgHeight / dotDiameter);

            var numDots = numDotsWidth * numDotsHeight;
            var dotsFrequencyData = new Uint8Array(numDots);

            //console.log("diameter: "+dotDiameter+", numDotsWidth: "+numDotsWidth+", numDotsHeight: "+numDotsHeight);

            var minStrokeWidth = 1;
            var minOpacity = 0.3;
            
            //draw initial grid of dots
            var dots = svg.selectAll("circle")
                .data(dotsFrequencyData)
                .enter().append("circle")
                .attr("fill", fillColour)
                .attr("fill-opacity", minOpacity)
                .attr("r", dotDiameter/2)
                .attr("cx",function(d,i){
                    return dotDiameter * (i % numDotsWidth) + dotDiameter/2;
                })
                .attr("cy",function(d,i){
                    return svgHeight - (dotDiameter * (Math.floor(i / numDotsWidth)) + dotDiameter/2);
                });

            analyser.smoothingTimeConstant = 0.94;

            // Continuously loop and update chart with frequency data.
            function renderDotsChart() {
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(dotsFrequencyData);

                requestAnimationFrame(renderDotsChart);

                dots   
                    .data(dotsFrequencyData)
                    .attr("r", function(d,i){
                        //return Math.min(maxDiameter/2, Math.max(minDiameter/2, d/4.5 ));

                        return Math.min(maxDiameter/2, (minDiameter/2 * (1+ Math.pow(d,3)/ Math.pow(200,3) )) );
                        
                    });
    
            }
    
            // Run the loop
            renderDotsChart();

        }
    
        else if(visualizationChoice == "dancingCircles"){
            console.log("Run dancing circles visualization");

            var numDancingCircles = 40;
            var dancingCirclesData = d3.range(0, 2 * Math.PI, 2 * Math.PI / numDancingCircles);
            var dancingCirclesFrequencyData = new Uint8Array(numDancingCircles);
            var frequencyThreshold = 150;

            var maxCircleSize = Math.min(svgWidth, svgHeight) * 0.06;
    
            //var count = d3.selectAll("circle").size()
            //console.log("# of circles: "+count);
    
            analyser.smoothingTimeConstant = 0.90;
    
            svg.selectAll("circle")
                .data(dancingCirclesData)
                .enter().append("circle")
                .attr("r",20)
                .attr("fill", fillColour)
                .attr("stroke", strokeColour)
                .attr("fill-opacity", 0.65);
        
            //count = d3.selectAll("circle").size()
            //console.log("# of circles: "+count);
    
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
                            //return Math.min(maxCircleSize, Math.max(0, Math.pow(dancingCirclesFrequencyData[i] * volumeMultiplier * shapeSizeMultiplier,0.91) - (62*shapeSizeMultiplier) ));
                            return Math.max(0, (dancingCirclesFrequencyData[i]-frequencyThreshold) / (255-frequencyThreshold)) * maxCircleSize;

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

            var barPadding = 1;
            var numBars = 120;
            var barsFrequencyData = new Uint8Array(numBars);

            var wavesRows = 8;
            var wavesCols = 3;
            var wavesData = d3.range(1, wavesRows);
    
            analyser.smoothingTimeConstant = 0.88;
    
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
    
                paths.attr("d", function(r) {
                    return d3.area()
                        .curve(d3.curveBasis)
                        .y0(svgHeight)
                        .y1(function(d, i) {
                            return 600 * (i % 2) - 150 + 20 * Math.sin(r + t / 25000);
                        })
                        .x(function(d) { return (r * t / 34) % (svgWidth / (wavesCols - 2)) + d * svgWidth / (wavesCols - 1); })
                        (d3.range(-3, wavesCols + 2));
                });

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
    
            analyser.smoothingTimeConstant = 0.94;
    
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
            var x = d3.scaleLinear().domain([0, joyPlotCols-1]).range([0, svgWidth+0]);
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

            var numCellWidth = 20;
            var numCellHeight = 16;
            var numCells = numCellHeight * numCellWidth;
            var maxCellStrokeWidth = 4;
    
            analyser.smoothingTimeConstant = 0.96;
    
            if(svgWidth < 500){
                numCellWidth = 10;
                numCellHeight = 20;
                numCells = numCellHeight * numCellWidth;
                maxCellStrokeWidth = 2;
            }
    
            var cellWidth = svgWidth / numCellWidth;
            var cellHeight = svgHeight / numCellHeight;
    
            console.log("numCellHeight: "+numCellHeight+", cellHeight: "+cellHeight+", "+" svgHeight: "+svgHeight);
    
            var maxOpacity = 1;
            var minStrokeWidth = 0.0;
    
            var exponent = 7;
            var divisor = 2;
            var frequencyThreshold = 80;
    
            var gridFrequencyData = new Uint8Array(numCells);
    
            //set max range of colours, based on frequency input 
            var hueRange = 170;
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

                console.log(gridFrequencyData);
    
                requestAnimationFrame(renderGridChart);
    
                rects
                    .data(gridFrequencyData)
                    .attr("fill", function(d) {
                        if(colourChoice == "Noir"){
                            return "white";
                        } else {
                            return d3.hsl(hueScale(d), 0.70, 0.50);
                        }
                    })
                    .attr("stroke-width",function(d){return Math.min(maxCellStrokeWidth, Math.max(0,(d-95)/50)+minStrokeWidth)})
                    .attr("fill-opacity",function(d) {
                        return Math.min(Math.max(0, Math.pow(Math.max(0,d-frequencyThreshold),exponent)/(Math.pow(140,exponent-1)/ divisor)),1)*maxOpacity;
                    });
    
            }
    
            // Run the loop
            renderGridChart();
    
        }

        else if(visualizationChoice == "rings"){
            console.log("Run rings visualization");
    
            var numLines = 20;
            var lineStrokeWidth = 8;

            var numRings = 40;
            var numShapes = numLines + numRings;

            var ringsFrequencyData = new Uint8Array(numRings);

            var maxRadius = Math.min(svgWidth, svgHeight)*0.9 / 2;
            var minRadius = 1;

            var minStrokeWidth = 0.0;
            var maxStrokeWidth = 30;

            var maxStrokeBoost = 0;

            var maxOpacity = 0.9;

            //set max range of colours, based on frequency input 
            var hueRange = 0;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;

            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);
    
    
            if(svgWidth < 500){
                var numLines = 12;
                var lineStrokeWidth = 4;
            }

            //draw diagonal lines
            var lines = svg.selectAll('line')
                .data(new Array(numLines))
                .enter().append('line')
                .attr("x1",-10)
                .attr("x2",svgWidth + 10)
                .attr("y1",function(d,i){
                    return svgHeight - ( svgHeight*0.3 - i * (svgHeight*0.7 / numLines));
                })
                .attr("y2",function(d,i){
                    return svgHeight - ( svgHeight*0.7 - i * (svgHeight*0.7 / numLines));
                })
                .attr("stroke",strokeColour)
                .attr("stroke-width", lineStrokeWidth);

            //draw circles
            var rings = svg.selectAll('circle')
                .data(new Array(numRings))
                .enter().append('circle')
                .attr("r", function(d,i) {
                    return maxRadius - (i/numRings) * (maxRadius - minRadius);
                })
                .attr("cx", svgWidth / 2)
                .attr("cy", svgHeight / 2)
                .attr("fill", backgroundColour)
                .attr("stroke-width", minStrokeWidth)
                .attr("stroke-opacity", maxOpacity)
                .attr("stroke", function(d) {
                    /*
                    if(colourChoice == "Noir"){
                        return "white";
                    } else {
                        var hueValue = hueScale(Math.random()*hueRange);
                        var saturationValue = Math.random()*0.3 + 0.5;
                        var lightnessValue = Math.random()*0.3 + 0.5;

                        return d3.hsl(hueValue, saturationValue, lightnessValue);
                    }
                    */
                   return fillColour;
                });

            analyser.smoothingTimeConstant = 0.85;
            
            // Continuously loop and update chart with frequency data.
            function renderRingsChart() {
        
                // Copy frequency data to array.
                analyser.getByteFrequencyData(ringsFrequencyData);
    
                requestAnimationFrame(renderRingsChart);

                /*
                var lineFrequencyData = rings2FrequencyData.slice(0,numLines);
                var ringFrequencyData = rings2FrequencyData.slice(numLines, numShapes);
                */

                // update d3 chart with new data


                /*
                lines
                    .data(lineFrequencyData)
                    .attr("stroke-width", function(d,i){
                        return 10;
                    });
                */

                rings
                    .data(ringsFrequencyData)
                    .attr("stroke-opacity", function(d,i){
                        return Math.max(0, (d-110)/255 * maxOpacity);
                    })
                    .attr("stroke-width", function(d,i){
                        
                        var strokeBoost = ((i+1) / numRings) * maxStrokeBoost;
                        
                        return Math.min(maxStrokeWidth, Math.max(minStrokeWidth, (d/20 + strokeBoost) ));
                    });
        
            }
    
            // Run the loop
            renderRingsChart();
            
    
        }
    
        else if(visualizationChoice == "spiral"){
            console.log("Run spiral visualization");
    
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
            var hueRange = 80;
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
    
            var circles = svg.selectAll('circles')
                .data(spiralCircleData)    
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
    
                        return d3.hsl(hueScale(yOffset + xOffset), 0.8, 0.65);
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
                analyser.getByteFrequencyData(activeSpiralCircleFrequencyData);
    
                requestAnimationFrame(renderSpiralChart);
    
                // update d3 chart with new data
                activeCircles
                    .data(activeSpiralCircleFrequencyData)
                    .attr("r", function(d, i) {
    
                        return Math.min(maxRadius, Math.max(minRadius, Math.pow(d, exponent) / divisor ));
                            
                    });  
    
                        
            }
    
            // Run the loop
            renderSpiralChart();
    
        }
    
        else if(visualizationChoice == "hills"){
            console.log("Run hill visualization");
    
            var numHill = 35;
            var numHorizontalLines = 20;
            var numVerticalLines = numHill;

            var numStars = 15;

            var starPositionArray = [];

            var numDataPoints = numHill + numStars;

            var starThreshold = 155;
            var maxStarSize = Math.min(svgWidth,svgHeight) * 0.08;
            var starRotationSpeed = 100; //higher value gives slow rotation

            var frequencyData = new Uint8Array(numHill + numDataPoints);
            var hillFrequencyData = new Uint8Array(numHill);
            var starFrequencyData = new Uint8Array(numStars);

            var frequencyMax = 255;
            var chartHeightMultiplier = 1.45;
            var opacity = 1;
            var strokeWidth = 5;
    
            var verticalLineOffset = 20;

    
            if(svgWidth < 500){
                strokeWidth = 2;
                chartHeightMultiplier = 1.5;
            }
    
            var horizontalLineData = new Uint8Array(numHorizontalLines);

            analyser.smoothingTimeConstant = 0.95;
    
            //set max range of colours, based on discussion from screen center
            var hueRange = 125;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;
    
            var hueScale = d3.scaleLinear()
                .domain([0, svgHeight])
                .range([hueStart, hueEnd]);
    
    
            var x = d3.scaleLinear().domain([0, numHill-1]).range([0, svgWidth+0]);
            var y = d3.scaleLinear().domain([0, frequencyMax * chartHeightMultiplier]).range([svgHeight, 0]);
    
            //make defs and add the linear gradient
            var lg = svg.append("defs").append("linearGradient")
                .attr("id", "mygrad")//id of the gradient
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "0%")
                .attr("y2", "100%")//since its a vertical linear gradient 
            
            
            lg.append("stop")
                .attr("offset", "0%")
                .style("stop-color", backgroundColour)//background colour at the top
                .style("stop-opacity", 1)

            lg.append("stop")
                .attr("offset", "100%")
                .style("stop-color", fillColour)//white at the bottom
                .style("stop-opacity", 1)

            svg.append("rect")
                .attr("fill",'url(#mygrad)')
                .attr("x",0)
                .attr("y",0)
                .attr("width",svgWidth)
                .attr("height",svgHeight)
            
            //Add the horizontal lines
            var horizontalLines = svg.selectAll('line')
                .data(horizontalLineData)
                .enter()
                .append('line')
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth*2)
                .attr("stroke-opacity",function(d,i){
                    return Math.max(0, (numHorizontalLines-i) / numHorizontalLines - 0.35);
                })
                .attr("x1", 0)
                .attr("y1", function (d,i) {
                    return svgHeight / numHorizontalLines * i;
                })
                .attr("x2", svgWidth)
                .attr("y2", function (d,i) {
                    return svgHeight / numHorizontalLines * i;
                });

            //Draw the stars
            for (var j=0; j<numStars; j++){

                var xVal = j * svgWidth / numStars + (svgWidth / numStars/2);
                var yVal = Math.random() * svgHeight * 0.45;
                var rotationVal = Math.random() * 360;
                var hueValue = Math.random() * hueRange + hueStart;
                var saturationValue = Math.random() * 0.3 + 0.5;
                var lightnessValue = Math.random() * 0.3 + 0.5;

                svg.append("rect")
                    .attr("x",xVal)
                    .attr("y",yVal)
                    .attr("height",5)
                    .attr("width",5)
                    .attr("fill",d3.hsl(hueValue, saturationValue, lightnessValue))
                    .attr("transform","rotate("+rotationVal+" "+xVal+" "+yVal+")")
                    .attr("class","stars")

                starPositionArray.push({x: xVal, y: yVal, r: rotationVal});
            }

            //console.log(starPositionArray);
                    
            
            // Add the area
            var path = svg.append("path")
                .datum(hillFrequencyData)
                .attr("fill","white")
                .attr("fill-opacity",opacity)
                .attr("stroke", "white")
                .attr("stroke-width", strokeWidth)
                .attr("d", d3.area()
                    .x(function(d,i) { return x(i) })
                    .y0(y(0))
                    .y1(function(d) { return y(20) })
                    .curve(d3.curveBasis)
                );
    
            // draw vertical lines
    
            var verticalLines = svg.selectAll('.verticalLines')
                .data(hillFrequencyData)
                .enter()
                .append('rect')
                .attr("class","verticalLines")
                .attr('x', function (d, i) {
                    return i * (svgWidth / (hillFrequencyData.length-1));
                })
                .attr("y",y(255))
                .attr('width', strokeWidth)
                .attr('fill', fillColour)
                .attr("height", svgHeight - y(255));
    
            // Continuously loop and update chart with frequency data.
            function renderHillChart() {

                var t = performance.now();
    
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(frequencyData);

                hillFrequencyData = frequencyData.slice(0,numHill);
                starFrequencyData = frequencyData.slice(numHill,numHill+numStars);

                requestAnimationFrame(renderHillChart);
    
                
                path
                    .datum(hillFrequencyData)
                    .attr("d", d3.area()
                        .x(function(d,i) { return x(i) })
                        .y0(y(0))
                        .y1(function(d) { return y(d) })
                        .curve(d3.curveBasis)
                    );
                
                
                verticalLines
                    .data(hillFrequencyData)    
                    .attr("y", function(d,i){
                        return y(d - verticalLineOffset);
                    })
                    .attr("height",function(d,i){
                        
                        //var pathY = y(hillFrequencyData[i]);
                        var pathY = y(Math.max(0,d - verticalLineOffset));
    
                        //console.log("pathY: "+pathY);
                        
                        return svgHeight - pathY;
                    });

                svg.selectAll(".stars")
                    .data(starFrequencyData)    
                    .attr("height", function(d,i){
                        return Math.max(d-starThreshold,0) / (255 - starThreshold) * maxStarSize;
                    })
                    .attr("width", function(d,i){
                        return Math.max(d-starThreshold,0) / (255 - starThreshold) * maxStarSize;
                    })
                    .attr("transform",function(d,i){
                        var newRotation = starPositionArray[i].r + t/starRotationSpeed;
                        return "rotate("+newRotation+" "+starPositionArray[i].x+" "+starPositionArray[i].y+")";
                    })
                
            }
    
            // Run the loop
            renderHillChart();
    
        }

        else if(visualizationChoice == "hexagons"){
            console.log("Run hexagons visualization");

            var width = svgWidth/2,
                height = svgHeight/2,
                n = 15,
                r = width / n / 2 + Math.min(svgWidth, svgHeight) * 0.014,
                dx = r * 2 * Math.sin(Math.PI / 3),
                dy = r * 1.5;

            var minStrokeWidth = 2;
            var minOpacity = 0.1;
            var opacityExponent = 5;
            var opacityDivisor = 4000;

            var hexagonsData = [[0, 0]], x, y, j;

            var numHexagons;
    
            if(svgWidth < 500){
                n = 11,
                r = width / n / 2 + Math.min(svgWidth, svgHeight) * 0.012,
                dx = r * 2 * Math.sin(Math.PI / 3),
                dy = r * 1.5;
                minStrokeWidth = 1;
            }
    
            analyser.smoothingTimeConstant = 0.94;

            //hexagon data
            for (var i = 1; i <= Math.floor(n/2); i++) {
                var odd = i % 2 === 1;
            
                for (j = 0, x = (2 - i) * dx / 2, y = -i * dy; j < i; j++, x += dx, y += 0) {
                    hexagonsData.push([x, y]);
                }
            
                for (j = 0, x = (1 + i) * dx / 2, y = (1 - i) * dy; j < i; j++, x += dx / 2, y += dy) {
                    hexagonsData.push([x, y]);
                }
            
                for (j = 0, x = (2 * i - 1) * dx / 2, y = dy; j < i; j++, x -= dx / 2, y += dy) {
                    hexagonsData.push([x, y]);
                }
            
                for (j = 0, x = i * dx / 2 - dx, y = i * dy; j < i; j++, x -= dx, y += 0) {
                    hexagonsData.push([x, y]);
                }
            
                for (j = 0, x = (-i - 1) * dx / 2, y = (i - 1) * dy; j < i; j++, x -= dx / 2, y -= dy) {
                    hexagonsData.push([x, y]);
                }
            
                for (j = 0, x = -i * dx + dx / 2, y = -dy; j < i; j++, x += dx / 2, y -= dy) {
                    hexagonsData.push([x, y]);
                }
            }

            numHexagons = hexagonsData.length;
            
            var hexagonsFrequencyData = new Uint8Array(numHexagons);

            //console.log("hexagons data length: "+hexagonsData.length);

            var hexes = svg.selectAll("g")
                .data(hexagonsData)
                .enter().append("g")
                .attr("class",function(d,i){
                    if(i == 0){
                        return "firstHexagon";
                    } else{
                        return "otherHexagon";
                    }
                })
                .attr("transform", function(d) {
                    return "translate(" + [d[0] + width, d[1] + height] + ")";
                })
                .append("path")
                .attr("fill", fillColour)
                .attr("stroke", strokeColour)
                .attr("stroke-width", minStrokeWidth)
                .attr("fill-opacity", minOpacity)
                .attr("d", "M" + hexagon(r).join("L") + "Z");
    
            // Continuously loop and update chart with frequency data.
            function renderHexagonsChart() {
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(hexagonsFrequencyData);

                var t = performance.now();

                requestAnimationFrame(renderHexagonsChart);
                
                hexes
                    .data(hexagonsFrequencyData)
                    .attr("fill-opacity", function(d){
                        return Math.max(minOpacity, Math.pow(d, opacityExponent) / Math.pow(70, opacityExponent-1) / opacityDivisor);
                    })
                    .attr("stroke-width", function(d){
                        return Math.max(minStrokeWidth, d/50);
                    })
                    .attr("transform", function(d, i) {
                        return "scale(" + (Math.sin(t * (i + 1) / 200000) + 1 ) / 2 + ")";
                    });
            }
    
            // Run the loop
            renderHexagonsChart();
    
        }
        
        else if(visualizationChoice == "grid2") {
            
            var numRows = 10;
            var numCols = 10;

            var numHorizontalSegments = numCols * (numRows+1);
            var numVerticalSegments = numRows * (numCols+1);
            var numTotalSegments = numHorizontalSegments + numVerticalSegments;

            var horizontalLength = svgWidth / numCols;
            var verticalLength = svgHeight / numRows;

            if(svgWidth < 500){
                numRows = 7;
                numCols = 7;
    
                numHorizontalSegments = numCols * (numRows+1);
                numVerticalSegments = numRows * (numCols+1);
                numTotalSegments = numHorizontalSegments + numVerticalSegments;
    
                horizontalLength = svgWidth / numCols;
                verticalLength = svgHeight / numRows;
            }

            var grid2FrequencyData = new Uint8Array(numTotalSegments);

            var strokeWidth = 1;

            //set max range of colours, based on discussion from screen center
            var hueRange = 80;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;
    
            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);

            var horizontalLines = svg.selectAll('.horizontalLines')
                .data(new Array(numHorizontalSegments))
                .enter()
                .append('line')
                .attr("class","horizontalLines")
                .attr("stroke", function(d,i){
                    var huePosition = Math.random() * hueRange;
                    var saturationValue = Math.random() * 0.3 + 0.5;
                    var lightnessValue = Math.random() * 0.3 + 0.5;

                    return d3.hsl(hueScale(huePosition), saturationValue, lightnessValue);
                })
                .attr("stroke-width", strokeWidth)
                .attr("x1", function(d,i){
                    return i % numCols * horizontalLength;
                })
                .attr("y1", function (d,i) {
                    return svgHeight - (Math.floor(i / numCols) * verticalLength);
                })
                .attr("x2", function(d,i){
                    return (i % numCols * horizontalLength) + horizontalLength;
                })
                .attr("y2", function (d,i) {
                    return svgHeight - (Math.floor(i / numCols) * verticalLength);
                });
            

            var verticalLines = svg.selectAll('.verticalLines')
                .data(new Array(numHorizontalSegments))
                .enter()
                .append('line')
                .attr("class","verticalLines")
                .attr("stroke", function(d,i){
                    var huePosition = Math.random() * hueRange;
                    var saturationValue = Math.random() * 0.3 + 0.5;
                    var lightnessValue = Math.random() * 0.3 + 0.5;

                    return d3.hsl(hueScale(huePosition), saturationValue, lightnessValue);
                })
                .attr("stroke-width", minStrokeWidth)
                .attr("x1", function(d,i){
                    return i % numCols * horizontalLength;
                })
                .attr("y1", function (d,i) {
                    return svgHeight - (Math.floor(i / numCols) * verticalLength);
                })
                .attr("x2", function(d,i){
                    return i % numCols * horizontalLength;
                })
                .attr("y2", function (d,i) {
                    return svgHeight - (Math.floor(i / numCols) * verticalLength + verticalLength);
                });

            analyser.smoothingTimeConstant = 0.91;

            
            // Continuously loop and update chart with frequency data.
            function renderGrid2Chart() {
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(grid2FrequencyData);

                requestAnimationFrame(renderGrid2Chart);

                svg.selectAll("line")   
                    .data(grid2FrequencyData)
                    .attr("stroke-width", function(d,i){

                        return Math.max(0, (d-140)/3 );
                        
                    });

            }

            // Run the loop
            renderGrid2Chart();
            
        }

        else if(visualizationChoice == "warp") {
            
            console.log("run warp visual");

            var numLines = 90;

            var minStrokeWidth = 1;
            var maxStrokeWidth = 16;

            var arcGroup = [];
            var startAngleArray = [];
            var endAngleArray = [];
            var innerRadiusArray = [];
            var outerRadiusArray = [];

            var maxAngleChange = Math.PI * 0.5;

            
            //set max range of colours, based on discussion from screen center
            var hueRange = 90;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;
    
            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);
            
            
            if(svgWidth < 500){
                numLines = 60;
                maxStrokeWidth = 8;
            }

            var warpFrequencyData = new Uint8Array(numLines);


            //create initial arcs
            for(var i=0; i<numLines; i++){

                var randomAngle = (Math.random() * 2 + 1) * Math.PI;
                var startAngle = randomAngle;
                var endAngle = randomAngle;
                
                //var innerRadius = Math.random() * Math.min(svgWidth, svgHeight) / 2;
                var innerRadius = (Math.min(svgWidth, svgHeight)/2 * 0.95 / numLines) * i;
                var outerRadius = innerRadius + Math.random() * maxStrokeWidth;

                startAngleArray.push(startAngle);
                endAngleArray.push(endAngle);
                innerRadiusArray.push(innerRadius);
                outerRadiusArray.push(outerRadius);

                var hueValue = hueScale(Math.random() * hueRange);
                var saturationValue = Math.random() * 0.3 + 0.5;
                var lightnessValue = Math.random() * 0.3 + 0.5;

                var minOpacity = 0.00;

                var singleArc = d3.arc()
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
                
                svg.append("path")
                    .attr("d", singleArc)
                    .attr("class","arc")
                    .attr("fill", d3.hsl(hueScale(hueValue), saturationValue, lightnessValue))
                    .attr("transform", "translate("+svgWidth/2+","+svgHeight/2+")");

                arcGroup.push(singleArc);
                
            }



            analyser.smoothingTimeConstant = 0.92;
            
            // Continuously loop and update chart with frequency data.
            function renderWarpChart() {
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(warpFrequencyData);

                requestAnimationFrame(renderWarpChart);

                var t = performance.now();
                var timeDivisor = 30000;
                var timeShift = t/timeDivisor * Math.PI;

                d3.selectAll(".arc")
                    .data(warpFrequencyData)
                    .attr("d", function(d,i){
                        
                        var newStartAngle = startAngleArray[i] + timeShift;
                        //startAngleArray[i] = newStartAngle;

                        var newEndAngle = endAngleArray[i] + (Math.max(0, d/255) * maxAngleChange) + timeShift;
                        //endAngleArray[i] = newEndAngle;
                        
                        return d3.arc()
                            .startAngle(newStartAngle)
                            .endAngle(newEndAngle)
                            .innerRadius(innerRadiusArray[i])
                            .outerRadius(outerRadiusArray[i])(d);
                    })
                    .attr("fill-opacity", function(d,i){
                        if(d > 60){
                            return Math.pow(d,6) / Math.pow(190,6);
                        } else{
                            return minOpacity;
                        }
                    });

            }

            // Run the loop
            renderWarpChart();
            
        }

        else if(visualizationChoice == "bubbleBath") {
            
            //bound the randomness -- force even distribution on the x axis?
            //two for loops for the circles, one behind the lines, one ahead of the lines

            console.log("run bubbleBath visual");

            var numLines = 4;
            var linePoints = 13;
            var numCircles = 20;
            var numDataPoints = numLines*linePoints + numCircles;

            var lineStrokeWidth = 12;

            var minRadius = 20;
            var maxRadius = 80;

            var opacity = 0.20;
            var maxCircleStrokeWidth = 15;

            var lineOffset1 = 0.00;
            var lineOffset2 = 0.2;
            var lineOffset3 = 0.4;
            var lineOffset4 = 0.6;

            
            //set max range of colours, based on discussion from screen center
            var hueRange = 90;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;
    
            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);
            
            
            if(svgWidth < 500){
                numLines = 3;
                linePoints = 13;
                numCircles = 10;
                numDataPoints = numLines*linePoints + numCircles;
    
                lineStrokeWidth = 8;
    
                minRadius = 10;
                maxRadius = 40;
    
                opacity = 0.20;
                maxCircleStrokeWidth = 10;
            }

            var moonsFrequencyData = new Uint8Array(numDataPoints);


            //create and place shapes


            //draw some of the cirles behind of the lines
            for(var i=0; i<numCircles; i++){
            
                if(i%2 == 0){
                    svg
                    .append('circle')
                    .attr("fill",fillColour)
                    .attr('r', minRadius)
                    .attr('stroke',fillColour)
                    .attr('stroke-width', Math.random() * maxCircleStrokeWidth)
                    .attr('fill-opacity', Math.random() + 0.1)
                    .attr('cx', svgWidth/numCircles * i + (svgWidth/numCircles/2) )
                    .attr('cy', svgHeight - (Math.random()*(svgHeight*0.9) + svgHeight*0.05) );
                }

            }


            var line1Data = new Uint8Array(linePoints);
            var line2Data = new Uint8Array(linePoints);
            var line3Data = new Uint8Array(linePoints);
            var line4Data = new Uint8Array(linePoints);

            var line1 = svg.append("path")
                .datum(line1Data)
                .attr("fill", strokeColour)
                .attr("fill-opacity",opacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", lineStrokeWidth)
                .attr("d", d3.area()
                    .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                    .y0(svgHeight)
                    .y1(function(d) { return svgHeight - svgHeight*lineOffset1 })
                    .curve(d3.curveBasis)
                );

            var line2 = svg.append("path")
                .datum(line2Data)
                .attr("fill", strokeColour)
                .attr("fill-opacity",opacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", lineStrokeWidth)
                .attr("d", d3.area()
                    .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                    .y0(svgHeight)
                    .y1(function(d) { return svgHeight - svgHeight*lineOffset2 })
                    .curve(d3.curveBasis)
                );

            var line3 = svg.append("path")
                .datum(line3Data)
                .attr("fill", strokeColour)
                .attr("fill-opacity",opacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", lineStrokeWidth)
                .attr("d", d3.area()
                    .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                    .y0(svgHeight)
                    .y1(function(d) { return svgHeight - svgHeight*lineOffset3 })
                    .curve(d3.curveBasis)
                );
            
            if(svgWidth>=500){
                var line4 = svg.append("path")
                .datum(line4Data)
                .attr("fill", strokeColour)
                .attr("fill-opacity",opacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", lineStrokeWidth)
                .attr("d", d3.area()
                    .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                    .y0(svgHeight)
                    .y1(function(d) { return svgHeight - svgHeight*lineOffset4 })
                    .curve(d3.curveBasis)
                );
            }


            
            //draw some of the cirles on top of the lines
            for(var i=0; i<numCircles; i++){
            
                if(i%2 != 0){
                    svg
                    .append('circle')
                    .attr("fill",fillColour)
                    .attr('r', minRadius)
                    .attr('stroke',fillColour)
                    .attr('stroke-width', Math.random() * maxCircleStrokeWidth)
                    .attr('fill-opacity', Math.random() + 0.1)
                    .attr('cx', svgWidth/numCircles * i + (svgWidth/numCircles/2) )
                    .attr('cy', svgHeight - (Math.random()*(svgHeight*0.9) + svgHeight*0.05) );
                }

            }
            
    


            analyser.smoothingTimeConstant = 0.92;
            
            // Continuously loop and update chart with frequency data.
            function renderMoonsChart() {
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(moonsFrequencyData);

                requestAnimationFrame(renderMoonsChart);

                line1Data = moonsFrequencyData.slice(0,linePoints);
                line2Data = moonsFrequencyData.slice(linePoints,linePoints*2);
                line3Data = moonsFrequencyData.slice(linePoints*2,linePoints*3);
                
                if(svgWidth>=500){
                    line4Data = moonsFrequencyData.slice(linePoints*3,linePoints*4);
                }
                
                circleData = moonsFrequencyData.slice(-numCircles);

                line1
                    .datum(line1Data)
                    .attr("d", d3.area()
                        .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                        .y0(svgHeight)
                        .y1(function(d,i) { return svgHeight - (svgHeight*lineOffset1 + d) })
                        .curve(d3.curveBasis)
                    );
                    
                line2
                    .datum(line2Data)
                    .attr("d", d3.area()
                        .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                        .y0(svgHeight)
                        .y1(function(d,i) { return svgHeight - (svgHeight*lineOffset2 + d) })
                        .curve(d3.curveBasis)
                    );
                    
                line3
                    .datum(line3Data)
                    .attr("d", d3.area()
                        .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                        .y0(svgHeight)
                        .y1(function(d,i) { return svgHeight - (svgHeight*lineOffset3 + d) })
                        .curve(d3.curveBasis)
                    );
                    
                if(svgWidth>=500){
                    line4
                    .datum(line4Data)
                    .attr("d", d3.area()
                        .x(function(d,i) { return (i) * (svgWidth / (linePoints-1)) })
                        .y0(svgHeight)
                        .y1(function(d,i) { return svgHeight - (svgHeight*lineOffset4 + d) })
                        .curve(d3.curveBasis)
                    );
                }

                svg.selectAll('circle')
                    .data(circleData)
                    .attr('r', function(d,i){
                        return Math.max(0, (d-100) * (Math.min(svgWidth, svgHeight) / 1200) );
                    });

            }

            // Run the loop
            renderMoonsChart();
            
        }

        else if(visualizationChoice == "loop") {

            console.log("run loop visual");

            var numCircles1 = 20;
            var pathRadius1 = Math.min(svgWidth, svgHeight) / 2 * 0.6;
            var minCircles1Radius = 10;
            
            var numCircles2 = 20;
            var pathRadius2 = Math.min(svgWidth, svgHeight) / 2 * 0.6;
            var minCircles2Radius = 0;

            var pathRadiusFlex = Math.min(svgWidth, svgHeight) / 2 * 0.25;

            var numCirclesTotal = numCircles1+ numCircles2;

            var maxStrokeWidth = 5;
            var opacity = 0.5;

            //set max range of colours, based on discussion from screen center
            var hueRange = 0;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;
    
            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);
            
            
            if(svgWidth < 500){

            }

            var loopFrequencyData = new Uint8Array(numCirclesTotal);

            //create and place shapes
            
            for(var i=0; i<numCircles1; i++){

                var hueValue = hueScale(Math.random()*hueRange);
                var saturationValue = Math.random()*0.3 + 0.5;
                var lightnessValue = Math.random()*0.3 + 0.5;

                svg
                    .append('circle')
                    .attr('class',"circle1")
                    .attr("fill", fillColour)
                    .attr('r', minCircles1Radius)
                    .attr('stroke',strokeColour)
                    .attr('stroke-width', maxStrokeWidth)
                    .attr('fill-opacity', opacity)
                    .attr('cx', function(d,i){
                        return svgWidth/2 + pathRadius1 * Math.cos(i+1);
                    })
                    .attr('cy', function(d,i){
                        return svgHeight/2 + pathRadius1 * Math.sin(i+1);
                    });

            }

            for(var i=0; i<numCircles2; i++){

                svg
                    .append('circle')
                    .attr('class',"circle2")
                    .attr("fill",strokeColour)
                    .attr('r', minCircles2Radius)
                    .attr('stroke',fillColour)
                    .attr('stroke-width', maxStrokeWidth)
                    .attr('fill-opacity', opacity)
                    .attr('cx', function(d,i){
                        return svgWidth/2 + pathRadius2 * Math.cos(i+1);
                    })
                    .attr('cy', function(d,i){
                        return svgHeight/2 + pathRadius2 * Math.sin(i+1);
                    });

            }
 
            analyser.smoothingTimeConstant = 0.90;
            
            // Continuously loop and update chart with frequency data.
            function renderLoopChart() {
                // Copy frequency data to frequencyData array.
                
                var t = performance.now();
                var timeDivisor = 12000;

                //pathRadius2 = Math.max(1, pathRadius2 + pathRadiusFlex * Math.cos(t/timeDivisor));
                var newPathRadius1 = Math.max(1, pathRadius1 + pathRadiusFlex * Math.cos(t/timeDivisor));
                var newPathRadius2 = Math.max(1, pathRadius2 + pathRadiusFlex * Math.sin(t/timeDivisor));


                analyser.getByteFrequencyData(loopFrequencyData);

                var circle1FrequencyData = loopFrequencyData.slice(0,numCircles1);
                var circle2FrequencyData = loopFrequencyData.slice(numCircles1,numCirclesTotal);
 

                requestAnimationFrame(renderLoopChart);


                svg.selectAll(".circle1")
                    .data(circle1FrequencyData)    
                    .attr('cx',function(d,i){
                        //var x = svgWidth/2 + pathRadius * Math.cos(t * (i+1) / timeDivisor);
                        var x = svgWidth/2 + newPathRadius1 * Math.cos( t / (timeDivisor / (1 + i/numCircles1)) + (2*Math.PI / numCircles1 * i));
                        return x;
                    })
                    .attr('cy',function(d,i){
                        //var y = svgHeight/2 + pathRadius * Math.sin(t * (i+1) / timeDivisor);
                        var y = svgHeight/2 + newPathRadius1 * Math.sin( t / (timeDivisor / (1 + i/numCircles1)) + (2*Math.PI / numCircles1 * i));

                        return y;
                    })
                    .attr('r', function(d,i){
                        return Math.max(minCircles1Radius, Math.pow((d-130),1.15) * (Math.min(svgWidth, svgHeight) / 3000) );
                    });

                svg.selectAll(".circle2")
                    .data(circle2FrequencyData)    
                    .attr('cx',function(d,i){
                        var x = svgWidth/2 - newPathRadius2 * Math.cos( t / (timeDivisor / (1 + i/numCircles2)) + (2*Math.PI / numCircles2 * i));
                        return x;
                    })
                    .attr('cy',function(d,i){
                        //var y = svgHeight/2 + pathRadius * Math.sin(t * (i+1) / timeDivisor);
                        var y = svgHeight/2 + newPathRadius2 * Math.sin( t / (timeDivisor / (1 + i/numCircles2)) + (2*Math.PI / numCircles2 * i));

                        return y;
                    })
                    .attr('r', function(d,i){
                        return Math.max(minCircles2Radius, (d-150) * (Math.min(svgWidth, svgHeight) / 1100) );
                    });

            }

            // Run the loop
            renderLoopChart();
            
        }

        else if(visualizationChoice == "mondrian") {

            //Mondrian generator source code from Christopher Lovell https://gist.github.com/christopherlovell/9d532ce94c48c6ff4b9f97ef323e3c6a

            console.log("run Mondrian visual");

            var padding = 30;

            var colours = [backgroundColour, fillColour, strokeColour, 'white']
            var colour_prob = [0.22, 0.22, 0.22, 0.34]  // probability of appearance of each colour
        
            // cumulative colour probabilities
            var colour_cum_prob = [];
            colour_prob.reduce(function(a,b,i) { return colour_cum_prob[i] = a+b; },0);
        
            var fractions = [1/5, 2/5, 3/5, 4/5]  // hard coded split fractions
            var tol = 80;  // height/width tolerance on which to split
            var recurs = 9;  // level of recursion

            var rectangleColourArray = [];

            var strokeWidth = 5;

            var changeTolerance = 18; //change in audio frequency at which to change colour

            
            if(svgWidth < 500){

            }
        
            // initialise array of rectangles with a single, giant rectangle (..square)
            var rectangles = [{"x": 0, "y": 0, "width": svgWidth, "height": svgHeight}]


            //draw initial Mondrian

            var j = 0;  // recursion counter
            while(j < recurs){
                j++;

                n = rectangles.length;  // number of initial rectangles in this loop
                to_remove = [];  // array of indices of rectangles to remove

                // loop through existing rectangles
                for(var i=0; i<n; i++){

                    // test if rectangle already small
                    if(rectangles[i]['width'] > tol && rectangles[i]['height'] > tol){

                        to_remove.push(i);  // save for removal later

                        // calculate split fraction
                        var frac = fractions[Math.floor(Math.random() * fractions.length)];
                        var x = rectangles[i]['x'];
                        var y = rectangles[i]['y'];

                        // decide whether to cut vertically or horizontally
                        if(Math.random() > 0.5) {
                            var width = rectangles[i]['width'] * frac;
                            var height = rectangles[i]['height'];
                            rectangles.push({"x": x + width, "y": y, "width": rectangles[i]['width'] - width, height});
                        }
                        else {
                            var width = rectangles[i]['width'];
                            var height = rectangles[i]['height'] * frac;
                            rectangles.push({"x": x, "y": y + height, "width": width, "height": rectangles[i]['height'] - height});
                        }

                        rectangles.push({"x": x, "y": y, "width": width, "height": height});
                    }

                }

                // remove old rectangles (loop in reverse order to avoid messing up indexing)
                for(var i=to_remove.length-1; i>=0; i--){
                    rectangles.splice(to_remove[i], 1);
                }

            }

            for(i=0; i < rectangles.length; i++){

                var condition = Math.random()
                colourIndex = colour_cum_prob.findIndex( function(elem) {return elem > condition} );

                rectangleColourArray.push(colours[colourIndex]);

                svg.append("rect")
                    .attr("x", rectangles[i]['x'] )
                    .attr("y", rectangles[i]['y'] )
                    .attr("width", rectangles[i]['width'] )
                    .attr("height", rectangles[i]['height'] )
                    .attr("fill", colours[colourIndex])
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke", "black");
            }

            var numRectangles = rectangles.length;

            var mondrianFrequencyData = new Uint8Array(numRectangles);
            var previousFrequencyArray = new Uint8Array(numRectangles);

            analyser.smoothingTimeConstant = 0.90;
            
            // Continuously loop and update chart with frequency data.
            function renderMondrianChart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(mondrianFrequencyData);

                requestAnimationFrame(renderMondrianChart);

                svg.selectAll('rect')
                    .data(mondrianFrequencyData)
                    .attr('fill',function(d,i){
                        
                        if((mondrianFrequencyData[i] - previousFrequencyArray[i]) > changeTolerance){
                            var condition = Math.random()
                            colourIndex = colour_cum_prob.findIndex( function(elem) {return elem > condition} );
                            
                            rectangleColourArray[i] = colours[colourIndex];
                            
                            return colours[colourIndex];

                        } else{
                            return rectangleColourArray[i];

                        }
                        
                    });

                previousFrequencyArray = mondrianFrequencyData.slice();

            }

            // Run the loop
            renderMondrianChart();
            
        }

        else if(visualizationChoice == "voronoi"){

            console.log("run voronoi visual");

            var numPolygons = 75;
            var pointArray = [];

            var strokeWidth = 5;

            var opacityThreshold = 150;
            var opacityExponent = 0.95;
            var minOpacity = 0.0;

            analyser.smoothingTimeConstant = 0.96;

            //set max range of colours, based on discussion from screen center
            var hueRange = 50;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;

            var hueScale = d3.scaleLinear()
                .domain([0, hueRange])
                .range([hueStart, hueEnd]);

    
            if(svgWidth < 500){
                numPolygons = 50
                strokeWidth = 3;
            }

            for(var i=0; i<numPolygons; i++){
                var xVal = Math.random() * svgWidth;
                var yVal = Math.random() * svgHeight;

                pointArray.push({x: xVal, y: yVal});

            }




            const delaunay = d3.Delaunay.from(pointArray, d => d.x, d => d.y )
            const voronoi = delaunay.voronoi([0.5, 0.5, svgWidth - 0.5, svgHeight - 0.5])
            // um what is this part?
            const renderCell = (d) => {
                return d == null ? null : "M" + d.join("L") + "Z";
            }
            
            var circle = svg.selectAll("g")
              .data(pointArray)
              .enter().append("g");
            
            var cell = circle.append("path")
                .data(pointArray.map((d,i) => voronoi.renderCell(i)) )
                .attr("stroke", backgroundColour)
              .attr("stroke-width", strokeWidth)
              .attr("d", d => d)
              .attr("id", function(d, i) { return "cell-" + i; })
              .attr("fill", function(d,i){
                  var hueValue = Math.random() * hueRange;
                  var saturationValue = Math.random()*0.3 + 0.5;
                  var lightnessValue = Math.random()*0.3 + 0.5;

                  return d3.hsl(hueScale(hueValue), saturationValue, lightnessValue);
              })
              .attr("fill-opacity", 0);
            

            var voronoiFrequencyData = new Uint8Array(numPolygons);

            
            // Continuously loop and update chart with frequency data.
            function renderVoronoiChart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(voronoiFrequencyData);

                requestAnimationFrame(renderVoronoiChart);

                cell
                    .data(voronoiFrequencyData)
                    .attr("fill-opacity", function(d,i){
                        return Math.max(minOpacity, Math.pow(Math.max(0,d-opacityThreshold), opacityExponent) / Math.pow(200-opacityThreshold, opacityExponent) );
                    });

            }

            // Run the loop
            renderVoronoiChart();

        }

        else if(visualizationChoice == "lavaLamp"){

            console.log("run lava lamp visual");

            var numPoints = 50;
            var pointArray = [];
            var xValArray = [];
            var yValArray = [];
            var fillOpacity = 1;
            var bandwidth = (39 * svgWidth/1000 - 39)/4 + 39;
            var heightShift = 0.3;
            var maxHeightShift = svgHeight * heightShift;
            var heightExponent = 2;

            var updateFrequency = 1000/24; //delay in milliseconds to update contour chart

            analyser.smoothingTimeConstant = 0.90;

            //set max range of colours
            var hueRange = 200;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;

            var hueScale = d3.scaleLinear()
                .domain([0, 255])
                .range([hueStart, hueEnd]);

            for(var i=0; i<numPoints; i++){
                
                //var xVal = svgWidth * Math.random();
                var xVal = i / numPoints * svgWidth;
                xValArray.push(xVal);

                var yVal = Math.random() * svgHeight * (1-heightShift);
                yValArray.push(yVal);

                pointArray.push({"x": xVal, "y": yVal});

            }

            //console.log(pointArray);

            const thresholds = 5;

            // compute the density data
            var contourFunc = d3.contourDensity()
                .thresholds(thresholds)
                .x(function(d) { return (d.x); })   // x and y = column name in .csv input data
                .y(function(d) { return (svgHeight - d.y); })
                .size([svgWidth, svgHeight])
                .bandwidth(bandwidth);    // smaller = more precision in lines = more lines
            
            var contourFrequencyData = new Uint8Array(numPoints);

            function updateContourData(){
                pointArray = [];
                
                analyser.getByteFrequencyData(contourFrequencyData);

                for(var i=0; i<numPoints; i++){
                
                    
                    var xVal = xValArray[i];    
                    var yVal = yValArray[i] + (Math.pow(contourFrequencyData[i],heightExponent) / Math.pow(245,heightExponent) * maxHeightShift);

                    pointArray.push({"x": xVal, "y": yVal});
    
                }


            }

            function updateContourChart(){
                
                svg.selectAll('*').remove();

                var contours = contourFunc(pointArray);
                
                var contourPaths = svg.selectAll("path");
      
                contourPaths
                    .data(contours)
                    .enter()
                    .append("path")
                        .attr("d", d3.geoPath())
                        .attr("fill",function(d,i){
                        
                            var frequencyValue = contourFrequencyData[i];
    
                            if(frequencyValue > 0){
                                var hueValue = hueScale(contourFrequencyData[i] - 0);
                            } else {
                                var hueValue = fillHue;
                            }
                            
                            return d3.hsl(hueValue, 0.3, 0.50);
                        })
                        .attr("fill-opacity", fillOpacity)
                        .attr("stroke", strokeColour)
                        .attr("stroke-linejoin", "round");
                

            }

            var intervalCall = setInterval(function() {
                updateContourData();
                updateContourChart();
            }, updateFrequency);

            intervals.push(intervalCall);

        }

        else if(visualizationChoice == "grid3"){

            console.log("run grid3 visual");

            analyser.smoothingTimeConstant = 0.90;

            var numRows = 10;
            var numCols = 10;
            var numCells = numRows * numCols;
            var numCellsRemaining = numCells;

            var cellWidth = svgWidth / numCols;
            var cellHeight = svgHeight / numRows;

            var minWidth = Math.min(cellWidth, cellHeight) / 2;
            var minHeight = Math.min(cellWidth, cellHeight) / 2;

            var cellPositionArray = [];

            var sizeSensitivity = 1;

            var fillThreshold = 215;
            var strokeThreshold = 125;

            //create array of all possible cell positions
            for(var i=0; i<numCells; i++){
                
                var colVal = i%numCols;
                var rowVal = Math.floor(i/numRows);
                
                cellPositionArray.push({"row": rowVal, "col": colVal});
            }

            //console.log(cellPositionArray);

            //draw rectangle in a random position, and remove that position afterwards

            for(var i=0; i<numCells; i++){
                var currentPosition = Math.floor(Math.random() * numCellsRemaining)
                numCellsRemaining--;

                var colVal = cellPositionArray[currentPosition].col;
                var rowVal = cellPositionArray[currentPosition].row;

                cellPositionArray.splice(currentPosition,1);

                svg
                    .append("rect")
                    .attr("x",colVal/numCols*svgWidth + cellWidth/4)
                    .attr("y",rowVal/numRows*svgHeight + cellHeight/4)
                    .attr("width",minWidth)
                    .attr("height",minHeight)
                    .attr("fill",fillColour)
                    .attr("stroke",strokeColour)
                    .attr("stroke-width",3);

            }

            var grid3FrequencyData = new Uint8Array(numCells);

            
            // Continuously loop and update chart with frequency data.
            function renderGrid3Chart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(grid3FrequencyData);

                var t = performance.now();

                requestAnimationFrame(renderGrid3Chart);

                svg.selectAll("rect")
                    .data(grid3FrequencyData)
                    .attr("fill-opacity", function(d,i){
                        return Math.max(0, (d-fillThreshold)*2 / (255-fillThreshold));
                    })
                    .attr("stroke-opacity", function(d,i){
                        return Math.max(0, (d-strokeThreshold) / (255-strokeThreshold));
                    })

            }

            // Run the loop
            renderGrid3Chart();

        }

        else if(visualizationChoice == "splatter"){

            console.log("run splatter visual");

            var frequencyThreshold = 170;
            var frequencyChangeThreshold = 20;
            
            var backgroundColourProbability = 0.4;
            var squareNoFillProbability = 0.5;

            var circleProbability = 0.25;
            var squareProbability = 0.35;

            var shapeClearThreshold = 170;

            var updateFrequency = 1000/24; //delay in milliseconds to update chart

            analyser.smoothingTimeConstant = 0.80;

            var maxLinePoints = 8;
            var maxStrokeWidth = 4;
            var maxLineShift = 0.4;

            var maxSquareWidth = svgWidth * 0.05;

            var numDataPoints = 7;
            var splatterFrequencyData = new Uint8Array(numDataPoints);
            var previousFrequencyData = new Uint8Array(numDataPoints);

            var shapeCounter = 0;

            //set max range of colours
            var hueRange = 75;
            var hueStart = fillHue - hueRange/2;
            var hueEnd = fillHue + hueRange/2;

            var hueScale = d3.scaleLinear()
                .domain([0, 255])
                .range([hueStart, hueEnd]);


            function drawShape(){
                analyser.getByteFrequencyData(splatterFrequencyData);

                for(var i=0; i<numDataPoints; i++){


                    if(splatterFrequencyData[i] - previousFrequencyData[i] > frequencyChangeThreshold){

                        var shapeValue = Math.random();

                        var hueValue = hueScale(splatterFrequencyData[i]);
                        var saturationValue = Math.random() * 0.3 + 0.5;
                        var lightnessValue = Math.random() * 0.3 + 0.5;

                        shapeCounter++;

                        if(shapeCounter % shapeClearThreshold == 0){
                            //draw a large shape with backgroundColour fill to "clear" the canvas
                            var randomNumber = Math.random();
                            
                            if(randomNumber < 0.5){
                                
                                svg
                                    .append("rect")
                                    .attr("x", svgWidth*0.1)
                                    .attr("y",svgHeight*0.1)
                                    .attr("width",svgWidth * 0.8)
                                    .attr("height",svgHeight * 0.8)
                                    .attr("fill",backgroundColour)
                                    .attr("stroke",fillColour)
                                    .attr("stroke-width", Math.random() * 20)

                            }
                            
                            else {
                                
                                svg
                                    .append("circle")
                                    .attr("cx", svgWidth/2)
                                    .attr("cy",svgHeight/2)
                                    .attr("r",Math.min(svgWidth,svgHeight)/2*0.9)
                                    .attr("fill",backgroundColour)
                                    .attr("stroke",fillColour)
                                    .attr("stroke-width", Math.random() * 20)

                            }


                        }

                        else if(shapeValue < circleProbability){
                            //draw circle
                            svg
                                .append("circle")
                                .attr("r", Math.pow( Math.max(0,(splatterFrequencyData[i] - frequencyThreshold))/25, 3.2 ) )
                                .attr("fill",function(d,i){
                                    var randomNumber = Math.random();

                                    if(randomNumber < backgroundColourProbability){
                                        return backgroundColour;
                                    } else{
                                        return d3.hsl(hueValue, saturationValue, lightnessValue);
                                    }
                                })
                                .attr("fill-opacity", 1)
                                .attr("cx", Math.random() * svgWidth)
                                .attr("cy", Math.random() * svgHeight)
                        }

                        else if(shapeValue < (circleProbability + squareProbability)){
                            //draw square

                            var xVal = Math.random() * svgWidth;
                            var yVal = Math.random() * svgHeight;
                            var width = Math.random() * maxSquareWidth;
                            var height = width;
                            var rotationAngle = Math.random() * 360;

                            svg
                                .append("rect")
                                .attr("x", xVal)
                                .attr("y",yVal)
                                .attr("width",width)
                                .attr("height",height)
                                .attr("transform", "rotate("+rotationAngle+","+xVal+","+yVal+")")
                                .attr("fill",function(d,i){
                                    var randomNumber = Math.random();

                                    if(randomNumber < squareNoFillProbability){
                                        return "none";
                                    } else{
                                        return d3.hsl(hueValue, saturationValue, lightnessValue);
                                    }
                                })
                                .attr("stroke",function(d,i){
                                    var strokeHueValue = hueScale(Math.random()*255);
                                    return d3.hsl(strokeHueValue, saturationValue, lightnessValue);
                                })
                                .attr("stroke-width", Math.random()*maxStrokeWidth)


                        }
                        
                        else {

                            //draw curved line path

                            var numPoints = Math.floor(maxLinePoints * Math.random());
                            var points = [];

                            var lineFunction = d3.line()
                                .x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .curve(d3.curveNatural)

                            var lineCenterX = svgWidth * Math.random();
                            var lineCenterY = svgHeight * Math.random();

                            var maxShiftX = svgWidth * maxLineShift * Math.random();
                            var maxShiftY = svgWidth * maxLineShift * Math.random();

                            for(var i=0; i<numPoints; i++){
                                
                                var xShift = (Math.random()*2 - 1) * maxShiftX;
                                var yShift = (Math.random()*2 - 1) * maxShiftY;

                                var xVal = lineCenterX + xShift;
                                var yVal = lineCenterY + yShift;

                                points.push({"x": xVal, "y": yVal});
                            }

                            svg
                                .append('path')
                                .datum(points)
                                .attr('d', lineFunction)
                                .attr('stroke', function(d,i){
                                    var randomNumber = Math.random();

                                    if(randomNumber < backgroundColourProbability){
                                        return backgroundColour;
                                    } else{
                                        return d3.hsl(hueValue, saturationValue, lightnessValue);
                                    }
                                })
                                .attr("stroke-width", Math.random() * maxStrokeWidth)
                                .attr('fill', 'none');


                        }


                    }



                }

                previousFrequencyData = splatterFrequencyData.slice();


            }

            var intervalCall = setInterval(function() {
                drawShape();
            }, updateFrequency);

            intervals.push(intervalCall);

        }

        else if(visualizationChoice == "flubber"){

            console.log("run radial visualization");

            var numDataPoints = 24;
            var innerRadius = 0;
            var outerRadius = Math.min(svgWidth, svgHeight)/2 * 0.95;
            var strokeWidth = 10;
            var fillOpacity = 1;

            var outerRadius2 = outerRadius * 2/3;
            var outerRadius3 = outerRadius * 1/3;

            /*
            var numCircles = 30;
            var minCircleSize = 20;
            var maxCircleSize = 50;
            */

            var fullCircle = 2 * Math.PI * (numDataPoints-1) / numDataPoints;

            analyser.smoothingTimeConstant = 0.9;

            const y = d3.scaleLinear()
                .range([innerRadius, outerRadius]);
            
            const y2 = d3.scaleLinear()
                .range([innerRadius, outerRadius2]); 
                
            const y3 = d3.scaleLinear()
                .range([innerRadius, outerRadius3]);  

            const x = d3.scaleLinear()

            x.range([0, fullCircle]);

            x.domain([0,numDataPoints]);
            y.domain([0,255]);
            y2.domain([0,255]);
            y3.domain([0,255]);


            const line = d3.lineRadial()
                .angle(function(d,i) { return x(i); })
                .radius(function(d) { return y(d); })
                .curve(d3.curveCardinalClosed)

            const line2 = d3.lineRadial()
                .angle(function(d,i) { return x(i); })
                .radius(function(d) { return y2(d); })
                .curve(d3.curveCardinalClosed)

            const line3 = d3.lineRadial()
                .angle(function(d,i) { return x(i); })
                .radius(function(d) { return y3(d); })
                .curve(d3.curveCardinalClosed)

            var radialFrequencyData = new Uint8Array(numDataPoints);


            /*
            //draw random circles in the background to add some texture

            for(var i=0; i<numCircles; i++){

                svg
                    .append("circle")
                    .attr("cx",Math.random()*svgWidth)
                    .attr("cy",Math.random()*svgHeight)
                    .attr("r",minCircleSize + Math.random() * (maxCircleSize - minCircleSize))
                    .attr("fill",d3.hsl(backgroundHue,0.7,0.7))
                    .attr("fill-opacity",0.3);

            }
            */

            //draw initial radial line plot
            var linePlot = svg.append("path")
                .datum(radialFrequencyData)
                .attr("fill", d3.hsl(fillHue, 0.4, 0.5))
                .attr("fill-opacity",fillOpacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth)
                .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")")
                .attr("d", line);

            var linePlot2 = svg.append("path")
                .datum(radialFrequencyData)
                .attr("fill", d3.hsl(fillHue, 0.7, 0.5))
                .attr("fill-opacity",fillOpacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth)
                .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")")
                .attr("d", line2);

            var linePlot3 = svg.append("path")
                .datum(radialFrequencyData)
                .attr("fill", d3.hsl(fillHue, 1, 0.5))
                .attr("fill-opacity",fillOpacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth)
                .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")")
                .attr("d", line3);
            
            // Continuously loop and update chart with frequency data.
            function renderRadialChart() {
                
                var t = performance.now();

                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(radialFrequencyData);

                requestAnimationFrame(renderRadialChart);

                linePlot
                    .datum(radialFrequencyData)
                    .attr("fill", d3.hsl(fillHue + t/450, 0.4, 0.5))
                    .attr("d", line);

                    
                linePlot2
                    .datum(radialFrequencyData)
                    .attr("fill", d3.hsl(fillHue + t/400, 0.7, 0.5))
                    .attr("d", line2);

                linePlot3
                    .datum(radialFrequencyData)
                    .attr("fill", d3.hsl(fillHue + t/350, 1.0, 0.5))
                    .attr("d", line3);
                    
                    

            }

            // Run the loop
            renderRadialChart();

        }

        else if(visualizationChoice == "fadeaway"){
            console.log("run fadeaway visual");

            var numCols = 7;

            var tileWidth = svgWidth/numCols;
            var tileHeight = tileWidth;

            var numRows = Math.ceil(svgHeight/tileHeight);

            var strokeWidth = 12;

            var numTiles = numCols * numRows;
            //console.log("numTiles: "+numTiles);

            var numIntersections = (numCols+1) * (numRows);
            //console.log("numIntersections: "+numIntersections);

            var tileCenterXArray = [];
            var tileCenterYArray = [];

            var circleRatio = 0.85;

            if(svgWidth > 1200){
                circleRatio = 0.5;
            }

            var frequencyThreshold = 140;

            var minOpacity = 0.3;

            analyser.smoothingTimeConstant = 0.92;

            var tileFrequencyData = new Uint8Array(numIntersections);

            //arc generator
            var arcGenerator = d3.arc();

            var path1 = arcGenerator({
                startAngle: 0,
                endAngle: 0.5 * Math.PI,
                innerRadius: tileWidth/2 - strokeWidth/2,
                outerRadius: tileWidth/2 + strokeWidth/2,
            });

            var path2 = arcGenerator({
                startAngle: 1 * Math.PI,
                endAngle: 1.5 * Math.PI,
                innerRadius: tileWidth/2 - strokeWidth/2,
                outerRadius: tileWidth/2 + strokeWidth/2,
            });

            //draw tiles / draw dot at the center of each tile
            for(var i=0; i<numTiles; i++){
                
                var xVal = i % numCols * tileWidth + tileWidth/2;
                var yVal = svgHeight - (Math.floor(i / numCols) * tileHeight + tileHeight/2);

                tileCenterXArray.push(xVal);
                tileCenterYArray.push(yVal);
                
                /*
                svg
                    .append("rect")
                    .attr("width",tileWidth)
                    .attr("height",tileHeight)
                    .attr("x",xVal-tileWidth/2)
                    .attr("y",yVal-tileHeight/2)
                    .attr("stroke",strokeColour)
                    .attr("fill","none")
                */

                //rotate at 90/180/270/360 degrees
                var rotationVal = Math.ceil(Math.random()*4)*90;

                //bottom left arc, rotated by x degrees
                svg
                    .append('path')
                    .attr('d',path1)
                    .attr("transform","rotate(100)")
                    .attr("fill",strokeColour)
                    .attr("fill-opacity",(svgHeight-yVal)/svgHeight*0.5+0.2)
                    .attr("transform","translate("+(xVal-tileWidth/2)+","+(yVal+tileWidth/2)+") rotate("+rotationVal+" "+tileWidth/2+" "+tileHeight/2*-1+")")

                //upper right arc, rotated by x degrees
                svg
                    .append('path')
                    .attr('d',path2)
                    .attr("fill",strokeColour)
                    .attr("fill-opacity",(svgHeight-yVal)/svgHeight*0.5+0.2)
                    .attr("transform","translate("+(xVal+tileWidth/2)+","+(yVal-tileWidth/2)+") rotate("+rotationVal+" "+tileWidth/2*-1+" "+tileHeight/2+")")

            }

            //draw circle at end tile corner
            for(var i=0; i<numIntersections; i++){
                var xVal = i % (numCols+1) * tileWidth;
                var yVal = svgHeight - ((Math.floor(i / (numCols+1))) * tileHeight);

                svg
                    .append("circle")
                    .attr("r",5)
                    .attr("cx",xVal)
                    .attr("cy",yVal)
                    .attr("fill",fillColour)

            }


            /*
            //draw single tile
            svg
                .append('path')
                .attr('d',path1)
                .attr("fill",fillColour)
                .attr("transform","translate("+(svgWidth/2-tileWidth/2)+","+(svgHeight/2+tileWidth/2)+")");

            svg
                .append('path')
                .attr('d',path2)
                .attr("fill",fillColour)
                .attr("transform","translate("+(svgWidth/2+tileWidth/2)+","+(svgHeight/2-tileWidth/2)+")");
            */

            // Continuously loop and update chart with frequency data.
            function renderTileChart() {
                
                var t = performance.now();
                
                /*
                var direction;

                if(Math.ceil(t / 10100) % 2 == 0){
                    direction = "up";
                } else {
                    direction = "down";
                }
                */

                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(tileFrequencyData);

                requestAnimationFrame(renderTileChart);

                svg.selectAll("circle")
                    .data(tileFrequencyData)
                    .attr("r",function(d,i){
                        return Math.max(0,d-frequencyThreshold)/(255-frequencyThreshold) * (tileWidth/2 - strokeWidth/2) * circleRatio;
                    })
                    .attr("cy",function(d,i){
                        
                        var initialYPosition = svgHeight - ((Math.floor(i / (numCols+1))) * tileHeight);
                        

                        //return initialYPosition;
                        return (initialYPosition + t/50) % (svgHeight + tileHeight);

                        /*
                        if(direction == "down"){
                            return (initialYPosition + t/50) % (svgHeight + tileHeight/2);
                        }

                        else {
                            return svgHeight - (initialYPosition + t/50) % (svgHeight + tileHeight/2);
                        }
                        */

                        /*
                        if(i % 2 == 0){
                            return (initialYPosition + t/50) % (svgHeight + tileHeight/2);
                        } else{
                            return svgHeight - (initialYPosition + t/50) % (svgHeight + tileHeight/2);
                        }
                        */
                    })
                    .attr("fill",function(d,i){
                        var initialYPosition = svgHeight - ((Math.floor(i / (numCols+1))) * tileHeight);
                        var currentPosition = (initialYPosition + t/50) % (svgHeight + tileHeight);

                        return d3.hsl(fillHue-25 + 50 * (svgHeight-currentPosition)/svgHeight, 0.8, 0.5);
                    })
                    .attr("fill-opacity",function(d,i){
                        var initialYPosition = svgHeight - ((Math.floor(i / (numCols+1))) * tileHeight);
                        var currentPosition = (initialYPosition + t/50) % (svgHeight + tileHeight);
                    
                        return (svgHeight-currentPosition)/svgHeight * 0.85 + 0.15;
                    })

                    /*
                    .attr("fill-opacity",function(d,i){
                        return Math.max(0,d-frequencyThreshold)/(255-frequencyThreshold) + minOpacity;
                    })
                    */
                    
                    
            }

            // Run the loop
            renderTileChart();

        }

        else if(visualizationChoice == "boomBox"){
            console.log("run boomBox visual");

            var numCols = 8;

            var tileWidth = svgWidth/numCols;
            var tileHeight = tileWidth;

            var numRows = Math.ceil(svgHeight/tileHeight);

            var strokeWidth = 14;

            var numTiles = numCols * numRows;
            //console.log("numTiles: "+numTiles);

            var numIntersections = (numCols+1) * (numRows);
            //console.log("numIntersections: "+numIntersections);

            var tileCenterXArray = [];
            var tileCenterYArray = [];

            var frequencyBuckets = 4;
            var tileFrequencyData = new Uint8Array(frequencyBuckets);
            var previousFrequencyData = new Uint8Array(frequencyBuckets);

            var frequencyChangePercentage = 0.03; //frequency increase percentage
            var frequencyThreshold = 180; // absolute frequency value

            var blankTileProbability = 0.00;

            var tilePositionArray = d3.range(0,numTiles);

            var newBackgroundColour = d3.hsl(strokeHue,0.6,0.5);
            var newFillColour = d3.hsl(fillHue+8,0.8,0.4);

            var tileType = "arc";

            var minOpacity = 0.3;

            var fps = 30;

            analyser.smoothingTimeConstant = 0.88;

            var hueRange = 0;


            //arc generator
            var arcGenerator = d3.arc();

            var path1 = arcGenerator({
                startAngle: 0,
                endAngle: 0.5 * Math.PI,
                innerRadius: tileWidth/2 - strokeWidth/2,
                outerRadius: tileWidth/2 + strokeWidth/2,
            });

            var path2 = arcGenerator({
                startAngle: 1 * Math.PI,
                endAngle: 1.5 * Math.PI,
                innerRadius: tileWidth/2 - strokeWidth/2,
                outerRadius: tileWidth/2 + strokeWidth/2,
            });


            function drawArcTile(tilePosition, frequencyValue){
                //var selectedTile = Math.ceil(numTiles * Math.random()) - 1;
                var selectedTile = tilePosition;
                //console.log("selectedTile: "+selectedTile);

                var xVal = selectedTile % numCols * tileWidth + tileWidth/2;
                var yVal = svgHeight - (Math.floor(selectedTile / numCols) * tileHeight + tileHeight/2);

                var rotationVal = Math.ceil(Math.random()*4)*90;

                var randomNumber = Math.random();

                if(randomNumber < blankTileProbability){
                    var tile = svg
                        .append('rect')
                        .attr("x", xVal - tileWidth/2)
                        .attr("y", yVal - tileHeight/2)
                        .attr("width",tileWidth)
                        .attr("height",tileHeight)
                        .attr("fill",backgroundColour)
                        .attr("fill-opacity",1)
                        
                        //.attr("stroke",backgroundColour)
                }

                else {

                    //var saturationValue = Math.max(0, (frequencyValue-50) / (255-50));
                    var saturationValue = 1;

                    //fill tile with background colour to erase previous tile
                    var tile = svg
                        .append('rect')
                        .attr("x", xVal - tileWidth/2)
                        .attr("y", yVal - tileHeight/2)
                        .attr("width",tileWidth)
                        .attr("height",tileHeight)
                        .attr("fill",newBackgroundColour)
                        .attr("fill-opacity",1)

                    //bottom left arc, rotated by x degrees
                    var arc1 = svg
                        .append('path')
                        .attr('d',path1)
                        .attr("transform","rotate(100)")
                        .attr("fill",fillColour)
                        .attr("fill-opacity",1)
                        .attr("transform","translate("+(xVal-tileWidth/2)+","+(yVal+tileWidth/2)+") rotate("+rotationVal+" "+tileWidth/2+" "+tileHeight/2*-1+")")

                    //upper right arc, rotated by x degrees
                    var arc2 = svg
                        .append('path')
                        .attr('d',path2)
                        .attr("fill",fillColour)
                        .attr("fill-opacity",1)
                        .attr("transform","translate("+(xVal+tileWidth/2)+","+(yVal-tileWidth/2)+") rotate("+rotationVal+" "+tileWidth/2*-1+" "+tileHeight/2+")")

                    /*
                    tile.transition().duration(transitionSpeed).ease(d3.easeLinear).attr("fill-opacity", 1)
                    arc1.transition().duration(transitionSpeed).ease(d3.easeLinear).attr("fill-opacity", 1)
                    arc2.transition().duration(transitionSpeed).ease(d3.easeLinear).attr("fill-opacity", 1)
                    */
                }


            }

            function drawCrossTile(tilePosition, frequencyValue){
                //var selectedTile = Math.ceil(numTiles * Math.random()) - 1;
                var selectedTile = tilePosition;
                //console.log("selectedTile: "+selectedTile);

                var xVal = selectedTile % numCols * tileWidth + tileWidth/2;
                var yVal = svgHeight - (Math.floor(selectedTile / numCols) * tileHeight + tileHeight/2);

                var rotationVal = Math.ceil(Math.random()*4)*90;

                var randomNumber = Math.random();

                if(randomNumber < blankTileProbability){
                    var tile = svg
                        .append('rect')
                        .attr("x", xVal - tileWidth/2)
                        .attr("y", yVal - tileHeight/2)
                        .attr("width",tileWidth)
                        .attr("height",tileHeight)
                        .attr("fill",backgroundColour)
                        .attr("fill-opacity",1)
                        
                        //.attr("stroke",backgroundColour)
                }

                else {

                    //var saturationValue = Math.max(0, (frequencyValue-50) / (255-50));
                    var saturationValue = 1;

                    //fill tile with background colour to erase previous tile
                    var tile = svg
                        .append('rect')
                        .attr("x", xVal - tileWidth/2)
                        .attr("y", yVal - tileHeight/2)
                        .attr("width",tileWidth)
                        .attr("height",tileHeight)
                        .attr("fill",newBackgroundColour)
                        .attr("fill-opacity",1)

                    //Vertical line, rotated by x degrees
                    var rect1 = svg
                    .append('rect')
                    .attr('x',xVal-strokeWidth/2)
                    .attr('y',yVal-tileHeight/2)
                    .attr('height',tileHeight)
                    .attr('width',strokeWidth)
                    .attr("fill",newFillColour)
                    .attr("fill-opacity",1)
                    //.attr("stroke",newBackgroundColour)
                    .attr("transform","rotate("+rotationVal+" "+xVal+" "+yVal+")")

                    //Horizontal line, rotated by x degrees
                    var rect2 = svg
                    .append('rect')
                    .attr('x',xVal - tileWidth/2)
                    .attr('y',yVal-strokeWidth/2)
                    .attr('height',strokeWidth)
                    .attr('width',tileWidth)
                    .attr("fill",newFillColour)
                    .attr("fill-opacity",1)
                    //.attr("stroke",newBackgroundColour)
                    .attr("transform","rotate("+rotationVal+" "+xVal+" "+yVal+")")

                }


            }

            /*
            var intervalCall = setInterval(function() {
                drawRandomTile();
            }, 1000);
            
            intervals.push(intervalCall);
            */
            
            var intervalCall = setInterval(function() {

                var t = performance.now();

                analyser.getByteFrequencyData(tileFrequencyData);

                for(var i=0; i<frequencyBuckets; i++){
                    /*
                    if( (tileFrequencyData[i] - previousFrequencyData[i]) > frequencyChangeThreshold){
                        drawRandomTile();
                    }
                    */

                    
                    if( (tileFrequencyData[i] / previousFrequencyData[i] - 1) > frequencyChangePercentage && tileFrequencyData[i] > frequencyThreshold ){
                        
                        if(tilePositionArray.length > 0){
                            var selectedPosition = Math.floor(Math.random() * tilePositionArray.length);
                            var selectedTile = tilePositionArray[selectedPosition];
                            
                            if(tileType == "arc"){
                                drawArcTile(selectedTile, tileFrequencyData[i]);
                            } else {
                                drawCrossTile(selectedTile, tileFrequencyData[i]);
                            }

                            tilePositionArray.splice(selectedPosition,1)

                        } else {
                            tilePositionArray = d3.range(0,numTiles);

                            if(tileType == "arc"){
                                tileType = "cross";
                            } else {
                                tileType = "arc";
                            }
                        }

                    }
                    

                    /*
                    drawRandomTile(tileCounter % numTiles, tileFrequencyData[i]);
                    tileCounter++;
                    */

                }

                previousFrequencyData = tileFrequencyData.slice();

                svg.selectAll("circle").remove();
                svg.selectAll(".box").remove();

                var boxSize = Math.min(svgHeight, svgWidth) * 0.5;
                var circleStrokeWidth = 5;

                var circle1Size = tileFrequencyData[0]/255 * Math.min(svgHeight, svgWidth)/2 * 0.45;
                var circle2Size = tileFrequencyData[frequencyBuckets-1]/255 * Math.min(svgHeight, svgWidth)/2 * 0.2;

                svg
                    .append("rect")
                    .attr("class","box")
                    .attr("height",boxSize)
                    .attr("width",boxSize)
                    .attr("fill", backgroundColour)
                    .attr("fill-opacity",0.65)
                    .attr("x",svgWidth/2 - boxSize/2 )
                    .attr("y",svgHeight/2 - boxSize/2 )
                    .attr("transform","rotate("+t/500+" "+svgWidth/2+" "+svgHeight/2+")")

                svg
                    .append("circle")
                    .attr("r",circle1Size)
                    .attr("fill",fillColour)
                    .attr("cx",svgWidth/2)
                    .attr("cy",svgHeight/2)
                    .attr("stroke",strokeColour)
                    .attr("stroke-width",circleStrokeWidth)

                svg
                    .append("circle")
                    .attr("r",circle2Size)
                    .attr("fill",strokeColour)
                    .attr("cx",svgWidth/2)
                    .attr("cy",svgHeight/2)



            }, 1000/fps);
            
            intervals.push(intervalCall);            

        }

        else if(visualizationChoice == "flow"){
            console.log("run flow visual");

            var cellSize = Math.min(svgHeight, svgWidth) / 200;
            var gridHeight = svgHeight;
            var gridWidth = svgWidth;
            var numCols = Math.ceil(gridWidth / cellSize);
            var numRows = Math.ceil(gridHeight / cellSize);
            var numCells = numCols * numRows;

            var angleArray = [];

            var angleRange = Math.PI * 1;
            var startingAngle = Math.random() * (Math.PI*2);
            var endingAngle = startingAngle + angleRange;

            var fps = 12;
            analyser.smoothingTimeConstant = 0.7;

            var stepLength = cellSize * 2;

            var maxCircleSize = Math.min(svgHeight, svgWidth)/2 * 0.2;
            var sizeExponent = 4;

            var circleOpacity = 0.5;

            //circle 1 inputs
            var circleSize = 0;
            var currentAngle = 0;

            var circleX = Math.random() * svgWidth;
            var circleY = Math.random() * svgHeight;

            var circleFill = fillColour;

            var xTranslate = 0;
            var yTranslate = 0;

            //circle 2 inputs
            var circle2Size = 0;
            var currentAngle2 = 0;

            var circle2X = Math.random() * svgWidth;
            var circle2Y = Math.random() * svgHeight;

            var circle2Fill = strokeColour;

            var xTranslate2 = 0;
            var yTranslate2 = 0;

            //circle 3 inputs
            var circle3Size = 0;
            var currentAngle3 = 0;

            var circle3X = Math.random() * svgWidth;
            var circle3Y = Math.random() * svgHeight;

            var circle3Fill = backgroundColour;

            var xTranslate3 = 0;
            var yTranslate3 = 0;

            var frequencyBuckets = 3;
            var flowFrequencyData = new Uint8Array(frequencyBuckets);
            
            //draw grid and initialize angles
            for(var i=0; i<numRows; i++){

                angleArray[i] = [];

                for(var j=0; j<numCols; j++){
                    /*
                    svg
                        .append("rect")
                        .attr("height", cellSize)
                        .attr("width", cellSize)
                        .attr("x", j * cellSize)
                        .attr("y", i * cellSize)
                        .attr("fill","none")
                        .attr("stroke", strokeColour)
                        .attr("stroke-width",1)
                    */

                    //0 PI is South, 0.5 PI is East, 1 PI is North, 1.5 PI is West, 2 PI is South 
                    var angle = startingAngle + (Math.random() * angleRange); 

                    angleArray[i][j] = angle;

                    /*
                    svg
                        .append("line")
                        .attr("x1", j * cellSize + cellSize/2)
                        .attr("x2", j * cellSize + cellSize/2)
                        .attr("y1", i * cellSize)
                        .attr("y2", i * cellSize + cellSize)
                        .attr("stroke",fillColour)
                        .attr("stroke-width",1)
                        .attr("transform","rotate("+angle+" "+(j * cellSize + cellSize/2)+" "+(i * cellSize + cellSize/2)+")")
                    */
                }
            }

            //console.log(angleArray);

            //draw circle at random position

            var circle = svg
                .append("circle")
                .attr("r",circleSize)
                .attr("cx", circleX)
                .attr("cy", circleY)
                .attr("fill",circleFill)
                .attr("fill-opacity",circleOpacity)

            var circle2 = svg
                .append("circle")
                .attr("r",circle2Size)
                .attr("cx", circle2X)
                .attr("cy", circle2Y)
                .attr("fill",circle2Fill)
                .attr("fill-opacity",circleOpacity)

            var circle3 = svg
                .append("circle")
                .attr("r",circle3Size)
                .attr("cx", circle3X)
                .attr("cy", circle3Y)
                .attr("fill",circle3Fill)
                .attr("fill-opacity",circleOpacity)
                .attr("stroke",fillColour)

            var intervalCall = setInterval(function() {

                analyser.getByteFrequencyData(flowFrequencyData);

                //circle 1 -- low frequency
                currentAngle = angleArray[Math.floor(circleY / cellSize)][Math.floor(circleX / cellSize)];

                circleSize = (Math.pow(flowFrequencyData[0],sizeExponent) / Math.pow(255,sizeExponent)) * maxCircleSize;

                xTranslate = Math.sin(currentAngle) * stepLength;
                yTranslate = Math.cos(currentAngle) * stepLength;

                circleX = circleX + xTranslate;
                circleY = circleY + yTranslate;

                //place circle back on the canvas to restart once it goes out of bounds
                if(circleX > svgWidth || circleX < 0 || circleY > svgHeight || circleY < 0){
                    circleX = Math.random() * svgWidth;
                    circleY = Math.random() * svgHeight;
                }

                //Move the circle based on the flow field angle
                
                
                svg
                    .append("circle")
                    .attr("r",circleSize)
                    .attr("cx", circleX)
                    .attr("cy", circleY)
                    .attr("fill",circleFill)
                    .attr("fill-opacity",circleOpacity)
                    .attr("stroke",backgroundColour)

                //circle 2
                currentAngle2 = angleArray[Math.floor(circle2Y / cellSize)][Math.floor(circle2X / cellSize)];

                circle2Size = (Math.pow(flowFrequencyData[1],sizeExponent) / Math.pow(255,sizeExponent)) * maxCircleSize;

                xTranslate2 = Math.sin(currentAngle2) * stepLength;
                yTranslate2 = Math.cos(currentAngle2) * stepLength;

                circle2X = circle2X + xTranslate2;
                circle2Y = circle2Y + yTranslate2;

                //place circle back on the canvas to restart once it goes out of bounds
                if(circle2X > svgWidth || circle2X < 0 || circle2Y > svgHeight || circle2Y < 0){
                    circle2X = Math.random() * svgWidth;
                    circle2Y = Math.random() * svgHeight;
                }

                //Move the circle based on the flow field angle
                
                svg
                    .append("circle")
                    .attr("r",circle2Size)
                    .attr("cx", circle2X)
                    .attr("cy", circle2Y)
                    .attr("fill",circle2Fill)
                    .attr("fill-opacity",circleOpacity)
                    .attr("stroke",backgroundColour)
                

                //circle 3
                currentAngle3 = angleArray[Math.floor(circle3Y / cellSize)][Math.floor(circle3X / cellSize)];

                circle3Size = (Math.pow(flowFrequencyData[2],sizeExponent) / Math.pow(255,sizeExponent)) * maxCircleSize;

                xTranslate3 = Math.sin(currentAngle3) * stepLength;
                yTranslate3 = Math.cos(currentAngle3) * stepLength;

                circle3X = circle3X + xTranslate3;
                circle3Y = circle3Y + yTranslate3;

                //place circle back on the canvas to restart once it goes out of bounds
                if(circle3X > svgWidth || circle3X < 0 || circle3Y > svgHeight || circle3Y < 0){
                    circle3X = Math.random() * svgWidth;
                    circle3Y = Math.random() * svgHeight;
                }

                //Move the circle based on the flow field angle
                
                svg
                    .append("circle")
                    .attr("r",circle3Size)
                    .attr("cx", circle3X)
                    .attr("cy", circle3Y)
                    .attr("fill",circle3Fill)
                    .attr("fill-opacity",circleOpacity)
                    .attr("stroke",fillColour)

                

            }, 1000/fps);
            
            intervals.push(intervalCall);
            
            
        

        }

        else if(visualizationChoice == "tetris"){
            console.log("run tetris visual");

            //perlin noise heatmap background
            //source: https://joeiddon.github.io/projects/javascript/perlin

            var GRID_SIZE = 5;
            var RESOLUTION = 2;
            var hueRange = 120;

            //var pixel_size = Math.ceil(svgWidth / RESOLUTION);
            var pixel_width = Math.ceil(svgWidth / RESOLUTION);
            var pixel_height = Math.ceil(svgHeight / RESOLUTION);
            var num_pixels = GRID_SIZE / RESOLUTION;

            var pixelCount = 0;

            var frequencyThreshold = 165;

            analyser.smoothingTimeConstant = 0.9;

            //clear the background on refresh
            perlin.seed();

            //draw heatmap grid
            for (var y = 0; y < GRID_SIZE; y += num_pixels / GRID_SIZE){
                for (var x = 0; x < GRID_SIZE; x += num_pixels / GRID_SIZE){
                    
                    //var v = (parseInt(perlin.get(x, y))+1) / 2;
                    var v = parseInt(perlin.get(x, y) * hueRange + fillHue);

                    //console.log(v);
                    //var currentColour = d3.hsl(v, backgroundHexArray[1], backgroundHexArray[2]);
                    var currentColour = d3.hsl(v, 0.6, 0.5);

                    svg
                        .append("rect")
                        .attr("x",x / GRID_SIZE * svgWidth)
                        .attr("y",svgHeight - (y / GRID_SIZE * svgHeight))
                        .attr("width",pixel_width)
                        .attr("height",pixel_height)
                        .attr("fill",currentColour)
                        .attr("fill-opacity",1.0)

                    pixelCount++;
                }
            }

            var noiseFrequencyData = new Uint8Array(pixelCount);

            function renderTetrisChart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(noiseFrequencyData);

                requestAnimationFrame(renderTetrisChart);

                svg.selectAll("rect")
                    .data(noiseFrequencyData)
                    .attr("fill-opacity",function(d,i){
                        return Math.max(0, d-frequencyThreshold) / (255-frequencyThreshold);
                    })

                    
            }

            // Run the loop
            renderTetrisChart();
            
        }

        else if(visualizationChoice == "fan"){
            console.log("run fan visual");

            var numSectors = 24;
            var hueRange = 80;

            //line inputs
            var lineLength = Math.min(svgHeight,svgWidth)/2 * 0.9;
            var lineStrokeWidth = 4;

            //arc inputs
            var minInnerRadius = lineLength * 0.3;
            var maxInnerRadius = lineLength * 1;
            var outerRadius = lineLength;
            var radiusRange = maxInnerRadius - minInnerRadius;
            var angleRange = (Math.PI * 2) / numSectors;
            var startAngleArray = [];

            var currentSector = 0;
            var previousSector = -1;

            var frequencyThreshold = 50;
            
            //animation inputs
            var animationSpeed = 10000; //higher value gives slower animation
            var fanFrequencyData = new Uint8Array(numSectors);
            var startingTime = performance.now(); 
            var sectorStartTime = performance.now();

            var fanState = "open";
            var sectorStateArray = [];

            analyser.smoothingTimeConstant = 0.94;

            //initial draw of arc and spoke line in each sector
            for(var i=0; i<numSectors; i++){

                var startAngle = -Math.PI * 0.5 + (angleRange * i);
                var endAngle = startAngle;
                
                startAngleArray.push(startAngle);
                sectorStateArray.push("off");
                
                var hueValue = fillHue - hueRange/2 + Math.random() * hueRange;
                var saturationValue = Math.random() * 0.3 + 0.5;
                var lightnessValue = Math.random() * 0.3 + 0.5;
    
                var singleArc = d3.arc()
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    .innerRadius(maxInnerRadius)
                    .outerRadius(outerRadius);
                
                //draw arc in each sector
                svg.append("path")
                    .attr("d", singleArc)
                    .attr("class","arc")
                    .attr("id","arc"+(i))
                    .attr("fill", d3.hsl(hueValue, saturationValue, lightnessValue))
                    .attr("transform", "translate("+svgWidth/2+","+svgHeight/2+")");

                
                var lineXVal = Math.sin(startAngle) * (lineLength) + svgWidth/2;
                var lineYVal = svgHeight - (Math.cos(startAngle) * (lineLength) + svgHeight/2);

                //draw spoke lines
                svg.append("line")
                    .attr("x1",svgWidth/2)
                    .attr("x2",lineXVal)
                    .attr("y1",svgHeight/2)
                    .attr("y2",lineYVal)
                    .attr("stroke",strokeColour)
                    .attr("stroke-width",lineStrokeWidth)
                    .attr("stroke-opacity",0)
                    .attr("id","line"+i)
        
            }
            
            //draw other lines
            var activeLine = svg.append("line")
                            .attr("x1",svgWidth/2 - lineLength)
                            .attr("x2",svgWidth/2)
                            .attr("y1",svgHeight/2)
                            .attr("y2",svgHeight/2)
                            .attr("stroke",strokeColour)
                            .attr("stroke-width",lineStrokeWidth)

            //passive starting line
            svg.append("line")
                .attr("x1",svgWidth/2 - lineLength)
                .attr("x2",svgWidth/2)
                .attr("y1",svgHeight/2)
                .attr("y2",svgHeight/2)
                .attr("stroke",strokeColour)
                .attr("stroke-width",lineStrokeWidth) 

            //animation
            function renderFanChart() {
                
                var currentTime = performance.now();
                var timeElapsed = currentTime - startingTime;
                var shift = timeElapsed / animationSpeed;

                var currentVal = -shift * Math.PI - Math.PI * 0.5;
                var xVal = Math.sin(currentVal) * (lineLength) + svgWidth/2;
                var yVal = Math.cos(currentVal) * (lineLength) + svgHeight/2;
                currentSector = Math.floor(timeElapsed / (animationSpeed*2/numSectors)) % numSectors;

                //update values when moving into a new sector
                if(currentSector != previousSector){
                    console.log("draw line segment");
                    
                    d3.select("#line"+currentSector)
                        .attr("stroke-opacity",function(d,i){
                            if(fanState == "open"){
                                return 1;
                            } else {
                                return 0;
                            }
                        })

                    sectorStartTime = performance.now();

                    //toggle sector state on vs off
                    if(sectorStateArray[currentSector] == "off"){
                        sectorStateArray[currentSector] = "on";
                    } else {
                        sectorStateArray[currentSector] = "off";
                    }

                    //toggle overall fan state open/close when completing a full cycle
                    if(currentSector == 0 && previousSector == (numSectors-1)){
                        if(fanState == "open"){
                            fanState = "close";
                        } else {
                            fanState = "open";
                        }
                    }
                }

                previousSector = currentSector;

                var sectorTimeElapsed = currentTime - sectorStartTime;

                analyser.getByteFrequencyData(fanFrequencyData);

                requestAnimationFrame(renderFanChart);

                //update arcs
                d3.selectAll(".arc")
                    .data(fanFrequencyData)
                    .attr("d", function(d,i){

                        currentState = sectorStateArray[i];
                                            
                        if(i == currentSector){
                            if(currentState == "on"){
                                //open sector over time
                                var newStartAngle = startAngleArray[i];
                                var newEndAngle = newStartAngle + (sectorTimeElapsed / (animationSpeed*2) * (Math.PI*2));
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius - (Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold) * radiusRange))
                                    .outerRadius(outerRadius)(d);

                            } else {
                                //close sector over time
                                var newStartAngle = startAngleArray[i] + (sectorTimeElapsed / (animationSpeed*2) * (Math.PI*2));
                                var newEndAngle = startAngleArray[i] + angleRange;
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius - (Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold) * radiusRange))
                                    .outerRadius(outerRadius)(d);
                            }
                        }
                        
                        else if(i < currentSector) {
                            
                            if(fanState == "open"){
                                //show full sector
                                var newStartAngle = startAngleArray[i];
                                var newEndAngle = newStartAngle + angleRange;
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius - (Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold) * radiusRange))
                                    .outerRadius(outerRadius)(d);
                            } else {
                                //don't show sector
                                var newStartAngle = startAngleArray[currentSector];
                                var newEndAngle = newStartAngle;
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius)
                                    .outerRadius(outerRadius)(d);
                            }
                        }

                        else if(i > currentSector){
                            if(sectorStateArray[i] == "on"){
                                //show full sector
                                var newStartAngle = startAngleArray[i];
                                var newEndAngle = newStartAngle + angleRange;
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius - (Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold) * radiusRange))
                                    .outerRadius(outerRadius)(d);
                            } else {
                                //don't show sector
                                var newStartAngle = startAngleArray[currentSector];
                                var newEndAngle = newStartAngle;
                                
                                return d3.arc()
                                    .startAngle(newStartAngle)
                                    .endAngle(newEndAngle)
                                    .innerRadius(maxInnerRadius)
                                    .outerRadius(outerRadius)(d);
                            }
                        }
                    })

                //update line arm
                activeLine
                    .attr("x1",svgWidth/2)    
                    .attr("x2",xVal)
                    .attr("y1",svgHeight/2)
                    .attr("y2",yVal)         
            }

            // Run the animation loop
            renderFanChart();
        }

        else if(visualizationChoice == "connect36"){
            var numCols = 6;
            var numRows = 6;
            var numCircles = numCols * numRows;
            var cellWidth = svgWidth / numCols;
            var cellHeight = svgHeight / numRows;
            var circleRadius = Math.min(cellWidth, cellHeight)/2 * 0.55;
            var maxTranslate = circleRadius * 1.0; //maximum amount of pixels to move away from circle center
            var pixelOffset = circleRadius * 0.55;
            var strokeWidth = 2;

            var circle1Opacity = 1;
            var circle2Opacity = 0.5;

            var circlePositionArray = [];

            var hueRange1 = 120;
            var hueRange2 = 120;
            var hue1 = backgroundHue;
            var hue2 = fillHue;

            var frequencyThreshold = 170;

            var meldFrequencyData = new Uint8Array(numCircles);
            analyser.smoothingTimeConstant = 0.92;

            /*
            //var backgroundCircleRadius = svgWidth * 0.7014;
            var backgroundCircleRadius = svgWidth * 0.82;
            var backgroundCircleOpacity = 0.10;
            var backgroundCircleHueRange = 360;
            var backgroundCircleSaturation = 0.3;            
            var backgroundCircleLightness = 0.8;

            //draw large background circles
            svg.append("circle")
                .attr("cx",0)
                .attr("cy",0)
                .attr("r",backgroundCircleRadius)
                .attr("fill",d3.hsl(backgroundHue+Math.random()*backgroundCircleHueRange-backgroundCircleHueRange/2,backgroundCircleSaturation,backgroundCircleLightness))
                .attr("fill-opacity",backgroundCircleOpacity)

            svg.append("circle")
                .attr("cx",svgWidth)
                .attr("cy",0)
                .attr("r",backgroundCircleRadius)
                .attr("fill",d3.hsl(backgroundHue+Math.random()*backgroundCircleHueRange-backgroundCircleHueRange/2,backgroundCircleSaturation,backgroundCircleLightness))
                .attr("fill-opacity",backgroundCircleOpacity)

            svg.append("circle")
                .attr("cx",0)
                .attr("cy",svgHeight)
                .attr("r",backgroundCircleRadius)
                .attr("fill",d3.hsl(backgroundHue+Math.random()*backgroundCircleHueRange-backgroundCircleHueRange/2,backgroundCircleSaturation,backgroundCircleLightness))
                .attr("fill-opacity",backgroundCircleOpacity)

            svg.append("circle")
                .attr("cx",svgWidth)
                .attr("cy",svgHeight)
                .attr("r",backgroundCircleRadius)
                .attr("fill",d3.hsl(backgroundHue+Math.random()*backgroundCircleHueRange-backgroundCircleHueRange/2,backgroundCircleSaturation,backgroundCircleLightness))
                .attr("fill-opacity",backgroundCircleOpacity)
            */

            //initial draw of grid and circles
            for(var i=0; i<numRows; i++){
                for(var j=0; j<numCols; j++){
                    
                    var circleX = j * cellWidth + circleRadius + pixelOffset; 
                    var circleY = svgHeight - ((i+1) * cellHeight) + circleRadius + pixelOffset;

                    circlePositionArray.push({x: circleX, y: circleY});

                    var hueValue1 = hue1 - hueRange1/2 + Math.random() * hueRange1;
                    var saturationValue1 = 0.5;
                    var lightnessValue1 = 0.5;

                    var hueValue2 = hue2 - hueRange2/2 + Math.random() * hueRange2;
                    var saturationValue2 = 0.7 * Math.random() + 0.3;
                    var lightnessValue2 = 0.5 * Math.random() + 0.3;
                    
                    //draw first circles - static
                    svg
                        .append("circle")
                        .attr("r",circleRadius)
                        .attr("cx",circleX)
                        .attr("cy",circleY)
                        .attr("fill",d3.hsl(hueValue1, saturationValue1, lightnessValue1))
                        .attr("fill-opacity",circle1Opacity)
                        //.attr("stroke",strokeColour)
                        //.attr("stroke-width",strokeWidth)

                    //draw active circles which will translate based on music
                    svg
                        .append("circle")
                        .attr("r",circleRadius)
                        .attr("cx",circleX)
                        .attr("cy",circleY)
                        .attr("fill",d3.hsl(hueValue2, saturationValue2, lightnessValue2))
                        .attr("fill-opacity",circle2Opacity)
                        .attr("class","activeCircles")
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",strokeWidth)
                }
            }


            //animate
            function renderMeldChart() {

                requestAnimationFrame(renderMeldChart);

                analyser.getByteFrequencyData(meldFrequencyData);

                svg.selectAll(".activeCircles")
                    .data(meldFrequencyData)
                    .attr("cx",function(d,i){
                        var translateVal = maxTranslate * (Math.max(0, d-frequencyThreshold) / (255-frequencyThreshold));
                        return circlePositionArray[i].x + translateVal;
                    })
                    .attr("cy",function(d,i){
                        var translateVal = maxTranslate * (Math.max(0, d-frequencyThreshold) / (255-frequencyThreshold));
                        return circlePositionArray[i].y + translateVal;
                    })

            }

            //run the animation loop
            renderMeldChart();

        }

        else if(visualizationChoice == "bpm"){

            var minTimeGap = 400; //min gap in milliseconds after beat is recorded
            var frequencyThreshold = 180;
            var frequencyBuckets = 10;
            var bpmFrequencyData = new Uint8Array(frequencyBuckets)
            var timeOfLastBeat = performance.now();
            var beatCount = 0;
            var radiusIncrement = 8;
            var minRadius = 10;

            function renderBPMChart() {

                analyser.getByteFrequencyData(bpmFrequencyData)

                var currentTime = performance.now();

                requestAnimationFrame(renderBPMChart);

                if(bpmFrequencyData[0] > frequencyThreshold && (currentTime - timeOfLastBeat) > minTimeGap){
                    timeOfLastBeat = currentTime;
                    beatCount++;
                    
                    svg
                        .append("circle")
                        .attr("r",minRadius + beatCount * radiusIncrement)
                        .attr("cx",svgWidth/2)
                        .attr("cy",svgHeight/2)
                        .attr("fill","none")
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",2)
                        
                }


            }

            renderBPMChart();

        }

        else if(visualizationChoice == "eclipse"){

            var numCircles = 60;
            var circleRadius = Math.min(svgHeight, svgWidth)/2 * 0.2;
            var maxShift = Math.min(svgHeight, svgWidth)/2 * 0.7;
            var hueRange = 150;
            var circleOpacity = 0.4;
            var frequencyThreshold = 185;
            var strokeWidth = 5;
            
            var eclipseFrequencyData = new Uint8Array(numCircles);
            analyser.smoothingTimeConstant = 0.96;

            //initial draw of circles

            for(var j=0; j<numCircles; j++){
                var hueValue = fillHue - hueRange/2 + (hueRange/numCircles) * j;
                var saturationValue = Math.random() * 0.5 + 0.3;
                var lightnessValue = Math.random() * 0.5 + 0.3;
                var currentColour = d3.hsl(hueValue, saturationValue, lightnessValue);

                svg
                    .append("circle")
                    .attr("cx", svgWidth/2)
                    .attr("cy", svgHeight/2)
                    .attr("r",circleRadius)
                    .attr("fill",currentColour)
                    .attr("fill-opacity",circleOpacity)
            }

            
            //draw static circle in the middle
            svg
                .append("circle")
                .attr("cx", svgWidth/2)
                .attr("cy", svgHeight/2)
                .attr("r",circleRadius)
                .attr("fill",backgroundColour)
                .attr("fill-opacity",1)
                .attr("stroke",strokeColour)
                .attr("stroke-width",strokeWidth)
            

            function renderEclipseChart(){

                analyser.getByteFrequencyData(eclipseFrequencyData);

                var t = performance.now();
                var rotateSpeed = 400; //higher value gives slower rotation

                requestAnimationFrame(renderEclipseChart);

                svg.selectAll("circle")
                    .data(eclipseFrequencyData)
                    .attr("cy",function(d,i){
                        return Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold) * maxShift + svgHeight/2;
                    })
                    .attr("transform",function(d,i){
                        return "rotate("+(i * 360/numCircles + (180+t/rotateSpeed))+" "+svgWidth/2+" "+svgHeight/2+")";
                    })

            }

            renderEclipseChart();




        }


        else if(visualizationChoice == "lilyPads"){

            //perlin inputs
            //source: https://joeiddon.github.io/projects/javascript/perlin

            var GRID_SIZE = 6;
            var RESOLUTION = 32;
            
            var hueRange = 0;

            var pixel_size = Math.ceil(svgWidth / RESOLUTION);

            var num_pixels = GRID_SIZE / RESOLUTION;

            var pixelCount = 0;

            //flow field inputs
            var gridHeight = svgHeight*1;
            var gridWidth = svgWidth*1;

            var numCols = GRID_SIZE * RESOLUTION;
            var numRows = GRID_SIZE * RESOLUTION;
            var numCells = numCols * numRows;

            var cellWidth = Math.ceil(gridWidth / numCols);
            var cellHeight = Math.ceil(gridHeight / numCols);

            var angleArray = [];

            var angleRotation = Math.random() * (Math.PI*2); //global rotation for all lines

            analyser.smoothingTimeConstant = 0.95;

            //line inputs
            var numLines = 200;
            
            var minLinePoints = 30;
            var maxLinePoints = 120;
            var linePointRange = maxLinePoints - minLinePoints;

            var minLineStrokeWidth = 2;
            var maxLineStrokeWidth = 15;
            var lineStrokeWidthRange = maxLineStrokeWidth - minLineStrokeWidth;

            var lineStepLength = cellWidth * 0.5;
            var lineOpacity = 0.45;

            //circle inputs
            var numCircles = 17;
            var stepLength = cellWidth * 0.15;

            var maxCircleSize = Math.min(svgHeight, svgWidth)/2 * 0.2;
            var maxStrokeWidth = 9;
            var circleSize = 20;
            var sizeExponent = 1;
            var frequencyThreshold = 185;

            var circlePositionArray = [];

            var lilyPadFrequencyData = new Uint8Array(numCircles);

            //clear the background on refresh
            perlin.seed();

            //create flow field angles
            for (var y = 0; y < GRID_SIZE; y += num_pixels / GRID_SIZE){

                angleArray[Math.round(y / (num_pixels / GRID_SIZE))] = [];


                for (var x = 0; x < GRID_SIZE; x += num_pixels / GRID_SIZE){
                    
                    var perlinValue = Number(perlin.get(x,y));
                    var normalizedPerlinValue = (perlinValue + 1)/2; //between 0 and 1
                    var lightnessValue = (Math.sin(perlinValue * Math.PI) + 1)/2 / 8;

                    /*
                    //var currentColour = d3.hsl(perlinValue * hueRange + fillHue, 0.6, 0.5);
                    var currentColour = d3.hsl(backgroundHue,0.3,lightnessValue);

                    //heatmap
                    svg
                        .append("rect")
                        .attr("x",x / GRID_SIZE * svgWidth)
                        .attr("y",y / GRID_SIZE * svgHeight)
                        .attr("width",pixel_size)
                        .attr("height",pixel_size)
                        .attr("fill",currentColour)
                        .attr("fill-opacity",0.04)
                        .attr("stroke","none")

                    svg
                        .append("rect")
                        .attr("x",x / GRID_SIZE * svgWidth)
                        .attr("y",y / GRID_SIZE * svgHeight)
                        .attr("width",cellWidth)
                        .attr("height",cellHeight)
                        .attr("fill","none")
                        .attr("stroke","white")
                    */

                    pixelCount++;

                    //0 PI is South, 0.5 PI is East, 1 PI is North, 1.5 PI is West, 2 PI is South 
                    var angle = normalizedPerlinValue * (Math.PI * 2) + angleRotation;

                    angleArray[Math.round(y / (num_pixels / GRID_SIZE))][Math.round(x / (num_pixels / GRID_SIZE))] = angle;
                }
            }
            //console.log(angleArray);

            //draw flow line paths
            var lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .curve(d3.curveBasis)

            
            for(var i=0; i<numLines; i++){

                var numPoints = minLinePoints + Math.floor(linePointRange * Math.random());
                var points = [];

                var previousLineX = (svgWidth-1) * Math.random();
                var previousLineY = (svgHeight-1) * Math.random();
                points.push({"x": previousLineX, "y": previousLineY});

                /*
                //draw dot at line starting point
                svg.append("circle")
                    .attr("cx",previousLineX)
                    .attr("cy",previousLineY)
                    .attr("r",6)
                    .attr("fill",strokeColour)
                */
                for(var j=0; j<numPoints; j++){
                    
                    if(previousLineX > svgWidth || previousLineX < 0 || previousLineY > svgHeight || previousLineY < 0){
                        break;
                    }
    
                    //console.log("row #: "+Math.floor(previousLineY / cellHeight)+", col #: "+Math.floor(previousLineX / cellWidth));
                    
                    var currentAngle = angleArray[Math.floor(previousLineY / cellHeight)][Math.floor(previousLineX / cellWidth)];
                    var xTranslate = Math.sin(currentAngle) * lineStepLength;
                    var yTranslate = Math.cos(currentAngle) * lineStepLength;
    
                    var xVal = previousLineX + xTranslate;
                    var yVal = previousLineY + yTranslate;
    
                    points.push({"x": xVal, "y": yVal});
    
                    previousLineX = xVal;
                    previousLineY = yVal;
    
                }
    
                svg
                    .append('path')
                    .datum(points)
                    .attr('d', lineFunction)
                    .attr('stroke', strokeColour)
                    .attr("stroke-width", lineStrokeWidthRange * Math.random() + minLineStrokeWidth)
                    .attr("stroke-opacity",lineOpacity)
                    .attr('fill', 'none');

            }

              
            //draw circle at random position
            for(var i=0; i<numCircles; i++){
                
                var xVal = Math.random() * svgWidth;
                var yVal = Math.random() * svgHeight;

                circlePositionArray.push({x: xVal, y: yVal});

                var hueValue = fillHue - hueRange/2 + Math.random() * hueRange;
                var saturationValue = 0.6 * Math.random() + 0.2;
                var lightnessValue = 0.6 * Math.random() + 0.2;

                svg
                    .append("circle")
                    .attr("id","circle"+(i+1))
                    .attr("r",circleSize)
                    .attr("cx", xVal)
                    .attr("cy", yVal)
                    .attr("fill",d3.hsl(hueValue, saturationValue, lightnessValue))
                    .attr("fill-opacity",1)
                    //.attr("fill-opacity",Math.random() + 0.3)
                    //.attr("stroke",strokeColour)
                    //.attr("stroke-width",Math.random() * maxStrokeWidth)
            }

            function renderLilyPadChart() {
                
                analyser.getByteFrequencyData(lilyPadFrequencyData);

                requestAnimationFrame(renderLilyPadChart);

                for(var j=0; j<numCircles; j++){

                    var currentX = circlePositionArray[j].x;
                    var currentY = circlePositionArray[j].y;
                    var currentAngle = angleArray[Math.floor(currentY / cellHeight)][Math.floor(currentX / cellWidth)];
                    
                    var currentRadius = (Math.pow(Math.max(0,lilyPadFrequencyData[j]-frequencyThreshold),sizeExponent) / Math.pow((255-frequencyThreshold),sizeExponent)) * maxCircleSize;
                    
                    var xTranslate = Math.sin(currentAngle) * stepLength;
                    var yTranslate = Math.cos(currentAngle) * stepLength;
    
                    var newX = currentX + xTranslate;
                    var newY = currentY + yTranslate;
    
                    //place circle back on the canvas to restart once it goes out of bounds
                    if(newX > svgWidth || newX < 0 || newY > svgHeight || newY < 0){
                        
                        newX = Math.random() * svgWidth-1;
                        newY = Math.random() * svgHeight-1;  

                    }

                    svg.select("#circle"+(j+1))
                        .attr("cx",newX)
                        .attr("cy",newY)
                        .attr("r",currentRadius)

                    circlePositionArray[j].x = newX;
                    circlePositionArray[j].y = newY;

                }
            }

            renderLilyPadChart();  
            
        }

        else if(visualizationChoice == "rainbowRoad"){
            console.log("Run rainbowRoad visualization");
    
            analyser.smoothingTimeConstant = 0.9;

            var numPassiveCols = 2;
            var numActiveCols = 24;
            var numTotalCols = numPassiveCols + numActiveCols;
    
            var strokeWidth = 0.3;
            var heightRange = svgHeight * 0.45;
            var numPaths = 12;
            var pathOffset = svgHeight * 0.05;
            var initialOffset = -svgHeight * 0.2;
            var baselineFrequency = 160;

            var hueRange = 120;
    
            var yarnFrequencyData = new Uint8Array(numActiveCols);
            var chartData = [];
    
            for (var j=0; j<numPaths; j++){
                svg.append("path")
                    .datum(chartData)
                    .attr("id","path"+j)
                    .attr("fill", function(d,i){
                        if(j == (numPaths-1)){
                            return backgroundColour;
                        } else {
                            return d3.hsl(fillHue - hueRange/2 + (j/numPaths) * hueRange, 0.6, 0.5);
                        }
                    })
                    .attr("stroke", backgroundColour)
                    .attr("stroke-width", strokeWidth)
                    .attr("d", d3.area()
                        .x(function(d,i) {
                            return svgWidth/(numTotalCols-1) * i;
                        })
                        .y0(svgHeight)
                        .y1(function(d) {
                            return svgHeight - (initialOffset + pathOffset*(numPaths-j) + d/255 * heightRange);
                        })
                        .curve(d3.curveBasis)
                    );
            }
        
            // Continuously loop and update chart with frequency data.
            function renderYarnChart() {
                
                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(yarnFrequencyData);
    
                for(var i=0; i<numTotalCols; i++){

                    if(i < numPassiveCols/2){
                        chartData[i] = baselineFrequency;
                    } else if(i < numPassiveCols/2 + numActiveCols){
                        chartData[i] = yarnFrequencyData[i-numPassiveCols/2];                    
                    } else {
                        chartData[i] = baselineFrequency;
                    }
                }
    
                requestAnimationFrame(renderYarnChart);

                for(var j=0; j<numPaths; j++){
                    d3.select("#path"+j)
                        .attr("d", d3.area()
                            .x(function(d,i) {
                                return svgWidth/(numTotalCols-1) * i;
                            })
                            .y0(svgHeight)
                            .y1(function(d) {
                                return svgHeight - (initialOffset + pathOffset*(numPaths-j) + d/255 * heightRange);
                            })
                            .curve(d3.curveBasis)
                        );
                }
            }
    
            // Run the loop
            renderYarnChart();
    
    
        }

        else if(visualizationChoice == "changingLanes"){
            var numDots = 60;
            var dotFrequencyData = new Uint8Array(numDots);
            var totalDotWidth = svgWidth*0.9;
            var minDotRadius = 5;
            var maxDotRadius = totalDotWidth/(numDots/2) * 2;
            var dotRadiusRange = maxDotRadius - minDotRadius;
            var maxHeightShift = svgHeight/2 * 0.75;
            var frequencyThreshold = 175;
            var dotOpacity = 1;
            var strokeWidth = 2;
            var widthMargin = (svgWidth - totalDotWidth)/2;

            analyser.smoothingTimeConstant = 0.90;
            var animationSpeed = 2000; //higher value gives slower animation

            //place initial dots
            for(var j=0; j<numDots; j++){
                svg
                    .append("circle")
                    .attr("r",maxDotRadius)
                    .attr("cx",widthMargin + totalDotWidth/(numDots-1) * j)
                    .attr("cy",svgHeight/2)
                    .attr("fill",function(){
                        if(j%2==0){
                            return fillColour;
                        } else{
                            return strokeColour;
                        }
                    })
                    .attr("fill-opacity",dotOpacity)
                    .attr("stroke",function(){
                        if(j%2==0){
                            return strokeColour;
                        } else{
                            return fillColour;
                        }
                    })
                    .attr("stroke-width",strokeWidth)
            }
            
            //animate
            function renderDotWaveChart(){

                var t = performance.now();
                analyser.getByteFrequencyData(dotFrequencyData);

                requestAnimationFrame(renderDotWaveChart);

                svg.selectAll("circle")
                    .data(dotFrequencyData)    
                    .attr("cy",function(d,i){
                        //return svgHeight/2 + Math.sin(t/animationSpeed * (numDots/2+0.5-i)) * maxHeightShift;
                        //return svgHeight/2 + Math.sin(t/animationSpeed) * maxHeightShift;
                        //return svgHeight/2 + Math.sin(t/animationSpeed + (Math.PI*2)/(numDots-1)*i) * maxHeightShift;

                        if(i%2==0){
                            return svgHeight/2 + Math.sin(t/animationSpeed + (Math.PI*2)/(numDots-1)*i) * maxHeightShift;
                        } else {
                            return svgHeight/2 + Math.cos(t/animationSpeed + (Math.PI*2)/(numDots-1)*i + Math.PI * 0.5) * maxHeightShift;
                        }
                    })
                    .attr("r",function(d,i){
                        return minDotRadius + Math.max(0, (d-frequencyThreshold)/(255-frequencyThreshold) * dotRadiusRange);
                    })

            }

            renderDotWaveChart();
        }

        else if(visualizationChoice == "seigaiha"){

            var numCols = 6;
            var initialRadius = svgWidth / (numCols-1) / 2;
            var maxRadius = initialRadius * 1.5;
            var radiusRange = maxRadius - initialRadius;
            var radiusFactor = 0.7; //radius percentage for each nested circle
            var numRows = Math.ceil(svgHeight / initialRadius * 2) + 2;
            var circlesPerSpot = 5;
            var numCircles = numCols * numRows * circlesPerSpot;
            var numActiveCircles = numCols * numRows;
            var strokeWidth = 2.5;
            var frequencyThreshold = 120;
            var circleOpacity = 1;
            var spotCount = 0;
            var hueRange = 150;

            analyser.smoothingTimeConstant = 0.9;

            var frequencyData = new Uint8Array(numActiveCircles);

            //initial draw
            for(var i=0; i<numRows; i++){
                for(var j=0; j<numCols; j++){

                    var xVal;
                    var yVal = initialRadius/2 * i;

                    if(i%2 == 0){
                        xVal = initialRadius*2 * j;
                    } else {
                        if(j==numCols-1){
                            break;
                        }
                        xVal = initialRadius*2 * j + initialRadius;
                    }

                    for(var k=0; k<circlesPerSpot; k++){
                        svg.append("circle")
                            .attr("r",function(){
                                return initialRadius * Math.pow(radiusFactor, k);
                            })    
                            .attr("cx",xVal)
                            .attr("cy",yVal)
                            .attr("fill",fillColour)
                            .attr("fill-opacity",circleOpacity)
                            .attr("stroke",strokeColour)
                            .attr("stroke-width",strokeWidth)
                            .attr("class",function(){
                                if(k==0){
                                    return "activeCircle spot"+spotCount;
                                } else {
                                    return "passiveCircle spot"+spotCount;
                                }
                            })
                    }

                    spotCount++;
                }
            }

            //animate

            function animateChart(){

                analyser.getByteFrequencyData(frequencyData);
                requestAnimationFrame(animateChart);

                for(var j=0; j<numActiveCircles; j++){
                    svg.selectAll(".spot"+j)
                    .attr("fill",function(d,i){
                        if(colourChoice=="Noir"){
                            return d3.hsl(150,0,Math.max(0,(frequencyData[j]-frequencyThreshold))/(255-frequencyThreshold));
                        } else {
                            return d3.hsl(fillHexArray[0]-hueRange/2+(Math.max(0,frequencyData[j]-frequencyThreshold))/(255-frequencyThreshold)*hueRange,Math.min(0.8,Math.max(0.5,fillHexArray[1])),Math.min(0.8,Math.max(0.5,fillHexArray[2])));
                        }
                    })
                }
                
            }
            animateChart();
        }

        else if(visualizationChoice == "ripples"){

            var numCols = 5;
            var initialRadius = svgWidth / (numCols-1) / 2;
            var maxRadius = initialRadius * 1;
            var radiusRange = maxRadius - initialRadius;
            var maxRadiusIncrease = 0.4; //max percentage increase in active circle radius
            var radiusFactor = 0.75; //radius percentage for each nested circle
            var numRows = Math.ceil(svgHeight / initialRadius * 2) + 2;
            var maxCirclesPerSpot = 10;
            var numCircles = numCols * numRows * circlesPerSpot;
            var numActiveCircles = numCols * numRows;
            var strokeWidth = 2;
            var frequencyThreshold = 120;
            var circleOpacity = 0;
            var initialStrokeOpacity = 0.25;
            var probabilityNilOpacity = 0.6;
            var maxFillOpacity = 0.3;
            var fadeInTime = 120; //seconds to fade in inner circles
            var fadeOutTime = 120; //seconds to fade out inner circles
            var startTime = performance.now();
            var activeCircleRadiusArray = [];

            analyser.smoothingTimeConstant = 0.88;

            var frequencyData = new Uint8Array(numActiveCircles);

            //initial draw
            for(var i=0; i<numRows; i++){
                for(var j=0; j<numCols; j++){

                    var circlesPerSpot = Math.ceil(Math.random()*maxCirclesPerSpot);
                    var xVal;
                    var yVal = svgHeight - (initialRadius/2 * i);
                    //var yVal = (initialRadius/2 * i);

                    if(i%2 == 0){
                        xVal = initialRadius*2 * j;
                    } else {
                        if(j==numCols-1){
                            break;
                        }
                        xVal = initialRadius*2 * j + initialRadius;
                    }

                    for(var k=0; k<circlesPerSpot; k++){
                        svg.append("circle")
                            .attr("r",function(){
                                var currentRadius = initialRadius * Math.pow(radiusFactor, k);
                                if(k==(circlesPerSpot-1)){
                                    activeCircleRadiusArray.push(currentRadius);
                                }
                                return currentRadius;
                            })    
                            .attr("cx",xVal)
                            .attr("cy",yVal)
                            .attr("fill",fillColour)
                            .attr("fill-opacity",0)
                            .attr("stroke",strokeColour)
                            .attr("stroke-opacity",function(){
                                var randomNum = Math.random();
                                if(randomNum < probabilityNilOpacity){
                                    return 0;
                                } else {
                                    return Math.random() * initialStrokeOpacity;
                                }
                            })
                            .attr("stroke-width",strokeWidth)
                            .attr("class",function(){
                                if(k==(circlesPerSpot-1)){
                                    return "activeCircle";
                                } else {
                                    return "passiveCircle";
                                }
                            })
                         
                    }
                }
            }

            //animate

            function animateChart(){

                analyser.getByteFrequencyData(frequencyData);
                var t = performance.now();

                requestAnimationFrame(animateChart);

                svg.selectAll(".activeCircle")
                    .data(frequencyData)
                    .attr("r",function(d,i){
                        return activeCircleRadiusArray[i] + (activeCircleRadiusArray[i] * maxRadiusIncrease * (Math.max(d-frequencyThreshold,0) / (255-frequencyThreshold)));
                    })
                    .attr("stroke-opacity",function(d,i){
                        return Math.max(d+30-frequencyThreshold,0) / (255-frequencyThreshold);
                    })
                    .attr("fill-opacity",function(d,i){
                        return Math.max(d-frequencyThreshold,0) / (255-frequencyThreshold) * maxFillOpacity;
                    })


                    /*
                    .attr("fill",function(d,i){
                        if(d>frequencyThreshold){
                            return strokeColour;
                        } else{
                            return activeCircleFillArray[i];
                        }
                    })
                    */

                /*
                svg.selectAll(".passiveCircle")
                    .attr("fill-opacity",function(){
                        var elapsedSeconds = (t-startTime)/1000;

                        if(elapsedSeconds < fadeInTime){
                            return elapsedSeconds / fadeInTime;
                        } else {
                            return Math.max(0,(1-(elapsedSeconds-fadeInTime)/fadeOutTime));
                        }
                    });
                */
            }
            animateChart();
        }

        else if(visualizationChoice == "triangles"){
            var numCols = 8;
            var numRows = 36;
            var numCells = numCols * numRows;
            var initialCellWidth = svgWidth / numCols;
            var initialCellHeight = svgHeight / numRows;
            var maxWidthShift = initialCellWidth * 0.6;
            var maxHeightShift = initialCellHeight * 0.6;
            var hueRange = 150;
            var frequencyData = new Uint8Array(numCells);
            var animationSpeed = 4000; //higher value gives slower animation
            var strokeWidth = 0;
            var frequencyThreshold = 90;
            analyser.smoothingTimeConstant = 0.9;

            var lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                //.curve(d3.curveCatmullRomClosed)
                //.curve(d3.curveBasisClosed)

            //initial draw
            for(var i=0; i<numRows; i++){
                for(var j=0; j<numCols; j++){
                    
                    /*
                    //draw grid cells
                    svg.append("rect")
                        .attr("width",initialCellWidth)
                        .attr("height",initialCellHeight)
                        .attr("x",initialCellWidth * j)
                        .attr("y",initialCellHeight * i)
                        .attr("fill",d3.hsl(fillHue - hueRange/2 + Math.random() * hueRange, 0.6,0.5))
                        .attr("fill-opacity",0.1)
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",strokeWidth)
                        .attr("id","cell"+i+j)
                    */

                    var currentPolygonPoints = [];

                    currentPolygonPoints.push({x: initialCellWidth*j, y: initialCellHeight *(i+1)});
                    currentPolygonPoints.push({x: initialCellWidth*(j+1), y: initialCellHeight *(i+1)});
                    currentPolygonPoints.push({x: initialCellWidth*(j+0.5), y: initialCellHeight *(i)});
                    
                    //console.log(currentPolygonPoints);
                    
                    svg
                        .append('path')
                        .datum(currentPolygonPoints)
                        .attr('d', lineFunction)
                        .attr('fill', fillColour)
                        .attr("id","trianglerow"+i+"col"+j)
                    
                }
            }

            //animate

            function animateChart(){
                
                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);

                requestAnimationFrame(animateChart);

                var previousHeightSum = 0;
                var heightSum = 0;

                for(var i=0; i<numRows; i++){

                    var currentHeight = initialCellHeight + maxHeightShift * Math.cos(t/(animationSpeed/1) + i/(numRows) * Math.PI * 2);
                    heightSum = previousHeightSum + currentHeight;

                    var previousWidthSum = 0;
                    var widthSum = 0;

                    for(var j=0; j<numCols; j++){

                        var currentWidth = initialCellWidth + maxWidthShift * Math.sin(t/(animationSpeed/2) + j/(numCols) * Math.PI * 2);
                        //var currentWidth = initialCellWidth;
                        widthSum = previousWidthSum + currentWidth;

                        /*
                        //update grid
                        svg.select("#cell"+i+j)
                            .attr("fill",d3.hsl(fillHue - hueRange/2 + frequencyData[i*numRows+j]/255 * hueRange, 0.6,0.5))    
                            .attr("x",previousWidthSum)
                            .attr("y",previousHeightSum)
                            .attr("width",currentWidth)
                            .attr("height",currentHeight)
                        */
                        
                        var currentPolygonPoints = [];
                        var trianglePointX = previousWidthSum + +currentWidth/2 + currentWidth/2 * Math.sin(t/(animationSpeed/4) + (i) * Math.PI*0.15 + j*Math.PI*0.05);

                        currentPolygonPoints.push({x: previousWidthSum, y: heightSum});
                        currentPolygonPoints.push({x: widthSum, y: heightSum});
                        currentPolygonPoints.push({x: trianglePointX, y: previousHeightSum});
                                      
                        
                        svg.select("#trianglerow"+i+"col"+j)
                            .datum(currentPolygonPoints)
                            .attr("fill",d3.hsl(fillHue - hueRange/2 + Math.max(0,frequencyData[i*numCols+j]-frequencyThreshold)/(255-frequencyThreshold) * hueRange, 0.7,0.5))    
                            .attr('d', lineFunction)
                            
                        previousWidthSum = widthSum;
                    }

                    previousHeightSum = heightSum;
                }
            }
            animateChart();
        }

        else if(visualizationChoice == "hoodoos"){
            var startingTime = performance.now();
            var numCols = 7;
            var circlesPerCol = 18;
            var numCircles = numCols * circlesPerCol;
            var yMargin = svgHeight * 0.12;
            var xMargin = svgWidth * 0.12;
            var yOffset = (svgHeight - yMargin*2) / (circlesPerCol-1);
            var xOffset = (svgWidth - xMargin*2) / (numCols-1);
            var baseRadius = Math.min(svgHeight,svgWidth)/2 * 0.1;
            var radiusRange = Math.min(svgHeight,svgWidth)/2 * 0.04;
            var animationSpeed = 5000; //higher amount gives slower animation
            var frequencyData = new Uint8Array(numCircles);
            var hueRange = 100;
            var frequencyThreshold = 130;
            analyser.smoothingTimeConstant = 0.92;
            var minOpacity = 1;

            //initial draw
            for(var i=0; i<numCols; i++){
                for(var j=0; j<circlesPerCol; j++){
                    svg.append("circle")
                        .attr("r",baseRadius)
                        .attr("cx",xMargin + i * xOffset)
                        .attr("cy",svgHeight - (yMargin + j * yOffset))
                        .attr("fill",fillColour)
                        .attr("stroke",backgroundColour)
                }
            }

            //animate
            function animateChart(){
                var elapsedTime = performance.now() - startingTime;
                analyser.getByteFrequencyData(frequencyData);

                minOpacity = 1 - (elapsedTime/1000/180); //min opacity declines from 1 to 0 in 180 seconds

                requestAnimationFrame(animateChart);

                svg.selectAll("circle")
                    .data(frequencyData)
                    .attr("r",function(d,i){
                        var currentRow = i%circlesPerCol;
                        var currentCol = Math.floor(i/circlesPerCol);
                        var currentRadius = baseRadius;
                        
                        if(currentCol%2 == 0){
                            currentRadius = baseRadius + radiusRange * Math.sin((elapsedTime/animationSpeed) * Math.PI*2 + currentRow-(circlesPerCol/2) * Math.PI*2);
                        }
                        else {
                            currentRadius = baseRadius + radiusRange * Math.sin((elapsedTime/animationSpeed) * Math.PI*2 + currentRow-(circlesPerCol/2) * Math.PI*2 + Math.PI);
                        }

                        return currentRadius;
                    })
                    .attr("fill",function(d,i){
                        return d3.hsl(fillHue - hueRange/2 + hueRange * Math.max(0,(d-frequencyThreshold)/(255-frequencyThreshold)),0.7,(d-frequencyThreshold)/(255-frequencyThreshold));
                        //return d3.hsl(fillHue - hueRange/2 + hueRange * Math.max(0,(d-frequencyThreshold)/(255-frequencyThreshold)),Math.max((d-frequencyThreshold),0)/(255-frequencyThreshold)+0.3,0.5);
                        //return d3.hsl(backgroundHexArray[0]+Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold)*hueRange,Math.min(0.7,Math.max(0.3,backgroundHexArray[1])),Math.min(0.7,Math.max(0.3,backgroundHexArray[2])))
                    })
                    .attr("fill-opacity",function(d,i){
                        return minOpacity + Math.max(0,(d-frequencyThreshold))/(255-frequencyThreshold);
                    })
            }

            animateChart();

        }

        else if(visualizationChoice == "blinds"){
            var numCols = 10;
            var numRows = 10;
            var numCells = numCols * numRows;
            var initialCellWidth = svgWidth / numCols;
            var initialCellHeight = svgHeight / numRows;
            var maxWidthShift = initialCellWidth * 0.7;
            var maxHeightShift = initialCellHeight * 0.7;
            var hueRange = 150;
            var frequencyData = new Uint8Array(numCells);
            var animationSpeed = 6000; //higher value gives slower animation
            var minStrokeWidth = 0.0;
            var maxStrokeWidth = 5;
            var frequencyThreshold = 140;
            analyser.smoothingTimeConstant = 0.9;

            var lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                //.curve(d3.curveCatmullRomClosed)
                //.curve(d3.curveBasisClosed)

            //initial draw
            for(var i=0; i<numRows; i++){
                for(var j=0; j<numCols; j++){
                    
                    
                    //draw grid cells
                    svg.append("rect")
                        .attr("width",initialCellWidth)
                        .attr("height",initialCellHeight)
                        .attr("x",initialCellWidth * j)
                        .attr("y",svgHeight - (initialCellHeight * i))
                        .attr("fill",fillColour)
                        .attr("fill-opacity",1)
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",minStrokeWidth)
                        .attr("id","cell"+i+j)
                    

                        /*
                    var currentPolygonPoints = [];

                    currentPolygonPoints.push({x: initialCellWidth*j, y: initialCellHeight *(i+1)});
                    currentPolygonPoints.push({x: initialCellWidth*(j+1), y: initialCellHeight *(i+1)});
                    currentPolygonPoints.push({x: initialCellWidth*(j+0.5), y: initialCellHeight *(i)});
                    
                    //console.log(currentPolygonPoints);
                    
                    svg
                        .append('path')
                        .datum(currentPolygonPoints)
                        .attr('d', lineFunction)
                        .attr('fill', fillColour)
                        .attr("id","trianglerow"+i+"col"+j)
                        */
                    
                }
            }

            //animate

            function animateChart(){
                
                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);

                requestAnimationFrame(animateChart);

                var previousHeightSum = 0;
                var heightSum = 0;

                for(var i=0; i<numRows; i++){

                    var currentHeight = initialCellHeight + maxHeightShift * Math.cos(t/(animationSpeed/1) + i/(numRows) * Math.PI * 2);
                    heightSum = previousHeightSum + currentHeight;

                    var previousWidthSum = 0;
                    var widthSum = 0;

                    for(var j=0; j<numCols; j++){

                        var currentWidth = initialCellWidth + maxWidthShift * Math.sin(t/(animationSpeed/2) + j/(numCols) * Math.PI * 2);
                        //var currentWidth = initialCellWidth;
                        widthSum = previousWidthSum + currentWidth;

                        var normalizedFrequencyValue = (frequencyData[i*numRows+j]-frequencyThreshold)/(255-frequencyThreshold); 

                        
                        //update grid
                        svg.select("#cell"+i+j)
                            .attr("fill",d3.hsl(fillHue - hueRange/2 + normalizedFrequencyValue * hueRange, normalizedFrequencyValue * 0.8,normalizedFrequencyValue * 0.8))   
                            .attr("x",previousWidthSum)
                            .attr("y",svgHeight - previousHeightSum - currentHeight)
                            .attr("width",currentWidth)
                            .attr("height",currentHeight)
                            .attr("fill-opacity",Math.max(0,frequencyData[i*numRows+j]-frequencyThreshold)/(255-frequencyThreshold))
                            .attr("stroke-width",minStrokeWidth + Math.max(0,frequencyData[i*numRows+j]-frequencyThreshold)/(255-frequencyThreshold) * maxStrokeWidth)
                        
                            /*
                        
                        var currentPolygonPoints = [];
                        var trianglePointX = previousWidthSum + +currentWidth/2 + currentWidth/2 * Math.sin(t/(animationSpeed/4) + (i) * Math.PI*0.15 + j*Math.PI*0.05);

                        currentPolygonPoints.push({x: previousWidthSum, y: heightSum});
                        currentPolygonPoints.push({x: widthSum, y: heightSum});
                        currentPolygonPoints.push({x: trianglePointX, y: previousHeightSum});
                                      
                        
                        svg.select("#trianglerow"+i+"col"+j)
                            .datum(currentPolygonPoints)
                            .attr("fill",d3.hsl(fillHue - hueRange/2 + Math.max(0,frequencyData[i*numCols+j]-frequencyThreshold)/(255-frequencyThreshold) * hueRange, 0.7,0.5))    
                            .attr('d', lineFunction)
                        */

                        previousWidthSum = widthSum;
                    }

                    previousHeightSum = heightSum;
                }
            }
            animateChart();
        }

        else if(visualizationChoice == "dunes"){

            var maxLinePoints = 2;
            var numPoints = maxLinePoints;
            var points = [];
            var maxStrokeWidth = 0;

            var minHeight = svgHeight * 0.25;
            var heightRange = svgHeight * 0.5;
            var shiftMultiplier = 90;
            var minDotRadius = 3;
            var maxDotRadius = 20;

            var numDots = 125;
            var frequencyThreshold = 110;

            var frequencyData = new Uint8Array(numDots);

            analyser.smoothingTimeConstant = 0.9;
            
            var maxWaveShift = svgHeight * 0.25;
            var animationSpeed = 2500; //higher value gives slower animation

            var centralYValArray = [];
            var yShiftArray = [];

            var numAreaPoints = 18;
            var activePoints = [];

            var numStaticDots = 3000;

            var lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .curve(d3.curveNatural)

            //define the initial dot path
            for(var i=0; i<numPoints; i++){

                var xVal = i/(numPoints-1) * (svgWidth);
                
                if(i == 0 || i == (numPoints-1)){
                    var yVal = svgHeight/2;
                } else {
                    var yVal = svgHeight - (Math.random() * heightRange + minHeight);
                }

                points.push({"x": xVal, "y": yVal});
            }

            var path = svg
                .append('path')
                .datum(points)
                .attr('d', lineFunction)
                .attr('stroke', strokeColour)
                .attr("stroke-width", Math.random() * maxStrokeWidth)
                .attr('fill', 'none');

                
            // Add the area            
            for(var i=0; i<numAreaPoints; i++){
                var xVal = i/(numAreaPoints-1)*svgWidth;
                var yVal = svgHeight - (svgHeight/2 + Math.sin(Math.PI*2/(numAreaPoints-1) * i) * maxWaveShift);
                activePoints.push({ "x": xVal, "y": yVal });
            }

            //make defs and add the linear gradient
            var lg = svg.append("defs").append("linearGradient")
            .attr("id", "mygrad")//id of the gradient
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%")//since its a vertical linear gradient 
        
            lg.append("stop")
                .attr("offset", "0%")
                .style("stop-color", backgroundColour)//background colour at the top
                .style("stop-opacity", 1)

            lg.append("stop")
                .attr("offset", "100%")
                .style("stop-color", fillColour)//white at the bottom
                .style("stop-opacity", 1)


            var activePath = svg.append("path")
                .datum(activePoints)
                .attr("fill",'url(#mygrad)')
                //.attr("stroke", "white")
                //.attr("stroke-width", 10)
                //.attr('d', lineFunction)
                .attr("d", d3.area()
                    .x(function(d,i) { return activePoints[i].x })
                    .y0(svgHeight)
                    .y1(function(d,i) { return activePoints[i].y })
                    .curve(d3.curveNatural)
                );
                
            //draw the static dot grain            
            for(var i=0; i<numStaticDots; i++){
                var xVal = i/(numStaticDots-1) * svgWidth;
                var randParetoVal = paretoDistribution(svgHeight-(minHeight+heightRange),6); //higher alpha variable gives more clustering at the start
                //console.log(randParetoVal);
                var yVal = randParetoVal;

                svg.append("circle")
                    .attr("r",1)
                    .attr("cx",xVal)
                    .attr("cy",yVal)
                    .attr("fill",backgroundColour)
            }

            //draw the active dots
            for(var i=0; i<numDots; i++){

                var xVal = i/(numDots-1) * (svgWidth);
                var centralYVal = yValueForX(xVal);

                var gaussRandomShift = randn_bm();
                //var gaussRandomShift = 0;
                var yShift = shiftMultiplier * gaussRandomShift;
                
                centralYValArray.push(centralYVal);
                yShiftArray.push(yShift);

                svg.append("circle")
                    .attr("r",minDotRadius)
                    .attr("cx",xVal)
                    .attr("cy",centralYVal + yShift)
                    .attr("fill",strokeColour)
                    .attr("class","activeCircles")
            }
            
            //helper function to locate the path y value at a given x value input
            function yValueForX(xCor){
                var x = xCor,
                    pathEl = path.node(),
                    pathLength = pathEl.getTotalLength(); 
                    
                var beginning = x, end = pathLength, target;
                while (true) {
                    target = Math.floor((beginning + end) / 2);
                    pos = pathEl.getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== x) {
                        break;
                    }
                    if (pos.x > x)      end = target;
                    else if (pos.x < x) beginning = target;
                    else                break; //position found
                }
                
                return pos.y;
            }

            //animation
            function animateChart(){

                activePoints = [];
                var t = performance.now();

                analyser.getByteFrequencyData(frequencyData);
                requestAnimationFrame(animateChart);

                svg.selectAll(".activeCircles")
                    .attr("cy",function(d,i){                        
                        var waveShift = Math.sin(t / animationSpeed + Math.PI*2 * (i/numDots-1)) * maxWaveShift;
                        var currentYVal = svgHeight - (centralYValArray[i] + yShiftArray[i] * (Math.max(0,frequencyData[i]-frequencyThreshold) / (255-frequencyThreshold)) + waveShift); 
                        return currentYVal;
                    })
                    .attr("r",function(d,i){
                        return minDotRadius + (maxDotRadius-minDotRadius) * (Math.max(0,frequencyData[i]-frequencyThreshold) / (255-frequencyThreshold));
                    })
                    .attr("fill",function(d,i){
                        //return d3.hsl(strokeHexArray[0],strokeHexArray[1],(Math.max(0,frequencyData[i]-frequencyThreshold) / (255-frequencyThreshold)) ) ;
                        return d3.hsl(strokeHexArray[0],strokeHexArray[1],(Math.max(0,frequencyData[i]) / (255)) ) ;
                    })

                for(var i=0; i<numAreaPoints; i++){
                    var xVal = i/(numAreaPoints-1)*svgWidth;
                    var yVal = svgHeight - (svgHeight/2 + Math.sin(t / animationSpeed + Math.PI*2/(numAreaPoints-1) * i + Math.PI*1.0) * maxWaveShift);
                    activePoints.push({ "x": xVal, "y": yVal });
                }

                activePath
                    .attr("d", d3.area()
                        .x(function(d,i) { return activePoints[i].x })
                        .y0(svgHeight)
                        .y1(function(d,i) { return activePoints[i].y })
                        .curve(d3.curveNatural)
                    );                
            }
            animateChart();
        }
    
        else if(visualizationChoice == "scroller"){

            var numLines = 10;
            
            var minDots = 10;
            var maxDots = 40;
            var dotRange = maxDots - minDots;
            var numDots = Number(minDots + Math.round((Math.random()*dotRange)));
            console.log("Number of dots: "+numDots);
            var frequencyThreshold = 140;
            var frequencyData = new Uint8Array(numDots);
            analyser.smoothingTimeConstant = 0.95;

            var initialDotRadius = svgWidth / numDots / 2;
            //var initialDotRadius = 50;
            var minDotRadius = 5;
            var maxDotRadius = 10;

            var initialXMargin = initialDotRadius;
            var maxYShift = svgHeight * 0.8;

            var maxDotLightness = 0.8;
            var minDotLightness = 0.2;
            var dotLightnessRange = maxDotLightness - minDotLightness;

            var animationSpeed = 15 ; //higher value gives slower animation

            //draw the vertical lines
            for(var i=0; i<numLines; i++){

                var xVal = (i/(numLines-1) * (svgWidth));

                var mainStrokeColour = d3.hsl(strokeHexArray[0],strokeHexArray[1], 0.5);
                var minorStrokeColour = d3.hsl(strokeHexArray[0],strokeHexArray[1], 0.4);

                svg.append("line")
                    .style("stroke", minorStrokeColour)  // colour the line
                    .attr("x1", xVal)     // x position of the first end of the line
                    .attr("y1", svgHeight)      // y position of the first end of the line
                    .attr("x2", xVal)     // x position of the second end of the line
                    .attr("y2", 0)    // y position of the second end of the line
                    .attr('stroke-width', 1)
                    .attr("class","verticalLines")
            }

            //draw the active dots
            for(var i=0; i<numDots; i++){

                var xVal = (i/(numDots-1) * (svgWidth)) - initialDotRadius;
                var yVal = svgHeight / 2;

                var dotColour = d3.hsl(fillHexArray[0],fillHexArray[1], maxDotLightness - (dotLightnessRange * (i/(numDots-1))));

                svg.append("circle")
                    .attr("r",initialDotRadius)
                    .attr("cx",xVal)
                    .attr("cy",yVal)
                    .attr("fill",dotColour)
                    .attr("class","activeCircles")
            }

            function animateChart(){

                activePoints = [];
                var t = performance.now();

                analyser.getByteFrequencyData(frequencyData);
                requestAnimationFrame(animateChart);

                svg.selectAll(".verticalLines")
                    .attr("x1",function(d,i){                       
                        var initialXVal = (i/(numLines-1) * (svgWidth));
                        var xShift = t / animationSpeed; 
                        var currentXVal = (initialXVal + xShift) % svgWidth;
                        return currentXVal;
                    })
                    .attr("x2",function(d,i){                       
                        var initialXVal = (i/(numLines-1) * (svgWidth));
                        var xShift = t / animationSpeed; 
                        var currentXVal = (initialXVal + xShift) % svgWidth;
                        return currentXVal;
                    })

                svg.selectAll(".activeCircles")
                    .attr("cy",function(d,i){                        
                        var currentYVal = svgHeight - (Math.max(0,(frequencyData[i]-frequencyThreshold)/(255-frequencyThreshold)) * maxYShift);
                        //return svgHeight/2;
                        return currentYVal;
                    })
                    .attr("cx",function(d,i){                       

                        var initialPosition = (i/(numDots-1) * (svgWidth)) - initialDotRadius;
                        var xShift = (t / animationSpeed);
                        var adjustedPosition = (initialPosition + xShift) % (svgWidth + initialDotRadius);
                        return adjustedPosition;
                    })


            }
            animateChart();

        }

        else if(visualizationChoice == "hourglass"){

            var numCells = 100;
            var initialCellWidth = svgWidth * 0.5;
            var initialCellHeight = svgHeight / numCells;
            var maxWidthShift = initialCellWidth * 0.95;
            var maxHeightShift = initialCellHeight * 0.99;
            var hueRange = 125;
            var frequencyData = new Uint8Array(numCells);
            var animationSpeed = 2000; //higher value gives slower animation
            var minStrokeWidth = 0;
            var maxStrokeWidth = 3;
            var frequencyThreshold = 140;
            var strokeFrequencyThreshold = 170;
            analyser.smoothingTimeConstant = 0.9;

            var lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })

            //initial draw
            for(var i=0; i<numCells; i++){
                
                //draw grid cells
                svg.append("rect")
                    .attr("width",initialCellWidth)
                    .attr("height",initialCellHeight)
                    .attr("x",svgWidth/2 - initialCellWidth/2)
                    .attr("y",svgHeight - (i+1)*initialCellHeight)
                    .attr("fill",fillColour)
                    .attr("fill-opacity",1)
                    .attr("stroke",strokeColour)
                    .attr("stroke-width",minStrokeWidth)
                    .attr("id","cell"+i)
        
            }

            //animate
            function animateChart(){
                
                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);

                requestAnimationFrame(animateChart);

                for(var i=0; i<numCells; i++){

                    var currentWidth = initialCellWidth + maxWidthShift * Math.sin(t/(animationSpeed) + i/(numCells) * Math.PI * 2);
                    var currentHeight = initialCellHeight + maxHeightShift * Math.cos(t/(animationSpeed) + i/(numCells) * Math.PI * 2);
                    var normalizedFrequencyValue = (frequencyData[i]-frequencyThreshold)/(255-frequencyThreshold); 


                    svg.select("#cell"+i)
                        .attr("width",currentWidth)
                        .attr("height",currentHeight)
                        .attr("x",svgWidth/2 - currentWidth/2)
                        //.attr("y",svgHeight/2 - (currentHeight/2))
                        .attr("fill",d3.hsl(fillHue - hueRange/2 + normalizedFrequencyValue * hueRange, normalizedFrequencyValue * 0.8, normalizedFrequencyValue * 0.8))
                        .attr("stroke-width",minStrokeWidth + Math.max(0,frequencyData[i]-strokeFrequencyThreshold)/(255-strokeFrequencyThreshold) * maxStrokeWidth)
                
                }

            }
            animateChart();

        }

        else if(visualizationChoice == "glowworm"){

            var numStaticShapes = 200;
            var numActiveShapes = 100;
            var shapeRatio = numStaticShapes / numActiveShapes;

            var xMargin = svgWidth * 0.05;
            var adjustedWidth = svgWidth - xMargin*2;

            var minStroke =  0;
            var maxStroke = 50;
            var strokeRange = maxStroke - minStroke;

            var minOpacity =  0.02;
            var maxOpacity = 0.06;
            var opacityRange = maxOpacity - minOpacity;

            //animation variables
            var frequencyData = new Uint8Array(numActiveShapes);
            var animationSpeed = 2000; //higher value gives slower animation
            var frequencyThreshold = 140;
            analyser.smoothingTimeConstant = 0.94;

            var maxActiveRadius = svgWidth * 0.12;
            var maxYShift = svgHeight * 0.2;
            
            var hueRange = 125;
            var strokeFrequencyThreshold = 170;
            
            //circle variables
            var minRadius = Math.round(svgWidth * 0.01);
            var maxRadius = Math.round(svgWidth * 0.05);
            var radiusRange = maxRadius - minRadius;


            //rectangle variables
            var minLength = Math.round(svgWidth * 0.02);
            var maxLength = Math.round(svgWidth * 0.3);
            var lengthRange = maxLength - minLength;

            for(i=0; i<numStaticShapes; i++){

                var activeCircleNumber = Math.floor(i / shapeRatio);

                if(i%shapeRatio == 0){
                    svg.append("circle")
                        .attr("r",20)
                        .attr("cx",adjustedWidth * (activeCircleNumber/numActiveShapes) + xMargin)
                        .attr("cy",svgHeight/2)
                        .attr("fill",backgroundColour)
                        .attr("opacity",1.0)
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",1)
                        .attr("class","activeCircles")
                }

                //draw static shapes -- some circles, some rectangles
                if(Math.random() <= 0.0){
                    //static circle
                    var currentRadius = minRadius + (Math.random()*radiusRange);

                    svg.append("circle")
                        .attr("r",currentRadius)
                        .attr("cx",Math.random() * svgWidth)
                        .attr("cy",Math.random() * svgHeight)
                        .attr("fill",fillColour)
                        .attr("opacity",minOpacity + (Math.random()*opacityRange))
                        //.attr("stroke",strokeColour)
                        //.attr("stroke-width",minStroke + Math.random()*strokeRange)
                        .attr("class","staticCircles")
                } else{
                    //static rectangle
                    svg.append("rect")
                        .attr("width",minLength + (Math.random()*lengthRange))
                        .attr("height",minLength + (Math.random()*lengthRange))
                        .attr("x",Math.random() * svgWidth)
                        .attr("y",Math.random() * svgHeight)
                        .attr("fill",fillColour)
                        .attr("opacity",minOpacity + (Math.random()*opacityRange))
                        .attr("stroke",backgroundColour)
                        .attr("stroke-width",minStroke + Math.random()*strokeRange)
                        .attr("class","staticRectangles")
                }
                
            }

            //animate
            function animateChart(){
    
                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);

                var currentYShift = maxYShift * (Math.cos(t/animationSpeed + Math.PI*2) / 2 + 0.5);

                requestAnimationFrame(animateChart);

                svg.selectAll(".activeCircles")
                    .attr("r",function(d,i){                        
                        var currentVal = (Math.max(0,(frequencyData[i]-frequencyThreshold)/(255-frequencyThreshold)) * maxActiveRadius);
                        return currentVal;
                    })
                    .attr("fill",function(d,i){                        
                        var currentVal = d3.hsl(fillHue - (hueRange/2) + (hueRange * (Math.max(0,(frequencyData[i]-frequencyThreshold)/(255-frequencyThreshold)))), 0.5, 0.5);
                        return currentVal;
                    })
                    .attr("cy",function(d,i){                        
                        var cycleValue = Math.cos(t/animationSpeed + Math.PI*4 * (i/numActiveShapes-1));
                        var currentVal = svgHeight/2 + cycleValue * currentYShift;
                        return currentVal;
                    })

            }
            animateChart();

        }

        else if(visualizationChoice == "queue"){
            var pathLength = Math.min(svgHeight,svgWidth) * 0.55;
            var numActiveCircles = 41; //actually produces 1 less circle than this

            //animation variables
            var frequencyData = new Uint8Array(numActiveCircles-1);
            var animationSpeed = 8000; //higher value gives slower animation
            var frequencyThreshold = 130;
            analyser.smoothingTimeConstant = 0.92;
            var hueRange = 125;

            var minStrokeWidth = 1;
            var maxStrokeWidth = 10;
            var strokeRange = maxStrokeWidth - minStrokeWidth;

            var minRadius = svgWidth * 0.01;
            var maxRadius = svgWidth * 0.05;
            var radiusRange = maxRadius - minRadius;

            //draw static path -- square
            svg.append('line')
                .style("stroke", strokeColour)
                .style("stroke-width", 4)
                .attr("x1", svgWidth/2-pathLength/2)
                .attr("y1", svgHeight/2-pathLength/2)
                .attr("x2", svgWidth/2-pathLength/2)
                .attr("y2", svgHeight/2+pathLength/2);

            svg.append('line')
                .style("stroke", strokeColour)
                .style("stroke-width", 4)
                .attr("x1", svgWidth/2-pathLength/2)
                .attr("y1", svgHeight/2-pathLength/2)
                .attr("x2", svgWidth/2+pathLength/2)
                .attr("y2", svgHeight/2-pathLength/2);

            svg.append('line')
                .style("stroke", strokeColour)
                .style("stroke-width", 4)
                .attr("x1", svgWidth/2+pathLength/2)
                .attr("y1", svgHeight/2-pathLength/2)
                .attr("x2", svgWidth/2+pathLength/2)
                .attr("y2", svgHeight/2+pathLength/2);
                
            svg.append('line')
                .style("stroke", strokeColour)
                .style("stroke-width", 4)
                .attr("x1", svgWidth/2-pathLength/2)
                .attr("y1", svgHeight/2+pathLength/2)
                .attr("x2", svgWidth/2+pathLength/2)
                .attr("y2", svgHeight/2+pathLength/2);

            
            //draw static circles
            
            for(i=0; i<(numActiveCircles-1); i++){
                svg.append("circle")
                .attr("r",minRadius)
                .attr("cx",svgWidth/2-pathLength/2)
                .attr("cy",svgHeight/2-pathLength/2)
                .attr("fill",fillColour)
                .attr("stroke", strokeColour)
                .attr("stroke-width", minStrokeWidth)
                .attr("class","activeCircles")
                .attr("id","circle"+i)
            }

            //animate
            function animateChart(){

                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);
                requestAnimationFrame(animateChart);


                for(i=0; i<numActiveCircles; i++){

                    //var currentPathValue = Math.cos(Math.PI*2 * t/animationSpeed) / 2 + 0.5;
                    var currentPathValue = ((t/animationSpeed % 4) / 4 + i/(numActiveCircles-1)) % 1;

                    var currentXValue = 0;
                    var currentYValue = 0;

                    var normalizedFrequencyValue = Math.max(0,(frequencyData[i]-frequencyThreshold)/(255-frequencyThreshold)); 

                    if(currentPathValue<=0.25){
                        currentXValue = svgWidth/2 - pathLength/2 + (pathLength*currentPathValue/0.25);
                        currentYValue = svgHeight/2 - pathLength/2;
                    } else if(currentPathValue<=0.5){
                        currentXValue = svgWidth/2 + pathLength/2;
                        currentYValue = svgHeight/2 - pathLength/2 + (pathLength*((currentPathValue-0.25)/0.25));                        
                    } else if(currentPathValue<=0.75){
                        currentXValue = svgWidth/2 + pathLength/2 - (pathLength*((currentPathValue-0.5)/0.25));
                        currentYValue = svgHeight/2 + pathLength/2;                       
                    } else if(currentPathValue<1.0){
                        currentXValue = svgWidth/2 - pathLength/2;
                        currentYValue = svgHeight/2 + pathLength/2 - (pathLength*((currentPathValue-0.75)/0.25));               
                    } 
                    
                    svg.select("#circle"+i)
                        .attr("cx",currentXValue)
                        .attr("cy",currentYValue)
                        .attr("fill",function(d,i){                        
                            var fillValue = d3.hsl(fillHue - (hueRange/2) + (hueRange * normalizedFrequencyValue), normalizedFrequencyValue, normalizedFrequencyValue);
                            return fillValue;
                        })
                        .attr("r", minRadius + normalizedFrequencyValue * radiusRange)
                        //.attr("stroke-width", minStrokeWidth + normalizedFrequencyValue * strokeRange)

                }

            }
            animateChart();

        }

        else if(visualizationChoice == "test"){
        
            var numDataPoints = 60;
            var innerRadius = 0;
            var outerRadius = Math.min(svgWidth, svgHeight)/2 * 0.90;
            var strokeWidth = 5;
            var fillOpacity = 1.0;

            var frequencyThreshold = 0;
            var numBassPoints = Math.round(numDataPoints * 0.2);
            var bassFactor = 0.6;

            var fullCircle = 2 * Math.PI * (numDataPoints-1) / numDataPoints;

            analyser.smoothingTimeConstant = 0.95;

            const y = d3.scaleLinear()
                .range([innerRadius, outerRadius]);
            
            const x = d3.scaleLinear()

            x.range([0, fullCircle]);

            x.domain([0,numDataPoints]);
            y.domain([0,255]);

            const line = d3.lineRadial()
                .angle(function(d,i) { return x(i); })
                .radius(function(d) { return y(d); })
                .curve(d3.curveBasisClosed)

            var radialFrequencyData = new Uint8Array(numDataPoints);

            var numBlobs = 1000;
            for(i=0; i<numBlobs; i++){
                drawBlob(strokeHue);
            }

            //draw initial radial line plot
            var linePlot = svg.append("path")
                .datum(radialFrequencyData)
                .attr("fill", d3.hsl(fillHue, 0.5, 0.5))
                .attr("fill-opacity",fillOpacity)
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth)
                .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")")
                .attr("d", line);

            // Continuously loop and update chart with frequency data.
            function animateChart() {
                
                var t = performance.now();

                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(radialFrequencyData);

                /*
                for(i=0; i<numDataPoints; i++){
                    if(radialFrequencyData[i] < frequencyThreshold){
                        radialFrequencyData[i] = frequencyThreshold;
                    }
                }
                */

                for(i=0; i<numBassPoints; i++){
                    radialFrequencyData[i] = radialFrequencyData[i] * bassFactor;
                }    
                
                requestAnimationFrame(animateChart);

                linePlot
                    .datum(radialFrequencyData)
                    //.attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")")
                    //.attr("transform","rotate("+t/50+" "+0+" "+0+")")
                    //.attr("fill", d3.hsl(fillHue + t/450, 0.4, 0.5))
                    .attr("d", line);
                    
            }

            // Run the loop
            animateChart();

        }

        else if(visualizationChoice == "dancefloor"){
        
            var numBlobs = 1000;
            for(i=0; i<numBlobs; i++){
                drawBlob(backgroundHue);
            }

            //background rectangle

            var backgroundWidth = svgWidth * 0.6;
            var backgroundHeight = svgHeight * 0.6;

            svg.append("rect")
                .attr("width",backgroundWidth)
                .attr("height",backgroundHeight)    
                .attr("x", svgWidth/2 - backgroundWidth/2)
                .attr("y", svgHeight/2 - backgroundHeight/2)
                .attr("fill", backgroundColour)
                .attr("stroke",strokeColour)
                .attr("stroke-width",4)

            //initial draw for active rectangles
            var numCols = 8;
            var numRows = 8;
            var numCells = numCols * numRows;

            var cellWidth = backgroundWidth / numCols;
            var cellHeight = backgroundHeight / numRows;

            var minStrokeWidth = 1;
            var maxStrokeWidth = 5;
            var strokeRange = maxStrokeWidth - minStrokeWidth;

            for(i=0; i<numRows; i++){
                for(j=0; j<numCols; j++){
                    svg.append("rect")
                        .attr("width",cellWidth)
                        .attr("height",cellHeight)    
                        .attr("x", svgWidth/2 - backgroundWidth/2 + j*cellWidth)
                        .attr("y", svgHeight/2 + backgroundHeight/2 - (i+1)*cellHeight)
                        .attr("fill", fillColour)
                        .attr("stroke",strokeColour)
                        .attr("stroke-width",minStrokeWidth)
                        .attr("class","activeRectangles")
                }
            }

            //animation variables
            var frequencyData = new Uint8Array(numCells);
            analyser.smoothingTimeConstant = 0.92;
            var frequencyThreshold = 150;
            var hueRange = 125;
            
            // Continuously loop and update chart with frequency data.
            function animateChart() {
    
                var t = performance.now();
                analyser.getByteFrequencyData(frequencyData);
                requestAnimationFrame(animateChart);

                svg.selectAll(".activeRectangles")
                    .attr("stroke-width",function(d,i){                        
                        var widthValue = Math.max(minStrokeWidth, ((frequencyData[i]-frequencyThreshold) / (255 - frequencyThreshold)) * maxStrokeWidth);
                        return widthValue;
                    })
                    .attr("fill",function(d,i){                        
                        var normalizedFrequencyValue = Math.max(0, (frequencyData[i]-frequencyThreshold) / (255 - frequencyThreshold));
                        var fillValue = d3.hsl(fillHue - (hueRange/2) + (hueRange * normalizedFrequencyValue), normalizedFrequencyValue, normalizedFrequencyValue);
                        return fillValue;
                    })
                    /*
                    .attr("fill-opacity",function(d,i){                        
                        var opacityValue = Math.max(0, (frequencyData[i]-frequencyThreshold) / (255 - frequencyThreshold));
                        return opacityValue;
                    })
                    */

            }

            // Run the loop
            animateChart();
        }        

        else{
            console.log("Audio not playing");

        }
    }

}

//inspired by Steve Makerspace tutorial on Pollock string theory
//https://www.youtube.com/watch?v=I69sutIrxNI
function drawBlob(hueInput){
    //blob variables
    var minDataPoints = 8;
    var maxDataPoints = 35;
    var numDataPoints = minDataPoints + (Math.random() * (maxDataPoints-minDataPoints)); //number of blob segments
    var innerRadius = 0; //min size
    var outerRadius = Math.min(svgWidth, svgHeight)/12 * Math.random(); //max size
    var maxYValue = 200; //no change needed
    var yRandomStep = maxYValue * 0.04; //extent of potential randomness
    var xPosition = Math.random() * svgWidth;
    var yPosition = Math.random() * svgHeight;
    
    var hueRange = 90;
    var currentHue = hueInput - hueRange/2 + hueRange*Math.random();

    var strokeWidth = 0;
    var fillOpacity = 1;
    var fullCircle = 2 * Math.PI * (numDataPoints-1) / numDataPoints;

    const y = d3.scaleLinear()
        .range([innerRadius, outerRadius])
        .domain([0,maxYValue])
    
    const x = d3.scaleLinear()
        .range([0, fullCircle])
        .domain([0,numDataPoints])

    const line = d3.lineRadial()
        .angle(function(d,i) { return x(i); })
        .radius(function(d) { return y(d); })
        .curve(d3.curveBasisClosed)

    //create blob
    var radialFrequencyData = new Uint8Array(numDataPoints);
    for(i=0; i<numDataPoints; i++){
        if(i==0){
            radialFrequencyData[i] = maxYValue / 2;
        } else{
            var currentStep = Math.random() * yRandomStep;
            if(Math.random()<=0.5){
                radialFrequencyData[i] = radialFrequencyData[i-1] + currentStep;
            } else {
                radialFrequencyData[i] = radialFrequencyData[i-1] - currentStep;
            }
        }
    }

    //draw blob on canvas
    var linePlot = svg.append("path")
        .datum(radialFrequencyData)
        .attr("fill", d3.hsl(currentHue, 0.25, 0.5))
        .attr("fill-opacity",fillOpacity)
        //.attr("stroke", strokeColour)
        //.attr("stroke-width", strokeWidth)
        .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
        .attr("d", line);
}

function paretoDistribution (minimum, alpha) {
    var u = 1.0 - Math.random();
    return minimum / Math.pow(u, 1.0 / alpha);
}

function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function hexagon(radius) {
    return d3.range(0, 2 * Math.PI, Math.PI / 3).map(function(angle) {
        var x1 = Math.sin(angle) * radius,
            y1 = -Math.cos(angle) * radius;
        return [x1, y1];
    });
}

function findYatX(x, linePath) {
    function getXY(len) {
         var point = linePath.getPointAtLength(len);
         return [point.x, point.y];
    }
    var curlen = 0;
    while (getXY(curlen)[0] < x) { curlen += 0.01; }
    return getXY(curlen);
}

function animateDancingCircles(){

    var t = performance.now() + 100000;
    //var t = d3.now();
    //console.log("animate -- d3.now() = "+d3.now());

    if(visualizationChoice == "dancingCircles"){

        t /= 50000;

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

function IgnoreAlpha(e) {
    if (!e) {
      e = window.event;
    }
    if (e.keyCode >= 65 && e.keyCode <= 90) // A to Z
    {
      e.returnValue = false;
      e.cancel = true;
    }
}

function pathTween(d) {
    function p(t) {
        return [d.r * Math.cos(d.t + t), d.r * Math.sin(d.t + t)];
    }
    return function(t) {
        return "M" + p(0) + " A" + d.r + "," + d.r + " 0 " + (t < 0.5 ? 0 : 1) + " 1 " + p(t * Math.PI * 2);
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
