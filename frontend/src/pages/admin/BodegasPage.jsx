import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Bodegas: CRUD completo (lista, crear, editar y eliminar con confirmación) en /bodegas.
const config = ENTIDADES.find((e) => e.ruta === 'bodegas');

export default function BodegasPage() {
  return <EntidadPage config={config} />;
}
