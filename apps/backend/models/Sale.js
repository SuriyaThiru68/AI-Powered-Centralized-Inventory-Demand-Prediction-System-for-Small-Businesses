const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    storeId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName:  { type: String, required: true },
    quantitySold: { type: Number, required: true },
    totalAmount:  { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
