const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Move",
  tableName: "moves",
  columns: {
    id: { primary: true, type: "int", generated: true },
    numberClicked: { type: "int" },
    createdAt: { type: "timestamp", createDate: true },
    isSuccessful: { type: "boolean", default: false },
  },
  relations: {
    game: {
      type: "many-to-one",
      target: "Game",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    player: {
      type: "many-to-one",
      target: "Player",
      joinColumn: true,
      onDelete: "SET NULL",
    },
  },
});
