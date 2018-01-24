// ENG1003 S2 2017 Assignment 1 Toposcope app
//
// Team: 81
//
// Written by Aaron Lim, Orion Zymaris, Jack Thomas and Bach Pham
//
//___________________________________INITIAL_SETUP_________________________________________
//

// Define the locations to fill the toposcope


//Device direction - every angle of the compass is an addition to this base angle.
var deviceAngle = 0; 

// Current device position
var currentPosition = 
{
    latitude: 0,
    longitude: 0
};

// old and new Position to calculate heading in case
// of device orientation error
var newLongitude = 0;
var newLatitude = 0;
var oldLongitude = 0;
var oldLatitude = 0;

// resetCounter - reset every 3 sec and increment every 1 sec.
// Each time it goes to 2, old and new lat update.
var resetCounter = 0;

// compassCalibrated will be false when North is not true North. 
// Otherwise compassCalibrated will be true.
var compassCalibrated = false;

// offsetAngle will be used if device compass is not true north.
var offsetAngle = 0

//
//____________________________________DISPLAY_CONTENT_________________________________________
//
// This function draws/redraws the compass, lines and distances for locations
// of interest.  This function should be called each time a new GPS location
// or new bearing is receieved.

function updateDisplay()
{
    var canvas = document.getElementById("compassCanvas");
    var context = canvas.getContext("2d");
    var radius = canvas.height / 2;

    // Clear the canvas.
    context.clearRect(-radius, -radius, canvas.width, canvas.height);

    // Use reduced radius for actual drawing.
    radius = radius * 0.80
    
    //Draw compass face
    drawCompassFace(context, radius);
    drawNeedle(context, deviceAngle , radius, radius*1.04, 5, "#000000");
    drawLetter(context, radius*1.05, deviceAngle, "N");
    drawLetter(context, radius*1.05, deviceAngle+90, "E");
    drawLetter(context, radius*1.05, deviceAngle+270, "W");
    drawLetter(context, radius*1.05, deviceAngle+180, "S");
    
    //if(compassCalibrated)
    //{
        drawNeedles(context, radius);
    //}//only draw when the compass is all set
    
    updateLocationDistances();
}

//
// This function draws all of the arrows on the compass
//
// Parameters:
//   context: HTML Canvas drawing context
//   radius:  The radius of the circle to draw.
//
function drawNeedles(context, radius)
{
    // Retrieve the maximum distance (to the farthest location).
    var maxDistance = -1; //Initialise to -1 so as the variable will update
    
    // For loop finds the max distance out of all of the locations
    for(var i = 0; i < locationsOfInterest.length;i++)
    {
        var distance = getLocationDistance(
            currentPosition,locationsOfInterest[i])/1000;
        maxDistance = Math.max(maxDistance,distance);
    }
    
    //Draw 
    for(var i = 0; i < locationsOfInterest.length;i++)
    {
        var distance = getLocationDistance( 
            currentPosition, locationsOfInterest[i])/1000; // Retrieves distance to each location
        var bearingAngle = getLocationDirection( 
            currentPosition, locationsOfInterest[i]); // Retrieves bearing to each location
        // drawNeedle is a function given to us that draws a single needle.
        // We place it in a for loop to draw all of the needles
        drawNeedle(
            context, deviceAngle+bearingAngle , 0, 
            radius/2, 3.141592654, 
            distinquishableColour(i+1) 
        );
        if(distance<1){
            distance = Number(distance.toFixed(3));
        }
        else{
            distance = Number(distance.toFixed(0));
        }
        drawLetter(context, radius/2, deviceAngle+bearingAngle, locationsOfInterest[i].label+":\n "+((distance > 1) ? distance : distance*1000) + 
            ((distance > 1) ? "km" : "m")
            );
    }
}
//
// This function will update the list of locations displayed by the app.
// It should be called each time there are updated distance estimations to
// the locations of interest.
//
// See the following functions defined in toposcopeview.js:
//      updateLocationList
//      distinquishableColour
//
function updateLocationDistances()
{
   
    var listCellContents = [];
    for(var i = 0; i < locationsOfInterest.length;i++)
    {
        var distance = (getLocationDistance(
            currentPosition,locationsOfInterest[i]));
        listCellContents.push({
            label: locationsOfInterest[i].label,
            labelColour: distinquishableColour(i+1),
            detailLabel: "Distance: " + 
            // The ? notation is a shorter method of implementing a for loop
            // The syntax follows <(condition) ? if true : if false>
            ((distance > 1000) ? distance/1000 : distance) + 
            ((distance > 1000) ? "km" : "m"),
        });
    }
    updateLocationList(listCellContents);
}
//
//_________________________________________GPS___________________________________________
//
// This function finds the location of the device and changes the global variable currentPosition.
// This function will be called every second.
// If the findLocation function returns 'success' the function is run.
// However, if access to the location of the device is denied, the error function will run.
//
//Reference: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation

// This 'success' function is run if access to the device location is granted
function success(pos)
    {
        // Store pos.coords into variable 'crd' for efficiency
        var crd = pos.coords;
        currentPosition.latitude = crd.latitude;
        currentPosition.longitude = crd.longitude;
        console.log(currentPosition.latitude+" "+currentPosition.longitude);
        updateDisplay();
    };

// This 'error' function will run if access to the device location is denied
 function error(err) 
    {
        console.log('an error occured');
    }

// The findLocation function grants or denies access to the location of the device. 

options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
};

function findLocation()
{ 
    navigator.geolocation.watchPosition(success, error, options);
    updateDisplay();
}

//___________________________DISTANCE_&_BEARING__________________________________
//
// Get initial heading bearing using forward azimuth formula
// Refrence: http://www.movable-type.co.uk/scripts/latlong.html
// This formula finds the bearing along a great circle line.
//
// Parameters:
// initialCoordinate, finalCoordinate: coordinate object {latitude: , longitude: }
//
function getLocationDirection(initialCoordinate,finalCoordinate)
{
    var latA = initialCoordinate.latitude.toRadians();
    var lonA = initialCoordinate.longitude.toRadians();
    var latB = finalCoordinate.latitude.toRadians();
    var lonB = finalCoordinate.longitude.toRadians();
    var y = Math.sin(lonB-lonA) * Math.cos(latB);
    var x = Math.cos(latA) * Math.sin(latB) 
        - Math.sin(latA) * Math.cos(latB) * Math.cos(lonB-lonA);
    var bearing = Math.atan2(y, x).toDegrees();
    return bearing;
}

// Get distance using haversine formula
// Refrence: http://www.movable-type.co.uk/scripts/latlong.html
// This formula finds the distance along a great circle line (shortest distance)
//
// Parameters:
// initialCoordinate, finalCoordinate: coordinate object {latitude: , longitude: }
//
function getLocationDistance(initialCoordinate,finalCoordinate)
{
    var latA = initialCoordinate.latitude.toRadians();
    var lonA = initialCoordinate.longitude.toRadians();
    var latB = finalCoordinate.latitude.toRadians();
    var lonB = finalCoordinate.longitude.toRadians();
    var R = 6371e3;
    var deltaLat = (latB-latA);
    var deltaLon = (lonB-lonA);
    var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + 
        Math.cos(latA) * Math.cos(latB) 
        * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
} 
//
//_______________________________DEVICE_ORIENTATION__________________________________
//
// Get heading bearing using two coordinates.
// Only call when deviceOrientationUpdate fails.
//
function getCurrentDirection()
{
    if(getLocationDistance({latitude: oldLatitude, longitude: oldLongitude},currentPosition) < 10)
    {
        //Only change deviceAngle when there is a considerable distance change.
        deviceAngle = deviceAngle;
    }
    else
    {
        deviceAngle = getLocationDirection(
            {latitude: oldLatitude, longitude: oldLongitude}
            ,{latitude: newLatitude, longitude: newLongitude});
    }
    
    updateDisplay();
}
//
// Get initial bearing using sensor.
// This will be called every time the device orientation changes
//
// Refrence: Sensor Test web app Copyright (c) 2014-2015  Monash University Written by Michael Wybrow
//
function deviceOrientationUpdate(event)
{
    // Compass doesn't work
    if(event.gamma===null && event.beta===null && event.alpha===null) //Set initial device orientation to null
    {
        getCurrentDirection();
    }else{
        var heading = 360 - event.alpha;
        deviceAngle = -heading;
        updateDisplay();    
    }
    //Allows compass to function for Android
    /*else if(event.absolute)
    {
        compassCalibrated = true;
        var heading = 360 - event.alpha;
        deviceAngle = -heading;
        updateDisplay();
    }
    
    // Allows compass to function on iOS
    else if(event.webkitCompassHeading) 
    {
        compassCalibrated = true;
        var heading = 360 - event.webkitCompassHeading;  
        deviceAngle = -heading;
        updateDisplay();
    }
    
    // Calculates heading for other devices that need further calculation
    else if(compassCalibrated === true)
    {
        var heading = 360 - event.alpha;
        deviceAngle = -(heading + offsetAngle);
        updateDisplay();
    }*/
}
//
// Alerts user to calibrate compass if the compass requires calibration.
//
function compassNeedsCalibrationEvent()
{
    alert("Compass needs calibration.  Move your phone in a figure-eight pattern.");
}
//
//________________________________________FINAL_RUN______________________________________
//
updateDisplay();//first display update

findLocation();

// Find location every second and update old location each 3 seconds

/*setInterval(function()
{
    findLocation();
    //every 3 seconds, old location and new location are updated
    if(resetCounter === 2){
        oldLongitude = newLongitude;
        oldLatitude = newLatitude;
        newLatitude = currentPosition.latitude;
        newLongitude = currentPosition.longitude;
    }
    resetCounter+=1;
    resetCounter%=3;
},1000);
*/
//initialize DeviceOrientationEvent and start watching for orientation change
if (window.DeviceOrientationEvent)
{
    window.addEventListener(
        'deviceorientation', deviceOrientationUpdate);
    window.addEventListener(
        'compassneedscalibration', compassNeedsCalibrationEvent);
}








