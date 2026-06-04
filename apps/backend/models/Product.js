const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '', trim: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    category: { type: String, default: 'General', trim: true },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('Product', productSchema);
