"use client";

import React, { useState } from "react";
import "../styles/components/game-selector.css";

export type GameOption = {
  id: string;
  name: string;
  emoji: string;
  maxPlayers?: number;
};

const games: GameOption[] = [
  { id: "flappy-bird", name: "Flappy Bird", emoji: "🐦", maxPlayers: 1 },
  { id: "race", name: "Race", emoji: "🏃" }, // no max = unlimited
];

type Props = {
  selectedPlayerCount: number;
};

export default function GameSelector({ selectedPlayerCount }: Props) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="game-selector">
      <h2>Select a game</h2>
      <div className="game-grid">
        {games.map((game) => {
          const isSelected = selectedGame === game.id;
          const isLocked =
            typeof game.maxPlayers === "number" &&
            selectedPlayerCount > game.maxPlayers;

          return (
            <button
              key={game.id}
              className={`game-box ${isSelected ? "selected" : ""} ${
                isLocked ? "locked" : ""
              }`}
              onClick={() => {
                if (!isLocked) setSelectedGame(game.id);
              }}
              type="button"
              disabled={isLocked}
            >
              <span className="emoji">{game.emoji}</span>
              <span className="name">{game.name}</span>
              {isLocked && (
                <span className="lock-msg">Max {game.maxPlayers} player{game.maxPlayers !== 1 ? "s" : ""}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
