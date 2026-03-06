var express = require('express');
var router = express.Router();

// 1. MOCK DATA (Dữ liệu giả lập từ đề bài)
let categories = [
  { id: 7, name: "Clothes", slug: "clothes", image: "https://i.imgur.com/QkIa5tT.jpeg", creationAt: "2026-02-05T16:51:34.000Z", updatedAt: "2026-02-05T16:51:34.000Z" },
  { id: 8, name: "Electronics", slug: "electronics", image: "https://i.imgur.com/ZANVnHE.jpeg", creationAt: "2026-02-05T16:51:35.000Z", updatedAt: "2026-02-05T16:51:35.000Z" },
  { id: 9, name: "Furniture", slug: "furniture", image: "https://i.imgur.com/Qphac99.jpeg", creationAt: "2026-02-05T16:51:36.000Z", updatedAt: "2026-02-05T16:51:36.000Z" },
  { id: 10, name: "Shoes", slug: "shoes", image: "https://i.imgur.com/qNOjJje.jpeg", creationAt: "2026-02-05T16:51:36.000Z", updatedAt: "2026-02-05T16:51:36.000Z" },
  { id: 11, name: "Miscellaneous", slug: "miscellaneous", image: "https://i.imgur.com/BG8J0Fj.jpg", creationAt: "2026-02-05T16:51:37.000Z", updatedAt: "2026-02-05T16:51:37.000Z" },
  { id: 13, name: "gargantilla", slug: "gargantilla", image: "link_anh", creationAt: "2026-02-05T21:09:36.000Z", updatedAt: "2026-02-05T21:09:36.000Z" },
  { id: 15, name: "category_B", slug: "category-b", image: "https://pravatar.cc/", creationAt: "2026-02-05T22:04:27.000Z", updatedAt: "2026-02-05T22:04:27.000Z" },
  { id: 16, name: "string", slug: "string", image: "https://pravatar.cc/", creationAt: "2026-02-05T22:04:28.000Z", updatedAt: "2026-02-05T22:04:28.000Z" },
  { id: 17, name: "Anillos", slug: "anillos", image: "link_anh", creationAt: "2026-02-06T02:40:20.000Z", updatedAt: "2026-02-06T02:40:20.000Z" },
  { id: 18, name: "Testing Category", slug: "testing-category", image: "https://placeimg.com/640/480/any", creationAt: "2026-02-06T06:04:54.000Z", updatedAt: "2026-02-06T06:04:54.000Z" }
];

// Dữ liệu Products giả để phục vụ yêu cầu cuối cùng
const products = [
  { id: 1, title: "Áo thun", price: 100, categoryId: 7 }, // Thuộc Clothes
  { id: 2, title: "Quần Jean", price: 200, categoryId: 7 }, // Thuộc Clothes
  { id: 3, title: "Laptop Dell", price: 500, categoryId: 8 }, // Thuộc Electronics
  { id: 4, title: "Ghế Sofa", price: 300, categoryId: 9 }, // Thuộc Furniture
];

// ================= CÁC API REQUEST =================

// 1. GET ALL (Có hỗ trợ lọc theo name)
// URL: /api/v1/categories?name=Clothes
router.get('/', function(req, res, next) {
  const { name } = req.query;
  
  if (name) {
    // Tìm kiếm tương đối (không phân biệt hoa thường)
    const filtered = categories.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return res.json(filtered);
  }
  
  // Nếu không có param name thì trả về hết
  res.json(categories);
});

// 2. GET BY ID
// URL: /api/v1/categories/10
router.get('/:id', function(req, res, next) {
  const { id } = req.params;
  const category = categories.find(c => c.id == id); // Dùng == để so sánh chuỗi và số
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

// 3. GET BY SLUG
// URL: /api/v1/categories/slug/shoes
// Lưu ý: Phải đặt đường dẫn khác đi một chút để tránh trùng với :id
router.get('/slug/:slug', function(req, res, next) {
  const { slug } = req.params;
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

// 4. GET PRODUCTS BY CATEGORY ID (Yêu cầu đặc biệt)
// URL: /api/v1/categories/7/products
router.get('/:id/products', function(req, res, next) {
  const { id } = req.params;
  
  // Lọc ra các sản phẩm có categoryId trùng với id truyền vào
  const result = products.filter(p => p.categoryId == id);
  
  res.json(result);
});

// 5. CREATE (Tạo mới)
router.post('/', function(req, res, next) {
  const { name, slug, image } = req.body;
  
  // Tạo ID mới (lấy ID lớn nhất + 1)
  const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
  
  const newCategory = {
    id: newId,
    name,
    slug,
    image,
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// 6. EDIT (Cập nhật)
router.put('/:id', function(req, res, next) {
  const { id } = req.params;
  const { name, slug, image } = req.body;
  
  const index = categories.findIndex(c => c.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Cập nhật dữ liệu
  categories[index] = {
    ...categories[index], // Giữ lại thông tin cũ (như creationAt)
    name: name || categories[index].name,
    slug: slug || categories[index].slug,
    image: image || categories[index].image,
    updatedAt: new Date().toISOString()
  };
  
  res.json(categories[index]);
});

// 7. DELETE (Xóa)
router.delete('/:id', function(req, res, next) {
  const { id } = req.params;
  const index = categories.findIndex(c => c.id == id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  categories.splice(index, 1); // Xóa khỏi mảng
  res.json({ message: 'Deleted successfully', id: id });
});

module.exports = router;