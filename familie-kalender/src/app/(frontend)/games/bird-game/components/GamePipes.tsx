"use client";

import React, { useEffect } from "react";
import { Pipe } from "../hooks/useCollisionDetection";

type GamePipesProps = {
  running: boolean;
  containerWidth: number;
  containerHeight: number;
  pipes: Pipe[];  // <-- add this
  setPipes: React.Dispatch<React.SetStateAction<Pipe[]>>;  // <-- and this
};

export default function GamePipes({
  running,
  containerWidth,
  //containerHeight,
  pipes,
  setPipes,
}: GamePipesProps) {
  const pipeGap = 160;
  const pipeWidth = 60;

  useEffect(() => {
    if (!running) return;

    const addPipe = () => {
      const topHeight = Math.random() * 200 + 100;
      setPipes((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: containerWidth,
          height: topHeight,
          x: containerWidth, // or whatever value is appropriate
          gapTop: topHeight,
          width: pipeWidth,
          gapHeight: pipeGap,
          gap: pipeGap,
        },
      ]);
    };

    const interval = setInterval(addPipe, 2000);
    return () => clearInterval(interval);
  }, [running, containerWidth, setPipes]);

  useEffect(() => {
    if (!running) return;

    const moveInterval = setInterval(() => {
      setPipes((prev) =>
        prev
          .map((pipe) => ({ ...pipe, left: pipe.left - 2 }))
          .filter((pipe) => pipe.left + pipeWidth > 0)
      );
    }, 1000 / 60);

    return () => clearInterval(moveInterval);
  }, [running, setPipes]);

  return (
    <>
      {pipes.map((pipe) => (
        <React.Fragment key={pipe.id}>
          <div
            style={{
              position: "absolute",
              left: pipe.left,
              top: 0,
              width: pipeWidth,
              height: pipe.height,
              backgroundColor: "green",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: pipe.left,
              top: pipe.height + pipeGap,
              width: pipeWidth,
              height: 640 - (pipe.height + pipeGap),
              backgroundColor: "green",
              zIndex: 2,
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
}
