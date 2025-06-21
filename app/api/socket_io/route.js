import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔌 Initializing Socket.IO server...");

    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected: ", socket.id);

      socket.on("join_game", (gameId) => {
        socket.join(gameId);
        console.log(`Socket ${socket.id} joined room ${gameId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
      });
    });
  } else {
    console.log("✅ Socket.IO already initialized");
  }

  res.end();
}
