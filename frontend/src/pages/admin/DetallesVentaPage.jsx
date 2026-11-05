import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Detalle de ventas: CRUD completo (lista, crear, editar y eliminar con confirmación) en /detalles-venta.
const config = ENTIDADES.find((e) => e.ruta === 'detalles-venta');

export default function DetallesVentaPage() {
  return <EntidadPage config={config} />;
}
