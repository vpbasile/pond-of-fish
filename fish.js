// Initializing global variables that are useful for fishCanvas
const canvas = document.getElementById("fishCanvas");
const fishCanvasContext = canvas.getContext("2d");
const header1 = document.getElementById("placeholder");
const currentView = document.getElementById("currentView");
const infoDiv = document.getElementById("infoDiv");
const dimension = 600;
var iterationCount = 0;
var iterationLimit = 8000;
var roster;
var canvasWidth, canvasHeight, pondWidth, pondHeight, bounds, grd;
var collidedYet = false;
var eStop = false;
var startButton = document.getElementById('startButton');
var stopButton = document.getElementById('stopButton');

function updateButtons() {
    startButton.disabled = true;
    stopButton.disabled = false;
}

function stopTheScript() { 
    eStop=true;  
    stopButton.disabled = true;
}

function initfishCanvas() {
    // iterationLimit = localStorage.getItem('iterationLimit');
    // if(iterationLimit==''){
    //     iterationLimit=100;
    // }
    // const iterationControl = document.getElementById("iterationControl");
    // iterationControl.value = iterationLimit;
    console.log("Setting canvas to "+ dimension +"px by " + dimension +"px.");
    canvas.height = dimension;
    canvas.width = dimension;
    fishCanvasContext.translate(dimension/2, dimension/2);
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    var allNames="";
    roster=[ // constructor(name,size,speed,initPosition,initBearing,color,verboseLogging)
        
        //The original four
        new fish("Jeremy",1,6,[-30,0],1,"175,125,50",true),
        new fish("Janet",2,3,[-120,-60],45,"150,25,175",false),
        new fish("Jonas",5,2,[70,-20],180,"100,100,225",true),
        new fish("Joy",3,4,[70,30],170,"50,175,25",false)
    ];
    for (var whichFish in roster) {
        // Initialize each fish
        // Populate the header
        if (allNames!=="") { allNames = allNames+", ";}  // Commas are important
        allNames=allNames+roster[whichFish].matchingSpan(roster[whichFish].name);
        //  Your pond contains 4 fish: Penelope, Stevie, Janet, Joseph
    }
    header1.innerHTML="Your pond contains " + roster.length + " fish: " + allNames;
    header1.style.width = pondWidth;
    for(let fishName of roster){
        fishName.draw();
    }
    
    
}

function loop() {
    iterationCount++;
    fishCanvasContext.clearRect(-canvasWidth/2, -canvasHeight/2, canvas.width, canvas.height);
    // drawpond();
    for(let fishName of roster){
        fishName.draw();
        fishName.checkCollisions();
    }
    // collidedYet = false;
    if((iterationCount<iterationLimit)&&(!collidedYet)&&(!eStop)) {
        requestAnimationFrame(loop);
    } 
    else {
        // cancelAnimationFrame();
        // Print out the IFB
        // console.log(this.bearingTo(nothing))
    }
}


class fish {
    constructor(name,size,speed,initPosition,initBearing,color,verboseLogging){
        this.name=name;
        this.size=size*5;
        this.speed=speed;
        this.bearing=conditionBearing(initBearing);
        this.color=color;
        this.position = initPosition;
        var thisFishInfo = document.createElement("div");
        thisFishInfo.id = ("info-"+this.name);
        infoDiv.appendChild(thisFishInfo);
        this.pickedDirection=0;
        this.originalBearing='';
    }

    checkCollisions() {
        let turnFactor = 15;
        let position = this.position;
        let bearing = this.bearing;
        let speed = this.speed;
        let futurePosition = [position[0] + speed*Math.cos(degToRad(bearing)),position[1] + speed*Math.sin(degToRad(bearing))];
        let farOut = distanceFromCenter(futurePosition);
        // console.log(farOut);
        if(farOut>250){
            // eStop=true;
            if(this.originalBearing==''){
                this.originalBearing = this.bearing;
                // console.log(this.name+" remebers "+this.originalBearing);
            }
            this.turn(turnFactor);
        }
        if(farOut<225){
            this.pickedDirection=0;
        }
        let otherFish;
        let interFishBearing;
        let difference;
        let bearingChange;
        for(let j=0;j<roster.length;j++){
            otherFish = roster[j];
            if (otherFish!==this) {
                let interFishDistance = this.distanceFrom(otherFish.position);
                // if (this.verboseLogging) {
                // }
                let closeEnough = this.size + otherFish.size;
                if ((interFishDistance<closeEnough)) {  // &&(this.size<otherFish.size)
                    if (this.verboseLogging) {console.log("Collision detected.");}
                    // console.log("IFD from "+this.name+" to "+otherFish.name+":~" + Math.floor(interFishDistance));
                    // collidedYet=true;
                    interFishBearing = this.bearingTo(otherFish.position);
                    // console.log("IFB: " + interFishBearing);
                    difference = bearing-interFishBearing;
                    if (difference<5) { bearingChange = 0;} else { bearingChange = 15 * posORneg(difference);}
                    // console.log(this.name + " turning " + bearingChange + ".")
                    this.bearing += bearingChange;
                }
            } 
        }
    }

    turn(angle){
        let direction = this.turnDirection();
        let howMuch;
        let bearing = this.bearing;
        if(Math.abs(bearing-this.originalBearing)>160){
            howMuch=0;
            this.originalBearing='';
        }
        else {
            howMuch = angle*direction;
            this.bearing = conditionBearing(this.bearing + howMuch);
        }
        // console.log(this.name+ " turning "+howMuch);
    }

    // randomply pick positive or negative and store it in the pickedDirection spot.  then once you get closer to center, 

    turnDirection() {
        let bearingDiff = Math.abs(this.bearingTo([0,0])-this.bearing);
        let pickedDirection = this.pickedDirection;        
        if(pickedDirection!==0){
            // console.log("Picked:"+pickedDirection);
            return pickedDirection;
        }
        else {
            let random = rand(0,1);
            if (random <= 0.5) {
                random=-1;
                // console.log(this.name+" turning left.");
            }
            else {
                random=1;
                // console.log(this.name+" turning right.");
            }
            this.pickedDirection = random;
            return random;
        }
    }

    draw() {
        // Find the next set of coordinates and draw the body through the last several sets. 
        let size = this.size;
        let speed = this.speed;
        let bearing = this.bearing;
        let color = this.color;
        // First, get new coordinates
        // ==============================
        var currentX = Math.floor(this.position[0]);
        var currentY = Math.floor(this.position[1]);
        if (this.verboseLogging) {
            let tempString = iterationCount + ". Drawing " + this.name + ". Position: [" + currentX + "," + currentY + "]. Bearing: " + bearing + " deg. ";
            tempString = tempString + this.distanceFrom(canvasCenter);
            console.log(tempString);
        }
        let newX = currentX + speed*Math.cos(degToRad(bearing));
        let newY = currentY + speed*Math.sin(degToRad(bearing));
        this.position[0] = newX;
        this.position[1] = newY;
        // Draw the fish.  Sprites would be better.
        // Opaque bodies
        fishCanvasContext.fillStyle = "rgba("+color+", 0.2)";
        fishCanvasContext.beginPath();
        fishCanvasContext.arc(newX, newY, 2*size, degToRad(0), degToRad(360), false);
        fishCanvasContext.fill();
        // Transparent fins
        fishCanvasContext.fillStyle = "rgba("+color+", 1)";
        fishCanvasContext.beginPath();
        fishCanvasContext.arc(newX, newY, size, degToRad(0), degToRad(360), false);
        fishCanvasContext.fill();
        // Draw Nose
        fishCanvasContext.beginPath();
        fishCanvasContext.lineWidth = "5";
        fishCanvasContext.strokeStyle = "rgba("+color+", 0.2)";
        fishCanvasContext.moveTo(newX,newY);
        fishCanvasContext.lineTo(newX + -30 * Math.cos(degToRad(bearing)), newY + -30 * Math.sin(degToRad(bearing)));
        fishCanvasContext.stroke();
        document.getElementById("info-"+this.name).innerHTML=this.matchingSpan(this.name+"'s Bearing: \n" + bearing);
    }
    
    matchingSpan(string) {return "<span style='color:rgb("+this.color+");'>"+string+"</span>";}

    distanceFrom(inputPoint) {
        let comparisonPoint = inputPoint;
        let xDistance = this.position[0] - comparisonPoint[0];
        let yDistance = this.position[1] - comparisonPoint[1];
        return Math.hypot(xDistance,yDistance);
    }

    bearingTo(inputPoint) {
        let comparisonPoint = inputPoint;
        let xDistance;
        let yDistance;
        // console.log(comparisonPoint);
        // console.log(this.position);
        if (comparisonPoint[0]!=="") { 
            xDistance = this.position[0] - comparisonPoint[0];
            yDistance = this.position[1] - comparisonPoint[1];
            // console.log("The provided point has indices");
            // console.log(yDistance + " " + xDistance);
        } else {
            xDistance = this.position[0] - comparisonPoint.x;
            yDistance = this.position[1] - comparisonPoint.y;
            // console.log("The provided point has x,y references");
            console.log(this.position[0]);
            console.log(comparisonPoint.x);

        }
        return radToDeg(Math.atan(yDistance/xDistance));
    }    

    debug(string) {if(this.verboseLogging){console.log(string);}}

}  // End of class Fish

//Useful math functions

function distanceFromCenter(point) {
    let xValue=point[0];
    let yValue=point[1];
    // console.log(xValue);
    // console.log(yValue);
    let distance = Math.hypot(xValue,yValue);
    return distance;
}

function conditionBearing(bearing) {
    let newBearing = bearing;
    for(; newBearing>360; newBearing-=360) {}
    for(; newBearing<0; newBearing+=360) {}
    return newBearing;
}

function posORneg(number) {if (number>0){return 1;} else {return -1;}}
function degToRad(degrees) { return degrees * Math.PI / 180; }
function radToDeg(radians) { return radians * 180 / Math.PI; }
function rand(min, max) { return Math.floor(Math.random() * (max-min+1)) + (min); }