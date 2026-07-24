const express = require("express");
const router = express.Router();

const cargoController = require("../controllers/cargoController");
const authMiddleware = require("../middleware/authMiddleware");
const validateCargo = require("../middleware/validateCargo");

// Test Route (public)
router.get("/test", (req, res) => {
    res.json({ message: "Cargo Routes Working!" });
});

// CRUD Routes (Protected)
router.post("/", authMiddleware, validateCargo, cargoController.addCargo);
router.get("/", authMiddleware, cargoController.getAllCargo);

// Optimization Route (Protected)
router.post("/optimize", authMiddleware, cargoController.optimizeCargo);

// ID Routes (Protected) — KEEP THESE LAST
router.get("/:id", authMiddleware, cargoController.getCargoById);
router.put("/:id", authMiddleware, validateCargo, cargoController.updateCargo);
router.delete("/:id", authMiddleware, cargoController.deleteCargo);

module.exports = router;
