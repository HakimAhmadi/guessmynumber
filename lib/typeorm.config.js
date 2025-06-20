// lib/data-source.ts

import { DataSource } from "typeorm";
import User from "./entities/User";
import Game from "./entities/Game";
import Player from "./entities/Player";
import Move from "./entities/Move";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Game, Player, Move],
  synchronize: true,
  logging: false,
});
