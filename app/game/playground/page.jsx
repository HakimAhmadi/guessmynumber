"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, EyeOff, Zap } from "lucide-react";
import { io } from "socket.io-client";

export default function GamePage() {
  const { id } = useParams();
  const router = useRouter();

  const [game, setGame] = useState(null);
  const [clickedNumbers, setClickedNumbers] = useState([]);
  const [lastElimination, setLastElimination] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const handleNumberClick = async (num) => {
    try {
      if (game?.playerTurn !== currentPlayer?.userId) {
        alert("Not your turn");
      }

      const move = {
        numberClicked: num,
        userId: currentPlayer.userId,
        gameId: currentPlayer.game.gameId,
      };
      console.log("movesRecorded", move);

      const res = await fetch(`/api/game/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(move),
      });
      const data = await res.json();
    } catch {
      console.log();
    }
  };

  const handleNewGame = () => {
    router.push("/");
  };

  const fetchGame = async (gameId) => {
    try {
      const res = await fetch(`/api/game?gameId=${gameId}`);
      const data = await res.json();
      console.log(data);
      setGame(data);

      if (data?.moves) {
        setClickedNumbers(data?.moves.map((item) => item.numberClicked));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const local = localStorage.getItem("hidden-game-player");
    if (local) {
      const localJson = JSON.parse(local);
      setCurrentPlayer(localJson);
      fetchGame(localJson?.game?.gameId);
    }
  }, []);

  useEffect(() => {
    const socket = io({
      path: "/api/socket_io",
    });

    socket.emit("join_game", game?.id);

    socket.on("game_update", (data) => {
      console.log("Live update:", data);
      // Update state here
    });

    return () => {
      socket.disconnect();
    };
  }, [game?.id]);

  if (!game) return null;

  if (game.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Card className="bg-slate-800 p-6 border border-slate-600 text-center">
          <CardTitle className="text-xl mb-2">Game Not Active</CardTitle>
          <p className="text-slate-300">
            This game is currently <strong>{game.status}</strong>.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {lastElimination && (
          <Alert className="mb-4 bg-red-900 border-red-700 animate-pulse">
            <Zap className="h-4 w-4" />
            <AlertDescription className="text-red-200 font-bold">
              💥 {lastElimination}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5" />
                Hidden Numbers Game
              </CardTitle>
              <Badge
                variant="outline"
                className="border-purple-600 text-purple-400"
              >
                Game ID: {game?.gameId}
              </Badge>
            </div>
            <p className="text-slate-400">
              Click numbers to eliminate players. But who has which number?
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {game?.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    player.status === "eliminated"
                      ? "bg-red-900 border-red-700 opacity-75"
                      : "bg-slate-700 border-slate-600"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      player.status === "eliminated"
                        ? "bg-red-800"
                        : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        player.status === "eliminated"
                          ? "text-red-300"
                          : "text-slate-300"
                      }`}
                    >
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">
                        {player.status === "eliminated"
                          ? "Eliminated"
                          : "Active"}
                      </p>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">
                  Click a number to eliminate!
                </h3>
                <Badge className="bg-purple-900 text-purple-300">
                  Your number: {currentPlayer?.secretNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Array.from(
                  { length: game?.maxNumber || 20 },
                  (_, i) => i + 1
                ).map((num) => {
                  const isClicked = clickedNumbers.includes(num);
                  console.log(isClicked);
                  return (
                    <Button
                      key={num}
                      variant={isClicked ? "destructive" : "outline"}
                      className={`aspect-square text-lg font-bold relative transition-all ${
                        isClicked
                          ? "bg-red-800 border-red-600 text-red-200 opacity-50"
                          : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-purple-500"
                      }`}
                      onClick={() => handleNumberClick(num)}
                      disabled={isClicked}
                    >
                      {isClicked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-400 rotate-45"></div>
                          <div className="w-full h-0.5 bg-red-400 -rotate-45 absolute"></div>
                        </div>
                      )}
                      <span className={isClicked ? "line-through" : ""}>
                        {num}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">
                game?.Players remaining:{" "}
                {game?.players.filter((p) => p.status === "active").length}/
                {game?.players.length}
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => router.push("/")}
                >
                  Leave Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Winner Dialog */}
        <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
          <DialogContent className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-yellow-400 text-white max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Trophy className="w-10 h-10 text-yellow-200" />
              </div>
              <DialogTitle className="text-3xl font-bold mb-2 animate-pulse">
                🎉 WINNER! 🎉
              </DialogTitle>
              <div className="space-y-4">
                <div className="text-6xl animate-bounce">👑</div>
                <h2 className="text-2xl font-bold text-yellow-100">
                  {winner} Wins!
                </h2>
                <p className="text-yellow-200">
                  Congratulations! You're the last player standing!
                </p>
                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    onClick={handleNewGame}
                    className="bg-white text-orange-600 hover:bg-yellow-100 font-bold"
                  >
                    🎮 Play Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWinnerModal(false)}
                    className="border-white text-white hover:bg-white hover:bg-opacity-20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
