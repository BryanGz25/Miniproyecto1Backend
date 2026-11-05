// Vistas de administración: una por entidad, indexadas por su ruta.
import MarcasPage from './MarcasPage';
import UnidadesMedidaPage from './UnidadesMedidaPage';
import ImpuestosPage from './ImpuestosPage';
import LotesPage from './LotesPage';
import BodegasPage from './BodegasPage';
import UbicacionesPage from './UbicacionesPage';
import ContactosProveedorPage from './ContactosProveedorPage';
import OrdenesCompraPage from './OrdenesCompraPage';
import DetallesOrdenCompraPage from './DetallesOrdenCompraPage';
import ClientesPage from './ClientesPage';
import MetodosPagoPage from './MetodosPagoPage';
import VentasPage from './VentasPage';
import DetallesVentaPage from './DetallesVentaPage';
import DepartamentosPage from './DepartamentosPage';
import EmpleadosPage from './EmpleadosPage';
import UsuariosPage from './UsuariosPage';

export const PAGINAS_ADMIN = {
  'marcas': MarcasPage,
  'unidades-medida': UnidadesMedidaPage,
  'impuestos': ImpuestosPage,
  'lotes': LotesPage,
  'bodegas': BodegasPage,
  'ubicaciones': UbicacionesPage,
  'contactos-proveedor': ContactosProveedorPage,
  'ordenes-compra': OrdenesCompraPage,
  'detalles-orden-compra': DetallesOrdenCompraPage,
  'clientes': ClientesPage,
  'metodos-pago': MetodosPagoPage,
  'ventas': VentasPage,
  'detalles-venta': DetallesVentaPage,
  'departamentos': DepartamentosPage,
  'empleados': EmpleadosPage,
  'usuarios': UsuariosPage,
};
