const overlay = document.querySelector(".overlay-info");
const overlayCont = document.querySelector(".info");
const closeBttn = document.querySelector(".close-tutorial");

export function add() {
  overlay.classList.remove("hidden");
  overlayCont.classList.remove("hidden");
}

export function remove() {
  overlay.classList.add("hidden");
  overlayCont.classList.add("hidden");
}

function closeOverlay() {
  overlay.style.opacity = "0";
  overlayCont.style.opacity = "0";
  setTimeout(() => {
    remove();
  }, 500);
}

export function init() {
  closeBttn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", closeOverlay);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeOverlay();
    }
  });
}
