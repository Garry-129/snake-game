import React, { useEffect, useRef, useState } from "react";

export default function Home() {

  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let snake = [{ x: 200, y: 200 }];

    let food = {
      x: 100,
      y: 100
    };

    let dx = 20;
    let dy = 0;

    let gameScore = 0;

    function draw() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // snake
      snake.forEach(part => {
        ctx.fillStyle = "lime";
        ctx.fillRect(part.x, part.y, 20, 20);
      });

      // food
      ctx.fillStyle = "red";
      ctx.fillRect(food.x, food.y, 20, 20);

      // move
      const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
      };

      snake.unshift(head);

      // eat food
      if (head.x === food.x && head.y === food.y) {

        gameScore++;
        setScore(gameScore);

        food = {
          x: Math.floor(Math.random() * 20) * 20,
          y: Math.floor(Math.random() * 20) * 20
        };

      } else {
        snake.pop();
      }
    }

    const interval = setInterval(draw, 100);

    function handleKey(e) {

      if (e.key === "ArrowUp") {
        dx = 0; dy = -20;
      }

      if (e.key === "ArrowDown") {
        dx = 0; dy = 20;
      }

      if (e.key === "ArrowLeft") {
        dx = -20; dy = 0;
      }

      if (e.key === "ArrowRight") {
        dx = 20; dy = 0;
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", handleKey);
    };

  }, []);

  async function saveScore() {

    const name = prompt("Enter name");

    await fetch("/save-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        score
      })
    });

    alert("Saved");
  }

  return (
    <div style={styles.container}>

      <h1>🐍 Snake Game</h1>

      <h2>Score: {score}</h2>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={styles.canvas}
      />

      <button onClick={saveScore} style={styles.button}>
        Save Score
      </button>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "white"
  },
  canvas: {
    background: "black",
    maxWidth: "90vw",
    maxHeight: "90vw"
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    background: "limegreen",
    border: "none",
    color: "white",
    cursor: "pointer"
  }
};