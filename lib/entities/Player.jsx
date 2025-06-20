const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Player",
  tableName: "players",
  columns: {
    id: { primary: true, type: "int", generated: true },
    name: { type: "varchar" },
    secretNumber: { type: "int" },
    userId: {
      type: "varchar",
    },
    // gameId: { type: "int" },
    status: { type: "varchar", default: "active" }, // active | eliminated
    joinedAt: { type: "timestamp", createDate: true },
  },
  relations: {
    game: {
      type: "many-to-one",
      target: "Game",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});
