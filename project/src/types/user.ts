export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  password?: string;
}
