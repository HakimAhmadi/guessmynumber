"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { Users, Trophy, Eye, EyeOff, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const { id } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const router = useRouter();

  const handleStartGame = () => {
    router.push(`/game/${data.game.gameId}`);
    setGameState("playing");
  };

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/game?gameId=${id}`);
      const data = await res.json();
      console.log(data);
      setGame(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (game && currentPlayer && game?.status === "active") {
      console.log(game);
      console.log(currentPlayer)
      const isPlayerInGame = game.players?.some(
        (player) => player.userId && currentPlayer?.userId && player.userId === currentPlayer.userId
      );
      console.log(isPlayerInGame)

      if (isPlayerInGame) {
        router.push("/game/playground");
      }
    }
  }, [game, currentPlayer, router]);

  useEffect(() => {
    if (id) {
      fetchGame();
      const local = localStorage.getItem("hidden-game-player");
      if (local) {
        const localJson = JSON.parse(local);
        setCurrentPlayer(localJson);
        setSelectedNumber(localJson?.player?.secretNumber);
      }
    }
  }, [id]);

  if (game?.status && game.status !== "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-400">
              Game Unavailable
            </CardTitle>
            <p className="text-slate-300 mt-2">
              This game has already <strong>{game.status}</strong>.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="mt-4 text-slate-300 border-slate-600 hover:bg-slate-700"
              onClick={() => (window.location.href = "/")} // or use router.push("/")
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-900 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Waiting for Players
          </CardTitle>
          <p className="text-slate-400">
            All players must select their secret numbers
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {game?.players &&
              game?.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-300">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-slate-300">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.secretNumber ? (
                      <Badge className="bg-green-900 text-green-300">
                        Ready
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-yellow-600 text-yellow-400"
                      >
                        Selecting...
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <Alert className="mb-6 bg-slate-700 border-slate-600">
            <EyeOff className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              Your number:{" "}
              <strong className="text-purple-400">{selectedNumber}</strong>{" "}
              (Keep it secret!)
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button
              onClick={handleStartGame}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
