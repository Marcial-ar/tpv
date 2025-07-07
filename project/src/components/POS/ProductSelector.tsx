import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ProductSelectorProps {
  onProductSelect: (productId: string) => void;
}

export function ProductSelector({ onProductSelect }: ProductSelectorProps) {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(state.products.map(p => p.category))];
  
  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.active;
  });

  return (
    <div>
      <div className="mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.id)}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <h4 className="font-semibold text-gray-900 mb-1">
              {product.name}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {product.category}
            </p>
            <div className="text-lg font-bold text-green-600">
              €{product.finalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Stock: {product.stock}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}