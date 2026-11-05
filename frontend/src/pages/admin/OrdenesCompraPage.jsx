import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Órdenes de compra: CRUD completo (lista, crear, editar y eliminar con confirmación) en /ordenes-compra.
const config = ENTIDADES.find((e) => e.ruta === 'ordenes-compra');

export default function OrdenesCompraPage() {
  return <EntidadPage config={config} />;
}
