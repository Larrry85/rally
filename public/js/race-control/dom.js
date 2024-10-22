// race-control/dom.js
export const DOM = {
  loginScreen: document.getElementById("login"),
  raceControlApp: document.getElementById("raceControlApp"),
  loginButton: document.getElementById("loginButton"),
  accessKeyInput: document.getElementById("accessKey"),
  loginMessage: document.getElementById("loginMessage"),
  startSessionButton: document.getElementById("startSessionButton"),
  session: document.getElementById("session"),
  raceLights: document.getElementById("raceLights"),
  buttons: document.getElementById("buttons"),
  raceSessionContainer: document.getElementById("raceSessionContainer"),
  startRaceButton: document.getElementById("startRaceButton"),
  message: document.getElementById("message"),
  endSessionContainer: document.getElementById("endSessionContainer"),
  endSessionButton: document.getElementById("endSessionButton"),

  getLightElement: (color) => document.querySelector(`.${color}`),
  getAllFlagButtons: () => document.querySelectorAll(".flag"),
};
