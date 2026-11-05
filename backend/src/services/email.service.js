'use strict';
const nodemailer = require('nodemailer');

const REMITENTE_DEFAULT = 'bryangomezfwd@gmail.com';

/**
 * Obtiene la configuración del transporte de correo.
 */
const obtenerConfiguracion = () => {
  const usuario = process.env.EMAIL_USER || REMITENTE_DEFAULT;
  const pass = process.env.EMAIL_PASS || '';
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = port === 465;

  return { usuario, pass, host, port, secure, configurado: Boolean(pass) };
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
 * Envía un correo electrónico. Si no hay contraseña de aplicación configurada en .env,
 * realiza una simulación controlada y devuelve el resultado detallado para pruebas.
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
    console.log('\n================== [SIMULACIÓN ENVÍO DE CORREO] ==================');
    console.log(`De: ${datosCorreo.from}`);
    console.log(`Para: ${datosCorreo.to}`);
    console.log(`Asunto: ${datosCorreo.subject}`);
    console.log('Nota: Para envío real vía Gmail, configura EMAIL_PASS en backend/.env (Contraseña de aplicación)');
    console.log('===================================================================\n');

    return {
      exito: true,
      simulado: true,
      remitente: config.usuario,
      destinatarios: listaDestinatarios,
      asunto,
      fecha: new Date().toISOString(),
      mensaje: `Simulación exitosa: el correo para [${to}] fue preparado correctamente. Para enviar a la bandeja real de Gmail, agrega tu contraseña de aplicación en EMAIL_PASS en el archivo .env.`,
    };
  }

  try {
    const transportador = crearTransportador();
    const info = await transportador.sendMail(datosCorreo);

    return {
      exito: true,
      simulado: false,
      remitente: config.usuario,
      destinatarios: listaDestinatarios,
      asunto,
      messageId: info.messageId,
      fecha: new Date().toISOString(),
      mensaje: `Correo enviado exitosamente a ${to}`,
    };
  } catch (error) {
    console.error('Error al enviar correo vía SMTP:', error);
    throw new Error(`Fallo al enviar correo desde ${config.usuario}: ${error.message}`);
  }
};

module.exports = {
  REMITENTE_DEFAULT,
  obtenerConfiguracion,
  enviarCorreo,
};

