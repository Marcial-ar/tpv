import React from 'react';
import { Minus, Plus, Trash2, Receipt } from 'lucide-react';
import { OrderItem, Table } from '../../types';

interface OrderSummaryProps {
  order: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCompleteOrder: () => void;
  table: Table | null;
  zone: 'barra' | 'terraza';
}

export function OrderSummary({ 
  order, 
  onUpdateQuantity, 
  onCompleteOrder, 
  table, 
  zone 
}: OrderSummaryProps) {
  const subtotal = order.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * 0.1;
  const total = subtotal + vatAmount;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold">Pedido Actual</h3>
        {table ? (
          <p className="text-sm text-gray-600">
            Mesa {table.number} - {zone === 'barra' ? 'Barra' : 'Terraza'}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {zone === 'barra' ? 'Barra' : 'Para llevar'}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {order.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay productos en el pedido</p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.map((item) => (
              <div key={item.productId} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, 0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      €{item.unitPrice.toFixed(2)} c/u
                    </div>
                    <div className="font-semibold">
                      €{item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {order.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA (10%):</span>
              <span>€{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCompleteOrder}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Completar Pedido
          </button>
        </div>
      )}
    </div>
  );
}