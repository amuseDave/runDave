import "core-js/stable";
import "regenerator-runtime/runtime";
import * as mapFunctions from "./mapView.js";
import * as overlay from "./overlay.js";
import { Run } from "./RunClass.js";
import * as API from "./API.js";
import startRunImage from "../images/start-run.svg";
import finishRunImage from "../images/finish-run.svg";

const mainCont = document.querySelector(".run-info");
const burgerBtnOpen = document.querySelector(".burger-bttn");
const burgerBtnClose = document.querySelector(".burger-bttn-close");
const openGuideBttn = document.querySelector(".guide-mark");
const sortRunsCont = document.querySelector(".sort-runs");
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
  lineD,
  loading,
  edit;
let displayed = 1000;
let numOfRuns = +runs.at(-1)?.id + 1 || runs.length;
let allSavedCoords = [];

function createIcon(state) {
  return L.icon({
    iconUrl: state === "start" ? startRunImage : finishRunImage,
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

if (runs.length > 0) {
  mainCont.classList.add("expand");
  closeBurger();
}
if (runs.length === 0) {
  burgerBtnOpen.classList.add("hidden");
}
displaySortMenu();

function displaySortMenu() {
  if (runs.length > 1) {
    sortRunsCont.classList.remove("hidden");
    setTimeout(() => {
      sortRunsCont.classList.add("opacity-sort");
    }, 500);
  }
}
function removeSortMenu() {
  if (runs.length < 2) {
    sortRunsCont.classList.remove("opacity-sort");
    setTimeout(() => {
      sortRunsCont.classList.add("hidden");
    }, 200);
  }
}

function activateSubmit() {
  if (+inputMin.value < 10 || +inputMin.value > 999) {
    alert(`Invalid input: value has to be > 10, and can't be above 1000`);
    return;
  }
  const mainContWidth = +getComputedStyle(mainCont).width.slice(0, 3);

  if (mainCont.classList.contains("expand") || mainContWidth > 0) {
    burgerBtnOpen.classList.remove("hidden");
    mainCont.classList.add("expand");
    addRun();
  } else {
    burgerBtnOpen.classList.remove("hidden");
    mainCont.classList.add("expand");
    setTimeout(() => {
      addRun();
    }, 400);
  }
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
    if (distance < 2.5) {
      alert("Run has to be longer than 2.5KM");
      return;
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
  if (loading) return;
  if (coords.length === 1) {
    closeBurger();
    if (runs.length === 0) {
      burgerBtnOpen.classList.add("hidden");
    }
    popup1 = addPopUp(coords[0], generatePopUpHTML(undefined, numOfRuns));
    marker1 = addMarker(coords[0], "start");
  }

  if (coords.length > 1) {
    closeBurger();
    if (runs.length === 0) {
      burgerBtnOpen.classList.add("hidden");
    }
    calculateDistance();
    if (lineD) {
      lineD.remove();
    }
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
function removeCurrentPopsMarks() {
  if (marker && popup) {
    marker.remove();
    popup.remove();
  }
  if (popup1 && marker1) {
    marker1.remove();
    popup1.remove();
  }
  if (lineD) {
    lineD.remove();
  }
}

async function addRun() {
  removeCurrentPopsMarks();
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
  openBurger2();
  loading = true;

  const weather = await API.getWeather(coords);
  const location = await Promise.race([
    API.getLocatioName(coords),
    API.errorLoc(),
  ]);

  runs.push(
    new Run(
      new Date().getTime(),
      +inputMin.value,
      coords,
      +distance,
      generateColor(numOfRuns),
      numOfRuns,
      weather,
      location
    )
  );
  displaySortMenu();

  allSavedCoords.push({
    markerStart,
    markerFinish,
    popupStart,
    popupFinish,
    line,
    id: +numOfRuns,
  });

  numOfRuns = +runs.at(-1).id + 1;
  setLocalStorage();
  resetLines();

  document
    .querySelector(`.run-stat-${numOfRuns - 1}`)
    .scrollIntoView({ behavior: "smooth" });

  loading = false;
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
if (runs.length > 0) {
  mapInitialization(runs[0].coords[0]);
} else {
  navigator.geolocation.getCurrentPosition(
    (position) =>
      mapInitialization([position.coords.latitude, position.coords.longitude]),
    () => mapInitialization([51.505, -0.09])
  );
}
function mapInitialization(startCoord) {
  map = mapFunctions.generateMap(startCoord);
  mapFunctions.displayMap();
  displayAllSavedRuns();
  map.on("click", function (ev) {
    if (loading) return;
    undisplayEdits();
    coords.push([ev.latlng.lat, ev.latlng.lng]);
    createRun();
  });
}

/*OVERLAY**/

if (tutorial) {
  overlay.init();
  overlay.add();
}
if (!tutorial) {
  overlay.init();
  overlay.remove();
}
openGuideBttn.addEventListener("click", () => {
  overlay.openOverlay();

  setTimeout(() => {
    removeCurrentPopsMarks();
    resetLines();
  }, 1);
});

function generateRunHTML(runs) {
  if (mainCont.classList.contains("expand")) {
    document.querySelector(".run-info2").innerHTML = "";
    setTimeout(() => {
      runs.forEach((run) => {
        mainCont.insertAdjacentHTML(
          "beforeend",
          `<div class="loading"> <i class="fa-solid fa-spinner fa-3x spinner" style="color: #e6fff1;"></i> </div>`
        );
      });
    }, 200);
    setTimeout(() => {
      document.querySelectorAll(".loading").forEach((el) => {
        el.remove();
      });
      runs.forEach((run) => {
        run.generateHTML(document.querySelector(".run-info2"));
      });
      loading = false;
    }, 400);
  }
}

function generateRunMarkers(runs) {
  if (runs.length === 0) {
    mainCont.classList.remove("expand");
    burgerBtnOpen.classList.add("hidden");
    burgerBtnClose.classList.add("hidden");
    return;
  }
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

initBurger();

const containerStats = document.querySelector(".run-info2");

function deleteRun(delBttn) {
  if (loading) return;
  removeCurrentPopsMarks();
  resetLines();
  const id = +delBttn.dataset.delId;
  const runIndex = runs.findIndex((run) => +run.id === id);
  const savedCoordsIndex = allSavedCoords.findIndex((crd) => +crd.id === id);

  if (savedCoordsIndex !== -1) {
    allSavedCoords[savedCoordsIndex].markerStart.remove();
    allSavedCoords[savedCoordsIndex].markerFinish.remove();
    allSavedCoords[savedCoordsIndex].popupStart.remove();
    allSavedCoords[savedCoordsIndex].popupFinish.remove();
    allSavedCoords[savedCoordsIndex].line.remove();
    allSavedCoords.splice(savedCoordsIndex, 1);
  }

  runs.splice(runIndex, 1);
  removeSortMenu();
  document.querySelector(`.run-stat-${id}`).remove();
  numOfRuns = +runs.at(-1)?.id + 1 || runs.length;
  setLocalStorage();
  displayDeleteAllDrawings();
  generateRunMarkers(runs);
}

containerStats.addEventListener("click", (e) => {
  const delBttn = e.target.closest(".del-bttn");
  const editBttn = e.target.closest(".edit-bttn");
  if (delBttn) {
    deleteRun(delBttn);
    return;
  }

  if (editBttn) {
    editRun(editBttn);
  }

  const runStat = e.target.closest(".run-stats");
  if (!runStat) return;
  goToRun(runStat);
});
containerStats.addEventListener("click", (e) => {
  const okEditBttn = e.target.closest(".ok-bttn");
  if (!okEditBttn) return;
  submitEditRun(okEditBttn);
});
function submitEditRun(okEditBttn) {
  const okId = okEditBttn.dataset.okId;
  const pElTime = document.querySelector(`.p-time-${+okId}`);
  const inputElTime = document.querySelector(`.edit-input-${+okId}`);
  const speedEditEl = document.querySelector(`.speed-edit-${+okId}`);

  if (+inputElTime.value < 10) {
    alert(`Invalid input: value has to be > 10, and can't be above 1000`);
    inputElTime.focus();
    return;
  }
  const minutes = +inputElTime.value;
  const runIndex = runs.findIndex((run) => +run.id === +okId);
  const distance = +runs[runIndex].distance;
  const speed = +(minutes / distance).toFixed(2);

  runs[runIndex].time = `${minutes} Minutes`;
  runs[runIndex].speed = speed;
  console.log(`Finish:`, +inputElTime.value);
  pElTime.textContent = `${minutes} Minutes`;
  speedEditEl.textContent = `${speed} min/km`;
  inputElTime.value = "";
  undisplayEdits();
  setLocalStorage();
  edit = false;
}

function editRun(editBttn) {
  undisplayEdits();
  const editId = editBttn.dataset.editId;
  const pElTime = document.querySelector(`.p-time-${+editId}`);
  const inputElTime = document.querySelector(`.edit-input-${+editId}`);
  const okEditBttn = document.querySelector(`.ok-bttn-${+editId}`);

  displayed = +editId;
  pElTime.classList.add("hidden");
  inputElTime.classList.remove("hidden");
  okEditBttn.classList.remove("hidden");
  inputElTime.focus();
  edit = true;
}

function undisplayEdits() {
  document
    .querySelectorAll(".p-time")
    .forEach((el) => el.classList.remove("hidden"));
  document
    .querySelectorAll(".edit-input")
    .forEach((el) => el.classList.add("hidden"));
  document
    .querySelectorAll(`.ok-bttn`)
    .forEach((el) => el.classList.add("hidden"));
}
function goToRun(runStat) {
  if (loading) return;
  if (+runStat.dataset.runId !== +displayed) {
    edit = false;
    undisplayEdits();
  }
  const inputElTime = document.querySelector(
    `.edit-input-${+runStat.dataset.runId}`
  );
  inputElTime.focus();
  removeCurrentPopsMarks();
  resetLines();
  const run = [runs.find((run) => +run.id === +runStat.dataset.runId)];
  displayDeleteAllDrawings();
  generateRunMarkers(run);
  const line = allSavedCoords.find((run) => +run.id === +runStat.dataset.runId);
  if (!edit) {
    closeBurger();
  }

  map.flyTo(
    [line.markerStart._latlng.lat, line.markerStart._latlng.lng],
    +run[0].distance > 5 ? 13 : 14
  );
}

/*BURGER MENU*/

function closeBurger() {
  if (loading) return;
  mainCont.classList.remove("opacity");
  burgerBtnOpen.classList.remove("hidden");
  burgerBtnClose.classList.remove("opacity");
  setTimeout(() => {
    burgerBtnOpen.classList.add("opacity");
    burgerBtnClose.classList.add("hidden");
  }, 40);
  setTimeout(() => {
    mainCont.classList.remove("visible");
  }, 300);
}
function openBurger() {
  removeCurrentPopsMarks();
  resetLines();
  openBurger2();
}

function openBurger2() {
  mainCont.classList.add("visible"); // cont add vis
  burgerBtnOpen.classList.remove("opacity"); // remove opacity
  burgerBtnClose.classList.remove("hidden");
  setTimeout(() => {
    burgerBtnClose.classList.add("opacity");
    mainCont.classList.add("opacity"); // cont add opacity
    burgerBtnOpen.classList.add("hidden"); // display none
  }, 40);
}
function initBurger() {
  // closeBurger();
  burgerBtnOpen.addEventListener("click", openBurger);
  burgerBtnClose.addEventListener("click", closeBurger);
}

let speedSorted, dateSorted, timeSorted, distanceSorted;

sortRunsCont.addEventListener("click", (e) => {
  const sortType = e.target.closest(".btn");
  if (!sortType) return;
  if (loading) return;
  if (sortType.classList.contains("speed")) {
    loading = true;
    sortBySpeed();
  }
  if (sortType.classList.contains("distance")) {
    loading = true;
    sortByDistance();
  }
  if (sortType.classList.contains("time")) {
    loading = true;
    sortByTime();
  }
  if (sortType.classList.contains("date")) {
    loading = true;
    sortByDate();
  }
});

function sortByDistance() {
  if (distanceSorted) {
    const sortedDistance = [...runs].sort((a, b) => a.distance - b.distance);
    generateRunHTML(sortedDistance);
    distanceSorted = false;
    return;
  }

  const sortedDistance = [...runs].sort((a, b) => b.distance - a.distance);
  generateRunHTML(sortedDistance);
  speedSorted = false;
  dateSorted = false;
  timeSorted = false;
  distanceSorted = true;
}
function sortBySpeed() {
  if (speedSorted) {
    const sortedSpeed = [...runs].sort((a, b) => b.speed - a.speed);
    generateRunHTML(sortedSpeed);
    speedSorted = false;
    return;
  }

  const sortedSpeed = [...runs].sort((a, b) => a.speed - b.speed);
  generateRunHTML(sortedSpeed);
  speedSorted = true;
  dateSorted = false;
  timeSorted = false;
  distanceSorted = false;
}
function sortByTime() {
  if (timeSorted) {
    const sortedTime = [...runs].sort(
      (a, b) =>
        +b.time.slice(0, b.time.indexOf(" ")) -
        +a.time.slice(0, a.time.indexOf(" "))
    );
    generateRunHTML(sortedTime);
    timeSorted = false;
    return;
  }

  const sortedTime = [...runs].sort(
    (a, b) =>
      +a.time.slice(0, a.time.indexOf(" ")) -
      +b.time.slice(0, b.time.indexOf(" "))
  );
  generateRunHTML(sortedTime);
  speedSorted = false;
  dateSorted = false;
  timeSorted = true;
  distanceSorted = false;
}
function sortByDate() {
  if (dateSorted) {
    const sortedDate = [...runs].sort((a, b) => b.dateMS - a.dateMS);
    generateRunHTML(sortedDate);
    dateSorted = false;
    return;
  }

  const sortedDate = [...runs].sort((a, b) => a.dateMS - b.dateMS);
  generateRunHTML(sortedDate);
  speedSorted = false;
  dateSorted = true;
  timeSorted = false;
  distanceSorted = false;
}
