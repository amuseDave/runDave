import * as mapFunctions from "./mapView.js";
import Run from "./RunClass.js";

let coords = [];
let distance = 0;
let currentCord = 0;
let runs = [];
let map, clicked, okBttn, inputMin, popup, marker;
let numOfRuns = runs.length;
let runcoords = [];

var myIcon = L.icon({
  iconUrl: "../images/running.svg",
  iconSize: [38, 95],
  iconAnchor: [30, 40],
  popupAnchor: [0, 0],
});

const colorPalette = [
  "#1E90FF", // Dodger Blue
  "#000000", // Black
  "#32CD32", // Lime Green
  "#FFD700", // Gold
  "#FF4500", // Orange Red
  "#8A2BE2", // Blue Violet
  "#00CED1", // Dark Turquoise
  "#2E8B57", // Sea Green
  "#FF69B4", // Hot Pink
  "#8B0000", // Dark Red
  "#ADFF2F", // Green Yellow
  "#4169E1", // Royal Blue
  "#FFDAB9", // Peach Puff
  "#4B0082", // Indigo
  "#40E0D0", // Turquoise
  "#9ACD32", // Yellow Green
  "#FF6347", // Tomato
  "#6A5ACD", // Slate Blue
  "#808080", // Gray
];

function generateColor() {
  return colorPalette[numOfRuns % colorPalette.length];
}
function generateStyle() {
  return `style="text-shadow: 0px 0px 5px ${generateColor()}"`;
}
function addLines(ev) {
  coords.push([ev.latlng.lat, ev.latlng.lng]);
  addMarker(coords[0]);
  coords.length === 1 ? addPopUp(coords[0], "🚩Start") : null;
  console.log(generateColor());
  console.log(numOfRuns);
  L.polyline(coords, { color: generateColor() }).addTo(map);
  if (coords.length >= 2) {
    if (okBttn) okBttn.remove();
    if (inputMin) inputMin.remove();
    clicked = false;
    calculateDistance();
    popup = addPopUp(
      coords[coords.length - 1],
      `🏁Finish`,
      true,
      generateToolTipText()
    );
    okBttn = document.querySelector(".ok");
    okBttn.addEventListener("click", () => {
      if (clicked) {
        console.log("work");
        if (+inputMin.value < 10) {
          alert("Run has to be more than 10 mimnutes");
          return;
        }
        popup.remove();
        // date, time, coords, distance

        runs.push(
          new Run(
            new Date(),
            inputMin.value,
            coords,
            +distance,
            generateColor()
          )
        );
        addPopUp(
          coords[coords.length - 1],
          `🏁Finish`,
          false,
          `<p ${generateStyle()} class="text-tool-tip current-distance">🛣️ ${distance}km</p>`
        );
        coords = [];
        distance = 0;
        currentCord = 0;
        numOfRuns++;
        console.log(runs);

        return;
      }
      document.querySelector(".submit").style.transform = "translateX(70px)";
      inputMin = document.querySelector(".submit input");
      inputMin.classList.remove("hidden");
      clicked = true;
    });
  }
}

function generateToolTipText() {
  return `<p ${generateStyle()} class="text-tool-tip current-distance">🛣️ ${distance}km</p> <div class="submit"><input class="hidden" type="number" placeholder="Minutes"> <button class="ok"> Ok </button></div>`;
}

function addMarker(crd) {
  return L.marker(crd, {
    icon: myIcon,
  }).addTo(map);
}
function addPopUp(crd, content = "", close = false, content2 = "") {
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
    content: `<p ${generateStyle()} ><span class="run">#${
      numOfRuns + 1
    }</span>${content}<br />${content2}</p>`,
    // content: `<p class="text-tool-tip">${content}</p> ${content2}`,
  }).openOn(map);
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
  const latlng1 = L.latLng(coords[currentCord]);
  const latlng2 = L.latLng(coords[currentCord + 1]);
  currentCord++;
  distance += Math.round(latlng1.distanceTo(latlng2)) / 1000;
  distance = +distance.toFixed(2);
}
