// race-control/config.js
export const CONFIG = {
  DEFAULT_AUTH_KEY: "0001",
  MESSAGE_TIMEOUT: 10000,
  FINISH_MESSAGE_TIMEOUT: 5000,
  SKIP_LOGIN: window.SKIP_LOGIN === "true",
};

export const FLAGS = {
  GREEN: "Safe",
  YELLOW: "Hazard",
  RED: "Danger",
  FINISH: "Finish",
};
