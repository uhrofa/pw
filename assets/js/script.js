/*
  url: peta.web.id
*/
// get current year
var curYear = new Date();
document.getElementById("copyright-year").innerHTML = curYear.getFullYear();

var longitude = parseInt(document.getElementById('lon').value);
var latitude = parseInt(document.getElementById('lat').value);
var olview = new ol.View({ center: ol.proj.fromLonLat([longitude,latitude]), zoom: 9 }),
    baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() }),
    map = new ol.Map({
      target: document.getElementById('map'),
      view: olview,
      layers: [baseLayer]
    });

// popup
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);

//Instantiate with some options and add the Control
var geocoder = new Geocoder('nominatim', {
  provider: 'osm',
  lang: 'en',
  placeholder: 'Cari alamat ...',
  limit: 5,
  debug: false,
  autoComplete: true,
  keepOpen: true
});
map.addControl(geocoder);

//Listen when an address is chosen
geocoder.on('addresschosen', function (evt) {
  console.info(evt);
  window.setTimeout(function () {
    popup.show(evt.coordinate, evt.address.formatted);
  }, 3000);
});

// EXPORT PNG
document.getElementById('export-png').addEventListener('click', function() {
  map.once('postcompose', function(event) {
    var canvas = event.context.canvas;
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
    } else {
      canvas.toBlob(function(blob) {
        saveAs(blob, 'peta-OpenStreetMap-Peta.com.png');
      });
    }
  });
  map.renderSync();
});
// SIMPLE REVERSE
function simpleReverseGeocoding(lon, lat) {
longitude = lon;
latitude = lat;
// https://nominatim.openstreetmap.org/reverse?format=json&lon=106.1639749&lat=-6.1103661
  fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat).then(function(response) {
    return response.json();
  }).then(function(json) {
    document.getElementById('address').innerHTML = json.display_name;
  })
}
map.on('click', function(e) {
  var coordinate = ol.proj.toLonLat(e.coordinate).map(function(val) {
    return val.toFixed(6);
  });
  var lon = document.getElementById('lon').value = coordinate[0];
  var lat = document.getElementById('lat').value = coordinate[1];
  simpleReverseGeocoding(lon, lat);
});
document.getElementById('reversegeocoding').addEventListener('click', function(e) {
  if (document.getElementById('lon').value && document.getElementById('lat').value) {
    simpleReverseGeocoding(document.getElementById('lon').value, document.getElementById('lat').value);
  }
});

function getLonLat() {
  var lngInput = document.getElementById('lon').value;
  var latInput = document.getElementById('lat').value;
  simpleReverseGeocoding(document.getElementById('lon').value, document.getElementById('lat').value);
}

if (window.addEventListener)
    window.addEventListener("load", getLonLat, false);
else if (window.attachEvent)
    window.attachEvent("onload", getLonLat);
else window.onload = getLonLat;
