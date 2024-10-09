// utils.js
export function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
}

export function sortDrivers(drivers) {
  return drivers.sort((a, b) => {
    if (a.carNumber !== b.carNumber) {
      return a.carNumber - b.carNumber;
    }
    if (a.fastestLap && b.fastestLap) {
      return a.fastestLap - b.fastestLap;
    }
    return 0;
  });
}
