import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { APIURL } from "../../GlobalAPIURL";

export default function Navbar({ currentDifficulty, onDifficultyChange, onScoreboardClick }) {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const difficulties = [
    { name: "Easy", color: "#4caf50", path: "/" },
    { name: "Medium", color: "#ff9800", path: "/medium" },
    { name: "Hard", color: "#f44336", path: "/hard" },
    { name: "Troll", color: "#9c27b0", path: "/impossible" }
  ];

  // Check localStorage on component mount
  useEffect(() => {
    const storedRegistration = localStorage.getItem("snakeGameRegistration");
    if (storedRegistration) {
      const registrationData = JSON.parse(storedRegistration);
      setIsRegistered(true);
      setRegisteredName(registrationData.name);
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim() || !country.trim()) {
      setFormError("Both name and country are required");
      setTimeout(() => setFormError(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${APIURL}/create_player`, {
        name: name.trim(),
        country: country.trim().toUpperCase()
      });
 
      if (response.data.success) {
        setFormSuccess(`✅ Welcome ${name}! Player registered successfully!`);
        
        // Save to localStorage
        const registrationData = {
          name: name.trim(),
          country: country.trim().toUpperCase(),
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem("snakeGameRegistration", JSON.stringify(registrationData));
        
        setRegisteredName(name.trim());
        setName("");
        setCountry("");
        
        // Set registered to true after 1 second to show the scoreboard button
        setTimeout(() => {
          setFormSuccess("");
          setIsRegistered(true);
        }, 1000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setFormError(`❌ ${err.response.data.message}`);
      } else {
        setFormError("❌ Failed to add player. Please try again.");
      }
      setTimeout(() => setFormError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("snakeGameRegistration");
    setIsRegistered(false);
    setRegisteredName("");
    setFormSuccess("");
    setFormError("");
  };

  return (
    <nav style={styles.nav}>
      
      {/* Left - Game Title */}
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
                >
                  <span style={{...styles.difficultyDot, backgroundColor: diff.color}}></span>
                  <span style={styles.difficultyName}>{diff.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Conditional Rendering: Show Form OR Scoreboard Button */}
      <div style={styles.right}>
        {!isRegistered ? (
          // Show Registration Form if not registered
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formTitle}>
              <span>🎮 Register to Play</span>
            </div>
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="👤 Enter your name"
                style={styles.input}
                disabled={submitting}
              />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="🌍 Enter country"
                style={styles.input}
                disabled={submitting}
              />
              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? "⏳ Registering..." : "📝 Register"}
              </button>
            </div>
            {formError && (
              <div style={styles.errorMessage}>
                {formError}
              </div>
            )}
            {formSuccess && (
              <div style={styles.successMessage}>
                {formSuccess}
              </div>
            )}
          </form>
        ) : (
          // Show Scoreboard Button if registered
          <div style={styles.registeredContainer}>
            <div style={styles.userInfo}>
              <span style={styles.userIcon}>👤</span>
              <span style={styles.userName}>{registeredName}</span>
            </div>
            <Link to="/scoreboard" style={styles.scoreboardLink}>
              <button style={styles.scoreboardBtn}>
                <span style={styles.trophy}>🏆</span>
                <span style={styles.scoreboardText}>View Scoreboard</span>
                <span style={styles.linkArrow}>→</span>
              </button>
            </Link>
          </div>
        )}
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
    flexWrap: "wrap",
    gap: "15px",
  },
  left: {
    flex: 1,
    minWidth: "180px",
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
  },
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    minWidth: "180px",
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
    flex: 1.5,
    display: "flex",
    justifyContent: "flex-end",
    minWidth: "380px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    maxWidth: "450px",
  },
  formTitle: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#4ecdc4",
    marginBottom: "2px",
    letterSpacing: "0.5px",
  },
  inputGroup: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  input: {
    padding: "10px 15px",
    borderRadius: "25px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    flex: 1,
    minWidth: "120px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #4ecdc4, #45b7d1)",
    padding: "10px 24px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    borderRadius: "25px",
    border: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(78, 205, 196, 0.3)",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#ff6b6b",
    backgroundColor: "rgba(255,107,107,0.15)",
    padding: "6px 12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "500",
  },
  successMessage: {
    fontSize: "12px",
    color: "#4ecdc4",
    backgroundColor: "rgba(78,205,196,0.15)",
    padding: "6px 12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "500",
  },
  registeredContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    padding: "8px 15px",
    borderRadius: "25px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  userIcon: {
    fontSize: "16px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4ecdc4",
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
    fontSize: "14px",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
    whiteSpace: "nowrap",
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
  logoutBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "8px 12px",
    borderRadius: "25px",
    color: "#ff6b6b",
    cursor: "pointer",
    fontSize: "18px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// Add animations to global CSS
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
  
  input::placeholder {
    color: rgba(255,255,255,0.5);
  }
  
  input:focus {
    border-color: #4ecdc4;
    background: rgba(255,255,255,0.2);
    outline: none;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .scoreboard-btn:hover .link-arrow {
    transform: translateX(5px);
  }
  
  a:hover h2 {
    opacity: 0.8;
  }
  
  .logout-btn:hover {
    background: rgba(255,107,107,0.2);
    border-color: #ff6b6b;
  }
`;
document.head.appendChild(styleSheet);