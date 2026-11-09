'use strict';
const { Router } = require('express');
const {
  obtenerEstadoAlertas,
  obtenerVistaPrevia,
  listarDestinatarios,
  crearDestinatario,
  borrarDestinatario,
  dispararAlertaCorreo,
  enviarMensajeChat,
} = require('../controllers/agentes.controller');
const { requierePermiso } = require('../middlewares/permisos');

const router = Router();

// Agente 1: Notificador & Alertas de Inventario
router.get('/alertas/estado', requierePermiso('alertas.ver'), obtenerEstadoAlertas);
router.get('/alertas/vista-previa', requierePermiso('alertas.ver'), obtenerVistaPrevia);
router.get('/alertas/destinatarios', requierePermiso('alertas.ver'), listarDestinatarios);
router.post('/alertas/destinatarios', requierePermiso('alertas.gestionar'), crearDestinatario);
router.delete('/alertas/destinatarios', requierePermiso('alertas.gestionar'), borrarDestinatario);
router.post('/alertas/enviar', requierePermiso('alertas.enviar'), dispararAlertaCorreo);

// Agente 2: Chatbot Asistente Integral con Guardrails
router.post('/chat', requierePermiso('chatbot.usar'), enviarMensajeChat);

module.exports = router;

