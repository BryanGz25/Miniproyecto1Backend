import { useCallback, useState } from 'react';
import CrudPage from '../components/CrudPage';
import Indicador from '../components/Indicador';
import StockBadge from '../components/StockBadge';
import ProductoForm from '../components/forms/ProductoForm';
import { useCrud } from '../hooks/useCrud';
import { useOpciones } from '../hooks/useOpciones';
import { categoriasService, productosService, proveedoresService } from '../services/inventario.service';
import { estadoStock, formatearColones, formatearEntero } from '../utils/formato';

const COLUMNAS = [
  { clave: 'sku', titulo: 'SKU', render: (p) => <span className="mono">{p.sku}</span> },
  { clave: 'nombre', titulo: 'Producto', render: (p) => <strong style={{ fontWeight: 500 }}>{p.nombre}</strong> },
  { clave: 'categoria', titulo: 'Categoría', render: (p) => p.categoria?.nombre ?? '—' },
  { clave: 'marca', titulo: 'Marca', render: (p) => <span className="secundario">{p.marca?.nombre ?? '—'}</span> },
  { clave: 'proveedor', titulo: 'Proveedor', render: (p) => <span className="secundario">{p.proveedor?.nombre ?? '—'}</span> },
  { clave: 'stock', titulo: 'Stock', render: (p) => <StockBadge producto={p} /> },
  { clave: 'precioVenta', titulo: 'Precio', clase: 'derecha', render: (p) => formatearColones(p.precioVenta) },
];

const BUSQUEDA = [(p) => p.nombre, (p) => p.sku, (p) => p.marca?.nombre];
const CATALOGOS = ['marcas', 'unidades-medida', 'impuestos'];

export default function ProductosPage() {
  const crud = useCrud(productosService);
  const categorias = useCrud(categoriasService);
  const proveedores = useCrud(proveedoresService);
  const catalogos = useOpciones(CATALOGOS);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const filtrar = useCallback((p) => !categoriaFiltro || String(p.categoriaId) === categoriaFiltro, [categoriaFiltro]);

  const valorInventario = crud.items.reduce((total, p) => total + p.stockActual * p.precioCosto, 0);
  const unidades = crud.items.reduce((total, p) => total + p.stockActual, 0);
  const porReponer = crud.items.filter((p) => estadoStock(p) !== 'ok').length;

  return (
    <CrudPage
      titulo="Productos"
      subtitulo={`${crud.items.length} productos en ${categorias.items.length} categorías`}
      entidad={{ singular: 'producto', articulo: 'el' }}
      recurso="productos"
      crud={crud}
      columnas={COLUMNAS}
      camposBusqueda={BUSQUEDA}
      filtrar={filtrar}
      Formulario={ProductoForm}
      propsFormulario={{
        categorias: categorias.items,
        proveedores: proveedores.items,
        marcas: catalogos.marcas,
        unidades: catalogos['unidades-medida'],
        impuestos: catalogos.impuestos,
      }}
      describir={(p) => `"${p.nombre}"`}
      antesDeTabla={
        <div className="indicadores">
          <Indicador etiqueta="Valor del inventario (a costo)" valor={formatearColones(valorInventario)} />
          <Indicador etiqueta="Unidades en stock" valor={formatearEntero(unidades)} />
          <Indicador etiqueta="Por reponer o agotados" valor={porReponer} alerta={porReponer > 0} />
        </div>
      }
      filtroExtra={
        <>
          <label className="sr-only" htmlFor="filtro-categoria">
            Filtrar por categoría
          </label>
          <select
            id="filtro-categoria"
            className="campo campo-filtro"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </>
      }
    />
  );
}
