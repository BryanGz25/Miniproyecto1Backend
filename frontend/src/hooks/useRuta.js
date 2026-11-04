import { useEffect, useState } from 'react';

const leerRuta = () => window.location.hash.replace(/^#\/?/, '') || 'resumen';

/** Navegación simple por hash (#/productos), sin librerías extra. */
export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return ruta;
}
