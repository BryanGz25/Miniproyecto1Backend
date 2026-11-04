import { useState } from 'react';
import Modal from './Modal';
import Icono from './Icono';

/** Confirmación antes de eliminar. Muestra el error de la API si la eliminación falla. */
export default function ConfirmDialog({ titulo, mensaje, onConfirmar, onCancelar }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const confirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Confirmar eliminación" onCerrar={onCancelar} pequeno>
      <div className="icono-peligro">
        <Icono nombre="basura" />
      </div>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{titulo}</p>
      <p className="secundario">{mensaje}</p>
      {error && (
        <div className="alerta-form" role="alert" style={{ marginTop: 14, marginBottom: 0 }}>
          {error}
        </div>
      )}
      <div className="acciones-form">
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="btn btn-peligro" onClick={confirmar} disabled={enviando}>
          {enviando ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
