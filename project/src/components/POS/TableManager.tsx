import React, { useState, useEffect } from 'react';
import { Table } from '../../types';

const statusOptions = [
  { value: 'available', label: 'Disponible' },
  { value: 'occupied', label: 'Ocupada' },
  { value: 'reserved', label: 'Reservada' },
];

const zoneOptions = [
  { value: 'barra', label: 'Barra' },
  { value: 'terraza', label: 'Terraza' },
];

const TableManager: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/tables');
        const data = await response.json();
        setTables(data);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar las mesas');
        setIsLoading(false);
      }
    };
    fetchTables();
  }, []);

  const handleSaveTable = async (tableData: Partial<Table>) => {
    try {
      let response;
      if (tableData.id) {
        response = await fetch(`http://localhost:4000/api/tables/${tableData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tableData),
        });
      } else {
        response = await fetch('http://localhost:4000/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tableData),
        });
      }
      if (!response.ok) throw new Error();
      // Refresca mesas tras guardar
      const res = await fetch('http://localhost:4000/api/tables');
      const data = await res.json();
      setTables(data);
      setIsModalOpen(false);
      setCurrentTable(null);
    } catch (err) {
      setError('Error al guardar la mesa');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/tables/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        // Refresca mesas tras eliminar
        const res = await fetch('http://localhost:4000/api/tables');
        const data = await res.json();
        setTables(data);
      } catch (err) {
        setError('Error al eliminar la mesa');
      }
    }
  };

  const handleEdit = (table: Table) => {
    setCurrentTable(table);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentTable({
      number: 1,
      zone: 'barra',
      seats: 2,
      status: 'available',
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando mesas...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span> Nueva Mesa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asientos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => (
              <tr key={table.id}>
                <td className="px-6 py-4 whitespace-nowrap">{table.number}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{table.zone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{table.seats}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    table.status === 'available' ? 'bg-green-100 text-green-800' :
                    table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {statusOptions.find(opt => opt.value === table.status)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(table)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentTable?.id ? 'Editar Mesa' : 'Nueva Mesa'}
              </h2>
              <form onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const tableData: Partial<Table> = {
                  ...currentTable,
                  number: Number(formData.get('number')),
                  zone: formData.get('zone') as 'barra' | 'terraza',
                  seats: Number(formData.get('seats')),
                  status: formData.get('status') as Table['status'],
                };
                handleSaveTable(tableData);
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
                    Número de mesa
                  </label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    defaultValue={currentTable?.number || 1}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zone">
                    Zona
                  </label>
                  <select
                    id="zone"
                    name="zone"
                    defaultValue={currentTable?.zone || 'barra'}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {zoneOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seats">
                    Asientos
                  </label>
                  <input
                    type="number"
                    id="seats"
                    name="seats"
                    defaultValue={currentTable?.seats || 2}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={currentTable?.status || 'available'}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentTable(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {currentTable?.id ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
