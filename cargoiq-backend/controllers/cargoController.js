const CargoItem = require("../models/CargoItem");
const optimizeCargo = require("../services/knapsackService");

// Add Cargo
exports.addCargo = async (req, res) => {
  try {
    const cargo = await CargoItem.create(req.body);
    res.status(201).json(cargo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Cargo
exports.getAllCargo = async (req, res) => {
  try {
    const cargo = await CargoItem.find();
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get One Cargo
exports.getCargoById = async (req, res) => {
  try {
    const cargo = await CargoItem.findById(req.params.id);

    if (!cargo) {
      return res.status(404).json({ message: "Cargo not found" });
    }

    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Cargo
exports.updateCargo = async (req, res) => {
  try {
    const cargo = await CargoItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cargo) {
      return res.status(404).json({ message: "Cargo not found" });
    }

    res.json(cargo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Cargo
exports.deleteCargo = async (req, res) => {
  try {
    const cargo = await CargoItem.findByIdAndDelete(req.params.id);

    if (!cargo) {
      return res.status(404).json({ message: "Cargo not found" });
    }

    res.json({ message: "Cargo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Knapsack Optimization
exports.optimizeCargo = async (req, res) => {
    try {
        // Accept frontend format { maxWeight, maxVolume } or direct { capacity }
        const maxWeight = Number(req.body.maxWeight || req.body.capacity);
        const maxVolume = req.body.maxVolume !== undefined ? Number(req.body.maxVolume) : null;

        if (!maxWeight || maxWeight < 1) {
            return res.status(400).json({ message: "maxWeight or capacity is required (positive number)" });
        }

        const cargoItems = await CargoItem.find();

        const result = optimizeCargo(cargoItems, maxWeight, maxVolume);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
