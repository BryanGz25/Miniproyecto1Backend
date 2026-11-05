import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Lotes: CRUD completo (lista, crear, editar y eliminar con confirmación) en /lotes.
const config = ENTIDADES.find((e) => e.ruta === 'lotes');

export default function LotesPage() {
  return <EntidadPage config={config} />;
}
