import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { SalesReport } from '../../types';

export function ReportsPanel() {
  const { state } = useApp();
  const [selectedReport, setSelectedReport] = useState<'sales' | 'products' | 'waiters' | 'daily'>('sales');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const generateSalesReport = (): SalesReport => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = state.orders.filter(order => 
      order.createdAt.toISOString().split('T')[0] === today && 
      order.status === 'completed'
    );

    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = todayOrders.length;

    // Top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { 
          name: item.productName, 
          quantity: 0, 
          revenue: 0 
        };
        productSales.set(item.productId, {
          name: item.productName,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({ productId, productName: data.name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Waiter performance
    const waiterSales = new Map<string, { name: string; orders: number; sales: number }>();
    todayOrders.forEach(order => {
      const existing = waiterSales.get(order.waiterId) || {
        name: order.waiterName,
        orders: 0,
        sales: 0
      };
      waiterSales.set(order.waiterId, {
        name: order.waiterName,
        orders: existing.orders + 1,
        sales: existing.sales + order.total
      });
    });

    const waiterPerformance = Array.from(waiterSales.entries())
      .map(([waiterId, data]) => ({ waiterId, waiterName: data.name, ...data }));

    return {
      date: today,
      totalSales,
      totalOrders,
      topProducts,
      waiterPerformance
    };
  };

  const salesReport = generateSalesReport();

  const reportTabs = [
    { id: 'sales', label: 'Ventas', icon: BarChart3 },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'waiters', label: 'Camareros', icon: Users },
    { id: 'daily', label: 'Cierre Diario', icon: Calendar }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Informes</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">hasta</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedReport === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {selectedReport === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-3xl font-bold text-gray-900">
                    €{salesReport.totalSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {salesReport.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Medio</p>
                  <p className="text-3xl font-bold text-gray-900">
                    €{salesReport.totalOrders > 0 ? (salesReport.totalSales / salesReport.totalOrders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
              <div className="space-y-3">
                {salesReport.topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <span className="ml-2">{product.productName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">€{product.revenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{product.quantity} uds</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Rendimiento Camareros</h3>
              <div className="space-y-3">
                {salesReport.waiterPerformance.map((waiter) => (
                  <div key={waiter.waiterId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{waiter.waiterName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">€{waiter.sales.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{waiter.orders} pedidos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'products' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Análisis de Productos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Producto</th>
                    <th className="text-left py-2">Categoría</th>
                    <th className="text-left py-2">Stock Actual</th>
                    <th className="text-left py-2">Precio Final</th>
                    <th className="text-left py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {state.products.map(product => (
                    <tr key={product.id} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{product.category}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-2">€{product.finalPrice.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'daily' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cierre Diario</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                <p className="text-lg">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario:</label>
                <p className="text-lg">{state.currentUser?.name}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Resumen de Ventas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Bruto:</span>
                  <span>€{salesReport.totalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (10%):</span>
                  <span>€{(salesReport.totalSales * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Neto:</span>
                  <span>€{(salesReport.totalSales * 0.9).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Generar Informe de Cierre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}