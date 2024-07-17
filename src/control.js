import * as mapFunctions from "./mapView.js";
import * as overlay from "./overlay.js";
import { Run } from "./RunClass.js";
import * as API from "./API.js";

const colorPalette = [
  "#1E90FF", // Dodger Blue
  "#283c41", // Black
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

let coords = [];
let distance = 0;
let currentCord = 0;
let runs = JSON.parse(localStorage.getItem("runDave2024")) || [];
runs = runs.map((run) => Object.assign(Object.create(Run.prototype), run));

let tutorial = runs.length > 0 ? false : true;
let map,
  clicked,
  okBttn,
  inputMin,
  submitCont,
  marker,
  marker1,
  popup,
  popup1,
  lineD;
let numOfRuns = +runs.at(-1)?.id + 1 || runs.length;
let allSavedCoords = [];

function createIcon(state) {
  return L.icon({
    iconUrl:
      state === "start"
        ? "../images/start-run.svg"
        : "../images/finish-run.svg",
    iconSize: [38, 95],
    iconAnchor: [30, 40],
    popupAnchor: [0, 0],
  });
}

function clearLocalStorage() {
  localStorage.clear("runDave2024");
}
function setLocalStorage() {
  localStorage.setItem("runDave2024", JSON.stringify(runs));
}

// Click on any map points
// genera
function activateSubmit() {
  if (+inputMin.value < 10) {
    alert("Minimum running time is > 10");
    return;
  }
  addRun();
}
function renderSubmit() {
  if (okBttn && inputMin) {
    okBttn.remove();
    inputMin.remove();
    submitCont.remove();
  }
  okBttn = document.querySelector(".ok");
  inputMin = document.querySelector(".submit input");
  submitCont = document.querySelector(".submit");
  okBttn.addEventListener("click", () => {
    if (clicked) {
      activateSubmit();
    }
    clicked = true;
    inputMin.classList.remove("hidden");
    submitCont.style.transform = `translateX(60%)`;
  });
}

function resetLines() {
  coords = [];
  distance = 0;
  currentCord = 0;
}

function generatePopUpHTML(
  line = "start",
  id,
  generateSubmit = true,
  distance
) {
  let markupHTML = `<p ${generateStyle(id)} ><span class="run">#${
    id + 1
  }</span>${line === "start" ? `🚩Start🚩` : `🏁Finish!🏁`}</p>`;
  line !== "start"
    ? (markupHTML += `<p ${generateStyle(
        id
      )} class="text-tool-tip current-distance">🛣️ ${distance}km</p>`)
    : "";
  if (generateSubmit && line !== "start") {
    markupHTML += `<div class="submit"><input class="hidden" type="number" placeholder="Minutes"> <button class="ok"> Ok </button></div>`;
  }
  return markupHTML;
}

function createRun() {
  if (coords.length === 1) {
    overlay.closeBurger();
    popup1 = addPopUp(coords[0], generatePopUpHTML(undefined, numOfRuns));
    marker1 = addMarker(coords[0], "start");
  }

  if (coords.length > 1) {
    calculateDistance();
    lineD = addLine(coords, numOfRuns);
    popup = addPopUp(
      coords[coords.length - 1],
      generatePopUpHTML("finish", numOfRuns, true, distance),
      true
    );
    if (marker) marker.remove();
    marker = addMarker(coords[coords.length - 1], "finish");
    clicked = false;
    renderSubmit();
  }
}

function addPopUp(crd, content = "", close = false) {
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
    content: `${content}`,
  }).openOn(map);
}

async function addRun() {
  const weather = await API.getWeather(coords);
  // const location = await API.getLocatioName(coords);
  // console.log(weather);
  console.log(weather);
  runs.push(
    new Run(
      new Date(),
      +inputMin.value,
      coords,
      +distance,
      generateColor(numOfRuns),
      numOfRuns,
      weather,
      location
    )
  );

  marker.remove();
  popup.remove();
  marker1.remove();
  popup1.remove();
  lineD.remove();

  const popupStart = addPopUp(
    coords[0],
    generatePopUpHTML(undefined, numOfRuns)
  );
  const markerStart = addMarker(coords[0], "start");
  const popupFinish = addPopUp(
    coords[coords.length - 1],
    generatePopUpHTML("finish", numOfRuns, false, distance)
  );
  const markerFinish = addMarker(coords[coords.length - 1], "finish");
  const line = addLine(coords, numOfRuns);

  allSavedCoords.push({
    markerStart,
    markerFinish,
    popupStart,
    popupFinish,
    line,
    id: +numOfRuns,
  });

  resetLines();
  numOfRuns = +runs.at(-1).id + 1;
  setLocalStorage();
  overlay.openBurger();
}
function calculateDistance() {
  const latlng1 = L.latLng(coords[currentCord]);
  const latlng2 = L.latLng(coords[currentCord + 1]);
  currentCord++;
  distance += Math.round(latlng1.distanceTo(latlng2)) / 1000;
  distance = +distance.toFixed(2);
}
function addMarker(crd, state) {
  return L.marker(crd, {
    icon: createIcon(state),
  }).addTo(map);
}
function addLine(coords, id) {
  return L.polyline(coords, { color: generateColor(id) }).addTo(map);
}
function generateStyle(id) {
  return `style="text-shadow: 0px 0px 5px ${generateColor(id)}"`;
}
function generateColor(id) {
  return colorPalette[id % colorPalette.length];
}

///////////////////////////////////////
////// MAP SETUP ////////////
//////////////////////////////////////
navigator.geolocation.getCurrentPosition(
  (position) =>
    mapInitialization([position.coords.latitude, position.coords.longitude]),
  () => mapInitialization([51.505, -0.09])
);
function mapInitialization(startCoord) {
  map = mapFunctions.generateMap(startCoord);
  mapFunctions.displayMap();
  displayAllSavedRuns();
  map.on("click", function (ev) {
    coords.push([ev.latlng.lat, ev.latlng.lng]);
    createRun();
  });
}

/*OVERLAY**/

if (tutorial) {
  overlay.init();
  overlay.add();
}
function generateRunHTML(runs) {
  runs.forEach((run) => {
    run.generateHTML(document.querySelector(".run-info2"));
  });
}
function saveCordinates() {}

function generateRunMarkers(runs) {
  allSavedCoords = [];
  runs.forEach((run) => {
    const markerStart = addMarker(run.coords[0], "start");
    const markerFinish = addMarker(run.coords[run.coords.length - 1], "finish");
    const popupStart = addPopUp(
      run.coords[0],
      generatePopUpHTML(undefined, +run.id)
    );
    const popupFinish = addPopUp(
      run.coords[run.coords.length - 1],
      generatePopUpHTML("finish", +run.id, false, run.distance)
    );
    const line = addLine(run.coords, run.id);
    allSavedCoords.push({
      markerStart,
      markerFinish,
      popupStart,
      popupFinish,
      line,
      id: run.id,
    });
  });
}
function displayAllSavedRuns() {
  if (runs.length > 0) {
    generateRunHTML(runs);
    generateRunMarkers(runs);
  }
}

function displayDeleteAllDrawings() {
  allSavedCoords.forEach((crd) => {
    crd.markerStart.remove();
    crd.markerFinish.remove();
    crd.popupStart.remove();
    crd.popupFinish.remove();
    crd.line.remove();
  });
  allSavedCoords = [];
}
// clearLocalStorage();
// FIX Displaying one run
overlay.initBurger();

const containerStats = document.querySelector(".run-info2");

containerStats.addEventListener("click", (e) => {
  const runStat = e.target.closest(".run-stats");
  if (!runStat) return;
  const run = [runs.find((run) => +run.id === +runStat.dataset.runId)];
  displayDeleteAllDrawings();
  generateRunMarkers(run);
  const line = allSavedCoords.find((run) => +run.id === +runStat.dataset.runId);
  overlay.closeBurger();
  map.flyTo(
    [line.markerStart._latlng.lat, line.markerStart._latlng.lng],
    +run[0].distance > 5 ? 13 : 14
  );
});
clearLocalStorage();
