// race-flags/config.js
export const CONFIG = {
  ROWS: 25,
  COLUMNS: 38,
  ANIMATION_DELAY_FACTOR: 20,
  DISPLACEMENT_FACTOR: 1 / 3,
  FLAG_COLORS: {
    Safe: "green",
    Hazard: "yellow",
    Danger: "red",
    Finish: null, // Special case, handled separately
  },
  TRAFFIC_LIGHT_SEQUENCE: [
    { duration: 2000, light: 0 }, // Red
    { duration: 2000, light: 1 }, // Yellow
    { duration: 500, light: 2 }, // Green
    { duration: 1000, display: "go" }, // GO! message
  ],
  RACE_END_MESSAGE_DURATION: 3000,
};
