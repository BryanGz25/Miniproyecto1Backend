import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Métodos de pago: CRUD completo (lista, crear, editar y eliminar con confirmación) en /metodos-pago.
const config = ENTIDADES.find((e) => e.ruta === 'metodos-pago');

export default function MetodosPagoPage() {
  return <EntidadPage config={config} />;
}
