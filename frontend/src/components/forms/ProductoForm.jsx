import Campo from '../Campo';
import FormBase from '../FormBase';
import { aNumero, useFormulario } from '../../hooks/useFormulario';

const validar = (v) => {
  const errores = [];
  if (!v.sku.trim()) errores.push('El SKU es obligatorio.');
  if (!v.nombre.trim()) errores.push('El nombre es obligatorio.');
  if (v.precioCosto === '') errores.push('El precio de costo es obligatorio.');
  if (v.precioVenta === '') errores.push('El precio de venta es obligatorio.');
  if (!v.categoriaId) errores.push('Selecciona una categoría.');
  return errores;
};

const convertir = (v) => ({
  sku: v.sku,
  nombre: v.nombre,
  descripcion: v.descripcion,
  precioCosto: aNumero(v.precioCosto),
  precioVenta: aNumero(v.precioVenta),
  stockActual: aNumero(v.stockActual) ?? 0,
  stockMinimo: aNumero(v.stockMinimo) ?? 0,
  categoriaId: aNumero(v.categoriaId),
  proveedorId: aNumero(v.proveedorId),
  activo: v.activo,
});

const texto = (valor) => (valor === null || valor === undefined ? '' : String(valor));

export default function ProductoForm({ inicial, onGuardar, onCancelar, textoGuardar, categorias, proveedores }) {
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    {
      sku: inicial.sku ?? '',
      nombre: inicial.nombre ?? '',
      descripcion: inicial.descripcion ?? '',
      precioCosto: texto(inicial.precioCosto),
      precioVenta: texto(inicial.precioVenta),
      stockActual: texto(inicial.stockActual ?? 0),
      stockMinimo: texto(inicial.stockMinimo ?? 0),
      categoriaId: texto(inicial.categoriaId),
      proveedorId: texto(inicial.proveedorId),
      activo: inicial.activo ?? true,
    },
    { validar, convertir },
  );

  return (
    <FormBase errores={errores} enviando={enviando} onSubmit={enviar(onGuardar)} onCancelar={onCancelar} textoGuardar={textoGuardar}>
      <Campo etiqueta="SKU" requerido ayuda="Código interno; se guarda en mayúsculas">
        {(id) => <input id={id} name="sku" className="campo" maxLength={30} value={valores.sku} onChange={cambiar} placeholder="BEB-001" />}
      </Campo>
      <Campo etiqueta="Categoría" requerido>
        {(id) => (
          <select id={id} name="categoriaId" className="campo" value={valores.categoriaId} onChange={cambiar}>
            <option value="">Selecciona…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Nombre" requerido completo>
        {(id) => <input id={id} name="nombre" className="campo" maxLength={120} value={valores.nombre} onChange={cambiar} placeholder="Agua 600 ml" />}
      </Campo>
      <Campo etiqueta="Proveedor" completo>
        {(id) => (
          <select id={id} name="proveedorId" className="campo" value={valores.proveedorId} onChange={cambiar}>
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Precio de costo (₡)" requerido>
        {(id) => <input id={id} name="precioCosto" type="number" min="0" step="0.01" className="campo" value={valores.precioCosto} onChange={cambiar} placeholder="250" />}
      </Campo>
      <Campo etiqueta="Precio de venta (₡)" requerido>
        {(id) => <input id={id} name="precioVenta" type="number" min="0" step="0.01" className="campo" value={valores.precioVenta} onChange={cambiar} placeholder="450" />}
      </Campo>
      <Campo etiqueta="Stock actual" ayuda="Para cambios del día a día usa Movimientos">
        {(id) => <input id={id} name="stockActual" type="number" min="0" step="1" className="campo" value={valores.stockActual} onChange={cambiar} />}
      </Campo>
      <Campo etiqueta="Stock mínimo" ayuda="Debajo de este número se marca para reponer">
        {(id) => <input id={id} name="stockMinimo" type="number" min="0" step="1" className="campo" value={valores.stockMinimo} onChange={cambiar} />}
      </Campo>
      <Campo etiqueta="Descripción" completo>
        {(id) => <input id={id} name="descripcion" className="campo" maxLength={255} value={valores.descripcion} onChange={cambiar} />}
      </Campo>
      <div className="completo">
        <label className="check">
          <input type="checkbox" name="activo" checked={valores.activo} onChange={cambiar} />
          Producto activo
        </label>
      </div>
    </FormBase>
  );
}
