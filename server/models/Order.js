const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    storeId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    poNumber:     { type: String, required: true, unique: true },
    supplier:     { type: String, required: true },
    productName:  { type: String, required: true },
    quantity:     { type: Number, required: true },
    unitPrice:    { type: Number, default: 0 },
    totalAmount:  { type: Number, default: 0 },
    status:       { type: String, enum: ['Draft', 'Ordered', 'In Transit', 'Arriving Today', 'Received', 'Delayed'], default: 'Draft' },
    expectedDate: { type: Date },
    notes:        { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
