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
    // Cada lista falla por separado: sin permiso sobre un recurso, las demás opciones se cargan igual.
    Promise.all(clave.split(',').map((r) => request(`/${r}`).then((lista) => [r, lista], () => [r, []])))
      .then((pares) => vigente && setOpciones(Object.fromEntries(pares)));
    return () => {
      vigente = false;
    };
  }, [clave]);

  return opciones;
}
