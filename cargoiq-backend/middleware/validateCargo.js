function validateCargo(req, res, next) {
  const { itemName, weight, profit, volume, destination } = req.body || {};

  // Basic required checks
  if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
    return res.status(400).json({ message: 'itemName is required' });
  }

  const w = Number(weight);
  const p = Number(profit);
  const vol = Number(volume);

  if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ message: 'weight must be a positive number' });
  if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'profit must be a non-negative number' });
  if (!Number.isFinite(vol) || vol <= 0) return res.status(400).json({ message: 'volume must be a positive number' });

  if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
    return res.status(400).json({ message: 'destination is required' });
  }

  // Normalize numeric values (keeps model validation happy)
  req.body = {
    itemName: itemName.trim(),
    weight: w,
    profit: p,
    volume: vol,
    destination: destination.trim()
  };

  next();
}

module.exports = validateCargo;

