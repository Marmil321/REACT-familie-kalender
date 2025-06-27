"use client";

import React, { useState } from "react";
import "../styles/components/game-selector.css"; // styles below

export type GameOption = {
  id: string;
  name: string;
  emoji: string;
};

const games: GameOption[] = [
  { id: "flappy-bird", name: "Flappy Bird", emoji: "🐦" },
  { id: "race", name:"Race", emoji: "🏃" },
];

export default function GameSelector() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="game-selector">
      <h2>Select a game</h2>
      <div className="game-grid">
        {games.map((game) => {
          const isSelected = selectedGame === game.id;
          return (
            <button
              key={game.id}
              className={`game-box ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedGame(game.id)}
              type="button"
            >
              <span className="emoji">{game.emoji}</span>
              <span className="name">{game.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
