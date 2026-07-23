const mongoose = require("mongoose");

const cargoSchema = new mongoose.Schema(
{
    itemName: {
        type: String,
        required: true,
        trim: true
    },

    weight: {
        type: Number,
        required: true,
        min: 1
    },

    profit: {
        type: Number,
        required: true,
        min: 0
    },

    volume: {
        type: Number,
        default: 1
    },

    category: {
        type: String,
        default: "General"
    },

    status: {
        type: String,
        enum: ["Pending","Loaded","Rejected"],
        default: "Pending"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Cargo", cargoSchema);