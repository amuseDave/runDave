export class Run {
  constructor(date, time, coords, distance, color, id) {
    this.dateMS = date.getTime();
    this.time = time;
    this.distance = distance;
    this.coords = coords;
    this.color = color;
    this.id = id;
    this.speed = this.calculateSpeed(distance, time);
    this.location;
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
  generateHTML(el) {
    const runHTML = `  <div data-run-id="${
      this.id
    }" class="run-stats run-stat-${this.id}" style=' box-shadow: 0px 0px 10px ${
      this.color
    }; ${this.color}'>
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
            <h4>🗺️ Location:</h4>
            <p>Central Park</p>
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
    const diffTime = Math.abs(now - this.dateMS);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return this.formatDate(this.dateMS);
    }
  }
}
