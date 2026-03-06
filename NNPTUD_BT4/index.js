const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// ==================== CẤU HÌNH ĐỌC/GHI FILE JSON LOKAL ====================
const readData = (fileName) => {
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
};

const saveData = (fileName, data) => {
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
};

let roles = readData('./roles.json');
let users = readData('./users.json');

// Khởi tạo timestamp tự động
const getTimestamp = () => new Date().toISOString();

// ==================== 1. CRUD OBJECT: ROLE ====================

// TẠO (CREATE)
app.post('/api/roles', (req, res) => {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: "Tham số 'name' là bắt buộc" });
    if (roles.some(r => r.name === name)) return res.status(400).json({ error: "Tên Role đã tồn tại" });

    const newRole = {
        id: "R" + Date.now(),
        name,
        description: description || "",
        isDeleted: false,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
    };
    roles.push(newRole);
    saveData('./roles.json', roles);
    res.status(201).json(newRole);
});

// GET ALL (Lấy tất cả các Role chưa xóa mềm)
app.get('/api/roles', (req, res) => {
    const activeRoles = roles.filter(r => !r.isDeleted);
    res.json(activeRoles);
});

// GET By ID
app.get('/api/roles/:id', (req, res) => {
    const role = roles.find(r => r.id === req.params.id && !r.isDeleted);
    if (!role) return res.status(404).json({ error: "Không tìm thấy Role" });
    res.json(role);
});

// SỬA (UPDATE)
app.put('/api/roles/:id', (req, res) => {
    const { name, description } = req.body;
    const idx = roles.findIndex(r => r.id === req.params.id && !r.isDeleted);

    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy Role" });
    if (name && name !== roles[idx].name && roles.some(r => r.name === name)) {
        return res.status(400).json({ error: "Tên Role mới đã tồn tại" });
    }

    if (name) roles[idx].name = name;
    if (description !== undefined) roles[idx].description = description;
    roles[idx].updatedAt = getTimestamp();

    saveData('./roles.json', roles);
    res.json(roles[idx]);
});

// XÓA MỀM (DELETE)
app.delete('/api/roles/:id', (req, res) => {
    const idx = roles.findIndex(r => r.id === req.params.id && !r.isDeleted);
    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy Role" });

    roles[idx].isDeleted = true;
    roles[idx].updatedAt = getTimestamp();
    saveData('./roles.json', roles);
    res.json({ message: "Role đã được xóa mềm", role: roles[idx] });
});

// ==================== 2. CRUD OBJECT: USER ====================

// TẠO (CREATE)
app.post('/api/users', (req, res) => {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: "Vui lòng cung cấp username, password và email" });
    }
    if (users.some(u => u.username === username || u.email === email)) {
        return res.status(400).json({ error: "Username hoặc Email đã tồn tại" });
    }

    const newUser = {
        id: "U" + Date.now(),
        username,
        password,
        email,
        fullName: fullName || "",
        avatarUrl: avatarUrl || "https://i.sstatic.net/l60Hf.png",
        status: false,
        role: role || null,
        loginCount: 0,
        isDeleted: false,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
    };

    users.push(newUser);
    saveData('./users.json', users);
    res.status(201).json(newUser);
});

// GET ALL (Lấy tất cả các User chưa xóa mềm)
app.get('/api/users', (req, res) => {
    const activeUsers = users.filter(u => !u.isDeleted);
    res.json(activeUsers);
});

// GET By ID
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id && !u.isDeleted);
    if (!user) return res.status(404).json({ error: "Không tìm thấy User" });
    res.json(user);
});

// SỬA (UPDATE)
app.put('/api/users/:id', (req, res) => {
    const idx = users.findIndex(u => u.id === req.params.id && !u.isDeleted);
    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy User" });

    const allowedUpdates = ['fullName', 'avatarUrl', 'password', 'role', 'status', 'loginCount'];
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            // Kiểm tra validate min=0 cho loginCount
            if (key === 'loginCount' && req.body[key] < 0) {
                return res.status(400).json({ error: "loginCount không được nhỏ hơn 0" });
            }
            users[idx][key] = req.body[key];
        }
    }

    users[idx].updatedAt = getTimestamp();
    saveData('./users.json', users);
    res.json(users[idx]);
});

// XÓA MỀM (DELETE)
app.delete('/api/users/:id', (req, res) => {
    const idx = users.findIndex(u => u.id === req.params.id && !u.isDeleted);
    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy User" });

    users[idx].isDeleted = true;
    users[idx].updatedAt = getTimestamp();
    saveData('./users.json', users);
    res.json({ message: "User đã được xóa mềm", user: users[idx] });
});

// ==================== 3. ENABLE / DISABLE TÀI KHOẢN (API THEO YÊU CẦU) ====================

const updateStatus = (req, res, targetStatus) => {
    const { email, username } = req.body;
    if (!email || !username) return res.status(400).json({ error: "Yêu cầu cả email và username" });

    const idx = users.findIndex(u => u.email === email && u.username === username && !u.isDeleted);
    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy tài khoản hợp lệ với email và username này" });

    users[idx].status = targetStatus;
    users[idx].updatedAt = getTimestamp();
    saveData('./users.json', users);

    res.json({ message: `Cập nhật trạng thái thành ${targetStatus}`, user: users[idx] });
}

// 2) API POST /enable
app.post('/api/users/enable', (req, res) => updateStatus(req, res, true));

// 3) API POST /disable
app.post('/api/users/disable', (req, res) => updateStatus(req, res, false));

// ==================== KHỞI CHẠY SERVER ====================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server (JSON DB) đang chạy tại: http://localhost:${PORT}`);
    console.log(`🚀 Thử tài liệu tại thư mục hiện tại của bạn.`);
});