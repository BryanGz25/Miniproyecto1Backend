import Indicador from '../components/Indicador';
import StockBadge from '../components/StockBadge';
import { useCrud } from '../hooks/useCrud';
import { movimientosService, productosService, proveedoresService } from '../services/inventario.service';
import { useAuth } from '../context/AuthContext';
import { estadoStock, formatearColones, formatearEntero, formatearFecha } from '../utils/formato';

// Lo que usa el resumen cuando el usuario no tiene permiso sobre un recurso.
const SIN_ACCESO = { listar: async () => [] };

export default function ResumenPage() {
  const { puede } = useAuth();
  const verProductos = puede('productos.ver');
  const verMovimientos = puede('movimientos.ver');
  const verProveedores = puede('proveedores.ver');
  const productos = useCrud(verProductos ? productosService : SIN_ACCESO);
  const movimientos = useCrud(verMovimientos ? movimientosService : SIN_ACCESO);
  const proveedores = useCrud(verProveedores ? proveedoresService : SIN_ACCESO);

  const valorCosto = productos.items.reduce((t, p) => t + p.stockActual * p.precioCosto, 0);
  const valorVenta = productos.items.reduce((t, p) => t + p.stockActual * p.precioVenta, 0);
  const porReponer = productos.items.filter((p) => estadoStock(p) !== 'ok');
  const ultimos = movimientos.items.slice(0, 6);
  const error = productos.error || movimientos.error || proveedores.error;

  return (
    <>
      <header className="encabezado">
        <div>
          <h1>Resumen</h1>
          <p>Estado general del inventario</p>
        </div>
      </header>

      {error && <div className="panel glass error-carga" role="alert">{error}</div>}

      <div className="indicadores">
        {verProductos && (
          <>
            <Indicador etiqueta="Valor a costo" valor={formatearColones(valorCosto)} />
            <Indicador etiqueta="Valor a precio de venta" valor={formatearColones(valorVenta)} />
            <Indicador etiqueta="Productos" valor={formatearEntero(productos.items.length)} />
          </>
        )}
        {verProveedores && <Indicador etiqueta="Proveedores activos" valor={proveedores.items.filter((p) => p.activo).length} />}
        {verProductos && <Indicador etiqueta="Por reponer o agotados" valor={porReponer.length} alerta={porReponer.length > 0} />}
      </div>

      <div className="dos-columnas">
        {verProductos && (
        <section className="panel glass">
          <h2>Productos por reponer</h2>
          {porReponer.length === 0 ? (
            <p className="secundario">Todo el stock está sobre el mínimo.</p>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {porReponer.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>
                        <StockBadge producto={p} />
                      </td>
                      <td className="secundario">{p.proveedor?.nombre ?? 'Sin proveedor'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}

        {verMovimientos && (
        <section className="panel glass">
          <h2>Últimos movimientos</h2>
          {ultimos.length === 0 ? (
            <p className="secundario">Aún no hay movimientos registrados.</p>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th className="derecha">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((m) => (
                    <tr key={m.id}>
                      <td className="secundario">{formatearFecha(m.fecha)}</td>
                      <td>{m.producto?.nombre}</td>
                      <td className="derecha">
                        <span className={`pastilla ${m.tipo === 'ENTRADA' ? 'ok' : 'alerta'}`}>
                          {(m.tipo === 'ENTRADA' ? '+' : '−') + m.cantidad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </div>
    </>
  );
}
