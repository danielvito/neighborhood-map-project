var map;
// Create a new blank array for all the listing markers.
var markers = [];
var largeInfowindow = null;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -23.6098600, lng: -46.6843567 },
        zoom: 11
    });

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
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
        locations[i].marker = marker;
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
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
        $.getJSON(exploreUrl).done(function(data) { 
            var id = data.response.groups[0].items[0].venue.id;
            var tipsUrl = 'https://api.foursquare.com/v2/venues/' + id + '/tips?client_id=B4ORRQPXOTBBTMBZKQWPBRPAQU2X0N2F0J1VWB1QDXQNBIJB&client_secret=PHS5UGTSRKYZBSODLPYT2LHI1JDGYBKBPQCJISSURKSHWGUT&v=20180323&limit=1';
            $.getJSON(tipsUrl).done(function(data) {
                    var text = data.response.tips.items[0].text;
                    var img = data.response.tips.items[0].photo.prefix + data.response.tips.items[0].photo.suffix;
                    var link = data.response.tips.items[0].canonicalUrl;

                    var icon = '<a href="' + link + '" target="_blank"><img src="img/foursquare.png" class="fqIcon"></a>';

                    $('#foursquare').html('<p>' + text + '</p><p>' + icon + '</p>');
                })
                .fail(function() {
                    $('#foursquare').html('<p>Error to retrive foursquare tips.</p>');
                });
        })
        .fail(function() {
            $('#foursquare').html('<p>Error to retrive foursquare venues.</p>');
        });
    }
}