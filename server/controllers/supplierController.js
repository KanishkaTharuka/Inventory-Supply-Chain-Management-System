const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSupplier = async (req, res) => {
  const { name, contact, products } = req.body;
  const supplier = new Supplier({ name, contact, products });
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendPO = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { poStatus: 'Awaiting' }, { new: true });
    console.log(`Purchase Order sent to ${supplier.name}`);
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
    console.error(`Error sending Purchase Order to supplier: ${err.message}`);
  }
};