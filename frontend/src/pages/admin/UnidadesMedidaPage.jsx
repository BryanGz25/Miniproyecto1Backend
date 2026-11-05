import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Unidades de medida: CRUD completo (lista, crear, editar y eliminar con confirmación) en /unidades-medida.
const config = ENTIDADES.find((e) => e.ruta === 'unidades-medida');

export default function UnidadesMedidaPage() {
  return <EntidadPage config={config} />;
}
