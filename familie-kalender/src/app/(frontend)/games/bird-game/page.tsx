"use client";

import React, { useEffect, useRef, useState } from "react";
import CheckerboardBackground from "../styles/Background";
import Bird from "./components/Bird";
import GamePipes from "./components/GamePipes";
import {useCollisionDetection, Pipe} from "./hooks/useCollisionDetection";

const GAME_WIDTH = 640;
const GAME_HEIGHT = 640;
const BIRD_SIZE = 40;
const birdX = 300; // Should match the bird’s horizontal position (e.g. 300px from left)

interface BirdGameProps {
  playerEmoji?: string;
}

export default function BirdGame( { playerEmoji }: BirdGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [birdY, setBirdY] = useState(200);
  const [pipes, setPipes] = useState<Pipe[]>([]); // Lift pipes here
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  //refrsh on collision
  useEffect(() => {
    if (gameOver) {
      setGameStarted(false); // Reset game state
      setGameOver(false); // Reset game over state
      setPipes([]); // Reset pipes on game over
      setBirdY(200); // Reset bird position
    }
  }, [gameOver]);


  useCollisionDetection({
    birdY,
    birdX,
    birdSize: BIRD_SIZE,
    pipes,
    containerHeight: GAME_HEIGHT,
    onCollision: () => {
      if(!gameOver){
      setGameOver(true);
      alert("Game Over! Collision detected.");
      }
    },
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{ zIndex: 0, overflow: "hidden", height: "100vh" }}
    >
      <CheckerboardBackground />
      <div className="gamewindow-container">
    {/*<>
    <div
      style={{
        position: "absolute",
        left: birdX,
        top: birdY,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        border: "2px solid red",
        zIndex: 100,
        pointerEvents: "none",
      }}
    />

    {pipes.map((pipe) => (
      <React.Fragment key={pipe.id}>
        <div
          style={{
            position: "absolute",
            left: pipe.left,
            top: 0,
            width: 60,
            height: pipe.height,
            border: "2px solid blue",
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: pipe.left,
            top: pipe.height + 160,
            width: 60,
            height: GAME_HEIGHT - (pipe.height + 160),
            border: "2px solid blue",
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      </React.Fragment>
    ))}
  </> */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          left: "50%",
          transform: "translateX(100%) translateY(10%)",
          top: "50%",
          backgroundColor: "#87CEEB", // light sky blue
          border: "4px solid #fff",
          borderRadius: "16px",
          overflow: "hidden",
          zIndex: 1, // above background
        }}
      >
        <Bird
          position={birdY}
          onPositionChange={setBirdY}
          hasFlapped={gameStarted}
          onFlap={() => setGameStarted(true)}
          containerHeight={GAME_HEIGHT}
          emoji= {playerEmoji}// selected member emoji
        />
        <GamePipes
          running={gameStarted}
          containerWidth={GAME_WIDTH}
          containerHeight={GAME_HEIGHT}
          pipes={pipes}          // Pass pipes state down
          setPipes={setPipes}    // Pass setter down so GamePipes updates pipes here
        />
      </div>
    </div>
    </div>
  );
}
