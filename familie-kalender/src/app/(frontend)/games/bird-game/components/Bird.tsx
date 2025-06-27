"use client";

import React, { useEffect, useState } from "react";
import "../styles/components/bird.css"; // optional for external styles

const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const FPS = 60;

type BirdProps = {
  position: number; // vertical position in pixels
  onPositionChange: (newPosition: (prev: number) => number) => void

  hasFlapped: boolean;
  onFlap: () => void;
  containerHeight: number;
};

export default function Bird({ position, onPositionChange, hasFlapped, onFlap, containerHeight }: BirdProps) {
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    if (!hasFlapped) return;
    const interval = setInterval(() => {
      setVelocity((v) => {
        const newVelocity = v + GRAVITY;
        return newVelocity;
      });
      onPositionChange((pos) => {
        const next = pos + velocity;
        return Math.min(Math.max(next, 0), containerHeight - 40);
      });
    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, [velocity, hasFlapped, onPositionChange, containerHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        onFlap();
        setVelocity(FLAP_STRENGTH);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFlap]);

  return (
    <div
      className="bird"
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: position,
        width: 40,
        height: 40,
        backgroundColor: "yellow",
        borderRadius: "50%",
        zIndex: 5,
      }}
    />

  );
}
