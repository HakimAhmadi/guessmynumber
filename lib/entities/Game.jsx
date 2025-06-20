const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Game",
  tableName: "games",
  columns: {
    id: { primary: true, type: "int", generated: true },
    gameId: { type: "varchar", unique: true },
    maxNumber: { type: "int" },
    createdAt: { type: "timestamp", createDate: true },
    status: { type: "varchar", default: "waiting" }, // waiting, active, finished
    playerTurn: { type: "varchar", nullable: true }, // player name or ID
  },
  relations: {
    players: {
      type: "one-to-many",
      target: "Player",
      inverseSide: "game",
      cascade: true,
    },
    moves: {
      type: "one-to-many",
      target: "Move",
      inverseSide: "game",
      cascade: true,
    },
  },
});
