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
  const { name, sku, quantity, supplierId, bin, salesPrice, purchasePrice } = req.body;
  try {
    if (!name || !sku || !supplierId || !bin || isNaN(salesPrice) || isNaN(purchasePrice)) {
      return res.status(400).json({ message: 'All fields (name, sku, supplierId, bin, salesPrice, purchasePrice) are required' });
    }
    if (isNaN(quantity) || quantity < 0 || salesPrice < 0 || purchasePrice < 0) {
      return res.status(400).json({ message: 'Quantity, sales price, and purchase price must be non-negative numbers' });
    }
    const existingItem = await Inventory.findOne({ sku });
    if (existingItem) {
      return res.status(400).json({ message: 'SKU must be unique' });
    }
    const inventoryItem = new Inventory({ name, sku, quantity: Number(quantity), supplierId, bin, salesPrice: Number(salesPrice), purchasePrice: Number(purchasePrice) });
    const newItem = await inventoryItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  const { name, sku, quantity, supplierId, bin, salesPrice, purchasePrice } = req.body;
  try {
    if (!name || !sku || !supplierId || !bin || isNaN(salesPrice) || isNaN(purchasePrice)) {
      return res.status(400).json({ message: 'All fields (name, sku, supplierId, bin, salesPrice, purchasePrice) are required' });
    }
    if (isNaN(quantity) || quantity < 0 || salesPrice < 0 || purchasePrice < 0) {
      return res.status(400).json({ message: 'Quantity, sales price, and purchase price must be non-negative numbers' });
    }
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, { name, sku, quantity: Number(quantity), supplierId, bin, salesPrice: Number(salesPrice), purchasePrice: Number(purchasePrice) }, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};