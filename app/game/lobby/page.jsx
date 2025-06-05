import React from 'react'

export const page = () => {
    const [playerName, setPlayerName] = useState("")
    const [gameId, setGameId] = useState("")
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
        </div>)
}
