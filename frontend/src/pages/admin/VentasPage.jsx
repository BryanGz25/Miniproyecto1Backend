import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Ventas: CRUD completo (lista, crear, editar y eliminar con confirmación) en /ventas.
const config = ENTIDADES.find((e) => e.ruta === 'ventas');

export default function VentasPage() {
  return <EntidadPage config={config} />;
}
