import { AppDataSource } from "@/lib/typeorm.config";

export async function POST(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await req.json();
    const { gameId, hostName, maxNumber } = body;

    if (!gameId || !hostName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const gameRepo = AppDataSource.getRepository("Game");
    const newGame = gameRepo.create({ gameId, hostName, maxNumber });
    const saved = await gameRepo.save(newGame);

    return Response.json(saved);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: "Missing gameId query param" }),
        { status: 400 }
      );
    }

    const gameRepo = AppDataSource.getRepository("Game");

    const game = await gameRepo.findOne({
      where: { gameId },
      relations: ["players", "moves"],
    });

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
      });
    }

    return Response.json(game);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function PATCH(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await req.json();
    const { gameId, updates } = body;

    if (!gameId || !updates) {
      return new Response(
        JSON.stringify({ error: "Missing gameId or updates" }),
        { status: 400 }
      );
    }

    const gameRepo = AppDataSource.getRepository("Game");
    const game = await gameRepo.findOne({ where: { gameId } });

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
      });
    }

    Object.assign(game, updates);
    const updatedGame = await gameRepo.save(game);

    return Response.json(updatedGame);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
