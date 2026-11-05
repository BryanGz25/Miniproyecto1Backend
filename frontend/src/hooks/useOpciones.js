import { useEffect, useState } from 'react';
import { request } from '../services/api';

/**
 * Carga las listas que alimentan los <select> de claves foráneas.
 * @param {string[]} recursos  ej. ['bodegas', 'productos']
 * @returns {Record<string, object[]>}  { bodegas: [...], productos: [...] }
 */
export function useOpciones(recursos) {
  const [opciones, setOpciones] = useState({});
  const clave = recursos.join(',');

  useEffect(() => {
    if (!clave) return undefined;
    let vigente = true;
    Promise.all(clave.split(',').map((r) => request(`/${r}`).then((lista) => [r, lista])))
      .then((pares) => vigente && setOpciones(Object.fromEntries(pares)))
      .catch(() => {}); // si falla, la tabla principal ya muestra el error
    return () => {
      vigente = false;
    };
  }, [clave]);

  return opciones;
}
