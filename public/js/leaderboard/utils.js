// leaderboard/utils.js
export function formatTime(ms) {
  if (ms === null || isNaN(ms)) return "N/A";

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return hours > 0
    ? `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
        .toString()
        .padStart(3, "0")}`
    : `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export function sortDrivers(drivers) {
  return drivers.sort((a, b) => {
    if (a.currentLap !== b.currentLap) return b.currentLap - a.currentLap;
    if (a.fastestLap && b.fastestLap) return a.fastestLap - b.fastestLap;
    return 0;
  });
}
