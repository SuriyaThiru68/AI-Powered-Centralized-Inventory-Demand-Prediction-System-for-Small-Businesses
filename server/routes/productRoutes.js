const express = require('express');
const multer  = require('multer');
const path    = require('path');
const os      = require('os');
const router  = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

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
router.post('/upload', protect, upload.single('file'), productController.uploadProducts);

// Read: any authenticated user
router.get('/', protect, productController.getProducts);

// Create: admin only
router.post('/', protect, adminOnly, productController.createProduct);

// Update: admin only
router.put('/:id', protect, adminOnly, productController.updateProduct);

// Delete ALL products for this store (clear uploaded data) — any authenticated user
router.delete('/all', protect, productController.deleteAllProducts);

// Delete single product: admin only
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
