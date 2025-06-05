"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Eye, EyeOff, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [gameState, setGameState] = useState("lobby")
  const [playerName, setPlayerName] = useState("")
  const [gameId, setGameId] = useState("")
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [players, setPlayers] = useState([
    { id: 1, name: "Alex", status: "active", hasSelectedNumber: true },
    { id: 2, name: "Sarah", status: "active", hasSelectedNumber: true },
    { id: 3, name: "Mike", status: "eliminated", hasSelectedNumber: true },
    { id: 4, name: "Emma", status: "active", hasSelectedNumber: true },
  ])
  const [clickedNumbers, setClickedNumbers] = useState([3, 7, 12, 18])
  const [lastElimination, setLastElimination] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState("You")

  const handleJoinGame = () => {
    if (playerName && gameId) {
      setGameState("selection")
    }
  }

  const handleNumberSelection = (num) => {
    setSelectedNumber(num)
  }

  const handleConfirmSelection = () => {
    if (selectedNumber) {
      setGameState("waiting")
    }
  }

  const handleStartGame = () => {
    setGameState("playing")
  }

  const handleNumberClick = (num) => {
    if (!clickedNumbers.includes(num)) {
      setClickedNumbers([...clickedNumbers, num])

      // Simulate elimination check (in real game, this would be server-side)
      const eliminationChance = Math.random() > 0.7 // 30% chance someone had this number
      if (eliminationChance) {
        const activePlayers = players.filter((p) => p.status === "active")
        const randomPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)]
        setPlayers(players.map((p) => (p.id === randomPlayer.id ? { ...p, status: "eliminated" } : p)))
        setLastElimination(`${randomPlayer.name} has been eliminated!`)
        setTimeout(() => setLastElimination(null), 3000)
      }
    }
  }

  if (gameState === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <EyeOff className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Hidden Numbers</CardTitle>
            <p className="text-slate-400">A game of mystery and elimination</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Game ID</label>
              <Input
                placeholder="Enter game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Button
              onClick={handleJoinGame}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!playerName || !gameId}
            >
              Join Game
            </Button>
            <div className="text-center">
              <Button variant="outline" className="text-sm border-slate-600 text-slate-300 hover:bg-slate-700">
                Create New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Eye className="w-5 h-5" />
                Choose Your Secret Number
              </CardTitle>
              <p className="text-slate-400">Select a number from 1-20. Keep it secret!</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedNumber === num
                    return (
                      <Button
                        key={num}
                        variant={isSelected ? "default" : "outline"}
                        className={`aspect-square text-lg font-bold ${
                          isSelected
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                        }`}
                        onClick={() => handleNumberSelection(num)}
                      >
                        {num}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {selectedNumber && (
                <Alert className="mb-6 bg-purple-900 border-purple-700">
                  <EyeOff className="h-4 w-4" />
                  <AlertDescription className="text-purple-200">
                    You selected number <strong>{selectedNumber}</strong>. This is your secret number!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleConfirmSelection}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!selectedNumber}
                >
                  Confirm Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-900 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Waiting for Players</CardTitle>
            <p className="text-slate-400">All players must select their secret numbers</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-300">{player.name.charAt(0)}</span>
                    </div>
                    <span className="text-slate-300">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.hasSelectedNumber ? (
                      <Badge className="bg-green-900 text-green-300">Ready</Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-400">
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
                Your number: <strong className="text-purple-400">{selectedNumber}</strong> (Keep it secret!)
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button onClick={handleStartGame} className="bg-purple-600 hover:bg-purple-700">
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {lastElimination && (
          <Alert className="mb-4 bg-red-900 border-red-700 animate-pulse">
            <Zap className="h-4 w-4" />
            <AlertDescription className="text-red-200 font-bold">💥 {lastElimination}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5" />
                Hidden Numbers Game
              </CardTitle>
              <Badge variant="outline" className="border-purple-600 text-purple-400">
                Game ID: {gameId}
              </Badge>
            </div>
            <p className="text-slate-400">Click numbers to eliminate players. But who has which number?</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {players.map((player) => (
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
                      player.status === "eliminated" ? "bg-red-800" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        player.status === "eliminated" ? "text-red-300" : "text-slate-300"
                      }`}
                    >
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{player.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">
                        {player.status === "eliminated" ? "Eliminated" : "Active"}
                      </p>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">Click a number to eliminate!</h3>
                <Badge className="bg-purple-900 text-purple-300">Your number: {selectedNumber}</Badge>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                  const isClicked = clickedNumbers.includes(num)

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
                      <span className={isClicked ? "line-through" : ""}>{num}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">
                Players remaining: {players.filter((p) => p.status === "active").length}/4
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Leave Game
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">New Round</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
