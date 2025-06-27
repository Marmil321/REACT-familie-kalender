"use client";

import React from "react";
import PlayerSelector from "./components/LobbyPlayerSelector";
import CheckerboardBackground from "./styles/Background";
import "../games/styles/game-page.css";
import GameSelector from "./components/GameSelector";

 const GamesPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Games</h1>
      <PlayerSelector />
      <GameSelector />

      <button className="start-game-button"
        onClick={() => alert("Game started!")}
        type="button"
      >
        Start Game
      </button>

      <CheckerboardBackground />
    </div>
  );
}

export default GamesPage;
