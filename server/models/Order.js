const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, 
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Returned'], default: 'Pending' },
  customer: { type: String, required: true },
  returnDetails: {
    reason: String,
    date: Date
  }
});

module.exports = mongoose.model('Order', orderSchema);