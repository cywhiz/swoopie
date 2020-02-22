var toronto = new google.maps.LatLng(27, 17);
var initialLocation;
var infowindow;
var service;
var map;
var geocoder;
var request;
var markers = [];
var state;
var address;
var position;

function initialize() {
  // Map options
  var mapOptions = {
    zoom: 3,
    center: toronto,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // Create main map
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  geocoder = new google.maps.Geocoder();
  infowindow = new google.maps.InfoWindow();

  $.getJSON('events.json', function (data) {
    $.each(data, function (k, v) {
      // populate drop list
      state = (v.state == null) ? ' ' : (v.state + ', ');
      $('#event').append($('<option/>', {
        value: v.id,
        text: v.city + ', ' + state + v.country + ' ' + v.start_date.substr(0, 10)
      }));

      // GEOCODE if no latitude/longtitude given
      if (v.location.lat == null)
      {
        // create markers for events
        address = v.city + ', ' + state + v.country;
        geocoder.geocode({
          'address': address
        }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
             position = results[0].geometry.location;
            content = 'city: ' + v.city + '<br>address: ' + v.address + '<br>website: <a href="http://' + v.website + '">' + v.website + '</a><br>date: ' + v.start_date.substr(0, 10) + '<br>twitter: ' + v.twitter_hashtag;
            addMarker('img/dot.png', position, content);
          }
        });
      }
      else {
            position = new google.maps.LatLng(v.location.lat,v.location.lng);
            content = 'city: ' + v.city + '<br>address: ' + v.address + '<br>website: <a href="http://' + v.website + '">' + v.website + '</a><br>date: ' + v.start_date.substr(0, 10) + '<br>twitter: ' + v.twitter_hashtag;
            addMarker('img/dot.png', position, content);
      }
    });


    // triggered when event changed
    $('#event').change(function () {
      var address = $('#event option:selected').text();
      geocoder.geocode({
        'address': address
      }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          initialLocation = results[0].geometry.location;
          map.setCenter(initialLocation);
          map.setZoom(14);

          marker = new google.maps.Marker({
            icon: 'img/arrow.png',
            map: map,
            position: results[0].geometry.location
          });
        }
      });
    });
  });



  /*
// Geolocation code
    if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);

      var a = new google.maps.Marker({
                position: initialLocation,
                map: map,
                title: 'fsdsf',
                icon: 'img/arrow.png'
            });

			createMarker(a);
    }, function() {
     alert("Geolocation failed.");
    });
  }
  // Browser doesn't support Geolocation
  else {
    alert("Geolocation service failed.");
  }
*/


}

function addMarker(icon, position, content) {
  marker = new google.maps.Marker({
    map: map,
    icon: icon,
    position: position
  });

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(content);
    infowindow.open(map, this);
  });
}


// find custom places function
function findPlaces() {

  // prepare variables (filter)
  var query = document.getElementById('gmap_type').value;
  var radius = document.getElementById('gmap_radius').value;
  var keyword = document.getElementById('gmap_keyword').value;

  //var lat = document.getElementById('lat').value;
  //var lng = document.getElementById('lng').value;
  //var cur_location = new google.maps.LatLng(lat, lng);

  // prepare request to Places
  request = {
    location: initialLocation,
    radius: radius,
    query: query
  };
  if (keyword) {
    request.query = keyword;
  }

  // send request
  //infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, createMarkers);
}

// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // if we have found something - clear map (overlays)
    clearOverlays();

    // and create new markers by search result
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
    alert('Sorry, nothing is found');
  }
}

function createMarker(place) {
  var image;

  //icons images
  switch (request.query) {
  case 'coffee':
    image = 'img/coffee.png';
    break;
  case 'pizza':
    image = 'img/pizza.png';
    break;
  case 'bank':
    image = 'img/bank.png';
    break;
  default:
    image = 'img/marker.png';
  }

  //create new marker
  marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: image
  });
  markers.push(marker);

  //add info windows
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent('<b>' + place.name + '</b><br>' + place.formatted_address + '<br>' + 'Rating: ' + place.rating + '/5.0');
    infowindow.open(map, this);
  });
}

// clear overlays function
function clearOverlays() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

google.maps.event.addDomListener(window, 'load', initialize);