'use strict';
const {
  consultarProductosCriticos,
  ejecutarAlertaInventario,
} = require('../services/alertaInventario.service');
const {
  leerDestinatarios,
  agregarDestinatario,
  eliminarDestinatario,
} = require('../services/destinatarios.service');
const { obtenerConfiguracion, REMITENTE_DEFAULT } = require('../services/email.service');
const { procesarMensajeChatbot } = require('../services/chatbot.service');

/**
 * GET /api/agentes/alertas/estado
 * Retorna el estado actual del inventario, remitente configurado y destinatarios.
 */
const obtenerEstadoAlertas = async (req, res, next) => {
  try {
    const diagnostico = await consultarProductosCriticos();
    const destinatarios = leerDestinatarios();
    const config = obtenerConfiguracion();

    res.json({
      exito: true,
      diagnostico,
      destinatarios,
      configuracion: {
        remitente: config.usuario,
        remitenteDefault: REMITENTE_DEFAULT,
        configurado: config.configurado,
        host: config.host,
        puerto: config.port,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/agentes/alertas/destinatarios
 */
const listarDestinatarios = async (req, res, next) => {
  try {
    const destinatarios = leerDestinatarios();
    res.json({ exito: true, datos: destinatarios });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/agentes/alertas/destinatarios
 */
const crearDestinatario = async (req, res, next) => {
  try {
    const { correo, etiqueta } = req.body;
    if (!correo) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
    }

    const nuevo = agregarDestinatario(correo, etiqueta);
    res.status(201).json({ exito: true, datos: nuevo, mensaje: 'Correo de prueba agregado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/agentes/alertas/destinatarios
 */
const borrarDestinatario = async (req, res, next) => {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ error: 'Debe especificar el correo a eliminar.' });
    }

    const resultado = eliminarDestinatario(correo);
    res.json({ exito: true, ...resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/agentes/alertas/enviar
 * Dispara el análisis y envío del correo de alerta.
 */
const dispararAlertaCorreo = async (req, res, next) => {
  try {
    const { correoPrueba } = req.body;
    const resultado = await ejecutarAlertaInventario({
      destinatarioPrueba: correoPrueba,
    });

    res.json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/agentes/chat
 * Endpoint del chatbot asistente integral del sistema.
 */
const enviarMensajeChat = async (req, res, next) => {
  try {
    const { mensaje, historial } = req.body;
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const resultado = await procesarMensajeChatbot({ mensaje, historial });
    res.json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerEstadoAlertas,
  listarDestinatarios,
  crearDestinatario,
  borrarDestinatario,
  dispararAlertaCorreo,
  enviarMensajeChat,
};
