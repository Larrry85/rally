// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { PORT } = require("./server/config");
const setupSocketHandlers = require("./server/socketHandlers");

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const routes = [
  "front-desk",
  "lap-line-tracker",
  "leader-board",
  "race-flags",
  "race-control",
  "next-race",
  "race-countdown",
];

routes.forEach((route) => {
  app.get(`/${route}`, (req, res) => {
    res.sendFile(__dirname + `/public/${route}.html`);
  });
});

app.get("/api/race-list", (req, res) => {
  res.json(raceSessions);
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  setupSocketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
