const mainCont = document.querySelector(".run-info2");
export async function getWeather(crd) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${crd[0][0]}&longitude=${crd[0][1]}&current_weather=true`
  );
  const data = await res.json();

  const weatherInfo = data.current_weather;
  const temperature = weatherInfo.temperature;
  const weatherCode = weatherInfo.weathercode;
  let weatherDescription;
  switch (weatherCode) {
    case 0:
      weatherDescription = "☀️";
      break;
    case 1:
    case 2:
    case 3:
      weatherDescription = "⛅";
      break;
    case 45:
    case 48:
      weatherDescription = "🌫️";
      break;
    case 51:
    case 53:
    case 55:
      weatherDescription = "🌦️";
      break;
    case 61:
    case 63:
    case 65:
      weatherDescription = "🌧️";
      break;
    case 71:
    case 73:
    case 75:
      weatherDescription = "❄️";
      break;
    case 80:
    case 81:
    case 82:
      weatherDescription = "🌦️";
      break;
    case 95:
    case 96:
    case 99:
      weatherDescription = "⛈️";
      break;
    default:
      weatherDescription = "Unknown";
  }
  return { temperature, weatherDescription };
}
export function errorLoc() {
  let loading = document.querySelector(".loading");
  loading.scrollIntoView({ behavior: "smooth" });
  return new Promise((resolve) => {
    setTimeout(() => {
      if (loading) loading.remove();
      resolve(`❗Couldn't get running location`);
    }, 2000);
  });
}

export async function getLocatioName(crd) {
  mainCont.insertAdjacentHTML(
    "beforeend",
    `<div class="loading"> <i class="fa-solid fa-spinner fa-3x spinner" style="color: #e6fff1;"></i> </div>`
  );
  let loading = document.querySelector(".loading");
  loading.scrollIntoView({ behavior: "smooth", block: "end" });

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     if (loading) loading.remove();
  //     resolve(`❗Couldn't get running location`);
  //   }, 3000);
  // });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${crd[0][0]}&lon=${crd[0][1]}`
  );
  const data = await res.json();
  loading.remove();
  const loc = `${data.address.country}, ${data.address.city || ""} `;
  return loc;
}
