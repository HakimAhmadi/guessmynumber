'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket; // Maintain outside state to avoid reconnections on rerenders

export const useSocket = (gameId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Initialize only once
    if (!socket) {
      socket = io('http://localhost:4000', {
        transports: ['websocket'],
      });
    }

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to WebSocket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from WebSocket');
    });

    // Join game room
    if (gameId) {
      socket.emit('join_game', gameId);
      console.log("after join game");
    }

    // Listen to game updates
    socket.on('game_update', (updatedGameState) => {
      console.log('📡 Game updated:', updatedGameState);
      setGameState(updatedGameState);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game_update');
    };
  }, [gameId]);

  const sendMove = (movePayload) => {
    if (socket && isConnected) {
      socket.emit('make_move', movePayload);
    }
  };

  return {
    isConnected,
    gameState,
    sendMove,
  };
};
