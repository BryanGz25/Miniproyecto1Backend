import { useState, useEffect } from 'react';
import Indicador from '../components/Indicador';
import StockBadge from '../components/StockBadge';
import Icono from '../components/Icono';
import { useAvisos } from '../components/Avisos';
import { agentesService } from '../services/agentes.service';
import { useAuth } from '../context/AuthContext';

export default function AlertasInventarioPage() {
  const avisar = useAvisos();
  const { puede } = useAuth();
  const puedeEnviar = puede('alertas.enviar');
  const puedeGestionar = puede('alertas.gestionar');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [destinatarios, setDestinatarios] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null);
  const [mostrarModalPreview, setMostrarModalPreview] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const res = await agentesService.obtenerEstadoAlertas();
      setDatos(res);
      setDestinatarios(res.destinatarios || []);
    } catch (error) {
      avisar(`Error al cargar datos del agente: ${error.message}`, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAgregarDestinatario = async (e) => {
    e.preventDefault();
    if (!nuevoCorreo.trim()) return;

    try {
      await agentesService.agregarDestinatario(nuevoCorreo, nuevaEtiqueta);
      avisar(`Correo ${nuevoCorreo} agregado a la lista de pruebas.`, 'ok');
      setNuevoCorreo('');
      setNuevaEtiqueta('');
      await cargarDatos();
    } catch (error) {
      avisar(error.message, 'error');
    }
  };

  const handleEliminarDestinatario = async (correo) => {
    try {
      await agentesService.eliminarDestinatario(correo);
      avisar(`Correo ${correo} eliminado.`, 'ok');
      await cargarDatos();
    } catch (error) {
      avisar(error.message, 'error');
    }
  };

  const handleEnviarAlerta = async (correoEspecifico = null) => {
    try {
      setEnviando(true);
      const res = await agentesService.enviarAlerta({ correoPrueba: correoEspecifico });
      
      setPreviewHtml(res.htmlPrevisualizacion);
      
      const destinoTexto = correoEspecifico ? `a ${correoEspecifico}` : `a ${res.destinatarios.length} destinatario(s)`;
      avisar(`🚀 ¡Correo enviado exitosamente ${destinoTexto}!`, 'ok');
    } catch (error) {
      avisar(`Error al enviar alerta: ${error.message}`, 'error');
    } finally {
      setEnviando(false);
    }
  };

  const handleVerDiseno = async () => {
    try {
      const { html } = await agentesService.obtenerVistaPrevia();
      setPreviewHtml(html);
      setMostrarModalPreview(true);
    } catch (error) {
      avisar(`Error al generar la vista previa: ${error.message}`, 'error');
    }
  };

  const criticos = datos?.diagnostico?.todos || [];
  const remitente = datos?.configuracion?.remitente || 'bryangomezfwd@gmail.com';
  const remitenteConfigurado = datos?.configuracion?.configurado;

  return (
    <>
      <header className="encabezado">
        <div>
          <h1>Agente Centinela de Inventario</h1>
          <p>Supervisión automática de stock y notificaciones por correo electrónico</p>
        </div>
        {puedeEnviar && <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => handleEnviarAlerta()}
            disabled={enviando || cargando}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Icono nombre="enviar" tamano={16} />
            {enviando ? 'Enviando alerta...' : 'Enviar Alerta a Todos'}
          </button>
        </div>}
      </header>

      {/* Banner de Remitente Oficial */}
      <div className="panel glass" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icono nombre="correo" tamano={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-texto-secundario, #64748b)' }}>Remitente oficial del sistema:</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              <code>{remitente}</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontWeight: '600',
            background: remitenteConfigurado ? '#dcfce7' : '#fef3c7',
            color: remitenteConfigurado ? '#166534' : '#92400e',
          }}>
            {remitenteConfigurado ? 'SMTP Gmail Configurado' : 'Envío de correos sin configurar'}
          </span>
          <button type="button" className="btn btn-secundario" onClick={handleVerDiseno}>
            Ver Diseño del Correo
          </button>
        </div>
      </div>

      {/* Indicadores de Stock Crítico */}
      <div className="indicadores">
        <Indicador
          etiqueta="Total Productos Críticos"
          valor={datos?.diagnostico?.totalCriticos ?? 0}
          alerta={(datos?.diagnostico?.totalCriticos ?? 0) > 0}
        />
        <Indicador
          etiqueta="Productos Agotados (Stock 0)"
          valor={datos?.diagnostico?.totalAgotados ?? 0}
          alerta={(datos?.diagnostico?.totalAgotados ?? 0) > 0}
        />
        <Indicador
          etiqueta="Próximos a agotarse"
          valor={datos?.diagnostico?.totalBajoStock ?? 0}
        />
        <Indicador
          etiqueta="Correos de prueba registrados"
          valor={destinatarios.length}
        />
      </div>

      <div className="dos-columnas" style={{ marginTop: '20px' }}>
        {/* Columna Izquierda: Formulario de Correos de Prueba */}
        <section className="panel glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Formulario de Correos de Prueba</h2>
            <Icono nombre="campana" tamano={20} />
          </div>
          {puedeGestionar && <>
          <p style={{ fontSize: '14px', color: 'var(--color-texto-secundario, #64748b)', marginTop: 0 }}>
            Agrega direcciones de correo adicionales para enviar y probar la recepción de alertas de reposición.
          </p>

          <form onSubmit={handleAgregarDestinatario} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                Correo electrónico de prueba:
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={nuevoCorreo}
                onChange={(e) => setNuevoCorreo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-borde, #cbd5e1)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                Etiqueta / Rol (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Gerente de compras, Supervisor de bodega"
                value={nuevaEtiqueta}
                onChange={(e) => setNuevaEtiqueta(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-borde, #cbd5e1)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secundario"
              disabled={!nuevoCorreo.trim() || enviando}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
            >
              <Icono nombre="mas" tamano={16} />
              Agregar a la Lista de Alertas
            </button>
          </form>
          </>}

          {/* Lista de Destinatarios */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Destinatarios de Alerta Registrados:</h3>
            {destinatarios.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>No hay correos registrados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {destinatarios.map((d) => (
                  <div
                    key={d.correo}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-borde, #e2e8f0)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{d.correo}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {d.etiqueta || 'Prueba'} • {d.correo === remitente ? 'Remitente principal' : 'Destinatario'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {puedeEnviar && <button
                        type="button"
                        className="btn-icono"
                        title={`Enviar prueba directa a ${d.correo}`}
                        onClick={() => handleEnviarAlerta(d.correo)}
                        disabled={enviando}
                        style={{ padding: '6px' }}
                      >
                        <Icono nombre="enviar" tamano={15} />
                      </button>}

                      {puedeGestionar && d.correo !== remitente && (
                        <button
                          type="button"
                          className="btn-icono btn-icono-peligro"
                          title="Eliminar correo de la lista"
                          onClick={() => handleEliminarDestinatario(d.correo)}
                          style={{ padding: '6px' }}
                        >
                          <Icono nombre="basura" tamano={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Columna Derecha: Lista de Productos Críticos en Tiempo Real */}
        <section className="panel glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Productos en Riesgo de Desabastecimiento</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{criticos.length} ítem(s)</span>
          </div>

          {criticos.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#166534', background: '#f0fdf4', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>¡Todo el inventario está en orden!</p>
              <p style={{ margin: '6px 0 0', fontSize: '13px' }}>No hay productos por debajo de su umbral mínimo.</p>
            </div>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                    <th>Pedido Sugerido</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {criticos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nombre}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>SKU: {p.sku}</div>
                      </td>
                      <td>
                        <StockBadge producto={p} />
                      </td>
                      <td>{p.stockMinimo} {p.unidad}</td>
                      <td style={{ color: '#0284c7', fontWeight: 'bold' }}>
                        +{p.sugeridoReorden} {p.unidad}
                      </td>
                      <td>{p.proveedor?.nombre || 'Sin asignar'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Previsualización del Correo */}
      {mostrarModalPreview && previewHtml && (
        <div className="modal-fondo" onClick={() => setMostrarModalPreview(false)}>
          <div
            className="modal-cuerpo glass"
            style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Previsualización del Correo</h3>
              <button
                type="button"
                className="btn-icono"
                onClick={() => setMostrarModalPreview(false)}
              >
                <Icono nombre="cerrar" tamano={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <iframe
                title="Previsualización de Correo"
                srcDoc={previewHtml}
                style={{ width: '100%', height: '550px', border: 'none' }}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secundario"
                onClick={() => setMostrarModalPreview(false)}
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
