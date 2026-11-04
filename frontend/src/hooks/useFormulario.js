import { useState } from 'react';
import { ApiError } from '../services/api';

/**
 * Maneja valores, envío y errores de un formulario.
 * `convertir` transforma los valores del formulario en el cuerpo que espera la API.
 */
export function useFormulario(inicial, { convertir = (v) => v, validar = () => [] } = {}) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (evento) => {
    const { name, value, type, checked } = evento.target;
    setValores((previos) => ({ ...previos, [name]: type === 'checkbox' ? checked : value }));
  };

  const enviar = (onGuardar) => async (evento) => {
    evento.preventDefault();
    const erroresCliente = validar(valores);
    if (erroresCliente.length) {
      setErrores(erroresCliente);
      return;
    }
    setEnviando(true);
    setErrores([]);
    try {
      await onGuardar(convertir(valores));
    } catch (error) {
      const detalles = error instanceof ApiError && error.detalles.length ? error.detalles : [];
      setErrores(detalles.length ? detalles : [error.message]);
    } finally {
      setEnviando(false);
    }
  };

  return { valores, cambiar, errores, enviando, enviar };
}

/** Convierte un texto de input numérico en número (o null si está vacío). */
export const aNumero = (texto) => (texto === '' || texto === null || texto === undefined ? null : Number(texto));
