const overlay = document.querySelector(".overlay-info");
const overlayCont = document.querySelector(".info");
const closeBttn = document.querySelector(".close-tutorial");
const openBttn = document.querySelector(".guide-mark");

export function add() {
  console.log("clicked");
  openBttn.classList.add("hidden");
  overlay.classList.remove("hidden");
  overlayCont.classList.remove("hidden");
}

export function remove() {
  openBttn.classList.remove("hidden");
  overlay.classList.add("hidden");
  overlayCont.classList.add("hidden");
}

function closeOverlay() {
  overlay.style.opacity = "0";
  overlayCont.style.opacity = "0";
  setTimeout(() => {
    remove();
  }, 300);
}
export function openOverlay() {
  overlay.style.opacity = "0";
  overlayCont.style.opacity = "0";
  add();
  setTimeout(() => {
    overlay.style.opacity = "1";
    overlayCont.style.opacity = "1";
  }, 10);
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
