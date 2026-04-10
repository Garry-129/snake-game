import React, { useEffect, useRef, useState, useCallback } from "react";
import { APIURL } from "../../GlobalAPIURL";

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

export default function Home() {
  const canvasRef = useRef(null);
  const snakeRef = useRef([]);
  const foodRef = useRef({ x: 15, y: 10 });
  const directionRef = useRef({ dx: 1, dy: 0 });
  const lastDirection = useRef({ dx: 1, dy: 0 });
  const scoreRef = useRef(0);
  const directionLocked = useRef(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(120);
  const [showRestart, setShowRestart] = useState(false);
  
  // Player info states
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerCountry, setPlayerCountry] = useState("");
  const [pendingScore, setPendingScore] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if player already exists in backend
  const checkAndSubmitScore = useCallback(async (scoreValue) => {
    // First check localStorage for saved player info
    const savedName = localStorage.getItem('playerName');
    const savedCountry = localStorage.getItem('playerCountry');
    
    if (savedName && savedCountry) {
      // Try to submit with saved info
      setIsSubmitting(true);
      try {
        const response = await fetch(`${APIURL}/submit_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: savedName,
            country: savedCountry,
            score: scoreValue,
            level: "easy"
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setScoreSubmitted(true);
          setTimeout(() => setScoreSubmitted(false), 3000);
          console.log("High score submitted successfully!");
        } else {
          // If backend says player doesn't exist or error, clear localStorage and ask again
          if (data.message === "All fields required" || data.message.includes("player")) {
            localStorage.removeItem('playerName');
            localStorage.removeItem('playerCountry');
            setPendingScore(scoreValue);
            setShowPlayerModal(true);
          }
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // No saved info, ask for it
      setPendingScore(scoreValue);
      setShowPlayerModal(true);
    }
  }, []);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    setGameOver(true);
    setIsPlaying(false);
    setShowRestart(true);

    // Update best score if current score is higher
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('snakeBestScore', finalScore.toString());
    }

    // Submit high score only if score > 0
    if (finalScore > 0) {
      checkAndSubmitScore(finalScore);
    }
  }, [bestScore, checkAndSubmitScore]);

  const handlePlayerInfoSubmit = async () => {
    if (playerName.trim() && playerCountry.trim()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch(`${APIURL}/submit_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: playerName.trim(),
            country: playerCountry.trim(),
            score: pendingScore,
            level: "easy"
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Save to localStorage only if submission successful
          localStorage.setItem('playerName', playerName.trim());
          localStorage.setItem('playerCountry', playerCountry.trim());
          
          setScoreSubmitted(true);
          setTimeout(() => setScoreSubmitted(false), 3000);
          console.log("High score submitted successfully!");
        } else {
          console.log("Failed to submit score:", data.message);
          alert(`Failed to submit score: ${data.message}`);
        }
      } catch (error) {
        console.error("Error submitting score:", error);
        alert("Network error while submitting score");
      } finally {
        setIsSubmitting(false);
        setShowPlayerModal(false);
        setPlayerName("");
        setPlayerCountry("");
        setPendingScore(null);
      }
    }
  };

  const restartGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setShowRestart(false);
    setIsPlaying(true);
    directionRef.current = { dx: 1, dy: 0 };
    lastDirection.current = { dx: 1, dy: 0 };

    // Reset snake and food
    snakeRef.current = [{ x: 10, y: 10 }];
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

    if (directionLocked.current) return;

    const { dx, dy } = lastDirection.current;

    if (e.key === "ArrowUp" && dy === 0) {
      directionRef.current = { dx: 0, dy: -1 };
    }
    else if (e.key === "ArrowDown" && dy === 0) {
      directionRef.current = { dx: 0, dy: 1 };
    }
    else if (e.key === "ArrowLeft" && dx === 0) {
      directionRef.current = { dx: -1, dy: 0 };
    }
    else if (e.key === "ArrowRight" && dx === 0) {
      directionRef.current = { dx: 1, dy: 0 };
    }

    lastDirection.current = directionRef.current;
    directionLocked.current = true;
  }, [isPlaying]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, { passive: false });
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
      const { dx, dy } = directionRef.current;

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

        if (index === 0) {
          const gradient = ctx.createRadialGradient(
            x + gridSize / 2, y + gridSize / 2, 2,
            x + gridSize / 2, y + gridSize / 2, gridSize / 2
          );
          gradient.addColorStop(0, "#a3ff00");
          gradient.addColorStop(1, "#7fb300");
          ctx.fillStyle = gradient;
        } else {
          const gradient = ctx.createRadialGradient(
            x + gridSize / 2, y + gridSize / 2, 2,
            x + gridSize / 2, y + gridSize / 2, gridSize / 2
          );
          gradient.addColorStop(0, "#00ff00");
          gradient.addColorStop(1, "#00aa00");
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 6);
        ctx.fill();

        directionLocked.current = false;
      });

      // Draw apple
      const appleX = foodRef.current.x * gridSize;
      const appleY = foodRef.current.y * gridSize;

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize / 2, appleY + gridSize - 2, gridSize / 3, gridSize / 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const appleGradient = ctx.createRadialGradient(
        appleX + gridSize / 3, appleY + gridSize / 3, 2,
        appleX + gridSize / 2, appleY + gridSize / 2, gridSize / 2
      );
      appleGradient.addColorStop(0, "#ff4d4d");
      appleGradient.addColorStop(1, "#cc0000");
      ctx.fillStyle = appleGradient;
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize / 2, appleY + gridSize / 2, gridSize / 2.5, gridSize / 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#8B4513";
      ctx.fillRect(appleX + gridSize / 2 - 2, appleY + 2, 4, gridSize / 4);

      ctx.fillStyle = "#00aa00";
      ctx.beginPath();
      ctx.ellipse(appleX + gridSize / 2 + 4, appleY + 4, 3, 5, -0.2, 0, Math.PI * 2);
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

        {/* Score submitted notification */}
        {scoreSubmitted && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
            🏆 High Score Submitted!
          </div>
        )}

        {/* Submitting indicator */}
        {isSubmitting && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            ⏳ Submitting score...
          </div>
        )}

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

      {/* Player Info Modal - Only shows once */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-400">
              🏆 High Score!
            </h2>
            <p className="text-center mb-4">
              You scored <span className="text-yellow-400 font-bold text-xl">{pendingScore}</span> points!
            </p>
            <p className="text-center mb-6 text-gray-300">
              Enter your details to save your high score:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Country *
                </label>
                <input
                  type="text"
                  value={playerCountry}
                  onChange={(e) => setPlayerCountry(e.target.value.toUpperCase())}
                  placeholder="Enter your country"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white uppercase"
                  maxLength={50}
                />
              </div>
              
              <button
                onClick={handlePlayerInfoSubmit}
                disabled={!playerName.trim() || !playerCountry.trim() || isSubmitting}
                className="w-full mt-6 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Save High Score"}
              </button>
              
              <button
                onClick={() => {
                  setShowPlayerModal(false);
                  setPlayerName("");
                  setPlayerCountry("");
                  setPendingScore(null);
                }}
                className="w-full mt-2 px-6 py-2 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}