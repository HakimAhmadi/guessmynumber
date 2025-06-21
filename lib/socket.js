// lib/socket.js
import { Server } from "socket.io";

let io;

export default function initSocket(res) {
  if (io) return io;

  io = new Server(res.socket.server, {
    path: "/api/socket_io",
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_game", (gameId) => {
      socket.join(gameId);
      console.log(`User joined game: ${gameId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
