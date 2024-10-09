// utils.js
export let raceData = {
  drivers: [],
  laps: {},
  carIds: [],
};

export function addLap(carId, socket) {
  if (!raceData.laps[carId]) {
    raceData.laps[carId] = 0;
  }
  raceData.laps[carId]++;
  const lapTime = new Date().toLocaleTimeString();

  socket.emit("lapAdded", { carId, laps: raceData.laps[carId], lapTime });
}
