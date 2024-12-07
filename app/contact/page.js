"use client";

import React, { useState, useEffect } from "react";

const ContactGamePage = () => {
  const [characterY, setCharacterY] = useState(250); // Character's vertical position
  const [velocity, setVelocity] = useState(0); // Character's vertical velocity
  const [obstacles, setObstacles] = useState([]); // Obstacles array
  const [score, setScore] = useState(0); // Score tracker
  const [gameOver, setGameOver] = useState(false); // Game-over state

  const GRAVITY = 0.5; // Gravity effect
  const FLAP_STRENGTH = -8; // Jump strength
  const OBSTACLE_SPEED = 3; // Speed of moving obstacles
  const CHARACTER_SIZE = 40; // Size of the bird/character

  // Generate obstacles every 2 seconds
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const gapHeight = Math.random() * 150 + 100;
      setObstacles((prev) => [
        ...prev,
        { x: 600, gapTop: gapHeight, passed: false },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Game loop: Updates position, velocity, and checks for collisions
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setCharacterY((prev) => prev + velocity);
      setVelocity((prev) => prev + GRAVITY);

      // Move obstacles
      setObstacles((prev) =>
        prev
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
          .filter((obs) => obs.x > -CHARACTER_SIZE)
      );

      // Check for collisions
      obstacles.forEach((obs) => {
        const characterX = 50; // Fixed X position of the character
        const inObstacleRange =
          obs.x < characterX + CHARACTER_SIZE && obs.x + 50 > characterX;
        const hitTop = characterY < obs.gapTop;
        const hitBottom = characterY > obs.gapTop + 150;

        if (inObstacleRange && (hitTop || hitBottom)) {
          setGameOver(true);
        }

        if (!obs.passed && obs.x + 50 < characterX) {
          obs.passed = true; // Mark obstacle as passed
          setScore((prev) => prev + 1);
        }
      });

      // Check if the character falls off the screen
      if (characterY > 500 || characterY < 0) {
        setGameOver(true);
      }
    }, 20);

    return () => clearInterval(gameLoop);
  }, [characterY, velocity, obstacles, gameOver]);

  // Flap (jump) action
  const flap = () => {
    if (!gameOver) setVelocity(FLAP_STRENGTH);
  };

  // Restart the game
  const restartGame = () => {
    setCharacterY(250);
    setVelocity(0);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div
      className="w-full h-screen bg-gradient-to-r mt-16 from-slate-800 to-gray-700 flex flex-col items-center justify-between overflow-hidden relative"
      onClick={flap}
      onTouchStart={flap}
      style={{ touchAction: "none" }}
    >
      {/* Header: Contact Info */}
      <div className="absolute top-4 w-full flex justify-between px-6 text-white">
        <div>
          <h1 className="text-xl font-bold">Contact Me</h1>
          <p>1234 Street, City</p>
          <p>Email: example@email.com</p>
        </div>
        <div className="text-2xl">Score: {score}</div>
        <div className="flex space-x-4">
          <a
            href="https://twitter.com"
            target="_blank"
            className="hover:scale-110 transition"
          >
            <img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            className="hover:scale-110 transition"
          >
            <img src="/icons/github.svg" alt="GitHub" className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            className="hover:scale-110 transition"
          >
            <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Parallax Background (Layer 1) */}
      <div
        className="absolute w-full h-full bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 transform translate-z-0"
        style={{ zIndex: -1 }}
      ></div>

      {/* Game Area */}
      <div className="relative w-full mb-8 border-2 border-gray-900 h-[80%] flex justify-center items-center overflow-hidden">
        {/* Parallax Obstacles */}
        {obstacles.map((obs, index) => (
          <React.Fragment key={index}>
            <div
              className="absolute bg-gray-400"
              style={{
                width: "50px",
                height: `${obs.gapTop}px`,
                left: `${obs.x}px`,
                top: "0",
                transform: `translateY(${obs.x / 10}px)`,
              }}
            ></div>
            <div
              className="absolute bg-gray-700"
              style={{
                width: "50px",
                height: `${500 - obs.gapTop - 150}px`,
                left: `${obs.x}px`,
                bottom: "0",
                transform: `translateY(${obs.x / 10}px)`,
              }}
            ></div>
          </React.Fragment>
        ))}

        {/* Character (Bird) */}
        <div
          className="absolute bg-blue-500 rounded-full"
          style={{
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            top: `${characterY}px`,
            left: "50px",
            transform: "translateZ(0)", // Ensure smooth scrolling
          }}
        ></div>
      </div>

      {/* Footer: Game Over or Score */}
      <div className="absolute bottom-[50%] left-[50%] flex flex-col items-center text-white">
        {gameOver ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold">Game Over</h2>
            <p className="text-lg">Score: {score}</p>
            <button
              onClick={restartGame}
              className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg text-lg hover:bg-indigo-700 transition"
            >
              Restart
            </button>
          </div>
        ) : (
          <p className="hidden text-lg">Score: {score}</p>
        )}
      </div>
    </div>
  );
};

export default ContactGamePage;
