const CargoItem = require('../models/CargoItem');

async function getAllCargoItems() {
  return CargoItem.find().sort({ createdAt: -1 });
}

async function createCargoItem(payload) {
  const item = new CargoItem(payload);
  return item.save();
}

async function deleteCargoItem(id) {
  const result = await CargoItem.findByIdAndDelete(id);
  return result;
}

module.exports = {
  getAllCargoItems,
  createCargoItem,
  deleteCargoItem
};

