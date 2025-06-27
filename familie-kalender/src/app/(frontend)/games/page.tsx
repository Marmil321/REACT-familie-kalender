// GamesPage.tsx
"use client";

import React, { useState } from "react";
import PlayerSelector from "./components/PlayerSelector";
import GameSelector from "./components/GameSelector";
import CheckerboardBackground from "./styles/Background";
import "../games/styles/game-page.css";

const GamesPage = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Games</h1>

      <PlayerSelector
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      <GameSelector selectedPlayerCount={selectedIds.length} />

      <button
        className="start-game-button"
        onClick={() => alert(`Game started with players: ${selectedIds.join(', ')}`)}
        type="button"
        disabled={selectedIds.length === 0}
      >
        Start Game
      </button>

      <CheckerboardBackground />
    </div>
  );
};

export default GamesPage;
