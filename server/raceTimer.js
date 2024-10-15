// server/raceTimer.js
const { EventEmitter } = require("events");

class RaceTimer extends EventEmitter {
  constructor(duration) {
    super();
    this.duration = duration;
    this.remainingTime = duration;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      this.remainingTime -= 1000;
      this.emit("tick", this.remainingTime);

      if (this.remainingTime <= 0) {
        this.stop();
        this.emit("finish");
      }
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset(newDuration = this.duration) {
    this.stop();
    this.duration = newDuration;
    this.remainingTime = newDuration;
  }
}

module.exports = RaceTimer;
