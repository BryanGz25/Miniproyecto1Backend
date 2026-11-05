'use strict';
const { Op } = require('sequelize');
const { Producto, Categoria, Proveedor, Marca, UnidadMedida } = require('../models');
const { enviarCorreo, obtenerConfiguracion, REMITENTE_DEFAULT } = require('./email.service');
const { leerDestinatarios } = require('./destinatarios.service');

/**
 * Obtiene los productos con stock crítico (agotados o bajo el mínimo).
 */
const consultarProductosCriticos = async () => {
  const productos = await Producto.findAll({
    where: {
      activo: true,
      [Op.or]: [
        { stockActual: 0 },
        {
          stockActual: {
            [Op.lte]: Producto.sequelize.col('stockMinimo'),
          },
        },
      ],
    },
    include: [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre', 'email', 'telefono'] },
      { model: Marca, as: 'marca', attributes: ['id', 'nombre'] },
      { model: UnidadMedida, as: 'unidadMedida', attributes: ['id', 'nombre', 'abreviatura'] },
    ],
    order: [
      ['stockActual', 'ASC'],
      ['nombre', 'ASC'],
    ],
  });

  const agotados = [];
  const bajoStock = [];

  productos.forEach((p) => {
    const item = p.toJSON();
    const unidad = item.unidadMedida ? item.unidadMedida.abreviatura : 'uds';
    const deficit = Math.max(0, item.stockMinimo - item.stockActual);
    const sugeridoReorden = Math.max(deficit, 10); // mínimo sugerido

    const enriquecido = {
      ...item,
      unidad,
      deficit,
      sugeridoReorden,
      estado: item.stockActual === 0 ? 'AGOTADO' : 'BAJO_STOCK',
    };

    if (item.stockActual === 0) {
      agotados.push(enriquecido);
    } else {
      bajoStock.push(enriquecido);
    }
  });

  return {
    totalCriticos: productos.length,
    totalAgotados: agotados.length,
    totalBajoStock: bajoStock.length,
    agotados,
    bajoStock,
    todos: [...agotados, ...bajoStock],
  };
};

/**
 * Genera el cuerpo HTML profesional del correo de alerta.
 */
const generarHtmlAlerta = ({ agotados, bajoStock, totalCriticos }) => {
  const fecha = new Date().toLocaleString('es-CR', { dateStyle: 'full', timeStyle: 'short' });

  const renderizarFilas = (lista, esAgotado) => {
    if (lista.length === 0) {
      return '<tr><td colspan="6" style="padding: 12px; text-align: center; color: #64748b;">No hay productos en esta categoría.</td></tr>';
    }

    return lista
      .map((item) => {
        const badgeColor = esAgotado ? '#dc2626' : '#d97706';
        const badgeBg = esAgotado ? '#fee2e2' : '#fef3c7';
        const estadoTexto = esAgotado ? 'AGOTADO' : 'STOCK BAJO';

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; font-weight: 600; color: #1e293b;">${item.nombre} <br><span style="font-size: 11px; color: #64748b; font-weight: 400;">SKU: ${item.sku}</span></td>
            <td style="padding: 12px; color: #475569;">${item.categoria?.nombre || 'General'}</td>
            <td style="padding: 12px; text-align: center;">
              <span style="display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: 700; border-radius: 9999px; background: ${badgeBg}; color: ${badgeColor};">
                ${estadoTexto} (${item.stockActual} ${item.unidad})
              </span>
            </td>
            <td style="padding: 12px; text-align: center; color: #475569;">${item.stockMinimo} ${item.unidad}</td>
            <td style="padding: 12px; text-align: center; font-weight: 700; color: #0284c7;">+${item.sugeridoReorden} ${item.unidad}</td>
            <td style="padding: 12px; color: #475569;">${item.proveedor?.nombre || 'Sin asignar'}<br><span style="font-size: 11px; color: #64748b;">${item.proveedor?.email || ''}</span></td>
          </tr>
        `;
      })
      .join('');
  };

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Alerta de Inventario</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
    <div style="max-width: 720px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- Encabezado -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 28px; text-align: center;">
        <span style="display: inline-block; background: #ef4444; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
          ALERTA AUTOMÁTICA DEL AGENTE
        </span>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Monitoreo de Stock Crítico</h1>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Emitido el ${fecha}</p>
      </div>

      <!-- Resumen en métricas -->
      <div style="display: flex; justify-content: space-around; background-color: #f1f5f9; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <div style="flex: 1;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Total Críticos</div>
          <div style="font-size: 22px; font-weight: 800; color: #0f172a;">${totalCriticos}</div>
        </div>
        <div style="flex: 1; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1;">
          <div style="font-size: 12px; color: #dc2626; text-transform: uppercase; font-weight: 700;">Agotados (0)</div>
          <div style="font-size: 22px; font-weight: 800; color: #dc2626;">${agotados.length}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 12px; color: #d97706; text-transform: uppercase; font-weight: 700;">Stock Bajo</div>
          <div style="font-size: 22px; font-weight: 800; color: #d97706;">${bajoStock.length}</div>
        </div>
      </div>

      <div style="padding: 24px;">
        <p style="margin-top: 0; color: #334155; font-size: 15px; line-height: 1.5;">
          El <strong>Agente de Monitoreo de Inventario</strong> ha detectado <strong>${totalCriticos} producto(s)</strong> que requieren atención urgente de reposición para evitar desabastecimiento.
        </p>

        <!-- Sección Agotados -->
        ${
          agotados.length > 0
            ? `
          <h3 style="color: #dc2626; font-size: 16px; margin: 24px 0 12px; display: flex; align-items: center;">
            🚨 Productos Totalmente Agotados (${agotados.length})
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569;">
                <th style="padding: 10px;">Producto</th>
                <th style="padding: 10px;">Categoría</th>
                <th style="padding: 10px; text-align: center;">Estado</th>
                <th style="padding: 10px; text-align: center;">Mínimo</th>
                <th style="padding: 10px; text-align: center;">Pedido Sugerido</th>
                <th style="padding: 10px;">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              ${renderizarFilas(agotados, true)}
            </tbody>
          </table>
        `
            : ''
        }

        <!-- Sección Bajo Stock -->
        ${
          bajoStock.length > 0
            ? `
          <h3 style="color: #d97706; font-size: 16px; margin: 24px 0 12px;">
            ⚠️ Productos Próximos a Agotarse (${bajoStock.length})
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569;">
                <th style="padding: 10px;">Producto</th>
                <th style="padding: 10px;">Categoría</th>
                <th style="padding: 10px; text-align: center;">Estado</th>
                <th style="padding: 10px; text-align: center;">Mínimo</th>
                <th style="padding: 10px; text-align: center;">Pedido Sugerido</th>
                <th style="padding: 10px;">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              ${renderizarFilas(bajoStock, false)}
            </tbody>
          </table>
        `
            : ''
        }

        ${
          totalCriticos === 0
            ? `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; text-align: center; color: #166534;">
            <p style="margin: 0; font-weight: 700; font-size: 16px;">¡Excelente! Todo el inventario se encuentra en niveles óptimos.</p>
            <p style="margin: 6px 0 0; font-size: 13px;">No hay productos con stock menor o igual a su umbral mínimo configurado.</p>
          </div>
        `
            : ''
        }

        <!-- Recomendaciones del Agente -->
        <div style="margin-top: 28px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 14px 18px;">
          <h4 style="margin: 0 0 6px 0; color: #1e40af; font-size: 14px;">💡 Acciones Recomendadas por el Agente:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.6;">
            <li>Generar de inmediato órdenes de compra a los proveedores indicados para los productos agotados.</li>
            <li>Revisar si existen pedidos pendientes de recepción en el módulo de <em>Órdenes de Compra</em>.</li>
            <li>Realizar un movimiento de entrada o ajuste si el stock físico real no coincide con el sistema.</li>
          </ul>
        </div>
      </div>

      <!-- Pie de página -->
      <div style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        <p style="margin: 0;">
          Generado automáticamente por el <strong>Agente Centinela de Inventario</strong>.
        </p>
        <p style="margin: 4px 0 0 0;">
          Remitente configurado: <a href="mailto:${REMITENTE_DEFAULT}" style="color: #0284c7; text-decoration: none;">${REMITENTE_DEFAULT}</a>
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
};

/**
 * Ejecuta el análisis y envía el reporte por correo a los destinatarios.
 *
 * @param {Object} [opciones]
 * @param {string} [opciones.destinatarioPrueba] - Si se especifica, solo se envía a este correo de prueba.
 */
const ejecutarAlertaInventario = async (opciones = {}) => {
  const { destinatarioPrueba } = opciones;
  const config = obtenerConfiguracion();

  // 1. Obtener productos con stock crítico
  const diagnostico = await consultarProductosCriticos();

  // 2. Determinar destinatarios
  let listaCorreos = [];
  if (destinatarioPrueba) {
    listaCorreos = [destinatarioPrueba.trim().toLowerCase()];
  } else {
    const registrados = leerDestinatarios();
    listaCorreos = registrados.filter((d) => d.activo).map((d) => d.correo);
  }

  if (listaCorreos.length === 0) {
    listaCorreos = [REMITENTE_DEFAULT];
  }

  // 3. Generar HTML
  const html = generarHtmlAlerta(diagnostico);
  const asunto =
    diagnostico.totalCriticos > 0
      ? `🚨 [ALERTA INVENTARIO] ${diagnostico.totalAgotados} agotado(s) y ${diagnostico.totalBajoStock} por agotarse`
      : `✅ [ESTADO INVENTARIO] Niveles de stock óptimos`;

  // 4. Enviar correo
  const resultadoEnvio = await enviarCorreo({
    destinatarios: listaCorreos,
    asunto,
    html,
  });

  return {
    ...resultadoEnvio,
    diagnostico,
    htmlPrevisualizacion: html,
    configuracion: {
      remitente: config.usuario,
      modoSimulado: resultadoEnvio.simulado,
    },
  };
};

module.exports = {
  consultarProductosCriticos,
  generarHtmlAlerta,
  ejecutarAlertaInventario,
};
