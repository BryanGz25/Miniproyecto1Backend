/** Envoltorio común de formularios: errores arriba, campos en grilla y botones abajo. */
export default function FormBase({ errores, enviando, onSubmit, onCancelar, textoGuardar = 'Guardar', children }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      {errores.length > 0 && (
        <div className="alerta-form" role="alert">
          Revisa los datos:
          <ul>
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="form-grid">{children}</div>
      <div className="acciones-form">
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Guardando…' : textoGuardar}
        </button>
      </div>
    </form>
  );
}
