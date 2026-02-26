import React from "react";

export default function Navbar({ score, onRestart }) {
  return (
    <nav style={styles.nav}>
      
      {/* Game Title */}
      <h2 style={styles.title}>🐍 Snake Game</h2>

      {/* Score */}
      <div style={styles.score}>
        Score: <span>{score}</span>
      </div>

      {/* Restart Button */}
      <button style={styles.button} onClick={onRestart}>
        Restart
      </button>

    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    color: "#fff",
    padding: "10px 20px",
    fontFamily: "Arial",
  },
  title: {
    margin: 0,
  },
  score: {
    fontSize: "18px",
  },
  button: {
    background: "limegreen",
    border: "none",
    padding: "8px 15px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};