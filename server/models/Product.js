const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:     { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0 },
    price:    { type: Number, default: 0 },
    sold:     { type: Number, default: 0 },
    category: { type: String, default: 'General', trim: true },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('Product', productSchema);
