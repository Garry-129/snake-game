import React, { useEffect, useRef, useState, useCallback } from "react";

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x,y,w,h,r) {
    if (w < 2*r) r = w/2;
    if (h < 2*r) r = h/2;
    this.moveTo(x+r,y);
    this.lineTo(x+w-r,y);
    this.quadraticCurveTo(x+w,y,x+w,y+r);
    this.lineTo(x+w,y+h-r);
    this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    this.lineTo(x+r,y+h);
    this.quadraticCurveTo(x,y+h,x,y+h-r);
    this.lineTo(x,y+r);
    this.quadraticCurveTo(x,y,x+r,y);
    return this;
  };
}

export default function Home() {
  const canvasRef = useRef(null);
  const snakeRef = useRef([]);
  const foodRef = useRef({x:15,y:10});
  const directionRef = useRef({dx:1,dy:0});
  const lastDirection = useRef({dx:1,dy:0});
  const scoreRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(120);
  const [showRestart, setShowRestart] = useState(false);

  // Load best score from localStorage on component mount
  useEffect(() => {
    const savedBestScore = localStorage.getItem('snakeBestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
    setIsPlaying(false);
    setShowRestart(true);
    
    // Update best score if current score is higher
    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current);
      localStorage.setItem('snakeBestScore', scoreRef.current.toString());
    }
  }, [bestScore]);

  const restartGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setShowRestart(false);
    setIsPlaying(true);
    directionRef.current = {dx:1, dy:0};
    lastDirection.current = {dx:1, dy:0};
    
    // Reset snake and food
    snakeRef.current = [{x:10, y:10}];
    foodRef.current = generateFood(snakeRef.current);
  }, []);

  const generateFood = (snake) => {
    let f;
    do {
      f = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
      };
    } while (snake.some(p => p.x === f.x && p.y === f.y));
    return f;
  };

  const handleKeyDown = useCallback((e) => {
    if (!isPlaying) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }

    const {dx, dy} = lastDirection.current;

    if (e.key === "ArrowUp" && dy === 0) {
      directionRef.current = {dx:0, dy:-1};
      lastDirection.current = {dx:0, dy:-1};
    } else if (e.key === "ArrowDown" && dy === 0) {
      directionRef.current = {dx:0, dy:1};
      lastDirection.current = {dx:0, dy:1};
    } else if (e.key === "ArrowLeft" && dx === 0) {
      directionRef.current = {dx:-1, dy:0};
      lastDirection.current = {dx:-1, dy:0};
    } else if (e.key === "ArrowRight" && dx === 0) {
      directionRef.current = {dx:1, dy:0};
      lastDirection.current = {dx:1, dy:0};
    }
  }, [isPlaying]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, {passive: false});
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = Math.min(400, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
    const gridSize = size / 20;

    function draw() {
      const snake = snakeRef.current;
      const food = foodRef.current;
      const {dx, dy} = directionRef.current;

      const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
      };

      // Check wall collision
      if (head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20) {
        endGame();
        return;
      }

      // Check self collision
      if (snake.some((p, i) => i !== 0 && p.x === head.x && p.y === head.y)) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        scoreRef.current++;
        setScore(scoreRef.current);
        foodRef.current = generateFood(snakeRef.current);
      } else {
        snake.pop();
      }

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      snake.forEach((part, index) => {
        const x = part.x * gridSize;
        const y = part.y * gridSize;
        
        // Gradient for snake body
        if (index === 0) {
          // Head with gradient
          const gradient = ctx.createRadialGradient(
            x + gridSize/2, y + gridSize/2, 2,
            x + gridSize/2, y + gridSize/2, gridSize/2
          );
          gradient.addColorStop(0, "#a3ff00");
          gradient.addColorStop(1, "#7fb300");
          ctx.fillStyle = gradient;
        } else {
          // Body with gradient
          const gradient = ctx.createRadialGradient(
            x + gridSize/2, y + gridSize/2, 2,
            x + gridSize/2, y + gridSize/2, gridSize/2
          );
          gradient.addColorStop(0, "#00ff00");
          gradient.addColorStop(1, "#00aa00");
          ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 6);
        ctx.fill();
      });

      // Draw apple with leaf and shadow
      const appleX = foodRef.current.x * gridSize;
      const appleY = foodRef.current.y * gridSize;
      
      // Apple shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize/2, appleY + gridSize - 2, gridSize/3, gridSize/6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Apple body
      const appleGradient = ctx.createRadialGradient(
        appleX + gridSize/3, appleY + gridSize/3, 2,
        appleX + gridSize/2, appleY + gridSize/2, gridSize/2
      );
      appleGradient.addColorStop(0, "#ff4d4d");
      appleGradient.addColorStop(1, "#cc0000");
      ctx.fillStyle = appleGradient;
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize/2, appleY + gridSize/2, gridSize/2.5, gridSize/2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Apple stem
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(appleX + gridSize/2 - 2, appleY + 2, 4, gridSize/4);
      
      // Apple leaf
      ctx.fillStyle = "#00aa00";
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize/2 + 4, appleY + 4, 3, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const interval = setInterval(draw, gameSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, gameSpeed, endGame]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-bold mb-2 text-center bg-linear-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
          🐍 Snake Classic
        </h1>
        
        <div className="flex justify-between mb-6 gap-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Current Score</p>
            <p className="text-3xl font-bold text-green-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Best Score</p>
            <p className="text-3xl font-bold text-yellow-400">{bestScore}</p>
          </div>
        </div>

        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="bg-gray-900 rounded-xl shadow-lg border-2 border-gray-700"
          />
          
          {!isPlaying && !gameOver && !showRestart && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
              <button 
                onClick={restartGame} 
                className="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                ▶ Start Game
              </button>
            </div>
          )}
          
          {showRestart && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Your score: {score}</p>
                {score === bestScore && score > 0 && (
                  <p className="text-yellow-400 mb-4">🎉 New Best Score! 🎉</p>
                )}
                <button 
                  onClick={restartGame} 
                  className="px-6 py-3 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-gray-400 text-sm">
          Use arrow keys to control the snake
        </div>
      </div>
    </div>
  );
}