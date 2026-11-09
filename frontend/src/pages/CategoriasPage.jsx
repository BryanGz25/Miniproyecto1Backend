import CrudPage from '../components/CrudPage';
import CategoriaForm from '../components/forms/CategoriaForm';
import { useCrud } from '../hooks/useCrud';
import { categoriasService } from '../services/inventario.service';
import { formatearFecha } from '../utils/formato';

const COLUMNAS = [
  { clave: 'nombre', titulo: 'Nombre', render: (c) => <strong style={{ fontWeight: 500 }}>{c.nombre}</strong> },
  { clave: 'descripcion', titulo: 'Descripción', render: (c) => <span className="secundario">{c.descripcion || '—'}</span> },
  { clave: 'createdAt', titulo: 'Creada', render: (c) => <span className="secundario">{formatearFecha(c.createdAt)}</span> },
];

const BUSQUEDA = [(c) => c.nombre, (c) => c.descripcion];

export default function CategoriasPage() {
  const crud = useCrud(categoriasService);

  return (
    <CrudPage
      titulo="Categorías"
      subtitulo={`${crud.items.length} categorías para clasificar productos`}
      entidad={{ singular: 'categoría', articulo: 'la' }}
      recurso="categorias"
      crud={crud}
      columnas={COLUMNAS}
      camposBusqueda={BUSQUEDA}
      Formulario={CategoriaForm}
      describir={(c) => `la categoría "${c.nombre}"`}
    />
  );
}
