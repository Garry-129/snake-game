// models/player.model.js
import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // 🔥 "india" → "INDIA"
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 optional: same name + country duplicate avoid
playerSchema.index({ name: 1, country: 1 }, { unique: true });

export const Player = mongoose.model("Player", playerSchema);