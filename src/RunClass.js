export class Run {
  constructor(date, time, coords, distance, color, id, weather, location) {
    this.dateMS = date;
    this.time = `${+time} Minutes`;
    this.distance = distance;
    this.coords = coords;
    this.color = color;
    this.id = id;
    this.speed = this.calculateSpeed(distance, time);
    this.weather = weather;
    this.location = location;
    this.generateHTML(document.querySelector(".run-info2"));
  }

  calculateSpeed(distanceKm, timeMin) {
    return +(timeMin / distanceKm).toFixed(2);
  }

  formatDate(date) {
    const local = navigator.language;
    const formattedDate = new Intl.DateTimeFormat(local, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
    return formattedDate;
  }
  async generateHTML(el) {
    const runHTML = `  <div data-run-id="${
      this.id
    }" class="run-stats run-stat-${this.id}" style='box-shadow: 0px 0px 10px ${
      this.color
    };'>
    <div data-del-id="${
      this.id
    }" class=del-bttn><i class="fa-solid fa-xmark fa-xl run-close-icon"></i></div>
        <div class="stat-row">
          <div class="stat">
            <h4>📅 Date:</h4>
            <p>${this.getFriendlyDateDifference(this.dateMS)}</p>
          </div>
          <div class="stat">
            <h4>🆔 Run ID:</h4>
            <p>${this.id + 1}</p>
          </div>
          <div class="stat">
            <h4>☁️Weather:</h4>
            <p>🌡️${this.weather.temperature}°C, ${
      this.weather.weatherDescription
    }</p>
          </div>
          <div class="stat-loc">
            <h4>🗺️</h4>
            <p>${this.location}</p>
          </div>
        </div>
        <div class="stat-row">
          <div class="stat">
            <h4>⏳ Time:</h4>
            <p>${this.time}</p>
          </div>
          <div class="stat">
            <h4>⚡ Speed:</h4>
            <p>${this.speed} min/km</p>
          </div>
          <div class="stat">
            <h4>🛣️ Distance:</h4>
            <p>${this.distance} km</p>
          </div>
        </div>
      </div>`;
    el.insertAdjacentHTML("beforeend", runHTML);
    setTimeout(() => {
      document.querySelector(`.run-stat-${this.id}`).style.opacity = "1";
    }, 1);
    setTimeout(() => {
      document.querySelector(`.run-stat-${this.id}`).style.transform =
        "scale(1.05)";
    }, 250);
    setTimeout(() => {
      document.querySelector(`.run-stat-${this.id}`).style.transform =
        "scale(1)";
    }, 600);
  }
  getFriendlyDateDifference() {
    const now = new Date();
    const runDate = new Date(this.dateMS);
    const diffTime = Math.abs(now - this.dateMS);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = runDate.getHours();
    const minutes = runDate.getMinutes().toString().padStart(2, "0");

    if (diffDays === 0) {
      return `Today at ${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${hours}:${minutes}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return this.formatDate(this.dateMS);
    }
  }
}
