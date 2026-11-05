import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Usuarios: CRUD completo (lista, crear, editar y eliminar con confirmación) en /usuarios.
const config = ENTIDADES.find((e) => e.ruta === 'usuarios');

export default function UsuariosPage() {
  return <EntidadPage config={config} />;
}
