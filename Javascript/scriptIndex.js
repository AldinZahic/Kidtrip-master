//Globala variabler
var imageViewer; //Hela bildspelet
var imgViewH3; //Rubriken i bildspelet
var myMap;
//-----------------------------------------------------------------------

function init() {
    imageViewer = document.getElementById("imageViewer");
    imgViewH3 = document.getElementById("imgViewH3");
    getInfo();
}
window.addEventListener("load", init);


function getInfo() {
    let request = new XMLHttpRequest(); // Object för Ajax-anropet
    request.open("GET", "https://smapi.lnu.se/api/?api_key=BGJIwUD4&debug=true&controller=activity&method=getAll&child_support=y", true);
    request.send(null); // Skicka begäran till servern
    request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
        if (request.readyState == 4)
            if (request.status == 200) printInfo(request.responseText);
    };
}

function printInfo(data) { //Plockar ut platsen namn och skriver ut i imgViewH3. Slumpar en plats från listan som hämtas
    let info = JSON.parse(data);
    imgViewH3.innerHTML = "";
    let ix = Math.floor(info.payload.length * Math.random());

    for (let i = 0; i < info.payload.length; i++) {
        var name = info.payload[ix].name;
        var lati = info.payload[ix].lat;
        var long = info.payload[ix].lng;
        imgViewH3.innerHTML = name;
    }
    initMap(lati, long);
    setTimeout(getInfo, 5000);
}

function initMap(lati, long) {
    myMap = new google.maps.Map(
        document.getElementById('map'),
        {
            center: { lat: Number(lati), lng: Number(long) },
            zoom: 15,
            styles: [
                { featureType: "poi", stylers: [{ visibility: "on" }] },  // No points of interest.
                { featureType: "transit.station", stylers: [{ visibility: "off" }] }  // No bus stations, etc.
            ]
        }
    );
} // End initMap

