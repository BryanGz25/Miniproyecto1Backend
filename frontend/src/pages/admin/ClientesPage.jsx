import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Clientes: CRUD completo (lista, crear, editar y eliminar con confirmación) en /clientes.
const config = ENTIDADES.find((e) => e.ruta === 'clientes');

export default function ClientesPage() {
  return <EntidadPage config={config} />;
}
