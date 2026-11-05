import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Detalle de órdenes de compra: CRUD completo (lista, crear, editar y eliminar con confirmación) en /detalles-orden-compra.
const config = ENTIDADES.find((e) => e.ruta === 'detalles-orden-compra');

export default function DetallesOrdenCompraPage() {
  return <EntidadPage config={config} />;
}
