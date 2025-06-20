import { AppDataSource } from "@/lib/typeorm.config";

export async function POST(req) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await req.json();
    console.log(body);
    const { numberClicked, playerId, gameId, isSuccessful } = body;

    if (!numberClicked || !playerId || !gameId || !isSuccessful) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const moveRepo = AppDataSource.getRepository("Move");

    const newMove = moveRepo.create({ numberClicked, playerId, MoveId, isSuccessful });
    const saved = await moveRepo.save(newMove);

    return Response.json(saved );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
