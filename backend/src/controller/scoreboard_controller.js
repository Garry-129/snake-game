// controllers/scoreboard.controller.js
import { Player } from "../model/player_model.js";
import { Score } from "../model/scoreboard_model.js";


export const submitScore = async (req, res) => {
  try {
    const { name, country, score, level } = req.body;

    if (!name || !country || score == null || !level) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // 1️⃣ find or create player
    let player = await Player.findOne({ name, country });

    if (!player) {
      player = await Player.create({ name, country });
    }

    // 2️⃣ update only if better score
    const updatedScore = await Score.findOneAndUpdate(
      { player: player._id, level },
      { $max: { score } }, // 🔥 only higher score replace karega
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedScore,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { level, country, type } = req.query;
    // type = "global" OR "country"

    if (!level) {
      return res.status(400).json({
        success: false,
        message: "Level required",
      });
    }

    let matchStage = { level };

    let pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "players",
          localField: "player",
          foreignField: "_id",
          as: "player",
        },
      },
      { $unwind: "$player" },
    ];

    // 🌍 country filter
    if (type === "country" && country) {
      pipeline.push({
        $match: {
          "player.country": country.toUpperCase(),
        },
      });
    }

    // 🏆 ranking logic
    pipeline.push(
      { $sort: { score: -1 } },
      {
        $setWindowFields: {
          sortBy: { score: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      { $limit: 10 }
    );

    const leaderboard = await Score.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};