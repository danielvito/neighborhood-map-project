function LocationViewModel() {
    var self = this;
    self.query = ko.observable('');
    self.places = [
        { marker: null, title: 'Aclimacao Park', id: '3992c222163c9e466b0b59771df76579a52e413a', location: { lat: -23.5725626, lng: -46.6288549 } },
        { marker: null, title: 'Alfredo Volpi Park', id: '2ca9a088cb9c30fb8875889ad96163414467be11', location: { lat: -23.5893609, lng: -46.7015135 } },
        { marker: null, title: 'Burle Marx Park', id: 'b9e636ecd3545de76de14bbc4ba325645d8f6be0', location: { lat: -23.6330026, lng: -46.7217367 } },
        { marker: null, title: 'Ibirapuera Park', id: '97251f393acb6e161c141ef5cbde8d70e8bf2f7b', location: { lat: -23.5874162, lng: -46.6576336 } },
        { marker: null, title: 'Juventude Park', id: 'bc39f54798094ad91f21573c9bed887d60b7cc86', location: { lat: -23.5079991, lng: -46.620855 } },
        { marker: null, title: 'Latin America Memorial', id: 'e6c1c96ff0d6092b4550eeb1a1316342f16d56d1', location: { lat: -23.5267697, lng: -46.6642913 } },
        { marker: null, title: 'Modern Art Museum', id: '18aa84747e2aab358c774c2b547d5ea81e9bc853', location: { lat: -23.5878333, lng: -46.6556522 } },
        { marker: null, title: 'Rock Gallery', id: '3d4e06e4a57882e82a13faafadea245b183a2740', location: { lat: -23.5437646, lng: -46.6387651 } },
        { marker: null, title: 'Safari Zoo Park', id: 'bdfbacca152a40fb965b03c3627256d4d93c8e40', location: { lat: -23.6551578, lng: -46.6141265 } },
        { marker: null, title: 'Sao Paulo Airport', id: 'cded507c240b00e0e9964d1e0b8c53b60a74d2dc', location: { lat: -23.6273246, lng: -46.6565842 } },
        { marker: null, title: 'Sao Paulo Aquarium', id: 'f0bd9bdd1ca0a7eadaa62dfa9e29928516ccb5d3', location: { lat: -23.5933253, lng: -46.6140276 } },
        { marker: null, title: 'Sao Paulo Zoo', id: '2e8efed707e696dcb9b968ae5b8ecd51a8d9c0b9', location: { lat: -23.6495818, lng: -46.6193802 } },
        { marker: null, title: 'Soccer Museum', id: 'ef71d4c4f0942c0778fd9b30bcb5d900cef40e38', location: { lat: -23.5475398, lng: -46.6649168 } },
        { marker: null, title: 'Villa-Lobos Park', id: '92c0f1ba2b5dcb31d733f8dfe6b3c5a9f4ba1061', location: { lat: -23.5469266, lng: -46.7246323 } }
    ];
    
    self.showDetails = function (place) {
        populateInfoWindow(place.marker, largeInfowindow);
    }

    self.placeList = ko.observableArray(self.places);
    self.computedPlaceList = ko.computed(function() {
        return ko.utils.arrayFilter(self.placeList(), function(item) {
            var show = item.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
            if (item.marker) {
                if (show) {
                    if ( ! item.marker.getMap())
                        item.marker.setMap(map);
                } else
                    item.marker.setMap(null);
            }
            return show;
        });
    });
};
var viewModel = new LocationViewModel();
ko.applyBindings(viewModel);