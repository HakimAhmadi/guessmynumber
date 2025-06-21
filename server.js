// server.js
const next = require("next");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);
  const io = new Server(httpServer);

  // Game state (in-memory for simplicity)
  let gameState = {
    players: {},
  };

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // New player joins
    socket.on("join", (player) => {
      gameState.players[socket.id] = player;
      console.log("Player joined:", player);

      // Notify everyone
      io.emit("gameState", gameState);
    });

    // Player moves
    socket.on("move", (data) => {
      if (gameState.players[socket.id]) {
        gameState.players[socket.id].position = data.position;
        io.emit("gameState", gameState); // send update to all
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      delete gameState.players[socket.id];
      io.emit("gameState", gameState); // update others
    });
  });

  expressApp.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Server listening at http://localhost:${PORT}`);
  });
});
