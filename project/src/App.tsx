import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { POSSystem } from './components/POS/POSSystem';
import { ProductManager } from './components/Products/ProductManager';
import { ReportsPanel } from './components/Reports/ReportsPanel';
import UserManager from './components/Users/UserManager';
import CategoryManager from './components/Products/CategoryManager';
import TableManager from './components/POS/TableManager';

function AppContent() {
  const { state } = useApp();
  const [activeSection, setActiveSection] = useState('pos');

  function renderContent() {
    switch (activeSection) {
      case 'pos':
        return <POSSystem />;
      case 'products':
        return <ProductManager onCategoryManage={() => setActiveSection('categories')} />;
      case 'categories':
        return <CategoryManager />;
      case 'reports':
        return <ReportsPanel />;
      case 'tables':
        return <TableManager />;
      case 'orders':
        return <div className="p-6"><h2 className="text-2xl font-bold">Historial de Pedidos</h2><p className="text-gray-600 mt-2">Funcionalidad en desarrollo...</p></div>;
      case 'users':
        return <UserManager />;
      case 'settings':
        return <div className="p-6"><h2 className="text-2xl font-bold">Configuración</h2><p className="text-gray-600 mt-2">Funcionalidad en desarrollo...</p></div>;
      default:
        return <POSSystem />;
    }
  }

  if (!state.currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;