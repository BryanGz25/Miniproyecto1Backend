import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Impuestos: CRUD completo (lista, crear, editar y eliminar con confirmación) en /impuestos.
const config = ENTIDADES.find((e) => e.ruta === 'impuestos');

export default function ImpuestosPage() {
  return <EntidadPage config={config} />;
}
