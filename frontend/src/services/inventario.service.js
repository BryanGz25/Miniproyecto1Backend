import { crearServicioCrud } from './api';

// Un servicio por entidad; cada uno expone listar, obtener, crear, actualizar y eliminar.
export const categoriasService = crearServicioCrud('categorias');
export const proveedoresService = crearServicioCrud('proveedores');
export const productosService = crearServicioCrud('productos');
export const movimientosService = crearServicioCrud('movimientos');
