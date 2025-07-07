import Database from 'better-sqlite3';

const db = new Database('tpv2.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  password TEXT
)`).run();

// Tabla usuarios
// id, name, role, active, password
db.prepare(`CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  password TEXT
)`).run();

// Tabla de configuración de roles de usuario
// id, nombre
db.prepare(`CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
)`).run();

// Insertar roles básicos si no existen
const rolesBasicos = ['Administrador', 'Camarero/a'];
for (const nombre of rolesBasicos) {
  db.prepare('INSERT OR IGNORE INTO roles (nombre) VALUES (?)').run(nombre);
}

// Tabla categorias
// id, name, description, isActive, createdAt, updatedAt, parentId

db.prepare(`CREATE TABLE IF NOT EXISTS categorias (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT,
  parentId TEXT
)`).run();

// Tabla productos
// id, name, description, categoryId, categoryName, basePrice, vatRate, finalPrice, costPrice, sku, barcode, stock, minStock, active, imageUrl, createdAt, updatedAt

db.prepare(`CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  categoryId TEXT NOT NULL,
  categoryName TEXT,
  basePrice REAL,
  vatRate REAL,
  finalPrice REAL,
  costPrice REAL,
  sku TEXT,
  barcode TEXT,
  stock INTEGER,
  minStock INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  imageUrl TEXT,
  createdAt TEXT,
  updatedAt TEXT
)`).run();

// Tabla mesas
// id, number, zone, seats, status, currentOrder

db.prepare(`CREATE TABLE IF NOT EXISTS mesas (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL,
  zone TEXT NOT NULL,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL,
  currentOrder TEXT
)`).run();

export default db;
