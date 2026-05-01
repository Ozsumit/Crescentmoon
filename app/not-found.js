"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Crosshair, Play, RotateCcw, Activity } from "lucide-react";

export default function PageNotFound() {
  // 1. HYDRATION FIX: This completely stops the infinite refresh bug in Next.js App Router.
  const [mounted, setMounted] = useState(false);

  // 2. MINIGAME STATE
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'over'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });

  // Initialize client-side rendering only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Minigame Logic
  const moveTarget = useCallback(() => {
    setTargetPos({
      x: Math.floor(Math.random() * 80) + 10, // Keep within 10%-90% bounds
      y: Math.floor(Math.random() * 80) + 10,
    });
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameState("playing");
    moveTarget();
  };

  const handleHit = (e) => {
    e.stopPropagation();
    if (gameState !== "playing") return;
    setScore((s) => s + 1);
    moveTarget();
  };

  // Minigame Timer
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("over");
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  // Prevents Next.js SSR from flashing and crashing the router
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-white/20">
      {/* Massive Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <h1 className="text-[30vw] font-black tracking-tighter text-white/[0.02] select-none leading-none">
          404
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-neutral-400 mb-6">
            <Activity size={14} className="text-red-400 animate-pulse" />
            Signal Lost
          </div>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-3">
            Scene Not Found
          </h2>
          <p className="text-neutral-500 text-sm md:text-base max-w-md mx-auto">
            The script ends here. You can return to the main cast, or help us
            re-establish the uplink.
          </p>
        </div>

        {/* Minigame Console */}
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-8">
          {/* Console Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
              <Crosshair size={14} />
              <span>Uplink Recovery System</span>
            </div>
            {gameState === "playing" && (
              <div className="flex items-center gap-4 font-mono text-sm font-bold">
                <span className="text-white">Score: {score}</span>
                <span
                  className={`${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-neutral-300"}`}
                >
                  00:{timeLeft.toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Game Area */}
          <div className="relative w-full h-[300px] md:h-[400px] bg-black overflow-hidden flex items-center justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* IDLE STATE */}
              {gameState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center z-10"
                >
                  <button
                    onClick={startGame}
                    className="group relative flex items-center justify-center h-16 w-16 rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-95 mb-4"
                  >
                    <Play size={24} className="ml-1" />
                    <span className="absolute inset-0 rounded-full border border-white animate-ping opacity-20" />
                  </button>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                    Initialize Recovery
                  </p>
                </motion.div>
              )}

              {/* GAME OVER STATE */}
              {gameState === "over" && (
                <motion.div
                  key="over"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center z-10 text-center"
                >
                  <h3 className="text-3xl font-black tracking-tighter text-white mb-2">
                    {score} Nodes Recovered
                  </h3>
                  <p className="text-sm text-neutral-400 mb-6">
                    {score > 15
                      ? "Outstanding reaction time."
                      : "Connection weak. Try again."}
                  </p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white hover:text-black transition-colors"
                  >
                    <RotateCcw size={16} />
                    Restart Diagnostic
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PLAYING STATE: The Target */}
            {gameState === "playing" && (
              <motion.button
                key="target"
                onClick={handleHit}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  left: `${targetPos.x}%`,
                  top: `${targetPos.y}%`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.6)] cursor-crosshair group outline-none"
              >
                <div className="w-8 h-8 rounded-full border-2 border-black border-dashed animate-[spin_3s_linear_infinite]" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Global Return Action */}
        <Link
          href="/"
          className="group flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 font-medium text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95"
        >
          <Home
            size={18}
            className="text-neutral-400 group-hover:text-white transition-colors"
          />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
