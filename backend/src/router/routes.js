const express = require("express");
const router = express.Router();

const {createPlayer,getAllPlayers,getPlayersByCountry} = require("../controller/player_controller")
const {getLeaderboard,submitScore} = require("../controller/scoreboard_controller")

router.post("/create_player", createPlayer);
router.get("/get_players", getAllPlayers);
router.get("/players/country/:country", getPlayersByCountry);

router.post("/submit_score", submitScore);
router.get("/leaderboard", getLeaderboard);
module.exports = router; 
