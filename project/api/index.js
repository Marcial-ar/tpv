import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());


// ===================== USERS API =====================

// Get all users (with role name)
app.get('/api/users', (req, res) => {
  const rows = db.prepare(`SELECT u.*, r.nombre as roleName FROM usuarios u LEFT JOIN roles r ON u.role = r.nombre`).all();
  res.json(rows);
});

// Create new user (role must exist in roles table)
app.post('/api/users', (req, res) => {
  const { name, role, active, password } = req.body;
  // Verificar que el rol existe
  const roleExists = db.prepare('SELECT 1 FROM roles WHERE nombre = ?').get(role);
  if (!roleExists) {
    return res.status(400).json({ error: 'Rol no válido' });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO usuarios (id, name, role, active, password) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, role, active !== false ? 1 : 0, password || null);
  const newUser = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  res.status(201).json(newUser);
});

// Update user (role must exist in roles table)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, active, password } = req.body;
  // Verificar que el rol existe
  const roleExists = db.prepare('SELECT 1 FROM roles WHERE nombre = ?').get(role);
  if (!roleExists) {
    return res.status(400).json({ error: 'Rol no válido' });
  }
  const result = db.prepare('UPDATE usuarios SET name = ?, role = ?, active = ?, password = ? WHERE id = ?')
    .run(name, role, active !== false ? 1 : 0, password || null, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  res.json(updated);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  res.status(204).end();
});

// ===================== ROLES API =====================

// Get all roles
app.get('/api/roles', (req, res) => {
  const rows = db.prepare('SELECT * FROM roles').all();
  res.json(rows);
});

// ===================== TABLES API =====================

// Get all tables
app.get('/api/tables', (req, res) => {
  const rows = db.prepare('SELECT * FROM mesas').all();
  res.json(rows);
});

// Create new table
app.post('/api/tables', (req, res) => {
  const { number, zone, seats, status, currentOrder } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO mesas (id, number, zone, seats, status, currentOrder) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, number, zone, seats, status, currentOrder || null);
  const newTable = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);
  res.status(201).json(newTable);
});

// Update table
app.put('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const { number, zone, seats, status, currentOrder } = req.body;
  const result = db.prepare('UPDATE mesas SET number = ?, zone = ?, seats = ?, status = ?, currentOrder = ? WHERE id = ?')
    .run(number, zone, seats, status, currentOrder || null, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);
  res.json(updated);
});

// Delete table
app.delete('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM mesas WHERE id = ?').run(id);
  res.status(204).end();
});
app.use(express.json());

// Eliminado: In-memory categories and products
// ===================== PRODUCTS API =====================

// Get all products
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM productos').all();
  res.json(rows);
});

// Create new product
app.post('/api/products', (req, res) => {
  const {
    name,
    description,
    categoryId,
    basePrice,
    vatRate,
    finalPrice,
    costPrice,
    sku,
    barcode,
    stock,
    minStock,
    active,
    imageUrl
  } = req.body;
  // Buscar la categoría correspondiente
  const category = db.prepare('SELECT * FROM categorias WHERE id = ?').get(categoryId);
  if (!category) {
    return res.status(400).json({ error: 'Categoría no encontrada' });
  }
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  db.prepare(`INSERT INTO productos (id, name, description, categoryId, categoryName, basePrice, vatRate, finalPrice, costPrice, sku, barcode, stock, minStock, active, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, description, categoryId, category.name, basePrice, vatRate, finalPrice, costPrice, sku, barcode, stock, minStock, active !== false ? 1 : 0, imageUrl, createdAt, updatedAt);
  const newProduct = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    categoryId,
    basePrice,
    vatRate,
    finalPrice,
    costPrice,
    sku,
    barcode,
    stock,
    minStock,
    active,
    imageUrl
  } = req.body;
  // Buscar la categoría correspondiente
  const category = db.prepare('SELECT * FROM categorias WHERE id = ?').get(categoryId);
  if (!category) {
    return res.status(400).json({ error: 'Categoría no encontrada' });
  }
  const updatedAt = new Date().toISOString();
  const result = db.prepare(`UPDATE productos SET name = ?, description = ?, categoryId = ?, categoryName = ?, basePrice = ?, vatRate = ?, finalPrice = ?, costPrice = ?, sku = ?, barcode = ?, stock = ?, minStock = ?, active = ?, imageUrl = ?, updatedAt = ? WHERE id = ?`)
    .run(name, description, categoryId, category.name, basePrice, vatRate, finalPrice, costPrice, sku, barcode, stock, minStock, active !== false ? 1 : 0, imageUrl, updatedAt, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  res.json(updated);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM productos WHERE id = ?').run(id);
  res.status(204).end();
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM categorias').all();
  res.json(rows);
});

// Create new category
app.post('/api/categories', (req, res) => {
  const { name, description, isActive, parentId } = req.body;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  db.prepare(`INSERT INTO categorias (id, name, description, isActive, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, description, isActive !== false ? 1 : 0, parentId || null, createdAt, updatedAt);
  const newCategory = db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
  res.status(201).json(newCategory);
});

// Update category
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, isActive, parentId } = req.body;
  const updatedAt = new Date().toISOString();
  const result = db.prepare(`UPDATE categorias SET name = ?, description = ?, isActive = ?, parentId = ?, updatedAt = ? WHERE id = ?`)
    .run(name, description, isActive !== false ? 1 : 0, parentId || null, updatedAt, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
  res.json(updated);
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
