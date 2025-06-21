import { AppDataSource } from "@/lib/typeorm.config";

export async function POST(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await req.json();
    console.log(body);
    const { gameId, name, secretNumber, userId } = body;

    if (!gameId || !name || !secretNumber || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const gameRepo = AppDataSource.getRepository("Game");
    const playerRepo = AppDataSource.getRepository("Player");

    // 🔍 First, fetch the game entity
    const game = await gameRepo.findOne({ where: { gameId } });

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), { status: 404 });
    }

    // 🧩 Create the player and assign the relation
    const newPlayer = playerRepo.create({
      name,
      secretNumber,
      game,
      userId
    });

    const saved = await playerRepo.save(newPlayer);

    return Response.json( saved );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
