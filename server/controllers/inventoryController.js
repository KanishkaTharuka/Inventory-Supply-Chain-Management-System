const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('supplierId');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addInventory = async (req, res) => {
  const { name, sku, quantity, supplierId, bin } = req.body;
  try {
    if (!name || !sku || !supplierId || !bin) {
      return res.status(400).json({ message: 'All fields (name, sku, supplierId, bin) are required' });
    }
    const inventoryItem = new Inventory({ name, sku, quantity: Number(quantity), supplierId, bin });
    const newItem = await inventoryItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};