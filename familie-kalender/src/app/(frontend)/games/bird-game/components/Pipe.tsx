"use client";

import React, { useEffect, useState } from "react";

type PipeProps = {
  height: number;       // height of the top pipe
  gap: number;          // vertical gap between top and bottom pipe
  speed?: number;       // speed in pixels per frame
  onOffscreen?: () => void; // callback when pipe leaves screen
};

export default function Pipe({
  height,
  gap,
  speed = 2,
  onOffscreen,
}: PipeProps) {
  const [x, setX] = useState(window.innerWidth);

  useEffect(() => {
    const frame = () => {
      setX((prevX) => {
        const nextX = prevX - speed;
        if (nextX + 60 < 0 && onOffscreen) {
          onOffscreen();
        }
        return nextX;
      });
    };

    const interval = setInterval(frame, 1000 / 60); // ~60 FPS
    return () => clearInterval(interval);
  }, [speed, onOffscreen]);

  return (
    <>
      {/* Top pipe */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: "60px",
          height: `${height}px`,
          backgroundColor: "green",
          border: "3px solid #004d00",
          boxSizing: "border-box",
        }}
      />

      {/* Bottom pipe */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: height + gap,
          width: "60px",
          height: `calc(100vh - ${height + gap}px)`,
          backgroundColor: "green",
          border: "3px solid #004d00",
          boxSizing: "border-box",
        }}
      />
    </>
  );
}
