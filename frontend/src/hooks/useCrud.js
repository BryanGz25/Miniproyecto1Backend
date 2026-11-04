import { useCallback, useEffect, useState } from 'react';

/**
 * Estado de una lista de registros conectada a un servicio CRUD.
 * @param {ReturnType<import('../services/api').crearServicioCrud>} servicio
 */
export function useCrud(servicio) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setItems(await servicio.listar());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [servicio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (datos, id) => {
    const resultado = id ? await servicio.actualizar(id, datos) : await servicio.crear(datos);
    await cargar();
    return resultado;
  };

  const eliminar = async (id) => {
    await servicio.eliminar(id);
    await cargar();
  };

  return { items, cargando, error, cargar, guardar, eliminar };
}
