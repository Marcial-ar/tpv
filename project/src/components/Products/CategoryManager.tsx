import React, { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '../../types/category';

interface CategoryManagerProps {
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<CategoryFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/categories');
        const data: Category[] = await response.json();
        // Convert flat list to tree
        const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
          return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
              ...item,
              children: buildTree(items, item.id)
            }));
        };
        setCategories(buildTree(data));
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar las categorías');
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSaveCategory = async (categoryData: Partial<CategoryFormData>) => {
    try {
      let response;
      if (categoryData.id) {
        response = await fetch(`http://localhost:4000/api/categories/${categoryData.id}` , {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
      } else {
        response = await fetch('http://localhost:4000/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
      }
      if (!response.ok) throw new Error('Error al guardar la categoría');
      // Refresca categorías después de guardar
      const res = await fetch('http://localhost:4000/api/categories');
      const data: Category[] = await res.json();
      const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id)
          }));
      };
      setCategories(buildTree(data));
      setIsModalOpen(false);
      setCurrentCategory(null);
    } catch (err) {
      setError('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar la categoría');
        // Refresca categorías después de eliminar
        const res = await fetch('http://localhost:4000/api/categories');
        const data: Category[] = await res.json();
        const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
          return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
              ...item,
              children: buildTree(items, item.id)
            }));
        };
        setCategories(buildTree(data));
      } catch (err) {
        setError('Error al eliminar la categoría');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      parentId: category.parentId,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = (parentId?: string) => {
    setCurrentCategory({
      name: '',
      description: '',
      isActive: true,
      parentId,
    });
    setIsModalOpen(true);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id] ?? false;
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="mb-1">
        <div 
          className={`flex items-center p-2 rounded-md ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            <button 
              onClick={() => toggleCategory(category.id)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}
          {!hasChildren && <div className="w-4 mr-2"></div>}
          
          <button 
            className={`flex-1 text-left ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-800'}`}
            onClick={() => onSelectCategory?.(category.id)}
          >
            {category.name}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="Editar categoría"
            >
              ✏️
            </button>
            <button
              onClick={() => handleAddNew(category.id)}
              className="text-green-600 hover:text-green-800 text-sm"
              title="Añadir subcategoría"
            >
              ➕
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(category.id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Eliminar categoría"
            >
              🗑️
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="border rounded-lg bg-white p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Categorías</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onSelectCategory?.(null)}
            className={`px-2 py-1 text-sm rounded ${!selectedCategoryId ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Todas
          </button>
          <button
            onClick={() => handleAddNew()}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <span className="mr-1">+</span> Nueva
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No hay categorías. Crea tu primera categoría.
          </div>
        ) : (
          categories.map(category => renderCategory(category))
        )}
      </div>

      {/* Category Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentCategory?.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const categoryData: Partial<CategoryFormData> = {
                  ...currentCategory,
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  isActive: formData.get('isActive') === 'on',
                  parentId: formData.get('parentId')?.toString() || undefined,
                };
                handleSaveCategory(categoryData);
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Nombre de la categoría *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={currentCategory?.name || ''}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={currentCategory?.description || ''}
                    rows={3}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentId">
                    Categoría padre
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    defaultValue={currentCategory?.parentId || ''}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Sin categoría padre</option>
                    {categories
                      .filter(cat => !currentCategory?.id || cat.id !== currentCategory.id) // Prevent selecting self as parent
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={currentCategory?.isActive !== false}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Categoría activa</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentCategory(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {currentCategory?.id ? 'Actualizar' : 'Crear'}
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

export default CategoryManager;
