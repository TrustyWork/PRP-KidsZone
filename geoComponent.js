'use strict';
 
var map = require('./map');
var markers = require('./createMarkersAll.js');


module.exports = function() {

    var infoWindow = new google.maps.InfoWindow({map: map}),
     newBounds


if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        map.setCenter(pos);

    }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
    });
} else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
}

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    window.setTimeout(function() {
        infoWindow.close();
    }, 10000);


    var listenerGeo = map.addListener('idle', function() {
       
        newBounds = map.getBounds();
        getMarkers();   
       
    });

    function getMarkers() {

        var keys = Object.keys(markers);
        
        for (let key of keys) {
            var marker = markers[key];


            if (newBounds.toJSON().south < marker.lat && marker.lat < newBounds.toJSON().north &&
                newBounds.toJSON().west < marker.lng && marker.lng < newBounds.toJSON().east) {
              
                marker.setMap(map);

            }
        }
    }
}
