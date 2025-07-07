import React, { useState } from 'react';
import { TableView } from './TableView';
import { ProductSelector } from './ProductSelector';
import { OrderSummary } from './OrderSummary';
import { useApp } from '../../contexts/AppContext';
import { Order, OrderItem, Table } from '../../types';

export function POSSystem() {
  const { state, dispatch } = useApp();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [activeZone, setActiveZone] = useState<'barra' | 'terraza'>('terraza');

  const addToOrder = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = currentOrder.find(item => item.productId === productId);
    
    if (existingItem) {
      setCurrentOrder(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.finalPrice,
        total: product.finalPrice
      };
      setCurrentOrder(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCurrentOrder(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCurrentOrder(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity, total: quantity * item.unitPrice }
            : item
        )
      );
    }
  };

  const completeOrder = () => {
    if (currentOrder.length === 0) return;

    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * 0.1; // Assuming 10% VAT
    const total = subtotal + vatAmount;

    const order: Order = {
      id: Date.now().toString(),
      tableId: selectedTable?.id,
      zone: activeZone,
      items: currentOrder,
      subtotal,
      vatAmount,
      total,
      status: 'completed',
      waiterId: state.currentUser!.id,
      waiterName: state.currentUser!.name,
      createdAt: new Date(),
      completedAt: new Date()
    };

    dispatch({ type: 'ADD_ORDER', payload: order });

    if (selectedTable) {
      dispatch({ 
        type: 'UPDATE_TABLE', 
        payload: { ...selectedTable, status: 'available', currentOrder: undefined }
      });
    }

    setCurrentOrder([]);
    setSelectedTable(null);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveZone('terraza')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeZone === 'terraza'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Terraza
            </button>
            <button
              onClick={() => setActiveZone('barra')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeZone === 'barra'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Barra
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="w-1/3 p-4">
            <TableView
              zone={activeZone}
              selectedTable={selectedTable}
              onTableSelect={setSelectedTable}
            />
          </div>

          <div className="flex-1 p-4">
            <ProductSelector onProductSelect={addToOrder} />
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-gray-200">
        <OrderSummary
          order={currentOrder}
          onUpdateQuantity={updateQuantity}
          onCompleteOrder={completeOrder}
          table={selectedTable}
          zone={activeZone}
        />
      </div>
    </div>
  );
}