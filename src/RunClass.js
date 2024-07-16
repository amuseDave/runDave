export default class Run {
  constructor(date, time, coords, distance, color, id) {
    this.date = date;
    this.time = time;
    this.distance = distance;
    this.coords = coords;
    this.color = color;
    this.id = id;
    this.speed;
    this.location;
  }
}
