// config.js
export const CONFIG = {
  INITIAL_RACE_MODE: "Danger",
  INITIAL_REMAINING_TIME: 600, // 10 minutes in seconds
  COUNTDOWN_DELAY: 7000, // 7 seconds delay before starting countdown
  UPDATE_INTERVAL: 1000, // 1 second interval for updates
};

export const RACE_MODE_COLORS = {
  Safe: "green",
  Hazard: "yellow",
  Danger: "red",
  Finish: "gray",
};
