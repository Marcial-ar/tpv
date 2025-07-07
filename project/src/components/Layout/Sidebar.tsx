import React from 'react';
import { 
  Home, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  Receipt, 
  Table,
  LogOut,
  Tags
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { state, dispatch } = useApp();

  const menuItems = [
    { id: 'pos', label: 'Punto de Venta', icon: Home },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'tables', label: 'Mesas', icon: Table },
    { id: 'orders', label: 'Pedidos', icon: Receipt },
    { id: 'reports', label: 'Informes', icon: BarChart3 },
    ...(state.currentUser?.role === 'admin' ? [
      { id: 'users', label: 'Usuarios', icon: Users },
      { id: 'settings', label: 'Configuración', icon: Settings }
    ] : [])
  ];

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">TPV Restaurant</h1>
        <p className="text-sm text-slate-400 mt-1">
          {state.currentUser?.name} ({state.currentUser?.role})
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}