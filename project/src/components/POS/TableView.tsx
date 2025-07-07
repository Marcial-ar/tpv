import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Table } from '../../types';

interface TableViewProps {
  zone: 'barra' | 'terraza';
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
}

export function TableView({ zone, selectedTable, onTableSelect }: TableViewProps) {
  const { state } = useApp();
  
  const tables = state.tables.filter(table => table.zone === zone);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      default:
        return status;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 capitalize">
        Mesas - {zone}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTable?.id === table.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-transparent'
            } ${getTableStatusColor(table.status)}`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {table.number}
              </div>
              <div className="text-xs mb-1">
                {table.seats} asientos
              </div>
              <div className="text-xs font-medium">
                {getStatusText(table.status)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}