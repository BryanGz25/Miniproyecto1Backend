import { useId } from 'react';

/** Etiqueta + control de formulario. `children` recibe el id para enlazar el label. */
export default function Campo({ etiqueta, requerido = false, ayuda, completo = false, children }) {
  const id = useId();
  return (
    <div className={completo ? 'completo' : undefined}>
      <label className="etiqueta" htmlFor={id}>
        {etiqueta}
        {requerido && ' *'}
      </label>
      {children(id)}
      {ayuda && <p className="ayuda">{ayuda}</p>}
    </div>
  );
}
