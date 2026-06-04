const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['super_admin', 'business_admin', 'customer'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: 'customer' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null },
    storeName: { type: String, default: '' },
    headquarters: { type: String, default: '' },
    contact: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Alert preferences
    alertEmail:     { type: String, default: '' },
    alertWhatsapp:  { type: String, default: '' },
    alertThreshold: { type: Number, default: 20 },
    alertEnabled:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
