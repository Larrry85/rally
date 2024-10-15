// server/config.js
require("dotenv").config();

const requiredKeys = [
  "RECEPTIONIST_KEY",
  "RACECONTROL_KEY",
  "LAP_LINE_TRACKER_KEY",
];

requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not set in the .env file. Server cannot start.`);
  }
});

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  INTERFACE_KEYS: {
    frontDesk: process.env.RECEPTIONIST_KEY,
    raceControl: process.env.RACECONTROL_KEY,
    lapLineTracker: process.env.LAP_LINE_TRACKER_KEY,
  },
  RACE_DURATION: isDevelopment ? 60000 : 600000,
  PORT: process.env.PORT || 3000,
  IS_DEVELOPMENT: isDevelopment,
};
