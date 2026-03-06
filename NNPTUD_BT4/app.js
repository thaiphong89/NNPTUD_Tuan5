const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// Kiểm tra và đọc dữ liệu từ file JSON
// Đảm bảo bạn đã có file categories.json và products.json trong cùng thư mục
const categories = JSON.parse(fs.readFileSync('./categories.json', 'utf8'));
const products = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

// ==================== TRANG CHỦ ====================
app.get('/', (req, res) => {
    res.send('<h1>Server của Phong đã hoạt động!</h1><p>Truy cập <a href="/api/v1/categories">/api/v1/categories</a> để xem dữ liệu.</p>');
});

// ==================== CATEGORIES API ====================

// 1. GET all categories (Hỗ trợ truy vấn theo name)
app.get('/api/v1/categories', (req, res) => {
  const { name } = req.query;
  let result = categories;
  if (name) {
    result = categories.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
  }
  res.json(result);
});

// 2. GET category by ID
app.get('/api/v1/categories/:id', (req, res) => {
  const category = categories.find(c => c.id == req.params.id);
  if (!category) return res.status(404).json({ message: 'Không tìm thấy Category' });
  res.json(category);
});

// 3. GET all products by category ID (Yêu cầu đặc biệt của bạn)
app.get('/api/v1/categories/:id/products', (req, res) => {
  const catId = Number(req.params.id);
  const result = products.filter(p => p.categoryId === catId);
  res.json(result);
});

// 4. POST create new category
app.post('/api/v1/categories', (req, res) => {
  const { name, slug, image } = req.body;
  const newCategory = {
    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
    name, slug, image,
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  categories.push(newCategory);
  fs.writeFileSync('./categories.json', JSON.stringify(categories, null, 2));
  res.status(201).json(newCategory);
});

// 5. DELETE category
app.delete('/api/v1/categories/:id', (req, res) => {
  const idx = categories.findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy Category để xóa' });
  const deleted = categories.splice(idx, 1);
  fs.writeFileSync('./categories.json', JSON.stringify(categories, null, 2));
  res.json(deleted[0]);
});

// ==================== KHỞI CHẠY SERVER ====================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🚀 Thử truy cập: http://localhost:${PORT}/api/v1/categories`);
});