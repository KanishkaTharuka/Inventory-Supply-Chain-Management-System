const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { v4: uuidv4 } = require('uuid');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addOrder = async (req, res) => {
  const { productId, quantity, customer } = req.body;
  try {
    const inventoryItem = await Inventory.findById(productId);
    if (!inventoryItem) return res.status(404).json({ message: 'Product not found' });
    if (inventoryItem.quantity < quantity) return res.status(400).json({ message: 'Out of stock' });

    // Reduce inventory quantity
    inventoryItem.quantity -= quantity;
    await inventoryItem.save();

    // Create new order with auto-generated orderId
    const order = new Order({ orderId: uuidv4(), productId, quantity, customer });
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.processReturn = async (req, res) => {
  const { orderId, items, reason } = req.body;
  try {
    const order = await Order.findById(req.params.id).populate('productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Delivered') return res.status(400).json({ message: 'Only delivered orders can be returned' });

    // Increase inventory quantity on return
    order.productId.quantity += order.quantity;
    await order.productId.save();

    // Update order status and return details
    order.status = 'Returned';
    order.returnDetails = { reason, date: new Date() };
    await order.save();

    res.json({ message: 'Return processed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};