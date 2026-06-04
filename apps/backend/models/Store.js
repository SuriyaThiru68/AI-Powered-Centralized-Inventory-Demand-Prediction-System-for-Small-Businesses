const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    theme: {
      primaryColor: { type: String, default: '#0f172a' },
      accentColor: { type: String, default: '#6366f1' },
    },
  },
  { timestamps: true }
);

storeSchema.index({ businessId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Store', storeSchema);
