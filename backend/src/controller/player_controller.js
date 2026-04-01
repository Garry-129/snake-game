// controllers/player.controller.js
import { Player } from "../model/player_model.js";

// 🟢 Create / Get Player
export const createPlayer = async (req, res) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      return res.status(400).json({
        success: false,
        message: "Name and country are required",
      });
    }

    // check existing player
    let player = await Player.findOne({ name, country });

    if (!player) {
      player = await Player.create({ name, country });
    }

    return res.status(200).json({
      success: true,
      player,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Player already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🟢 Get All Players
export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({})
      .select("name country -_id")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: players.length,
      players,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🟢 Get Players by Country (optional but useful)
export const getPlayersByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    const players = await Player.find({
      country: country.toUpperCase(),
    }).select("name country -_id");

    return res.status(200).json({
      success: true,
      players,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};