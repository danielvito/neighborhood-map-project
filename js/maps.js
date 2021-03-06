'use strict';

var CONSTANTS = {
    "MAP_CENTER_LAT" : -23.6098600,
    "MAP_CENTER_LNG" : -46.6843567
}

var map;
// Create a new blank array for all the listing markers.
var markers = [];
var largeInfowindow = null;

/**
 * @description Generate the initial map with the custom markers.
 */
function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: CONSTANTS.MAP_CENTER_LAT, lng: CONSTANTS.MAP_CENTER_LNG },
        zoom: 11,
        mapTypeControl: false
    });

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.
    var locations = viewModel.places;
    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function () {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function () {
            this.setIcon(defaultIcon);
        });
        bounds.extend(markers[i].position);
        locations[i].marker = marker;
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
}

/**
 * @description This function populates the infowindow when the marker is clicked. We'll only allow
 *              one infowindow which will open at the marker that is clicked, and populate based
 *              on that markers position.
 * @param {google.maps.Marker}     marker     - Map marker
 * @param {google.maps.InfoWindow} infowindow - Map info window
 */
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setAnimation(null);
        
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div><div id="foursquare">Loading...</div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);

        var location = marker.position.lat() + ',' + marker.position.lng();
        var exploreUrl = 'https://api.foursquare.com/v2/venues/explore?client_id=B4ORRQPXOTBBTMBZKQWPBRPAQU2X0N2F0J1VWB1QDXQNBIJB&client_secret=PHS5UGTSRKYZBSODLPYT2LHI1JDGYBKBPQCJISSURKSHWGUT&v=20180323&limit=1&ll=' + location;
        try {
            $.getJSON(exploreUrl).done(function (data) {
                var id = data.response.groups[0].items[0].venue.id;
                var tipsUrl = 'https://api.foursquare.com/v2/venues/' + id + '/tips?client_id=B4ORRQPXOTBBTMBZKQWPBRPAQU2X0N2F0J1VWB1QDXQNBIJB&client_secret=PHS5UGTSRKYZBSODLPYT2LHI1JDGYBKBPQCJISSURKSHWGUT&v=20180323&limit=1';
                $.getJSON(tipsUrl).done(function (data) {
                    var text = data.response.tips.items[0].text;
                    var linkText = '<img src="img/foursquare.png" class="fqIcon">';
                    if (data.response.tips.items[0].photo && data.response.tips.items[0].photo.prefix && data.response.tips.items[0].photo.suffix) {
                        var img = data.response.tips.items[0].photo.prefix + data.response.tips.items[0].photo.suffix;
                        var link = data.response.tips.items[0].canonicalUrl;
                        linkText = '<a href="' + link + '" target="_blank">' + linkText + '</a>';
                    }
                    $('#foursquare').html('<p>' + text + '</p><p>' + linkText + '</p>');
                })
                .fail(function () {
                    $('#foursquare').html('<p>Error to retrive foursquare tips.</p>');
                });
            })
            .fail(function () {
                $('#foursquare').html('<p>Error to retrive foursquare venues.</p>');
            });
        } catch(e) {
            $('#foursquare').html('<p>Error to retrive foursquare info.</p>');    
        }
    }
}

/**
 * @description This function takes in a COLOR, and then creates a new marker
 *              icon of that color. The icon will be 21 px wide by 34 high,
 *              have an origin of 0, 0 and be anchored at 10, 34).
 * @param {string} markerColor - Hex color
 * @returns {google.maps.MarkerImage} Marker image
 */
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}