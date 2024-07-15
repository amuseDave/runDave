import * as mapFunctions from "./mapView.js";
import Run from "./RunClass.js";

let coords = [];
let distance = 0;
let current = 0;
let runs = [];
let map, marker, popup;

var myIcon = L.icon({
  iconUrl: "../images/running.svg",
  iconSize: [38, 95],
  iconAnchor: [30, 40],
  popupAnchor: [0, 0],
});

function addLines(ev) {
  coords.push([ev.latlng.lat, ev.latlng.lng]);

  addMarkerAndPopUp(coords[0]);
  L.polyline(coords, { color: "#002223" }).addTo(map);
  if (coords.length >= 2) {
    calculateDistance();
  }
}

function createRun() {
  runs.push(new Run());
}

function addMarkerAndPopUp(crd) {
  marker = L.marker(crd, {
    icon: myIcon,
  }).addTo(map);

  popup = L.popup(crd, {
    content: "<p>🚩Start</p>",
    closeButton: false,
  }).openOn(map);
}
function removeMarker() {
  marker.remove();
}

///////////////////////////////////////
////// SETUP COMPLETE ////////////
//////////////////////////////////////
navigator.geolocation.getCurrentPosition(
  (position) =>
    mapInitialization([position.coords.latitude, position.coords.longitude]),
  () => mapInitialization([51.505, -0.09])
);
function mapInitialization(coords) {
  map = mapFunctions.generateMap(coords);
  mapFunctions.displayMap();
  mapFunctions.addMapClickEvent(addLines);
}
/**
 * Calculates distance of line cordinates
 */
function calculateDistance() {
  const latlng1 = L.latLng(coords[current]);
  const latlng2 = L.latLng(coords[current + 1]);
  current++;
  distance += Math.round(latlng1.distanceTo(latlng2)) / 1000;
  distance = +distance.toFixed(2);
  console.log(distance);
}
