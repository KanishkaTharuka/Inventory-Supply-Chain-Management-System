const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: {
    email: { type: String },
    phone: { type: String }
  },
  products: [{ type: String, required: true }],
  poStatus: { type: String, enum: ['Awaiting', 'Delivered', 'Late'], default: 'Awaiting' }
});

module.exports = mongoose.model('Supplier', supplierSchema);