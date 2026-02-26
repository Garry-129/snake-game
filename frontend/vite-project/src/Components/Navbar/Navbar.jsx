import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ currentDifficulty, onDifficultyChange, onScoreboardClick }) {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const difficulties = [
    { name: "Easy", color: "#4caf50", path: "/" },
    { name: "Medium", color: "#ff9800", path: "/medium" },
    { name: "Hard", color: "#f44336", path: "/hard" },
    { name: "Impossible", color: "#9c27b0", path: "/impossible" }
  ];

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDifficulty(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDifficultySelect = (difficulty) => {
    onDifficultyChange(difficulty);
    setShowDifficulty(false);
  };

  return (
    <nav style={styles.nav}>
      
      {/* Left - Game Title with Link to Home */}
      <div style={styles.left}>
        <Link to="/" style={styles.titleLink} onClick={() => onDifficultyChange('Easy')}>
          <h2 style={styles.title}>🐍 Snake Game</h2>
        </Link>
      </div>

      {/* Center - Difficulty Selector */}
      <div style={styles.center} ref={dropdownRef}>
        <div style={styles.difficultyContainer}>
          <button 
            style={styles.difficultyBtn}
            onClick={() => setShowDifficulty(!showDifficulty)}
          >
            <span style={styles.difficultyIcon}>🎮</span>
            <span style={styles.difficultyText}>
              Difficulty: <span style={{
                ...styles.currentDifficulty,
                color: difficulties.find(d => d.name === currentDifficulty)?.color
              }}>{currentDifficulty}</span>
            </span>
            <span style={styles.arrow}>▼</span>
          </button>
          
          {showDifficulty && (
            <div style={styles.dropdown}>
              {difficulties.map((diff) => (
                <Link
                  key={diff.name}
                  to={diff.path}
                  style={{
                    ...styles.difficultyOption,
                    textDecoration: 'none',
                    backgroundColor: currentDifficulty === diff.name ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderLeft: currentDifficulty === diff.name ? `4px solid ${diff.color}` : '4px solid transparent'
                  }}
                  onClick={() => handleDifficultySelect(diff.name)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = currentDifficulty === diff.name ? 'rgba(255,255,255,0.1)' : 'transparent'}
                >
                  <span style={{...styles.difficultyDot, backgroundColor: diff.color}}></span>
                  <span style={styles.difficultyName}>{diff.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Scoreboard Link */}
      <div style={styles.right}>
        <Link to="/scoreboard" style={styles.scoreboardLink}>
          <button style={styles.scoreboardBtn}>
            <span style={styles.trophy}>🏆</span>
            <span style={styles.scoreboardText}>Scoreboard</span>
            <span style={styles.linkArrow}>→</span>
          </button>
        </Link>
      </div>

    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    color: "#fff",
    padding: "15px 30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    borderBottom: "2px solid #0f3460",
    position: "relative",
  },
  left: {
    flex: 1,
  },
  titleLink: {
    textDecoration: 'none',
    display: 'inline-block',
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #4ecdc4, #45b7d1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
    ':hover': {
      opacity: 0.8,
    },
  },
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  difficultyContainer: {
    position: "relative",
  },
  difficultyBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 20px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    minWidth: "200px",
    justifyContent: "space-between",
  },
  difficultyIcon: {
    fontSize: "18px",
  },
  difficultyText: {
    flex: 1,
    textAlign: "left",
  },
  currentDifficulty: {
    fontWeight: "bold",
    marginLeft: "5px",
  },
  arrow: {
    fontSize: "12px",
    opacity: 0.7,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "10px",
    background: "#1e1e2f",
    borderRadius: "12px",
    padding: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid #2d2d44",
    zIndex: 1000,
    animation: "slideDown 0.2s ease-out",
  },
  difficultyOption: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  difficultyDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  difficultyName: {
    flex: 1,
    fontWeight: "500",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  scoreboardLink: {
    textDecoration: 'none',
  },
  scoreboardBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "10px 25px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  trophy: {
    fontSize: "18px",
  },
  scoreboardText: {
    letterSpacing: "0.5px",
  },
  linkArrow: {
    fontSize: "16px",
    transition: "transform 0.3s ease",
  },
};

// Add these animations to your global CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .scoreboard-btn:hover .link-arrow {
    transform: translateX(5px);
  }
  
  a:hover h2 {
    opacity: 0.8;
  }
`;
document.head.appendChild(styleSheet);