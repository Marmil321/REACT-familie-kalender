import React from "react";
import PlayerSelector from "./components/LobbyPlayerSelector";

 const GamesPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Games</h1>
      <p className="text-lg">This page is under construction.</p>
      <PlayerSelector />
    </div>
  );
}

export default GamesPage;
