const Product = require('../models/Product');
const csv     = require('csv-parser');
const xlsx    = require('xlsx');
const fs      = require('fs');

// ── Smart field detector ─────────────────────────────────────────────────────
const NAME_KEYS = [
  'name','Name','NAME','product','Product','PRODUCT',
  'product_name','Product Name','ProductName','PRODUCT_NAME',
  'item','Item','ITEM','item_name','Item Name','ItemName',
  'title','Title','TITLE','description','Description','sku','SKU',
];
const QTY_KEYS = [
  'quantity','Quantity','QUANTITY','qty','Qty','QTY',
  'stock','Stock','STOCK','stock_quantity','Stock Quantity',
  'units','Units','count','Count','inventory','Inventory',
  'on_hand','On Hand','available','Available',
];
const PRICE_KEYS = [
  'price','Price','PRICE','unit_price','Unit Price','UnitPrice',
  'cost','Cost','COST','selling_price','Selling Price','mrp','MRP',
  'rate','Rate','amount','Amount','value','Value','listPrice',
];
const SOLD_KEYS = [
  'sold','Sold','SOLD','sales','Sales','SALES',
  'sold_quantity','units_sold','Units Sold','total_sold',
  'quantity_sold','Quantity Sold','boughtInLastMonth',
];
const CATEGORY_KEYS = [
  'category','Category','CATEGORY','cat','Cat',
  'department','Department','type','Type','section','Section',
  'product_category','Product Category','category_name',
];
const IMAGE_KEYS = [
  'image','Image','IMAGE','image_url','Image URL','imageUrl','ImageUrl',
  'imgUrl','img_url','ImgUrl','IMG_URL','photo','Photo','picture','Picture',
  'thumbnail','Thumbnail','img','Img','image_link','product_image',
];

function pick(data, keys) {
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== '') return data[k];
  }
  return null;
}

// Strips "$", "₹", "£", "€", commas, spaces then parses float
function parsePrice(val) {
  if (val === null || val === undefined) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function detectName(data) {
  const fromKeys = pick(data, NAME_KEYS);
  if (fromKeys) return String(fromKeys).trim();
  const firstVal = Object.values(data)[0];
  return firstVal ? String(firstVal).trim() : null;
}

function normaliseRow(data, storeId) {
  const name     = detectName(data);
  const quantity = parseInt(pick(data, QTY_KEYS), 10)  || 0;
  const price    = parsePrice(pick(data, PRICE_KEYS));
  const sold     = parseInt(pick(data, SOLD_KEYS), 10)  || 0;
  const category = String(pick(data, CATEGORY_KEYS)     || 'General').trim().slice(0, 80);
  const imageUrl = String(pick(data, IMAGE_KEYS)         || '').trim();
  return { storeId, name, quantity, price, sold, category, imageUrl };
}

// ── Insert a batch of rows using bulkWrite (High Performance) ────────────────
const BATCH_SIZE = 1000; 

// ── Upload ────────────────────────────────────────────────────────────────────
exports.uploadProducts = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const storeId      = req.storeId;
  const filePath     = req.file.path;
  const originalname = req.file.originalname;

  const cleanup = () => fs.unlink(filePath, () => {});

  try {
    if (originalname.toLowerCase().endsWith('.csv')) {
      let batch        = [];
      let totalSaved   = 0;
      let storeCleared = false;
      let headersSent  = false;

      const fileStream = fs.createReadStream(filePath);
      const parser     = fileStream.pipe(csv());

      parser.on('data', async (data) => {
        const p = normaliseRow(data, storeId);
        if (!p.name) return;

        // Prepare bulk operation
        batch.push({
          insertOne: { document: p }
        });

        if (batch.length >= BATCH_SIZE) {
          parser.pause();
          const toInsert = batch.splice(0, BATCH_SIZE);
          
          if (!storeCleared) {
            await Product.deleteMany({ storeId });
            storeCleared = true;
          }

          await Product.bulkWrite(toInsert);
          totalSaved += toInsert.length;
          parser.resume();
        }
      });

      parser.on('end', async () => {
        if (headersSent) return;
        
        // Finalize remaining
        if (!storeCleared) await Product.deleteMany({ storeId });
        if (batch.length > 0) {
          await Product.bulkWrite(batch);
          totalSaved += batch.length;
        }

        headersSent = true;
        cleanup();
        const products = await Product.find({ storeId }).sort({ createdAt: -1 }).limit(500);
        const totalProducts = products.length;
        const remainingStock = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
        const soldItems = products.reduce((acc, p) => acc + (Number(p.sold) || 0), 0);
        const totalValue = products.reduce(
          (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 0),
          0
        );
        res.status(201).json({
          success: true,
          message: `✅ ${totalSaved.toLocaleString()} products integrated into your catalog!`,
          count: totalSaved,
          data: products,
          stats: { totalProducts, remainingStock, soldItems, totalValue },
        });
      });

      parser.on('error', (err) => {
        cleanup();
        if (!headersSent) {
          headersSent = true;
          res.status(500).json({ success: false, message: 'Parsing failed: ' + err.message });
        }
      });

    } else if (/\.xlsx?$/i.test(originalname)) {
      const workbook = xlsx.readFile(filePath);
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const rows     = xlsx.utils.sheet_to_json(sheet);
      
      const products = rows.map(r => normaliseRow(r, storeId)).filter(p => p.name);
      
      await Product.deleteMany({ storeId });
      
      // Process XLSX in chunks to avoid large memory spikes
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const chunk = products.slice(i, i + BATCH_SIZE).map(p => ({
          insertOne: { document: p }
        }));
        await Product.bulkWrite(chunk);
      }

      cleanup();
      const saved = await Product.find({ storeId }).sort({ createdAt: -1 }).limit(500);
      const totalProducts = saved.length;
      const remainingStock = saved.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
      const soldItems = saved.reduce((acc, p) => acc + (Number(p.sold) || 0), 0);
      const totalValue = saved.reduce(
        (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 0),
        0
      );
      res.status(201).json({
        success: true,
        message: `✅ ${products.length.toLocaleString()} products uploaded!`,
        count: products.length,
        data: saved,
        stats: { totalProducts, remainingStock, soldItems, totalValue },
      });

    } else {
      cleanup();
      return res.status(400).json({ success: false, message: 'Please upload a .csv or .xlsx file.' });
    }

  } catch (error) {
    cleanup();
    res.status(500).json({ success: false, message: 'System Error: ' + error.message });
  }
};



// ── Get all products for this store ──────────────────────────────────────────

exports.getProducts = async (req, res) => {
  try {
    const products      = await Product.find({ storeId: req.storeId }).sort({ createdAt: -1 }).limit(500);
    const totalProducts  = products.length;
    const remainingStock = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
    const soldItems      = products.reduce((acc, p) => acc + (Number(p.sold)     || 0), 0);
    const totalValue     = products.reduce((acc, p) => acc + ((Number(p.price) || 0) * (Number(p.quantity) || 0)), 0);

    res.json({ success: true, data: products, stats: { totalProducts, remainingStock, soldItems, totalValue } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// ── Create single product ────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({ ...req.body, storeId: req.storeId });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// ── Update — ensure belongs to this store ────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// ── Delete — ensure belongs to this store ────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// ── Delete ALL products for this store (clear uploaded data) ──────────────────
exports.deleteAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({ storeId: req.storeId });
    res.json({
      success: true,
      message: `All ${result.deletedCount} products deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete products' });
  }
};

