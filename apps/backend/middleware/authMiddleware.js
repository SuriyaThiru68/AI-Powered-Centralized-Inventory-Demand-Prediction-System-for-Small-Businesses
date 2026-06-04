const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised — user no longer exists',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorised — invalid or expired token',
    });
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Access denied — requires one of: ${roles.join(', ')}`,
  });
};

const superAdminOnly = requireRoles('super_admin');
const businessAdminOnly = requireRoles('super_admin', 'business_admin');

/** @deprecated use businessAdminOnly */
const adminOnly = businessAdminOnly;

const resolveStoreContext = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin' && req.headers['x-store-id']) {
      req.storeId = req.headers['x-store-id'];
      return next();
    }

    if (req.user.role === 'business_admin' && req.user.businessId) {
      const store =
        (await Store.findOne({ businessId: req.user.businessId }).sort({ createdAt: 1 })) ||
        null;
      req.storeId = store?._id || req.user._id;
      req.businessId = req.user.businessId;
      return next();
    }

    req.storeId = req.user._id;
    next();
  } catch (error) {
    console.error('resolveStoreContext error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to resolve store context' });
  }
};

module.exports = {
  protect,
  requireRoles,
  superAdminOnly,
  businessAdminOnly,
  adminOnly,
  resolveStoreContext,
};
