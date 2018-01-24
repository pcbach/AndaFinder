console.log("run");
function success(pos)
    {
        // Store pos.coords into variable 'crd' for efficiency
        var crd = pos.coords;
        document.getElementsByName("lat")[0].value = pos.coords.latitude;
        document.getElementsByName("lng")[0].value = pos.coords.longitude;
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

function send(){
    document.coordinates.submit();
    console.log("send");
}
function findLocation()
{ 
    navigator.geolocation.watchPosition(success, error, options); 
}
findLocation();