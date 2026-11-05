'use strict';
const { Router } = require('express');
const {
  obtenerEstadoAlertas,
  listarDestinatarios,
  crearDestinatario,
  borrarDestinatario,
  dispararAlertaCorreo,
  enviarMensajeChat,
} = require('../controllers/agentes.controller');

const router = Router();

// Agente 1: Notificador & Alertas de Inventario
router.get('/alertas/estado', obtenerEstadoAlertas);
router.get('/alertas/destinatarios', listarDestinatarios);
router.post('/alertas/destinatarios', crearDestinatario);
router.delete('/alertas/destinatarios', borrarDestinatario);
router.post('/alertas/enviar', dispararAlertaCorreo);

// Agente 2: Chatbot Asistente Integral con Guardrails
router.post('/chat', enviarMensajeChat);

module.exports = router;

