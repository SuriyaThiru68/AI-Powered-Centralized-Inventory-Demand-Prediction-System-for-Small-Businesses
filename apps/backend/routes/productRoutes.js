const express = require('express');
const multer  = require('multer');
const path    = require('path');
const os      = require('os');
const router  = express.Router();
const productController = require('../controllers/productController');
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');

/** Merchants can manage catalog; customers cannot */
const catalogWrite = (req, res, next) => {
  if (req.user?.role === 'customer') {
    return res.status(403).json({ success: false, message: 'Customers cannot modify the product catalog' });
  }
  next();
};

// Multer — write to OS temp folder (no RAM limit, handles huge files)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename:    (req, file, cb) => cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 500 * 1024 * 1024 },  // 500 MB hard cap
});

// ── Routes ───────────────────────────────────────────────────────────
// Upload: any authenticated user can upload their store data
router.post('/upload', protect, resolveStoreContext, upload.single('file'), productController.uploadProducts);

router.get('/', protect, resolveStoreContext, productController.getProducts);

router.post('/', protect, resolveStoreContext, catalogWrite, productController.createProduct);

router.put('/:id', protect, resolveStoreContext, catalogWrite, productController.updateProduct);

router.delete('/all', protect, resolveStoreContext, catalogWrite, productController.deleteAllProducts);

router.delete('/:id', protect, resolveStoreContext, catalogWrite, productController.deleteProduct);

module.exports = router;
