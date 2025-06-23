/*
File: server.js
Path: ./server.js
*/

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { DataSource } from "typeorm";

import Game from "./entities/Game.js";
import Player from "./entities/Player.js";
import Move from "./entities/Move.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true,
  entities: [Game, Player, Move],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("join_game", async ({ name, gameId, userId }) => {
        const gameRepo = AppDataSource.getRepository("Game");
        const playerRepo = AppDataSource.getRepository("Player");

        let game = await gameRepo.findOne({
          where: { gameId },
          relations: { players: true, moves: true },
        });

        if (!game) {
          game = await gameRepo.save({ gameId, maxNumber: 20 });
        }

        let existing = await playerRepo.findOneBy({ userId });
        if (!existing) {
          const secretNumber = Math.floor(Math.random() * game.maxNumber) + 1;
          await playerRepo.save({ name, userId, secretNumber, game });
        }

        const updatedGame = await gameRepo.findOne({
          where: { gameId },
          relations: { players: true, moves: true },
        });
        socket.join(gameId);
        io.to(gameId).emit("game_update", updatedGame);
      });

      socket.on("make_move", async ({ gameId, userId, numberClicked }) => {
        const moveRepo = AppDataSource.getRepository("Move");
        const gameRepo = AppDataSource.getRepository("Game");
        const playerRepo = AppDataSource.getRepository("Player");

        const game = await gameRepo.findOne({
          where: { gameId },
          relations: { players: true, moves: true },
        });
        const player = await playerRepo.findOneBy({ userId });

        const isHit = game.players.some(
          (p) => p.secretNumber === numberClicked && p.userId !== userId
        );
        if (isHit) {
          const eliminated = game.players.find(
            (p) => p.secretNumber === numberClicked
          );
          eliminated.status = "eliminated";
          await playerRepo.save(eliminated);
        }

        await moveRepo.save({
          numberClicked,
          isSuccessful: isHit,
          game,
          player,
        });

        const updatedGame = await gameRepo.findOne({
          where: { gameId },
          relations: { players: true, moves: true },
        });
        io.to(gameId).emit("game_update", updatedGame);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });

      socket.on("game_status", async ({ gameId }) => {
        console.log(`📥 Checking game status for gameId: ${gameId}`);

        const gameRepo = AppDataSource.getRepository("Game");
        const game = await gameRepo.findOne({
          where: { gameId },
          relations: ["players", "moves"],
        });

        if (game) {
          socket.emit("game_update", {
            success: true,
            data: game,
          });
        } else {
          socket.emit("game_update", {
            success: false,
            error: "Game not found",
          });
        }
      });
    });

    httpServer.listen(4000, () => {
      console.log("Socket.IO server running on http://localhost:4000");
    });
  })
  .catch((err) => console.error("Database connection error:", err));
