"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from "uuid";

export default function Page() {
  const [form, setForm] = useState({
    gameId: "",
    hostName: "",
    maxNumber: 20,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push(`/game/${data.game.gameId}`); // Or redirect as needed
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm({ ...form, gameId: uuidv4().split("-")[0] });
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            Create a New Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm">Game ID</label>
              <Input
                name="gameId"
                value={form.gameId}
                onChange={handleChange}
                required
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">Host Name</label>
              <Input
                name="hostName"
                value={form.hostName}
                onChange={handleChange}
                required
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm">Max Number</label>
              <Input
                type="number"
                name="maxNumber"
                value={form.maxNumber}
                onChange={handleChange}
                min={1}
                max={100}
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
            {error && (
              <Alert className="bg-red-900 text-red-200 border-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
