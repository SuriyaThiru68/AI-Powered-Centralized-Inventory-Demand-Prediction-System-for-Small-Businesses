const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '30d' });

// ── POST /api/auth/register ────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    const allowedRoles = ['customer', 'business_admin'];
    const safeRole = allowedRoles.includes(role) ? role : 'customer';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: safeRole });

    if (user) {
      res.status(201).json({
        success: true,
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        storeName: user.storeName,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/auth/profile  (protected route) ──────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/auth/profile  (protected route) — update name, storeName, contact ─
exports.updateProfile = async (req, res) => {
  try {
    const { name, storeName, headquarters, contact, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name)         user.name         = name;
    if (storeName)    user.storeName    = storeName;
    if (headquarters) user.headquarters = headquarters;
    if (contact)      user.contact      = contact;
    if (password)     user.password     = password;   // hashed by pre-save hook

    const updated = await user.save();

    res.json({
      success: true,
      data: {
        _id:          updated._id,
        name:         updated.name,
        email:        updated.email,
        role:         updated.role,
        storeName:    updated.storeName,
        headquarters: updated.headquarters,
        contact:      updated.contact,
      },
      token: generateToken(updated._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
