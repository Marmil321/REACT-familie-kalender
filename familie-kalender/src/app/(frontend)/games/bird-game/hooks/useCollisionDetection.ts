"use client";

import { useEffect } from "react";

export type Pipe = {
  id: number;
  left: number;
  height: number;
};

type UseCollisionDetectionProps = {
  birdX: number;
  birdY: number;
  birdSize: number;
  pipes: Pipe[];
  containerHeight: number;
  onCollision: () => void;
};

const PIPE_WIDTH = 60;
const PIPE_GAP = 160;

export function useCollisionDetection({
  birdX,
  birdY,
  birdSize,
  pipes,
  containerHeight,
  onCollision,
}: UseCollisionDetectionProps) {
  useEffect(() => {
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;
    const birdLeft = birdX;
    const birdRight = birdX + birdSize;

    for (const pipe of pipes) {
      const pipeLeft = pipe.left;
      const pipeRight = pipe.left + PIPE_WIDTH;

      const topPipeBottom = pipe.height;
      const bottomPipeTop = pipe.height + PIPE_GAP;

      const isInPipeX = birdRight > pipeLeft && birdLeft < pipeRight;
      const hitTop = birdTop < topPipeBottom;
      const hitBottom = birdBottom > bottomPipeTop;

      const collided = isInPipeX && (hitTop || hitBottom);

      // 🐛 Debug logs here
      console.log("Checking collision with pipe", pipe.id);
      console.table({
        birdTop,
        birdBottom,
        birdLeft,
        birdRight,
        pipeLeft,
        pipeRight,
        topPipeBottom,
        bottomPipeTop,
        isInPipeX,
        hitTop,
        hitBottom,
        collided,
      });

      if (collided) {
        onCollision();
        break;
      }
    }

    // Also detect floor/ceiling collision
    if (birdTop <= 0 || birdBottom >= containerHeight) {
      console.log("💥 Collision with floor or ceiling");
      onCollision();
    }
  }, [birdX, birdY, birdSize, pipes, containerHeight, onCollision]);
}
