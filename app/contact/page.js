"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Zap,
  Terminal,
  Shield,
  Cpu,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  Lock,
  Unlock,
  Phone,
  Star,
} from "lucide-react";

// --- Game Constants ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 8; // For keyboard
const BORDER_PADDING = 20;

const COLORS = {
  player: "#000000",
  bullet: "#000000",
  enemyBasic: "#EF4444",
  enemySeeker: "#F59E0B",
  enemyWeaver: "#8B5CF6",
  enemyTank: "#EC4899",
  powerupSpread: "#EAB308",
  powerupShield: "#3B82F6",
  border: "#E5E5E5",
};

const ContactArcade = () => {
  // UI State
  const [gameState, setGameState] = useState("IDLE");
  const [uiScore, setUiScore] = useState(0);
  const [uiWave, setUiWave] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [health, setHealth] = useState(100);
  const [inputType, setInputType] = useState("MOUSE"); // 'MOUSE' or 'KEYBOARD'

  // Unlock State
  const [unlockedPremium, setUnlockedPremium] = useState({
    cellphone: false,
    vipCode: false,
  });

  // Refs
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const keysPressed = useRef({}); // Track active keys

  // --- Game Engine ---
  const startGame = () => {
    setGameState("PLAYING");
    setHealth(100);
    setUploadProgress(0);
    setUiScore(0);
    setUiWave(1);
    setUnlockedPremium({ cellphone: false, vipCode: false });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Game Objects
    let frame = 0;
    let score = 0;
    let upload = 0;
    let wave = 1;

    // Player Init
    const player = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 100,
      radius: 16,
      weaponLevel: 1,
      powerupTimer: 0,
      isShielded: false,
      shieldTimer: 0,
    };

    let projectiles = [];
    let enemies = [];
    let particles = [];
    let powerups = [];

    // Mouse Tracking
    let mouseX = GAME_WIDTH / 2;
    let mouseY = GAME_HEIGHT - 100;
    let currentInputMode = "MOUSE"; // Local ref for loop performance

    // --- Input Handling ---

    // 1. Mouse/Touch
    const handleMouseMove = (e) => {
      if (currentInputMode !== "MOUSE") {
        currentInputMode = "MOUSE";
        setInputType("MOUSE");
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseX = (e.clientX - rect.left) * scaleX;
      mouseY = (e.clientY - rect.top) * scaleY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (currentInputMode !== "MOUSE") {
        currentInputMode = "MOUSE";
        setInputType("MOUSE");
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseX = (e.touches[0].clientX - rect.left) * scaleX;
      mouseY = (e.touches[0].clientY - rect.top) * scaleY;
    };

    // 2. Keyboard Listeners
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
        ].includes(e.key)
      ) {
        if (currentInputMode !== "KEYBOARD") {
          currentInputMode = "KEYBOARD";
          setInputType("KEYBOARD");
        }
      }
    };
    const handleKeyUp = (e) => (keysPressed.current[e.key] = false);

    // Attach Listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // --- Helpers ---
    const spawnPowerup = (x, y) => {
      const type = Math.random() > 0.5 ? "SPREAD" : "SHIELD";
      powerups.push({
        x,
        y,
        type,
        radius: 12,
        vy: 2,
        wobble: Math.random() * Math.PI,
      });
    };

    const createExplosion = (x, y, color, count = 8) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 1.0,
          color,
        });
      }
    };

    // --- Main Loop ---
    const loop = () => {
      if (health <= 0) {
        setGameState("GAME_OVER");
        return;
      }
      if (upload >= 100) {
        setGameState("VICTORY");
        setUploadProgress(100);
        return;
      }

      frame++;

      // Clear & Draw Background
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      const scrollY = (frame * 2) % gridSize;
      for (let x = 0; x < GAME_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }
      for (let y = scrollY; y < GAME_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
      }

      // Draw Game Borders
      ctx.strokeStyle = "#D4D4D4";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        BORDER_PADDING,
        BORDER_PADDING,
        GAME_WIDTH - BORDER_PADDING * 2,
        GAME_HEIGHT - BORDER_PADDING * 2
      );

      // --- 1. Player Movement (Hybrid) ---
      if (currentInputMode === "MOUSE") {
        // Lerp to mouse
        player.x += (mouseX - player.x) * 0.12;
        player.y += (mouseY - player.y) * 0.12;
      } else {
        // Keyboard Direct
        if (keysPressed.current["ArrowUp"] || keysPressed.current["w"])
          player.y -= PLAYER_SPEED;
        if (keysPressed.current["ArrowDown"] || keysPressed.current["s"])
          player.y += PLAYER_SPEED;
        if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"])
          player.x -= PLAYER_SPEED;
        if (keysPressed.current["ArrowRight"] || keysPressed.current["d"])
          player.x += PLAYER_SPEED;
      }

      // Clamp to Borders
      player.x = Math.max(
        BORDER_PADDING + player.radius,
        Math.min(GAME_WIDTH - BORDER_PADDING - player.radius, player.x)
      );
      player.y = Math.max(
        BORDER_PADDING + player.radius,
        Math.min(GAME_HEIGHT - BORDER_PADDING - player.radius, player.y)
      );

      // Update Timers
      if (player.powerupTimer > 0) player.powerupTimer--;
      else player.weaponLevel = 1;

      if (player.shieldTimer > 0) {
        player.shieldTimer--;
        if (player.shieldTimer === 0) player.isShielded = false;
      }

      // Shooting
      if (frame % 8 === 0) {
        const bulletSpeed = 15;
        projectiles.push({
          x: player.x,
          y: player.y - 15,
          vx: 0,
          vy: -bulletSpeed,
        });

        if (player.weaponLevel >= 2) {
          projectiles.push({
            x: player.x,
            y: player.y - 15,
            vx: -3,
            vy: -bulletSpeed * 0.9,
          });
          projectiles.push({
            x: player.x,
            y: player.y - 15,
            vx: 3,
            vy: -bulletSpeed * 0.9,
          });
        }
      }

      // Draw Player
      ctx.save();
      ctx.translate(player.x, player.y);

      if (player.isShielded) {
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${
          0.6 + Math.sin(frame * 0.2) * 0.3
        })`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      // Simple Drone Shape
      ctx.moveTo(0, -18);
      ctx.lineTo(-14, 12);
      ctx.lineTo(0, 6);
      ctx.lineTo(14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- 2. Projectiles ---
      ctx.fillStyle = COLORS.bullet;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillRect(p.x - 2, p.y - 2, 4, 8);
        if (p.y < 0) projectiles.splice(i, 1);
      }

      // --- 3. Enemies & Spawning ---
      // Wave Logic
      if (upload < 20) wave = 1;
      else if (upload < 50) wave = 2;
      else if (upload < 80) wave = 3;
      else wave = 4;
      if (frame % 30 === 0 && wave !== uiWave) setUiWave(wave);

      // Spawn
      let spawnRate = wave === 1 ? 60 : wave === 2 ? 45 : wave === 3 ? 35 : 25;

      if (frame % spawnRate === 0) {
        const x = Math.random() * (GAME_WIDTH - 100) + 50;
        let type = "BASIC";
        if (wave > 1 && Math.random() > 0.6) type = "WEAVER";
        if (wave > 2 && Math.random() > 0.7) type = "SEEKER";
        if (wave > 3 && Math.random() > 0.8) type = "TANK";

        const enemy = {
          x,
          y: -50,
          type,
          hp: 1,
          w: 30,
          h: 30,
          color: COLORS.enemyBasic,
          vx: 0,
          vy: 3,
          scoreValue: 100,
        };

        if (type === "WEAVER") {
          enemy.color = COLORS.enemyWeaver;
          enemy.vy = 4;
          enemy.initialX = x;
          enemy.scoreValue = 300;
        } else if (type === "SEEKER") {
          enemy.color = COLORS.enemySeeker;
          enemy.vy = 3.5;
          enemy.hp = 2;
          enemy.scoreValue = 500;
        } else if (type === "TANK") {
          enemy.color = COLORS.enemyTank;
          enemy.vy = 1.5;
          enemy.hp = 10;
          enemy.w = 60;
          enemy.h = 50;
          enemy.scoreValue = 1000;
        }

        enemies.push(enemy);
      }

      // Enemy Updates
      for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        if (e.type === "WEAVER") {
          e.x = e.initialX + Math.sin(e.y * 0.02) * 60;
          e.y += e.vy;
        } else if (e.type === "SEEKER") {
          const dx = player.x - e.x;
          e.vx = dx * 0.015;
          e.x += e.vx;
          e.y += e.vy;
        } else {
          e.y += e.vy;
        }

        // Draw Enemy
        ctx.fillStyle = e.color;
        if (e.type === "TANK") {
          ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
          // Tank HP Bar
          ctx.fillStyle = "#000";
          ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2 - 8, e.w, 4);
          ctx.fillStyle = "#0F0";
          ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2 - 8, e.w * (e.hp / 10), 4);
        } else {
          // Triangle / Square shapes
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + e.h / 2);
          ctx.lineTo(e.x - e.w / 2, e.y - e.h / 2);
          ctx.lineTo(e.x + e.w / 2, e.y - e.h / 2);
          ctx.fill();
        }

        // Projectile Collision
        let hit = false;
        for (let j = projectiles.length - 1; j >= 0; j--) {
          let p = projectiles[j];
          if (
            Math.abs(p.x - e.x) < e.w / 2 + 2 &&
            Math.abs(p.y - e.y) < e.h / 2 + 2
          ) {
            e.hp--;
            projectiles.splice(j, 1);
            createExplosion(p.x, p.y, "#FFF", 2);
            if (e.hp <= 0) {
              hit = true;
              if (Math.random() < 0.15) spawnPowerup(e.x, e.y);
            }
            break;
          }
        }

        if (hit) {
          enemies.splice(i, 1);
          createExplosion(e.x, e.y, e.color, 10);
          score += e.scoreValue;
          if (frame % 5 === 0) setUiScore(score); // Throttle UI update

          upload += 1.5;
          if (Math.floor(upload) > Math.floor(uploadProgress))
            setUploadProgress(Math.min(100, upload));
          continue;
        }

        // Player Collision
        if (
          Math.hypot(player.x - e.x, player.y - e.y) <
          player.radius + e.w / 2
        ) {
          enemies.splice(i, 1);
          createExplosion(e.x, e.y, e.color, 12);
          if (!player.isShielded) setHealth((h) => Math.max(0, h - 25));
        }

        if (e.y > GAME_HEIGHT + 50) enemies.splice(i, 1);
      }

      // --- 4. Powerups ---
      for (let i = powerups.length - 1; i >= 0; i--) {
        let pup = powerups[i];
        pup.y += pup.vy;
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          pup.type === "SPREAD" ? COLORS.powerupSpread : COLORS.powerupShield;
        ctx.fill();

        if (
          Math.hypot(player.x - pup.x, player.y - pup.y) <
          player.radius + pup.radius
        ) {
          if (pup.type === "SPREAD") {
            player.weaponLevel = 2;
            player.powerupTimer = 600;
          } else {
            player.isShielded = true;
            player.shieldTimer = 400;
          }
          powerups.splice(i, 1);
          score += 500;
        }
        if (pup.y > GAME_HEIGHT) powerups.splice(i, 1);
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Passive Upload
      if (frame % 60 === 0) {
        upload += 0.1;
        setUploadProgress(Math.min(100, upload));
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  };

  // Unlock Logic
  useEffect(() => {
    if (uploadProgress > 50 && !unlockedPremium.cellphone)
      setUnlockedPremium((prev) => ({ ...prev, cellphone: true }));
    if (uploadProgress >= 100 && !unlockedPremium.vipCode)
      setUnlockedPremium((prev) => ({ ...prev, vipCode: true }));
  }, [uploadProgress]);

  // Unlock Logic
  useEffect(() => {
    if (uploadProgress > 50 && !unlockedPremium.cellphone)
      setUnlockedPremium((prev) => ({ ...prev, cellphone: true }));
    if (uploadProgress >= 100 && !unlockedPremium.vipCode)
      setUnlockedPremium((prev) => ({ ...prev, vipCode: true }));
  }, [uploadProgress]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] mt-20 text-neutral-900 font-sans flex flex-col relative overflow-hidden">
      {/* Navbar / HUD */}
      <nav className="w-full p-6 flex flex-col md:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">AGENCY_OS</h1>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  gameState === "PLAYING"
                    ? "bg-green-500 animate-pulse"
                    : "bg-neutral-300"
                }`}
              ></span>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                {gameState === "IDLE"
                  ? "Systems Online"
                  : `Defense Mode: Active`}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Bar (Only visible when game is focused or playing) */}
        <div className="w-full max-w-md bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-neutral-400">
              <span>Decryption Progress</span>
              <span>{Math.floor(uploadProgress)}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-black"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-neutral-400">
              Score
            </p>
            <p className="font-mono font-bold">{uiScore}</p>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 pb-6 grid lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* LEFT: Contact Information */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2">
          {/* 1. PUBLIC INFO (Always Visible) */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail size={80} />
            </div>
            <h3 className="font-bold text-lg mb-1">Get in Touch</h3>
            <p className="text-neutral-500 text-sm mb-6">
              Available for freelance projects and consulting.
            </p>

            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Email
                </p>
                <a
                  href="mailto:hello@agency.com"
                  className="text-lg font-medium hover:underline decoration-2"
                >
                  hello@agency.com
                </a>
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Socials
                </p>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <Twitter size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <Github size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <Linkedin size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PREMIUM INFO (Locked -> Unlocks at 50%) */}
          <div
            className={`p-6 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden ${
              unlockedPremium.cellphone
                ? "bg-black text-white border-black"
                : "bg-neutral-100 border-dashed border-neutral-300"
            }`}
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  {unlockedPremium.cellphone ? "Direct Line" : "Locked"}
                </span>
              </div>
              {unlockedPremium.cellphone ? (
                <Unlock size={16} />
              ) : (
                <Lock size={16} className="text-neutral-400" />
              )}
            </div>

            {unlockedPremium.cellphone ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-2xl font-mono font-bold">+1 (555) 928-400</p>
                <p className="text-xs text-neutral-500 mt-2">
                  VIP Priority Support Line
                </p>
              </motion.div>
            ) : (
              <div>
                <p className="text-2xl font-mono font-bold blur-sm opacity-30">
                  +1 (555) 000-000
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  Play game to decrypt (50%)
                </p>
              </div>
            )}
          </div>

          {/* 3. ULTRA RARE INFO (Locked -> Unlocks at 100%) */}
          <div
            className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
              unlockedPremium.vipCode
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-neutral-100 border-dashed border-neutral-300"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Star size={18} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  {unlockedPremium.vipCode ? "Access Granted" : "Locked"}
                </span>
              </div>
              {unlockedPremium.vipCode ? (
                <Unlock size={16} />
              ) : (
                <Lock size={16} className="text-neutral-400" />
              )}
            </div>

            {unlockedPremium.vipCode ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link
                  href="https://instagram.com/sumitp._"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="text-3xl font-black tracking-tight">
                    Instagram
                  </p>
                  <p className="text-xs font-bold mt-2 uppercase opacity-70">
                    instagram.com/sumitp._
                  </p>
                </Link>
              </motion.div>
            ) : (
              <div>
                <p className="text-3xl font-black blur-sm opacity-20">
                  XXXXXXXX
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  Play game to decrypt (100%)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Game Area */}
        <div className="lg:col-span-8 relative flex flex-col h-full bg-white rounded-[2rem] border-4 border-neutral-200 shadow-xl overflow-hidden">
          {/* Health Bar Overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100 z-10">
            <motion.div
              animate={{ width: `${health}%` }}
              className={`h-full ${health < 30 ? "bg-red-500" : "bg-black"}`}
            />
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className={`w-full h-full object-cover cursor-crosshair touch-none ${
              gameState === "GAME_OVER" && "grayscale opacity-20"
            }`}
          />

          <AnimatePresence>
            {/* START SCREEN */}
            {gameState === "IDLE" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
              >
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-neutral-200 text-center max-w-sm w-full">
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="p-3 bg-neutral-100 rounded-lg">
                      <Crosshair size={24} />
                    </div>
                    <div className="p-3 bg-neutral-100 rounded-lg">
                      <Shield size={24} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight mb-2">
                    DECRYPT DATA
                  </h2>
                  <p className="text-neutral-500 mb-6 text-sm">
                    Reach 50% & 100% upload to unlock the VIP phone line and
                    discount code.
                  </p>

                  <div className="flex justify-center gap-8 mb-8 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 border rounded border-neutral-300 flex items-center justify-center">
                          W
                        </div>
                        <div className="w-6 h-6 border rounded border-neutral-300 flex items-center justify-center">
                          A
                        </div>
                        <div className="w-6 h-6 border rounded border-neutral-300 flex items-center justify-center">
                          S
                        </div>
                        <div className="w-6 h-6 border rounded border-neutral-300 flex items-center justify-center">
                          D
                        </div>
                      </div>
                      <span>Move</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-6 border rounded border-neutral-300 flex items-center justify-center">
                        MOUSE
                      </div>
                      <span>Aim</span>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    START DECRYPTION
                  </button>
                </div>
              </motion.div>
            )}

            {/* GAME OVER */}
            {gameState === "GAME_OVER" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center"
              >
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center max-w-sm w-full">
                  <AlertTriangle
                    size={48}
                    className="text-red-500 mx-auto mb-4"
                  />
                  <h2 className="text-2xl font-black mb-2">CONNECTION LOST</h2>
                  <p className="text-neutral-500 mb-6 text-sm">
                    You reached {Math.floor(uploadProgress)}% decryption.
                  </p>
                  <button
                    onClick={startGame}
                    className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                  >
                    RETRY
                  </button>
                </div>
              </motion.div>
            )}

            {/* VICTORY */}
            {gameState === "VICTORY" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-black"
                  >
                    <Star size={40} fill="black" />
                  </motion.div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">
                    ALL DATA UNLOCKED
                  </h2>
                  <p className="text-neutral-500 mb-8">
                    You have full access to our VIP channels.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() =>
                        (window.location.href = "mailto:hello@agency.com")
                      }
                      className="px-6 py-3 bg-black text-white rounded-full font-bold"
                    >
                      Claim Reward
                    </button>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 border border-neutral-300 rounded-full font-bold hover:bg-neutral-50"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ContactArcade;
