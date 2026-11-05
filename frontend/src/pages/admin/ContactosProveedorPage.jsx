import EntidadPage from '../../components/EntidadPage';
import { ENTIDADES } from '../../config/entidades';

// Contactos de proveedor: CRUD completo (lista, crear, editar y eliminar con confirmación) en /contactos-proveedor.
const config = ENTIDADES.find((e) => e.ruta === 'contactos-proveedor');

export default function ContactosProveedorPage() {
  return <EntidadPage config={config} />;
}
