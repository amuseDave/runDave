export default class Run {
  constructor(date, time, coords, distance, color) {
    this.date = date;
    this.time = time;
    this.distance = distance;
    this.coords = coords;
    this.color = color;
    this.speed;
    this.location;
  }
}
