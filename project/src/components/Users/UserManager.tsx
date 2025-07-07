import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';


const UserManager: React.FC = () => {
  // Obtener roles desde el hook (dentro del componente)
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/users');
        const data = await response.json();
        setUsers(data.map((u: any) => ({
          ...u,
          username: u.name, // Map DB 'name' to 'username' for UI
          isActive: u.active === 1 || u.active === true,
        })));
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      let response;
      if (userData.id) {
        response = await fetch(`http://localhost:4000/api/users/${userData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.username,
            role: userData.role,
            active: userData.isActive,
            password: userData.password || null,
          }),
        });
      } else {
        response = await fetch('http://localhost:4000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.username,
            role: userData.role,
            active: userData.isActive,
            password: userData.password || null,
          }),
        });
      }
      if (!response.ok) throw new Error();
      // Refresca usuarios tras guardar
      const res = await fetch('http://localhost:4000/api/users');
      const data = await res.json();
      setUsers(data.map((u: any) => ({
        ...u,
        username: u.name,
        isActive: u.active === 1 || u.active === true,
      })));
      setIsModalOpen(false);
      setCurrentUser(null);
    } catch (err) {
      setError('Error al guardar el usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        // Refresca usuarios tras eliminar
        const res = await fetch('http://localhost:4000/api/users');
        const data = await res.json();
        setUsers(data.map((u: any) => ({
          ...u,
          username: u.name,
          isActive: u.active === 1 || u.active === true,
        })));
      } catch (err) {
        setError('Error al eliminar el usuario');
      }
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentUser({
      username: '',
      email: '',
      role: 'cashier',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentUser?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userData = {
                  ...currentUser,
                  username: formData.get('username') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as User['role'],
                  isActive: formData.get('isActive') === 'on',
                };
                handleSaveUser(userData);
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    defaultValue={currentUser?.username || ''}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={currentUser?.email || ''}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                    Rol
                  </label>
                  {loadingRoles ? (
                    <div className="text-gray-500">Cargando roles...</div>
                  ) : errorRoles ? (
                    <div className="text-red-500">{errorRoles}</div>
                  ) : (
                    <select
                      id="role"
                      name="role"
                      defaultValue={currentUser?.role || (roles[0]?.nombre || '')}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.nombre}>{role.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                {!currentUser?.id && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required={!currentUser?.id}
                    />
                  </div>
                )}

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={currentUser?.isActive !== false}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Usuario activo</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {currentUser?.id ? 'Actualizar' : 'Crear'}
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

export default UserManager;
