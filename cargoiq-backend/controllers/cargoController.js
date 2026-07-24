const CargoItem = require("../models/CargoItem");
const optimizeCargo = require("../services/knapsackService");

// Async wrapper to eliminate try/catch boilerplate
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Add Cargo
exports.addCargo = catchAsync(async (req, res) => {
  const cargo = await CargoItem.create(req.body);
  res.status(201).json(cargo);
});

// Get All Cargo
exports.getAllCargo = catchAsync(async (req, res) => {
  const cargo = await CargoItem.find();
  res.json(cargo);
});

// Get One Cargo
exports.getCargoById = catchAsync(async (req, res) => {
  const cargo = await CargoItem.findById(req.params.id);

  if (!cargo) {
    return res.status(404).json({ message: "Cargo not found" });
  }

  res.json(cargo);
});

// Update Cargo
exports.updateCargo = catchAsync(async (req, res) => {
  const cargo = await CargoItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!cargo) {
    return res.status(404).json({ message: "Cargo not found" });
  }

  res.json(cargo);
});

// Delete Cargo
exports.deleteCargo = catchAsync(async (req, res) => {
  const cargo = await CargoItem.findByIdAndDelete(req.params.id);

  if (!cargo) {
    return res.status(404).json({ message: "Cargo not found" });
  }

  res.json({ message: "Cargo deleted successfully" });
});

// Knapsack Optimization
exports.optimizeCargo = catchAsync(async (req, res) => {
    // Accept frontend format { maxWeight, maxVolume } or direct { capacity }
    const maxWeight = Number(req.body.maxWeight || req.body.capacity);
    const maxVolume = req.body.maxVolume !== undefined ? Number(req.body.maxVolume) : null;

    if (!maxWeight || maxWeight < 1) {
      const err = new Error("maxWeight or capacity is required (positive number)");
      err.statusCode = 400;
      throw err;
    }

    const cargoItems = await CargoItem.find();
    const result = optimizeCargo(cargoItems, maxWeight, maxVolume);

    res.json(result);
});
