// front-desk/dom.js
export const DOM = {
  loginScreen: document.getElementById("login"),
  frontDeskApp: document.getElementById("frontDeskApp"),
  loginButton: document.getElementById("loginButton"),
  accessKeyInput: document.getElementById("accessKey"),
  loginMessage: document.getElementById("loginMessage"),
  sessionNameInput: document.getElementById("sessionName"),
  sessionsContainer: document.getElementById("sessions"),
  driversListContainer: document.getElementById("driversList"),
  addDriverButton: document.getElementById("addDriverFieldButton"),
  addSessionButton: document.getElementById("addSessionButton"),
  messageContainers: {
    main: document.getElementById("message"),
    minDrivers: document.getElementById("message1"),
    sessionName: document.getElementById("message2"),
    duplicateName: document.getElementById("message3"),
    duplicateCarNumber: document.getElementById("message4"),
  },
};
