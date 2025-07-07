import { useEffect, useState } from 'react';

export interface Role {
  id: number;
  nombre: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/roles')
      .then(res => res.json())
      .then(setRoles)
      .catch(() => setError('Error al cargar roles'))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading, error };
}
