import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Departamentos: CRUD completo (lista, crear, editar y eliminar con confirmación) en /departamentos.
const config = ENTIDADES.find((e) => e.ruta === 'departamentos');

export default function DepartamentosPage() {
  return <EntidadPage config={config} />;
}
