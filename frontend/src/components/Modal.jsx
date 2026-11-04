import { useEffect, useRef } from 'react';
import Icono from './Icono';

/** Ventana modal accesible: cierra con Escape o clic fuera y enfoca el primer campo. */
export default function Modal({ titulo, onCerrar, pequeno = false, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', alPresionar);
    ref.current?.querySelector('input, select, textarea, button:not(.btn-icono)')?.focus();
    return () => document.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div
        ref={ref}
        className={`modal glass${pequeno ? ' pequeno' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <div className="modal-cabecera">
          <h2 id="modal-titulo">{titulo}</h2>
          <button type="button" className="btn btn-icono" onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
