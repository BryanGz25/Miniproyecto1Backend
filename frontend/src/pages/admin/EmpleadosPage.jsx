import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Empleados: CRUD completo (lista, crear, editar y eliminar con confirmación) en /empleados.
const config = ENTIDADES.find((e) => e.ruta === 'empleados');

export default function EmpleadosPage() {
  return <EntidadPage config={config} />;
}
