import { request } from './api';

export const agentesService = {
  /** Obtiene estado actual de productos críticos, correos y configuración SMTP. */
  obtenerEstadoAlertas: () => request('/agentes/alertas/estado'),

  /** Obtiene el HTML del reporte sin enviar ningún correo. */
  obtenerVistaPrevia: () => request('/agentes/alertas/vista-previa'),

  /** Obtiene la lista de destinatarios de prueba para las alertas. */
  listarDestinatarios: () => request('/agentes/alertas/destinatarios'),

  /** Agrega un correo de prueba al sistema. */
  agregarDestinatario: (correo, etiqueta) =>
    request('/agentes/alertas/destinatarios', {
      method: 'POST',
      body: { correo, etiqueta },
    }),

  /** Elimina un correo de prueba. */
  eliminarDestinatario: (correo) =>
    request('/agentes/alertas/destinatarios', {
      method: 'DELETE',
      body: { correo },
    }),

  /** Dispara el envío de alertas (a todos o a uno de prueba específico). */
  enviarAlerta: ({ correoPrueba } = {}) =>
    request('/agentes/alertas/enviar', {
      method: 'POST',
      body: { correoPrueba },
    }),

  /** Envía un mensaje al chatbot con historial opcional. */
  enviarMensajeChat: ({ mensaje, historial = [] }) =>
    request('/agentes/chat', {
      method: 'POST',
      body: { mensaje, historial },
    }),
};

