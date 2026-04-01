// models/score.model.js
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    level: {
      type: String,
      enum: ["easy", "medium", "hard", "troll"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 fast ranking queries
scoreSchema.index({ level: 1, score: -1 });

export const Score = mongoose.model("Score", scoreSchema);