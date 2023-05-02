//Globala variabler
var msgElem; //Element för felmeddelande ifall ingen information finns
var pickedDistance; //Distansen som användaren valt
var pickedPrice; //Priset som användaren har valt
var searchBtn; //Sökknappen
var infoELem; //Div-element där platser som stämmer överens med sökningen visas
var locId;
var userMarker;
var myMap;
var locMarker;
var markers = [];
//-----------------------------------------------------------------------------------------

function init() {
    infoELem = document.getElementById("showInfo");
    searchBtn = document.getElementById("searchBtn");
    document.getElementById("filter").reset();
    readPicks()
}
window.addEventListener("load", init);

//-----------------------------------------------------------------------------------------

function readPicks() { //Läser av vad användaren valt för alternativ i filtreringen
    let priceRadios = document.getElementsByName("prices");
    let priceValue = document.getElementById("priceValue");

    let rangeInput = document.getElementById("amountKm");
    let rangeValue = document.getElementById("rangeValue");

    //Startvärden för globala variabler
    pickedDistance = rangeInput.value;
    pickedPrice = priceRadios[0].value

    //Skriver ut startvärden för input-elementen
    rangeValue.innerHTML = rangeInput.value + " km";
    priceValue.innerHTML = priceRadios[0].value + ":-";
    //-----------------------------------------------------------------------------------------

    //Uppdaterar värdet som skrivs ut när användaren ändrar i input-elementet för distans
    rangeInput.addEventListener("input", function () {
        rangeValue.innerHTML = rangeInput.value + " km";
        pickedDistance = rangeInput.value;
    });

    //Uppdaterar värdet som skrivs ut när användaren klickar på en annan radioknapp
    document.getElementById("price").addEventListener("click", () => {
        // Loop through all the radio buttons to find the selected one
        for (let i = 0; i < priceRadios.length; i++) {
            if (priceRadios[i].checked) {
                pickedPrice = priceRadios[i].value
                break;
            }
        }
        priceValue.innerHTML = pickedPrice + ":-";
    });

    //Visar kartan med användarens position när användaren klickar på söknappen
    searchBtn.addEventListener("click", function () {
        document.getElementById("filterMap").style.display = "block";
        initMap();
    });
}

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            myMap = new google.maps.Map(
                document.getElementById("filterMap"),
                {
                    center: { lat: lat, lng: lng },
                    zoom: 7,
                    styles: [
                        { featureType: "poi", stylers: [{ visibility: "on" }] },  // No points of interest.
                        { featureType: "transit.station", stylers: [{ visibility: "off" }] }  // No bus stations, etc.
                    ]
                }
            );
            if (locMarker) {
                locMarker.setMap(null); // remove the previous marker from the map
            }
            getSearchResults(lat, lng);
        }, function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    // Handle permission denied error
                    break;
                case error.POSITION_UNAVAILABLE:
                    // Handle position unavailable error
                    break;
                case error.TIMEOUT:
                    // Handle timeout error
                    break;
                default:
                    // Handle other errors
                    break;
            }
        });
    } else {
        // Geolocation is not supported by this browser
    }

}



function getSearchResults(lat, lng) { //Visar användarens position på kartan
    console.log(lat, lng, pickedDistance, pickedPrice);
    let request = new XMLHttpRequest(); // Object för Ajax-anropet
    request.open("GET", "https://smapi.lnu.se/api/?api_key=BGJIwUD4&debug=true&controller=activity&method=getfromlatlng&lat=" + lat + "&lng=" + lng + "&radius=" + pickedDistance + "&child_support=Y", true);
    request.send(null); // Skicka begäran till servern
    request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
        if (request.readyState == 4)
            if (request.status == 200) showResults(request.responseText);
            else msgElem.innerHTML = "Ingen information kunde hittas.";
    };
}

function showResults(data) {
    let info = JSON.parse(data);
    for (let i = 0; i < info.payload.length; i++) {
        let destination = info.payload[i];

        let newElem = document.createElement("div")
        newElem.innerHTML =
            "<h3>" + destination.name + "</h3>" +
            "<p>Vad är det för plats? " + destination.description + "</p>" +
            "<p>Distans till " + destination.name + ": " + destination.distance_in_km + "</p>" +
            "<p>Rekommenderad lägsta ålder: " + destination.min_age + " år</p>" +
            "<p>Betyg: " + destination.rating + "</p>";

        newElem.setAttribute("id", "infoDiv")
        infoELem.appendChild(newElem);
        newElem.addEventListener("click", function () {
            let request = new XMLHttpRequest(); // Object för Ajax-anropet
            request.open("GET", "https://smapi.lnu.se/api/?api_key=BGJIwUD4&debug=true&controller=activity&method=getAll&names=" + destination.name, true);
            request.send(null); // Skicka begäran till servern
            request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
                if (request.readyState == 4)
                    if (request.status == 200) pickedLocation(request.responseText);
                    else msgElem.innerHTML = "Ingen information kunde hittas.";
            };
        });

    }

}

function pickedLocation(data) { //Hämtar koordinaterna från platsen användaren klickat på
    let location = JSON.parse(data);
    for (let i = 0; i < location.payload.length; i++) {
        let destination = location.payload[i];
        var lati = destination.lat;
        var long = destination.lng;
    }
    locMarker = new google.maps.Marker({
        position: { lat: Number(lati), lng: Number(long) },
    });
    markers.push(locMarker); 
    for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(myMap);

    }
     
 
}
//Testa att göra en egen funktion för att skapa markören och ta bort existerande markörer i pickedLocation