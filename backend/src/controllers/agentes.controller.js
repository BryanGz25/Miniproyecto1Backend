'use strict';
// Express 5 envía al manejador de errores cualquier excepción de estos controladores,
// que responde con el código que corresponde a cada caso.
const {
  consultarProductosCriticos,
  ejecutarAlertaInventario,
  generarHtmlAlerta,
} = require('../services/alertaInventario.service');
const {
  leerDestinatarios,
  agregarDestinatario,
  eliminarDestinatario,
  esCorreoValido,
} = require('../services/destinatarios.service');
const { obtenerConfiguracion, REMITENTE_DEFAULT } = require('../services/email.service');
const { procesarMensajeChatbot } = require('../services/chatbot.service');

/**
 * GET /api/agentes/alertas/estado
 * Retorna el estado actual del inventario, remitente configurado y destinatarios.
 */
const obtenerEstadoAlertas = async (_req, res) => {
  const diagnostico = await consultarProductosCriticos();
  const config = obtenerConfiguracion();

  res.status(200).json({
    exito: true,
    diagnostico,
    destinatarios: leerDestinatarios(),
    configuracion: {
      remitente: config.usuario,
      remitenteDefault: REMITENTE_DEFAULT,
      configurado: config.configurado,
      host: config.host,
      puerto: config.port,
    },
  });
};

/**
 * GET /api/agentes/alertas/vista-previa
 * Devuelve el HTML del reporte con los datos actuales, sin enviar ningún correo.
 */
const obtenerVistaPrevia = async (_req, res) => {
  res.status(200).json({ exito: true, html: generarHtmlAlerta(await consultarProductosCriticos()) });
};

/**
 * GET /api/agentes/alertas/destinatarios
 */
const listarDestinatarios = (_req, res) => {
  res.status(200).json({ exito: true, datos: leerDestinatarios() });
};

/**
 * POST /api/agentes/alertas/destinatarios
 */
const crearDestinatario = (req, res) => {
  const { correo, etiqueta } = req.body ?? {};
  if (!correo) return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });

  const nuevo = agregarDestinatario(correo, etiqueta);
  return res.status(201).json({ exito: true, datos: nuevo, mensaje: 'Correo de prueba agregado correctamente.' });
};

/**
 * DELETE /api/agentes/alertas/destinatarios
 */
const borrarDestinatario = (req, res) => {
  const { correo } = req.body ?? {};
  if (!correo) return res.status(400).json({ error: 'Debe especificar el correo a eliminar.' });

  return res.status(200).json({ exito: true, ...eliminarDestinatario(correo) });
};

/**
 * POST /api/agentes/alertas/enviar
 * Dispara el análisis y el envío. Responde 200 solo si el servidor de correo aceptó el mensaje.
 */
const dispararAlertaCorreo = async (req, res) => {
  const { correoPrueba } = req.body ?? {};
  if (correoPrueba !== undefined && correoPrueba !== null && !esCorreoValido(correoPrueba)) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }

  const resultado = await ejecutarAlertaInventario({ destinatarioPrueba: correoPrueba });
  return res.status(200).json({ exito: true, ...resultado });
};

/**
 * POST /api/agentes/chat
 * Endpoint del chatbot asistente integral del sistema.
 */
const enviarMensajeChat = async (req, res) => {
  const { mensaje, historial } = req.body ?? {};
  if (typeof mensaje !== 'string' || !mensaje.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  const resultado = await procesarMensajeChatbot({ mensaje, historial, puede: req.acceso.puede });
  return res.status(200).json({ exito: true, ...resultado });
};

module.exports = {
  obtenerEstadoAlertas,
  obtenerVistaPrevia,
  listarDestinatarios,
  crearDestinatario,
  borrarDestinatario,
  dispararAlertaCorreo,
  enviarMensajeChat,
};
