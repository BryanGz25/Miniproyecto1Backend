'use strict';
const nodemailer = require('nodemailer');

const { ErrorHttp } = require('../utils/errorHttp');

const REMITENTE_DEFAULT = 'bryangomezfwd@gmail.com';
const EMAIL_PASS_DE_EJEMPLO = 'tu-contraseña'; // inicio del valor de .env.example

/**
 * Obtiene la configuración del transporte de correo.
 */
const obtenerConfiguracion = () => {
  const usuario = process.env.EMAIL_USER || REMITENTE_DEFAULT;
  const pass = process.env.EMAIL_PASS || '';
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = port === 465;

  return { usuario, pass, host, port, secure, configurado: Boolean(pass) && !pass.startsWith(EMAIL_PASS_DE_EJEMPLO) };
};

/**
 * Crea una instancia del transportador nodemailer.
 */
const crearTransportador = () => {
  const { usuario, pass, host, port, secure } = obtenerConfiguracion();

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: usuario,
      pass,
    },
    // Compatibilidad en entornos locales
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Envía un correo electrónico. Solo devuelve un resultado si el servidor de correo lo aceptó:
 * sin configuración lanza un 503 y si el envío falla, un 502.
 *
 * @param {Object} opciones
 * @param {string|string[]} opciones.destinatarios - Dirección o lista de direcciones destino
 * @param {string} opciones.asunto - Título del correo
 * @param {string} opciones.html - Contenido en formato HTML
 * @param {string} [opciones.texto] - Versión en texto plano opcional
 */
const enviarCorreo = async ({ destinatarios, asunto, html, texto }) => {
  const config = obtenerConfiguracion();
  const listaDestinatarios = Array.isArray(destinatarios) ? destinatarios : [destinatarios];
  const to = listaDestinatarios.join(', ');

  const datosCorreo = {
    from: `"Alertas Inventario" <${config.usuario}>`,
    to,
    subject: asunto,
    text: texto || html.replace(/<[^>]*>?/gm, ''),
    html,
  };

  if (!config.configurado) {
    console.error('Envío de correo no disponible: falta EMAIL_PASS en backend/.env (contraseña de aplicación de Gmail).');
    throw new ErrorHttp(503, 'El envío de correos no está configurado en el servidor.');
  }

  try {
    const info = await crearTransportador().sendMail(datosCorreo);
    return {
      remitente: config.usuario,
      destinatarios: info.accepted,
      rechazados: info.rejected,
      asunto,
      messageId: info.messageId,
      fecha: new Date().toISOString(),
      mensaje: `Correo aceptado por el servidor para ${info.accepted.join(', ')}`,
    };
  } catch (error) {
    console.error('Error al enviar correo vía SMTP:', error);
    throw new ErrorHttp(502, 'El servidor de correo no aceptó el envío.');
  }
};

module.exports = {
  REMITENTE_DEFAULT,
  obtenerConfiguracion,
  enviarCorreo,
};

