import { AppDataSource } from "@/lib/typeorm.config";

export async function POST(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await req.json();
    const { numberClicked, userId, gameId } = body;

    if (!numberClicked || !userId || !gameId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const gameRepo = AppDataSource.getRepository("Game");
    const playerRepo = AppDataSource.getRepository("Player");
    const moveRepo = AppDataSource.getRepository("Move");

    const player = await playerRepo.findOne({ where: { userId } });
    const cleanGame = await gameRepo.findOne({ where: { gameId } });

    if (!player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404,
      });
    }

    // Save the move first
    const newMove = moveRepo.create({
      numberClicked,
      player,
      game: cleanGame,
    });
    const savedMove = await moveRepo.save(newMove);

    // Re-fetch game with players and moves
    const game = await gameRepo.findOne({
      where: { gameId },
      relations: ["players", "moves"],
    });

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
      });
    }

    // ✅ Check if any player's secretNumber matches the clicked number
    const matchingPlayer = game.players.find(
      (p) => p.secretNumber === numberClicked && p.status === "active"
    );

    if (matchingPlayer) {
      matchingPlayer.status = "eliminated";
      await playerRepo.save(matchingPlayer);
    }

    // 🔁 Determine next player's turn (round-robin among active players)
    const activePlayers = game.players.filter((p) => p.status === "active");
    const currentIndex = activePlayers.findIndex((p) => p.userId === userId);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    // 📝 Save next playerTurn to Game
    game.playerTurn = nextPlayer.userId;
    await gameRepo.save(game);

    // 🔌 Emit WebSocket update
    const io = initSocket(res); // Initialize or get socket instance
    io.to(gameId).emit("game_update", {
      type: "move",
      numberClicked,
      eliminatedPlayer: eliminated?.name || null,
      playerTurn: game.playerTurn,
    });

    return Response.json({
      move: savedMove,
      eliminatedPlayer: matchingPlayer ? matchingPlayer.userId : null,
      nextPlayerTurn: nextPlayer.userId,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
