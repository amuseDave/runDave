import * as mapFunctions from "./mapView.js";
import Run from "./RunClass.js";

let coords = [];
let distance = 0;
let current = 0;
let runs = [];
let map, marker, popup;
let popups = [];
let markers = [];
let numOfRuns = 0;
let ok;

var myIcon = L.icon({
  iconUrl: "../images/running.svg",
  iconSize: [38, 95],
  iconAnchor: [30, 40],
  popupAnchor: [0, 0],
});

function addLines(ev) {
  coords.push([ev.latlng.lat, ev.latlng.lng]);

  marker = addMarker(coords[0]);

  coords.length === 1 ? addPopUp(coords[0], "🚩Start") : console.log("work");

  L.polyline(coords, { color: "#002223" }).addTo(map);
  if (coords.length >= 2) {
    calculateDistance();
    addPopUp(
      coords[coords.length - 1],
      `🏁Finish`,
      true,
      `<p class="text-tool-tip current-distance">🛣️ ${distance}km</p> <div class="submit"><input class="hidden" type="number" placeholder="Minutes"> <button class="ok"> Ok </button></div>`
    );
    ok = document.querySelector(".ok");
    ok.addEventListener("click", () => {
      document.querySelector(".submit").style.right = "-90px";
    });
  }
}

function createRun() {
  runs.push(new Run());
}

function addMarker(crd) {
  return L.marker(crd, {
    icon: myIcon,
  }).addTo(map);
}
function addPopUp(crd, content, close = false, content2 = "") {
  return L.popup(crd, {
    minWidth: 60,
    maxWidth: 110,
    maxHeight: 50,
    autoClose: false,
    closeOnClick: close,
    className: `popup`,
    closeButton: false,
    closeOnEscapeKey: false,
    close: false,
    content: `<p><span class="run run${numOfRuns}">#${
      numOfRuns + 1
    }</span>${content}<br />${content2}</p>`,
    // content: `<p class="text-tool-tip">${content}</p> ${content2}`,
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
