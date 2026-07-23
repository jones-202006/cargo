const mongoose = require("mongoose");

const cargoSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [1, "Weight must be at least 1"],
    },
    profit: {
      type: Number,
      required: [true, "Profit is required"],
      min: [0, "Profit cannot be negative"],
    },
    volume: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["Pending", "Loaded", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CargoItem", cargoSchema);
