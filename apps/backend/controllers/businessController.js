const Business = require('../models/Business');
const Store = require('../models/Store');
const User = require('../models/User');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.createBusiness = async (req, res) => {
  try {
    const { name, storeName } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    const slug = slugify(name);
    const exists = await Business.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Business slug already taken' });
    }

    const business = await Business.create({
      name: name.trim(),
      slug,
      ownerId: req.user._id,
    });

    const store = await Store.create({
      businessId: business._id,
      name: storeName?.trim() || `${name.trim()} Store`,
      slug: slugify(storeName || name) || slug,
      isPublished: false,
    });

    await User.findByIdAndUpdate(req.user._id, {
      role: 'business_admin',
      businessId: business._id,
      storeName: store.name,
    });

    res.status(201).json({
      success: true,
      data: { business, store },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create business' });
  }
};

exports.getMyBusiness = async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.json({ success: true, data: null });
    }

    const business = await Business.findById(req.user.businessId);
    const stores = await Store.find({ businessId: req.user.businessId });

    res.json({ success: true, data: { business, stores } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch business' });
  }
};

exports.listAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: businesses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to list businesses' });
  }
};
