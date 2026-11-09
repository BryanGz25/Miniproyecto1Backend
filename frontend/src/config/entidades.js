// Configuración de las 16 pantallas de administración que usan EntidadPage
// (las 15 entidades nuevas + usuarios). Cada una describe su tabla y su formulario;
// los campos y reglas coinciden con la validación del backend.
//
// Columnas: { clave, titulo, tipo: texto|mono|colones|porcentaje|entero|fecha|fechaHora|bool|estado|relacion, ruta? }
// Campos:   { nombre, etiqueta, tipo: texto|email|telefono|entero|decimal|booleano|fecha|fechaHora|enum|fk|password,
//             requerido?, max?, min?, valores?, recurso? (fk), opcion? (fk), completo?, ayuda?, placeholder? }

const nombre = (x) => x.nombre;
const producto = (p) => `${p.sku} · ${p.nombre}`;

export const ESTADOS_ORDEN = ['BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA'];
export const ESTADOS_VENTA = ['PENDIENTE', 'PAGADA', 'ANULADA'];

export const ENTIDADES = [
  // ---------- Inventario ----------
  {
    ruta: 'marcas',
    titulo: 'Marcas',
    subtitulo: 'Marcas comerciales de los productos',
    grupo: 'Inventario',
    icono: 'estrella',
    entidad: { singular: 'marca', articulo: 'la' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Marca', tipo: 'fuerte' },
      { clave: 'paisOrigen', titulo: 'País de origen' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 80, completo: true, placeholder: 'La Finca' },
      { nombre: 'paisOrigen', etiqueta: 'País de origen', tipo: 'texto', max: 60, completo: true, placeholder: 'Costa Rica' },
    ],
  },
  {
    ruta: 'unidades-medida',
    titulo: 'Unidades de medida',
    subtitulo: 'Cómo se cuentan los productos (unidad, kilo, litro…)',
    grupo: 'Inventario',
    icono: 'regla',
    entidad: { singular: 'unidad de medida', articulo: 'la' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Unidad', tipo: 'fuerte' },
      { clave: 'abreviatura', titulo: 'Abreviatura', tipo: 'mono' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 40, placeholder: 'Kilogramo' },
      { nombre: 'abreviatura', etiqueta: 'Abreviatura', tipo: 'texto', requerido: true, max: 10, placeholder: 'KG' },
    ],
  },
  {
    ruta: 'impuestos',
    titulo: 'Impuestos',
    subtitulo: 'Tarifas que se aplican a los productos',
    grupo: 'Inventario',
    icono: 'porcentaje',
    entidad: { singular: 'impuesto', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Impuesto', tipo: 'fuerte' },
      { clave: 'porcentaje', titulo: 'Tarifa', tipo: 'porcentaje' },
      { clave: 'activo', titulo: 'Estado', tipo: 'bool' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'IVA general' },
      { nombre: 'porcentaje', etiqueta: 'Porcentaje (%)', tipo: 'decimal', requerido: true, min: 0, max: 100, placeholder: '13' },
      { nombre: 'activo', etiqueta: 'Impuesto activo', tipo: 'booleano' },
    ],
  },
  {
    ruta: 'lotes',
    titulo: 'Lotes',
    subtitulo: 'Lotes de producto y su fecha de vencimiento',
    grupo: 'Inventario',
    icono: 'calendario',
    entidad: { singular: 'lote', articulo: 'el' },
    titular: 'codigo',
    columnas: [
      { clave: 'codigo', titulo: 'Lote', tipo: 'mono' },
      { clave: 'producto', titulo: 'Producto', tipo: 'relacion', mostrar: producto },
      { clave: 'fechaVencimiento', titulo: 'Vence', tipo: 'vencimiento' },
      { clave: 'cantidad', titulo: 'Cantidad', tipo: 'entero' },
    ],
    campos: [
      { nombre: 'productoId', etiqueta: 'Producto', tipo: 'fk', requerido: true, recurso: 'productos', opcion: producto, completo: true },
      { nombre: 'codigo', etiqueta: 'Código de lote', tipo: 'texto', requerido: true, max: 40, placeholder: 'L2611-A' },
      { nombre: 'fechaVencimiento', etiqueta: 'Fecha de vencimiento', tipo: 'fecha' },
      { nombre: 'cantidad', etiqueta: 'Cantidad', tipo: 'entero', requerido: true, min: 0 },
    ],
  },

  // ---------- Bodegas ----------
  {
    ruta: 'bodegas',
    titulo: 'Bodegas',
    subtitulo: 'Almacenes físicos de la empresa',
    grupo: 'Bodegas',
    icono: 'almacen',
    entidad: { singular: 'bodega', articulo: 'la' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Bodega', tipo: 'fuerte' },
      { clave: 'direccion', titulo: 'Dirección' },
      { clave: 'telefono', titulo: 'Teléfono' },
      { clave: 'activa', titulo: 'Estado', tipo: 'bool', textos: ['Activa', 'Inactiva'] },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 80, completo: true, placeholder: 'Bodega Central' },
      { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'texto', max: 255, completo: true },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono', placeholder: '+506 2290-1000' },
      { nombre: 'activa', etiqueta: 'Bodega activa', tipo: 'booleano' },
    ],
  },
  {
    ruta: 'ubicaciones',
    titulo: 'Ubicaciones',
    subtitulo: 'Pasillos y estantes dentro de cada bodega',
    grupo: 'Bodegas',
    icono: 'pin',
    entidad: { singular: 'ubicación', articulo: 'la' },
    titular: 'codigo',
    columnas: [
      { clave: 'codigo', titulo: 'Código', tipo: 'mono' },
      { clave: 'bodega', titulo: 'Bodega', tipo: 'relacion', mostrar: nombre },
      { clave: 'descripcion', titulo: 'Descripción' },
    ],
    campos: [
      { nombre: 'bodegaId', etiqueta: 'Bodega', tipo: 'fk', requerido: true, recurso: 'bodegas', opcion: nombre },
      { nombre: 'codigo', etiqueta: 'Código', tipo: 'texto', requerido: true, max: 30, placeholder: 'A-01', ayuda: 'Único dentro de la bodega' },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', max: 255, completo: true },
    ],
  },

  // ---------- Compras ----------
  {
    ruta: 'contactos-proveedor',
    titulo: 'Contactos de proveedor',
    subtitulo: 'Personas con quienes se coordina cada proveedor',
    grupo: 'Compras',
    icono: 'contacto',
    entidad: { singular: 'contacto', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Contacto', tipo: 'fuerte' },
      { clave: 'proveedor', titulo: 'Proveedor', tipo: 'relacion', mostrar: nombre },
      { clave: 'cargo', titulo: 'Cargo' },
      { clave: 'telefono', titulo: 'Teléfono' },
      { clave: 'email', titulo: 'Email' },
    ],
    campos: [
      { nombre: 'proveedorId', etiqueta: 'Proveedor', tipo: 'fk', requerido: true, recurso: 'proveedores', opcion: nombre, completo: true },
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 100 },
      { nombre: 'cargo', etiqueta: 'Cargo', tipo: 'texto', max: 60 },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono' },
      { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
    ],
  },
  {
    ruta: 'ordenes-compra',
    titulo: 'Órdenes de compra',
    subtitulo: 'Pedidos de mercadería a proveedores',
    grupo: 'Compras',
    icono: 'documento',
    entidad: { singular: 'orden de compra', articulo: 'la' },
    titular: 'numero',
    columnas: [
      { clave: 'numero', titulo: 'Número', tipo: 'mono' },
      { clave: 'fecha', titulo: 'Fecha', tipo: 'fechaHora' },
      { clave: 'proveedor', titulo: 'Proveedor', tipo: 'relacion', mostrar: nombre },
      { clave: 'bodega', titulo: 'Bodega destino', tipo: 'relacion', mostrar: nombre },
      { clave: 'estado', titulo: 'Estado', tipo: 'estado' },
      { clave: 'usuario', titulo: 'Registró', tipo: 'relacion', mostrar: nombre },
    ],
    campos: [
      { nombre: 'numero', etiqueta: 'Número', tipo: 'texto', requerido: true, max: 20, placeholder: 'OC-0003' },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'enum', valores: ESTADOS_ORDEN },
      { nombre: 'proveedorId', etiqueta: 'Proveedor', tipo: 'fk', requerido: true, recurso: 'proveedores', opcion: nombre },
      { nombre: 'bodegaId', etiqueta: 'Bodega destino', tipo: 'fk', requerido: true, recurso: 'bodegas', opcion: nombre },
      { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'fechaHora' },
      { nombre: 'observaciones', etiqueta: 'Observaciones', tipo: 'texto', max: 255, completo: true },
    ],
  },
  {
    ruta: 'detalles-orden-compra',
    titulo: 'Detalle de órdenes de compra',
    subtitulo: 'Productos, cantidades y costos de cada orden',
    grupo: 'Compras',
    icono: 'lista',
    entidad: { singular: 'línea de orden', articulo: 'la' },
    describir: (d) => `${d.cantidad} × ${d.producto?.nombre} de la orden ${d.ordenCompra?.numero}`,
    columnas: [
      { clave: 'ordenCompra', titulo: 'Orden', tipo: 'relacion', mostrar: (o) => o.numero, mono: true },
      { clave: 'producto', titulo: 'Producto', tipo: 'relacion', mostrar: producto },
      { clave: 'cantidad', titulo: 'Cantidad', tipo: 'entero' },
      { clave: 'costoUnitario', titulo: 'Costo unit.', tipo: 'colones' },
      { clave: 'subtotal', titulo: 'Subtotal', tipo: 'colones', calcular: (d) => d.cantidad * d.costoUnitario },
    ],
    campos: [
      { nombre: 'ordenCompraId', etiqueta: 'Orden de compra', tipo: 'fk', requerido: true, recurso: 'ordenes-compra', opcion: (o) => `${o.numero} · ${o.proveedor?.nombre ?? ''}`, completo: true },
      { nombre: 'productoId', etiqueta: 'Producto', tipo: 'fk', requerido: true, recurso: 'productos', opcion: producto, completo: true },
      { nombre: 'cantidad', etiqueta: 'Cantidad', tipo: 'entero', requerido: true, min: 1 },
      { nombre: 'costoUnitario', etiqueta: 'Costo unitario (₡)', tipo: 'decimal', requerido: true, min: 0 },
    ],
  },

  // ---------- Ventas ----------
  {
    ruta: 'clientes',
    titulo: 'Clientes',
    subtitulo: 'Personas y empresas que compran',
    grupo: 'Ventas',
    icono: 'persona',
    entidad: { singular: 'cliente', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Cliente', tipo: 'fuerte' },
      { clave: 'identificacion', titulo: 'Identificación', tipo: 'mono' },
      { clave: 'telefono', titulo: 'Teléfono' },
      { clave: 'email', titulo: 'Email' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre o razón social', tipo: 'texto', requerido: true, max: 120, completo: true },
      { nombre: 'identificacion', etiqueta: 'Identificación', tipo: 'texto', requerido: true, max: 20, placeholder: '3-101-123456' },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono' },
      { nombre: 'email', etiqueta: 'Email', tipo: 'email', completo: true },
      { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'texto', max: 255, completo: true },
    ],
  },
  {
    ruta: 'metodos-pago',
    titulo: 'Métodos de pago',
    subtitulo: 'Formas de pago aceptadas',
    grupo: 'Ventas',
    icono: 'tarjeta',
    entidad: { singular: 'método de pago', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Método', tipo: 'fuerte' },
      { clave: 'activo', titulo: 'Estado', tipo: 'bool' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 40, completo: true, placeholder: 'SINPE Móvil' },
      { nombre: 'activo', etiqueta: 'Método activo', tipo: 'booleano' },
    ],
  },
  {
    ruta: 'ventas',
    titulo: 'Ventas',
    subtitulo: 'Facturas de venta a clientes',
    grupo: 'Ventas',
    icono: 'recibo',
    entidad: { singular: 'venta', articulo: 'la' },
    titular: 'numero',
    columnas: [
      { clave: 'numero', titulo: 'Factura', tipo: 'mono' },
      { clave: 'fecha', titulo: 'Fecha', tipo: 'fechaHora' },
      { clave: 'cliente', titulo: 'Cliente', tipo: 'relacion', mostrar: nombre },
      { clave: 'metodoPago', titulo: 'Pago', tipo: 'relacion', mostrar: nombre },
      { clave: 'estado', titulo: 'Estado', tipo: 'estado' },
      { clave: 'usuario', titulo: 'Registró', tipo: 'relacion', mostrar: nombre },
    ],
    campos: [
      { nombre: 'numero', etiqueta: 'Número de factura', tipo: 'texto', requerido: true, max: 20, placeholder: 'FV-0004' },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'enum', valores: ESTADOS_VENTA },
      { nombre: 'clienteId', etiqueta: 'Cliente', tipo: 'fk', requerido: true, recurso: 'clientes', opcion: nombre },
      { nombre: 'metodoPagoId', etiqueta: 'Método de pago', tipo: 'fk', requerido: true, recurso: 'metodos-pago', opcion: nombre },
      { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'fechaHora' },
      { nombre: 'observaciones', etiqueta: 'Observaciones', tipo: 'texto', max: 255, completo: true },
    ],
  },
  {
    ruta: 'detalles-venta',
    titulo: 'Detalle de ventas',
    subtitulo: 'Productos, cantidades y precios de cada factura',
    grupo: 'Ventas',
    icono: 'lista',
    entidad: { singular: 'línea de venta', articulo: 'la' },
    describir: (d) => `${d.cantidad} × ${d.producto?.nombre} de la factura ${d.venta?.numero}`,
    columnas: [
      { clave: 'venta', titulo: 'Factura', tipo: 'relacion', mostrar: (v) => v.numero, mono: true },
      { clave: 'producto', titulo: 'Producto', tipo: 'relacion', mostrar: producto },
      { clave: 'cantidad', titulo: 'Cantidad', tipo: 'entero' },
      { clave: 'precioUnitario', titulo: 'Precio', tipo: 'colones' },
      { clave: 'descuento', titulo: 'Desc.', tipo: 'porcentaje' },
      { clave: 'total', titulo: 'Total', tipo: 'colones', calcular: (d) => d.cantidad * d.precioUnitario * (1 - d.descuento / 100) },
    ],
    campos: [
      { nombre: 'ventaId', etiqueta: 'Factura', tipo: 'fk', requerido: true, recurso: 'ventas', opcion: (v) => `${v.numero} · ${v.cliente?.nombre ?? ''}`, completo: true },
      { nombre: 'productoId', etiqueta: 'Producto', tipo: 'fk', requerido: true, recurso: 'productos', opcion: producto, completo: true },
      { nombre: 'cantidad', etiqueta: 'Cantidad', tipo: 'entero', requerido: true, min: 1 },
      { nombre: 'precioUnitario', etiqueta: 'Precio unitario (₡)', tipo: 'decimal', requerido: true, min: 0 },
      { nombre: 'descuento', etiqueta: 'Descuento (%)', tipo: 'decimal', min: 0, max: 100, placeholder: '0' },
    ],
  },

  // ---------- Personal ----------
  {
    ruta: 'departamentos',
    titulo: 'Departamentos',
    subtitulo: 'Áreas internas de la empresa',
    grupo: 'Personal',
    icono: 'edificio',
    entidad: { singular: 'departamento', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Departamento', tipo: 'fuerte' },
      { clave: 'descripcion', titulo: 'Descripción' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 80, completo: true },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', max: 255, completo: true },
    ],
  },
  {
    ruta: 'empleados',
    titulo: 'Empleados',
    subtitulo: 'Personal y su usuario en el sistema',
    grupo: 'Personal',
    icono: 'persona',
    entidad: { singular: 'empleado', articulo: 'el' },
    titular: 'nombre',
    columnas: [
      { clave: 'nombre', titulo: 'Empleado', tipo: 'fuerte' },
      { clave: 'departamento', titulo: 'Departamento', tipo: 'relacion', mostrar: nombre },
      { clave: 'puesto', titulo: 'Puesto' },
      { clave: 'fechaIngreso', titulo: 'Ingreso', tipo: 'fecha' },
      { clave: 'salario', titulo: 'Salario', tipo: 'colones' },
      { clave: 'usuario', titulo: 'Usuario', tipo: 'relacion', mostrar: (u) => u.correo },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true, max: 120, completo: true },
      { nombre: 'identificacion', etiqueta: 'Identificación', tipo: 'texto', requerido: true, max: 20 },
      { nombre: 'departamentoId', etiqueta: 'Departamento', tipo: 'fk', requerido: true, recurso: 'departamentos', opcion: nombre },
      { nombre: 'puesto', etiqueta: 'Puesto', tipo: 'texto', max: 80 },
      { nombre: 'usuarioId', etiqueta: 'Usuario del sistema', tipo: 'fk', recurso: 'usuarios', opcion: (u) => `${u.nombre} (${u.correo})`, ayuda: 'Opcional' },
      { nombre: 'fechaIngreso', etiqueta: 'Fecha de ingreso', tipo: 'fecha' },
      { nombre: 'salario', etiqueta: 'Salario mensual (₡)', tipo: 'decimal', min: 0 },
      { nombre: 'activo', etiqueta: 'Empleado activo', tipo: 'booleano' },
    ],
  },
  {
    ruta: 'usuarios',
    titulo: 'Usuarios',
    subtitulo: 'Cuentas con acceso al sistema',
    grupo: 'Personal',
    icono: 'usuarios',
    entidad: { singular: 'usuario', articulo: 'el' },
    titular: 'correo',
    columnas: [
      { clave: 'nombre', titulo: 'Nombre', tipo: 'fuerte' },
      { clave: 'correo', titulo: 'Correo' },
      { clave: 'perfil', titulo: 'Perfil', tipo: 'relacion', mostrar: nombre },
      { clave: 'fechaCreacion', titulo: 'Creado', tipo: 'fechaHora' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 100, completo: true },
      { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true, completo: true },
      { nombre: 'perfilId', etiqueta: 'Perfil', tipo: 'fk', requerido: true, recurso: 'perfiles', opcion: nombre, completo: true, ayuda: 'Al cambiarlo se quitan los permisos personalizados del usuario.' },
      { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', completo: true, ayuda: 'Mínimo 8 caracteres. Al editar, déjala vacía para conservar la actual.' },
    ],
  },
];
