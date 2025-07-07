import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Table, Order, User, Category } from '../types';

interface AppState {
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  tables: Table[];
  orders: Order[];
  users: User[];
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TABLE'; payload: Table }
  | { type: 'UPDATE_TABLE'; payload: Table }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOAD_INITIAL_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  currentUser: null,
  products: [
    {
      id: '1',
      name: 'Café Solo',
      categoryId: '1',
      categoryName: 'Bebidas Calientes',
      basePrice: 1.20,
      vatRate: 10,
      finalPrice: 1.32,
      stock: 100,
      active: true,
      sku: 'CAFE001',
      barcode: '1234567890123',
      costPrice: 0.60,
      minStock: 10,
      description: 'Café solo de máquina',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Cerveza',
      categoryId: '2',
      categoryName: 'Bebidas Frías',
      basePrice: 2.50,
      vatRate: 10,
      finalPrice: 2.75,
      stock: 50,
      active: true,
      sku: 'CERVEZA001',
      barcode: '1234567890124',
      costPrice: 1.20,
      minStock: 5,
      description: 'Cerveza de barril',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Tostada Jamón',
      categoryId: '3',
      categoryName: 'Comida',
      basePrice: 3.50,
      vatRate: 10,
      finalPrice: 3.85,
      stock: 30,
      active: true,
      sku: 'TOS001',
      barcode: '1234567890125',
      costPrice: 1.75,
      minStock: 5,
      description: 'Tostada de pan rústico con jamón serrano',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  categories: [
    { id: '1', name: 'Bebidas Calientes', description: 'Bebidas calientes del menú', isActive: true, parentId: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Bebidas Frías', description: 'Bebidas frías del menú', isActive: true, parentId: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', name: 'Comida', description: 'Platos del menú', isActive: true, parentId: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  tables: [
    { id: '1', number: 1, zone: 'terraza', seats: 4, status: 'available' },
    { id: '2', number: 2, zone: 'terraza', seats: 2, status: 'available' },
    { id: '3', number: 3, zone: 'terraza', seats: 6, status: 'available' },
    { id: '4', number: 1, zone: 'barra', seats: 2, status: 'available' },
    { id: '5', number: 2, zone: 'barra', seats: 2, status: 'available' }
  ],
  orders: [],
  users: [
    { id: '1', name: 'Admin', role: 'admin', active: true },
    { id: '2', name: 'María García', role: 'waiter', active: true },
    { id: '3', name: 'Juan López', role: 'waiter', active: true }
  ]
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.payload] };
    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(t => t.id !== action.payload)
      };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o)
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u)
      };
    case 'LOAD_INITIAL_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, prodRes, tableRes, userRes] = await Promise.all([
          fetch('http://localhost:4000/api/categories'),
          fetch('http://localhost:4000/api/products'),
          fetch('http://localhost:4000/api/tables'),
          fetch('http://localhost:4000/api/users'),
        ]);
        const categories = await catRes.json();
        const products = await prodRes.json();
        const tables = await tableRes.json();
        const usersRaw = await userRes.json();
        // Mapear los usuarios para que tengan las propiedades correctas para el frontend
        const users = usersRaw.map((u: any) => ({
          ...u,
          username: u.name,
          isActive: u.active === 1 || u.active === true,
        }));
        dispatch({ type: 'LOAD_INITIAL_DATA', payload: { categories, products, tables, users } });
      } catch {
        // Error al cargar datos iniciales
      }
    };
    fetchInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}