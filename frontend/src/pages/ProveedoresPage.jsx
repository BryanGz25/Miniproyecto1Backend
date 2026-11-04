import CrudPage from '../components/CrudPage';
import ProveedorForm from '../components/forms/ProveedorForm';
import { useCrud } from '../hooks/useCrud';
import { proveedoresService } from '../services/inventario.service';

const COLUMNAS = [
  { clave: 'nombre', titulo: 'Proveedor', render: (p) => <strong style={{ fontWeight: 500 }}>{p.nombre}</strong> },
  { clave: 'identificacion', titulo: 'Identificación', render: (p) => <span className="mono">{p.identificacion}</span> },
  { clave: 'telefono', titulo: 'Teléfono' },
  { clave: 'email', titulo: 'Email', render: (p) => <span className="secundario">{p.email || '—'}</span> },
  {
    clave: 'activo',
    titulo: 'Estado',
    render: (p) => <span className={`pastilla ${p.activo ? 'ok' : 'neutra'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>,
  },
];

const BUSQUEDA = [(p) => p.nombre, (p) => p.identificacion, (p) => p.email];

export default function ProveedoresPage() {
  const crud = useCrud(proveedoresService);
  const activos = crud.items.filter((p) => p.activo).length;

  return (
    <CrudPage
      titulo="Proveedores"
      subtitulo={`${crud.items.length} proveedores, ${activos} activos`}
      entidad={{ singular: 'proveedor', articulo: 'el' }}
      crud={crud}
      columnas={COLUMNAS}
      camposBusqueda={BUSQUEDA}
      Formulario={ProveedorForm}
      describir={(p) => `el proveedor "${p.nombre}"`}
    />
  );
}
