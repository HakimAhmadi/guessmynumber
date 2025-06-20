"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, Trophy, Eye, EyeOff, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from "uuid";

export default function Page() {
  const [form, setForm] = useState({
    gameId: "",
    userId: "",
    name: "",
    secretNumber: null,
  });

  const [mode, setMode] = useState("A");
  const [gameData, setGameData] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSecretNumber = (value) => {
    setForm({ ...form, secretNumber: value });
  };

  function generateId(length = 8) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }

  const handleJoinGame = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/game/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      localStorage.setItem("hidden-game-player", JSON.stringify(data));

      router.push(`/game/lobby/${data.game.gameId}`);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const local = localStorage.getItem("hidden-game-player");
    if (local) {
      const localJson = JSON.parse(local);
      setForm({ ...form, userId: localJson.UserId, name: localJson.name });
    } else {
      setForm({ ...form, userId: uuidv4().split("-")[0] });
    }
  }, []);

  const getSelectedGameData = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/game?gameId=${form.gameId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      console.log(data);
      setGameData(data);
      setMode("B");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "B") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Eye className="w-5 h-5" />
                Choose Your Secret Number
              </CardTitle>
              <p className="text-slate-400">
                Select a number from 1-20. Keep it secret!
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="grid grid-cols-5 gap-3">
                  {Array.from(
                    { length: gameData?.maxNumber || 0 },
                    (_, i) => i + 1
                  ).map((num) => {
                    const isSelected = form?.secretNumber === num;
                    return (
                      <Button
                        key={num}
                        variant={isSelected ? "default" : "outline"}
                        className={`aspect-square text-lg font-bold ${
                          isSelected
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                        }`}
                        onClick={() => handleSecretNumber(num)}
                      >
                        {num}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleJoinGame}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!form?.secretNumber}
                >
                  Confirm & Join Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "A") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <EyeOff className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Hidden Numbers
            </CardTitle>
            <p className="text-slate-400">A game of mystery and elimination</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                User ID
              </label>
              <Input
                placeholder="Enter user ID"
                name="userId"
                disabled
                value={form.userId}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Game ID
              </label>
              <Input
                placeholder="Enter game ID"
                name="gameId"
                value={form.gameId}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Button
              onClick={getSelectedGameData}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!form.name || !form.gameId}
            >
              Next
            </Button>
            <div className="text-center">
              <Button
                variant="outline"
                className="text-sm border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Create New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
