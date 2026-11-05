import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Ubicaciones: CRUD completo (lista, crear, editar y eliminar con confirmación) en /ubicaciones.
const config = ENTIDADES.find((e) => e.ruta === 'ubicaciones');

export default function UbicacionesPage() {
  return <EntidadPage config={config} />;
}
