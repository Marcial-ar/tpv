export * from './category';

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  vatRate: number;
  finalPrice: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  minStock?: number;
  active: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Table {
  id: string;
  number: number;
  zone: 'barra' | 'terraza';
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  tableId?: string;
  zone: 'barra' | 'terraza';
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  waiterId: string;
  waiterName: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'waiter';
  active: boolean;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  waiterPerformance: Array<{
    waiterId: string;
    waiterName: string;
    orders: number;
    sales: number;
  }>;
}