const overlay = document.querySelector(".overlay-info");
const overlayCont = document.querySelector(".info");
const closeBttn = document.querySelector(".close-tutorial");
const mainCont = document.querySelector(".run-info");
const burgerBtnOpen = document.querySelector(".burger-bttn");
const burgerBtnClose = document.querySelector(".burger-bttn-close");

function closeBurger() {
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
export function openBurger() {
  mainCont.classList.add("visible"); // cont add vis
  burgerBtnOpen.classList.remove("opacity"); // remove opacity
  burgerBtnClose.classList.remove("hidden");
  setTimeout(() => {
    burgerBtnClose.classList.add("opacity");
    mainCont.classList.add("opacity"); // cont add opacity
    burgerBtnOpen.classList.add("hidden"); // display none
  }, 40);
}

export function initBurger() {
  closeBurger();
  burgerBtnOpen.addEventListener("click", openBurger);
  burgerBtnClose.addEventListener("click", closeBurger);
}
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
