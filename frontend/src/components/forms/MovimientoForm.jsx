import Campo from '../Campo';
import FormBase from '../FormBase';
import { aNumero, useFormulario } from '../../hooks/useFormulario';
import { aInputFecha } from '../../utils/formato';

export const TIPOS_MOVIMIENTO = [
  { valor: 'ENTRADA', texto: 'Entrada (compra, devolución)' },
  { valor: 'SALIDA', texto: 'Salida (venta, consumo)' },
  { valor: 'AJUSTE', texto: 'Ajuste (merma, daño, pérdida)' },
];

const validar = (v) => {
  const errores = [];
  if (!v.productoId) errores.push('Selecciona un producto.');
  if (!v.cantidad || Number(v.cantidad) <= 0) errores.push('La cantidad debe ser mayor que 0.');
  return errores;
};

const convertir = (v) => ({
  productoId: aNumero(v.productoId),
  tipo: v.tipo,
  cantidad: aNumero(v.cantidad),
  costoUnitario: aNumero(v.costoUnitario),
  motivo: v.motivo,
  fecha: v.fecha,
});

export default function MovimientoForm({ inicial, onGuardar, onCancelar, textoGuardar, productos }) {
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    {
      productoId: inicial.productoId ? String(inicial.productoId) : '',
      tipo: inicial.tipo ?? 'ENTRADA',
      cantidad: inicial.cantidad ? String(inicial.cantidad) : '',
      costoUnitario: inicial.costoUnitario != null ? String(inicial.costoUnitario) : '',
      motivo: inicial.motivo ?? '',
      fecha: aInputFecha(inicial.fecha),
    },
    { validar, convertir },
  );

  const seleccionado = productos.find((p) => String(p.id) === valores.productoId);

  return (
    <FormBase errores={errores} enviando={enviando} onSubmit={enviar(onGuardar)} onCancelar={onCancelar} textoGuardar={textoGuardar}>
      <Campo etiqueta="Producto" requerido completo ayuda={seleccionado ? `Stock actual: ${seleccionado.stockActual}` : undefined}>
        {(id) => (
          <select id={id} name="productoId" className="campo" value={valores.productoId} onChange={cambiar}>
            <option value="">Selecciona…</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} · {p.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Tipo" requerido>
        {(id) => (
          <select id={id} name="tipo" className="campo" value={valores.tipo} onChange={cambiar}>
            {TIPOS_MOVIMIENTO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.texto}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Cantidad" requerido>
        {(id) => <input id={id} name="cantidad" type="number" min="1" step="1" className="campo" value={valores.cantidad} onChange={cambiar} placeholder="10" />}
      </Campo>
      <Campo etiqueta="Costo unitario (₡)">
        {(id) => <input id={id} name="costoUnitario" type="number" min="0" step="0.01" className="campo" value={valores.costoUnitario} onChange={cambiar} />}
      </Campo>
      <Campo etiqueta="Fecha">
        {(id) => <input id={id} name="fecha" type="datetime-local" className="campo" value={valores.fecha} onChange={cambiar} />}
      </Campo>
      <Campo etiqueta="Motivo" completo>
        {(id) => <input id={id} name="motivo" className="campo" maxLength={255} value={valores.motivo} onChange={cambiar} placeholder="Compra factura #1234" />}
      </Campo>
    </FormBase>
  );
}
