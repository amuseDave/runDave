import { ZOOM_LEVEL } from "./config.js";

const mapDiv = document.querySelector("#map");

let map;

export function generateMap(crd) {
  map = L.map(mapDiv).setView(crd, ZOOM_LEVEL);
  return map;
}

export function displayMap() {
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  }).addTo(map);
  // L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  //   attribution:
  //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  // }).addTo(map);
}
