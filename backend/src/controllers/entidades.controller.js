// CRUD de las 15 entidades agregadas para la administración (catálogos, bodegas, compras, ventas y personal).
// Cada entrada describe sus campos; crudFactory arma la validación y los 5 endpoints.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

const ESTADOS_ORDEN = ['BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA'];
const ESTADOS_VENTA = ['PENDIENTE', 'PAGADA', 'ANULADA'];

// Datos relacionados que se devuelven junto a cada registro (solo los necesarios para mostrar).
const PRODUCTO = { model: m.Producto, as: 'producto', attributes: ['id', 'sku', 'nombre'] };
const PROVEEDOR = { model: m.Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };
const BODEGA = { model: m.Bodega, as: 'bodega', attributes: ['id', 'nombre'] };
const USUARIO = { model: m.Usuario, as: 'usuario', attributes: ['id', 'nombre'] };

// El usuario del token queda registrado como responsable del documento.
const responsable = (req) => ({ usuarioId: req.usuario.id });

const ENTIDADES = {
  // ---------- Catálogos de producto ----------
  marcas: {
    modelo: m.Marca,
    entidad: { singular: 'marca', articulo: 'la' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 80 },
      paisOrigen: { tipo: 'texto', max: 60 },
    },
  },
  'unidades-medida': {
    modelo: m.UnidadMedida,
    entidad: { singular: 'unidad de medida', articulo: 'la' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 40 },
      abreviatura: { tipo: 'texto', requerido: true, max: 10 },
    },
  },
  impuestos: {
    modelo: m.Impuesto,
    entidad: { singular: 'impuesto', articulo: 'el' },
    orden: [['porcentaje', 'DESC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 60 },
      porcentaje: { tipo: 'decimal', requerido: true, min: 0, max: 100 },
      activo: { tipo: 'booleano' },
    },
  },

  // ---------- Bodegas e inventario ----------
  bodegas: {
    modelo: m.Bodega,
    entidad: { singular: 'bodega', articulo: 'la' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 80 },
      direccion: { tipo: 'texto', max: 255 },
      telefono: { tipo: 'telefono' },
      activa: { tipo: 'booleano' },
    },
  },
  ubicaciones: {
    modelo: m.Ubicacion,
    entidad: { singular: 'ubicación', articulo: 'la' },
    incluir: [BODEGA],
    orden: [['codigo', 'ASC']],
    campos: {
      bodegaId: { tipo: 'fk', requerido: true, modelo: 'Bodega', etiqueta: 'la bodega' },
      codigo: { tipo: 'texto', requerido: true, max: 30, mayusculas: true },
      descripcion: { tipo: 'texto', max: 255 },
    },
  },
  lotes: {
    modelo: m.Lote,
    entidad: { singular: 'lote', articulo: 'el' },
    incluir: [PRODUCTO],
    orden: [['fechaVencimiento', 'ASC']],
    campos: {
      productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
      codigo: { tipo: 'texto', requerido: true, max: 40, mayusculas: true },
      fechaVencimiento: { tipo: 'fecha' },
      cantidad: { tipo: 'entero', requerido: true, min: 0 },
    },
  },

  // ---------- Compras ----------
  'contactos-proveedor': {
    modelo: m.ContactoProveedor,
    entidad: { singular: 'contacto', articulo: 'el' },
    incluir: [PROVEEDOR],
    orden: [['nombre', 'ASC']],
    campos: {
      proveedorId: { tipo: 'fk', requerido: true, modelo: 'Proveedor', etiqueta: 'el proveedor' },
      nombre: { tipo: 'texto', requerido: true, max: 100 },
      cargo: { tipo: 'texto', max: 60 },
      telefono: { tipo: 'telefono' },
      email: { tipo: 'email' },
    },
  },
  'ordenes-compra': {
    modelo: m.OrdenCompra,
    entidad: { singular: 'orden de compra', articulo: 'la' },
    incluir: [PROVEEDOR, BODEGA, USUARIO],
    orden: [['fecha', 'DESC']],
    alCrear: responsable,
    campos: {
      numero: { tipo: 'texto', requerido: true, max: 20, mayusculas: true },
      proveedorId: { tipo: 'fk', requerido: true, modelo: 'Proveedor', etiqueta: 'el proveedor' },
      bodegaId: { tipo: 'fk', requerido: true, modelo: 'Bodega', etiqueta: 'la bodega' },
      fecha: { tipo: 'fechaHora' },
      estado: { tipo: 'enum', valores: ESTADOS_ORDEN },
      observaciones: { tipo: 'texto', max: 255 },
    },
  },
  'detalles-orden-compra': {
    modelo: m.DetalleOrdenCompra,
    entidad: { singular: 'línea de orden', articulo: 'la' },
    incluir: [{ model: m.OrdenCompra, as: 'ordenCompra', attributes: ['id', 'numero'] }, PRODUCTO],
    campos: {
      ordenCompraId: { tipo: 'fk', requerido: true, modelo: 'OrdenCompra', etiqueta: 'la orden de compra' },
      productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
      cantidad: { tipo: 'entero', requerido: true, min: 1 },
      costoUnitario: { tipo: 'decimal', requerido: true, min: 0 },
    },
  },

  // ---------- Ventas ----------
  clientes: {
    modelo: m.Cliente,
    entidad: { singular: 'cliente', articulo: 'el' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 120 },
      identificacion: { tipo: 'texto', requerido: true, max: 20 },
      telefono: { tipo: 'telefono' },
      email: { tipo: 'email' },
      direccion: { tipo: 'texto', max: 255 },
    },
  },
  'metodos-pago': {
    modelo: m.MetodoPago,
    entidad: { singular: 'método de pago', articulo: 'el' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 40 },
      activo: { tipo: 'booleano' },
    },
  },
  ventas: {
    modelo: m.Venta,
    entidad: { singular: 'venta', articulo: 'la' },
    incluir: [
      { model: m.Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
      { model: m.MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
      USUARIO,
    ],
    orden: [['fecha', 'DESC']],
    alCrear: responsable,
    campos: {
      numero: { tipo: 'texto', requerido: true, max: 20, mayusculas: true },
      clienteId: { tipo: 'fk', requerido: true, modelo: 'Cliente', etiqueta: 'el cliente' },
      metodoPagoId: { tipo: 'fk', requerido: true, modelo: 'MetodoPago', etiqueta: 'el método de pago' },
      fecha: { tipo: 'fechaHora' },
      estado: { tipo: 'enum', valores: ESTADOS_VENTA },
      observaciones: { tipo: 'texto', max: 255 },
    },
  },
  'detalles-venta': {
    modelo: m.DetalleVenta,
    entidad: { singular: 'línea de venta', articulo: 'la' },
    incluir: [{ model: m.Venta, as: 'venta', attributes: ['id', 'numero'] }, PRODUCTO],
    campos: {
      ventaId: { tipo: 'fk', requerido: true, modelo: 'Venta', etiqueta: 'la venta' },
      productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
      cantidad: { tipo: 'entero', requerido: true, min: 1 },
      precioUnitario: { tipo: 'decimal', requerido: true, min: 0 },
      descuento: { tipo: 'decimal', min: 0, max: 100, defecto: 0 },
    },
  },

  // ---------- Personal ----------
  departamentos: {
    modelo: m.Departamento,
    entidad: { singular: 'departamento', articulo: 'el' },
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 80 },
      descripcion: { tipo: 'texto', max: 255 },
    },
  },
  empleados: {
    modelo: m.Empleado,
    entidad: { singular: 'empleado', articulo: 'el' },
    incluir: [{ model: m.Departamento, as: 'departamento', attributes: ['id', 'nombre'] }, { ...USUARIO, attributes: ['id', 'nombre', 'correo'] }],
    orden: [['nombre', 'ASC']],
    campos: {
      nombre: { tipo: 'texto', requerido: true, max: 120 },
      identificacion: { tipo: 'texto', requerido: true, max: 20 },
      departamentoId: { tipo: 'fk', requerido: true, modelo: 'Departamento', etiqueta: 'el departamento' },
      usuarioId: { tipo: 'fk', modelo: 'Usuario', etiqueta: 'el usuario' },
      puesto: { tipo: 'texto', max: 80 },
      fechaIngreso: { tipo: 'fecha' },
      salario: { tipo: 'decimal', min: 0 },
      activo: { tipo: 'booleano' },
    },
  },
};

module.exports = Object.fromEntries(Object.entries(ENTIDADES).map(([recurso, config]) => [recurso, crearControladorCrud(config)]));
