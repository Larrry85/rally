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

  if (socket && typeof socket.emit === "function") {
    socket.emit("lapAdded", { carId, laps: raceData.laps[carId], lapTime });
  } else {
    console.error("Socket is not properly initialized or passed to addLap");
    // You might want to handle this error case, perhaps by updating the UI
  }
}