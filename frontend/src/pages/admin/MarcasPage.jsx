import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Marcas: CRUD completo (lista, crear, editar y eliminar con confirmación) en /marcas.
const config = ENTIDADES.find((e) => e.ruta === 'marcas');

export default function MarcasPage() {
  return <EntidadPage config={config} />;
}
