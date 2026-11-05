'use strict';
// Datos de ejemplo para las 15 entidades de administración (nombres ficticios).
// Se puede correr varias veces: ignora duplicados. Requiere los seeders anteriores (productos y usuario demo).

const ids = async (qi, tabla, campo) => {
  const [filas] = await qi.sequelize.query(`SELECT id, ${campo} AS clave FROM ${tabla}`);
  return Object.fromEntries(filas.map((f) => [f.clave, f.id]));
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi) {
    const ahora = new Date();
    const f = (fila) => ({ ...fila, createdAt: ahora, updatedAt: ahora });
    const insertar = (tabla, filas) => qi.bulkInsert(tabla, filas.map(f), { ignoreDuplicates: true });

    // ---------- Catálogos ----------
    await insertar('Marcas', [
      { nombre: 'La Finca', paisOrigen: 'Costa Rica' },
      { nombre: 'Andina', paisOrigen: 'Colombia' },
      { nombre: 'Brillo Total', paisOrigen: 'México' },
      { nombre: 'Valle Verde', paisOrigen: 'Costa Rica' },
    ]);
    await insertar('UnidadesMedida', [
      { nombre: 'Unidad', abreviatura: 'UND' },
      { nombre: 'Kilogramo', abreviatura: 'KG' },
      { nombre: 'Litro', abreviatura: 'L' },
      { nombre: 'Caja', abreviatura: 'CJ' },
      { nombre: 'Paquete', abreviatura: 'PQ' },
    ]);
    await insertar('Impuestos', [
      { nombre: 'IVA general', porcentaje: 13, activo: true },
      { nombre: 'IVA canasta básica', porcentaje: 1, activo: true },
      { nombre: 'Exento', porcentaje: 0, activo: true },
    ]);
    await insertar('MetodosPago', [
      { nombre: 'Efectivo', activo: true },
      { nombre: 'SINPE Móvil', activo: true },
      { nombre: 'Tarjeta', activo: true },
      { nombre: 'Transferencia', activo: true },
    ]);
    await insertar('Departamentos', [
      { nombre: 'Ventas', descripcion: 'Atención al cliente y caja' },
      { nombre: 'Bodega', descripcion: 'Recepción y despacho de mercadería' },
      { nombre: 'Administración', descripcion: 'Compras, contabilidad y personal' },
    ]);
    await insertar('Bodegas', [
      { nombre: 'Bodega Central', direccion: 'San José, Uruca', telefono: '+506 2290-1000', activa: true },
      { nombre: 'Sucursal Norte', direccion: 'Alajuela centro', telefono: '+506 2440-2000', activa: true },
    ]);
    await insertar('Clientes', [
      { nombre: 'Minisúper El Roble', identificacion: '3-101-445566', telefono: '+506 2255-1111', email: 'compras@elroble.test', direccion: 'Heredia' },
      { nombre: 'Soda La Esquina', identificacion: '3-102-778800', telefono: '+506 2233-4455', email: null, direccion: 'Cartago' },
      { nombre: 'María Fernández', identificacion: '1-1234-5678', telefono: '+506 8888-1234', email: 'maria.f@correo.test', direccion: 'San José' },
    ]);

    const marcas = await ids(qi, 'Marcas', 'nombre');
    const unidades = await ids(qi, 'UnidadesMedida', 'abreviatura');
    const impuestos = await ids(qi, 'Impuestos', 'nombre');
    const bodegas = await ids(qi, 'Bodegas', 'nombre');
    const productos = await ids(qi, 'Productos', 'sku');
    const proveedores = await ids(qi, 'Proveedores', 'nombre');
    const clientes = await ids(qi, 'Clientes', 'identificacion');
    const metodos = await ids(qi, 'MetodosPago', 'nombre');
    const departamentos = await ids(qi, 'Departamentos', 'nombre');
    const usuarios = await ids(qi, 'Usuarios', 'correo');

    // Productos existentes: marca, unidad e impuesto (solo si aún no los tienen).
    const asignar = { 'BEB-': ['La Finca', 'UND', 'IVA general'], 'ABA-': ['Andina', 'KG', 'IVA canasta básica'], 'LIM-': ['Brillo Total', 'UND', 'IVA general'], 'LAC-': ['Valle Verde', 'L', 'IVA canasta básica'] };
    for (const [sku, id] of Object.entries(productos)) {
      const datos = asignar[sku.slice(0, 4)];
      if (!datos) continue;
      await qi.sequelize.query(
        'UPDATE Productos SET marcaId = COALESCE(marcaId, ?), unidadMedidaId = COALESCE(unidadMedidaId, ?), impuestoId = COALESCE(impuestoId, ?) WHERE id = ?',
        { replacements: [marcas[datos[0]], unidades[datos[1]], impuestos[datos[2]], id] },
      );
    }

    // ---------- Inventario ----------
    await insertar('Ubicaciones', [
      { bodegaId: bodegas['Bodega Central'], codigo: 'A-01', descripcion: 'Pasillo A, estante 1 (bebidas)' },
      { bodegaId: bodegas['Bodega Central'], codigo: 'A-02', descripcion: 'Pasillo A, estante 2 (abarrotes)' },
      { bodegaId: bodegas['Bodega Central'], codigo: 'B-01', descripcion: 'Pasillo B (limpieza)' },
      { bodegaId: bodegas['Sucursal Norte'], codigo: 'N-01', descripcion: 'Cámara fría (lácteos)' },
    ]);
    const lotes = [
      ['LAC-001', 'L2611-A', '2026-11-20', 40],
      ['LAC-001', 'L2611-B', '2026-12-02', 32],
      ['LAC-002', 'Q2610-01', '2026-12-15', 14],
      ['BEB-002', 'J2610-07', '2027-01-30', 40],
    ].filter(([sku]) => productos[sku]);
    await insertar('Lotes', lotes.map(([sku, codigo, fechaVencimiento, cantidad]) => ({ productoId: productos[sku], codigo, fechaVencimiento, cantidad })));

    // ---------- Compras ----------
    const contactos = [
      ['Distribuidora Central S.A.', 'Laura Mora', 'Ejecutiva de ventas', '+506 8700-1111', 'laura.mora@distcentral.test'],
      ['Lácteos del Valle', 'Jorge Solís', 'Jefe de despacho', '+506 8700-2222', null],
      ['Química Limpia', 'Ana Vargas', 'Representante', '+506 8700-3333', 'ana@quimicalimpia.test'],
    ].filter(([prov]) => proveedores[prov]);
    const [existentes] = await qi.sequelize.query('SELECT nombre FROM ContactosProveedor');
    await insertar(
      'ContactosProveedor',
      contactos
        .filter(([, nombre]) => !existentes.some((e) => e.nombre === nombre))
        .map(([prov, nombre, cargo, telefono, email]) => ({ proveedorId: proveedores[prov], nombre, cargo, telefono, email })),
    );
    const demo = usuarios['demo@inventario.test'] ?? null;
    if (proveedores['Distribuidora Central S.A.']) {
      await insertar('OrdenesCompra', [
        { numero: 'OC-0001', proveedorId: proveedores['Distribuidora Central S.A.'], bodegaId: bodegas['Bodega Central'], usuarioId: demo, fecha: new Date('2026-11-02T09:00'), estado: 'RECIBIDA', observaciones: 'Reposición semanal' },
        { numero: 'OC-0002', proveedorId: proveedores['Distribuidora Central S.A.'], bodegaId: bodegas['Bodega Central'], usuarioId: demo, fecha: new Date('2026-11-05T08:30'), estado: 'ENVIADA', observaciones: 'Urgente: arroz agotado' },
      ]);
      const ordenes = await ids(qi, 'OrdenesCompra', 'numero');
      await insertar('DetallesOrdenCompra', [
        ['OC-0001', 'BEB-001', 48, 250], ['OC-0001', 'BEB-003', 24, 900], ['OC-0002', 'ABA-001', 30, 1500], ['OC-0002', 'ABA-002', 20, 1100],
      ].filter(([, sku]) => productos[sku]).map(([oc, sku, cantidad, costoUnitario]) => ({ ordenCompraId: ordenes[oc], productoId: productos[sku], cantidad, costoUnitario })));
    }

    // ---------- Ventas ----------
    await insertar('Ventas', [
      { numero: 'FV-0001', clienteId: clientes['3-101-445566'], metodoPagoId: metodos['Transferencia'], usuarioId: demo, fecha: new Date('2026-11-03T15:20'), estado: 'PAGADA', observaciones: null },
      { numero: 'FV-0002', clienteId: clientes['1-1234-5678'], metodoPagoId: metodos['SINPE Móvil'], usuarioId: demo, fecha: new Date('2026-11-04T11:05'), estado: 'PAGADA', observaciones: 'Cliente frecuente' },
      { numero: 'FV-0003', clienteId: clientes['3-102-778800'], metodoPagoId: metodos['Efectivo'], usuarioId: demo, fecha: new Date('2026-11-05T09:40'), estado: 'PENDIENTE', observaciones: 'Paga contra entrega' },
    ]);
    const ventas = await ids(qi, 'Ventas', 'numero');
    await insertar('DetallesVenta', [
      ['FV-0001', 'BEB-001', 24, 450, 5], ['FV-0001', 'LIM-002', 6, 1100, 0], ['FV-0002', 'LAC-001', 2, 1150, 0], ['FV-0002', 'ABA-003', 4, 990, 0], ['FV-0003', 'BEB-002', 10, 1200, 10],
    ].filter(([, sku]) => productos[sku]).map(([v, sku, cantidad, precioUnitario, descuento]) => ({ ventaId: ventas[v], productoId: productos[sku], cantidad, precioUnitario, descuento })));

    // ---------- Personal ----------
    await insertar('Empleados', [
      { nombre: 'Usuario Demo', identificacion: '1-0000-0001', departamentoId: departamentos['Administración'], usuarioId: demo, puesto: 'Administrador del sistema', fechaIngreso: '2024-01-15', salario: 850000, activo: true },
      { nombre: 'Carlos Jiménez', identificacion: '1-0987-6543', departamentoId: departamentos['Bodega'], usuarioId: null, puesto: 'Encargado de bodega', fechaIngreso: '2023-06-01', salario: 520000, activo: true },
      { nombre: 'Daniela Rojas', identificacion: '2-0456-7890', departamentoId: departamentos['Ventas'], usuarioId: null, puesto: 'Cajera', fechaIngreso: '2025-03-10', salario: 450000, activo: true },
    ]);
  },

  async down(qi) {
    // Borra en orden inverso a las dependencias.
    for (const tabla of ['Empleados', 'DetallesVenta', 'Ventas', 'DetallesOrdenCompra', 'OrdenesCompra', 'ContactosProveedor', 'Lotes', 'Ubicaciones', 'Clientes', 'Bodegas', 'Departamentos', 'MetodosPago']) {
      await qi.bulkDelete(tabla, {});
    }
    await qi.sequelize.query('UPDATE Productos SET marcaId = NULL, unidadMedidaId = NULL, impuestoId = NULL');
    for (const tabla of ['Impuestos', 'UnidadesMedida', 'Marcas']) await qi.bulkDelete(tabla, {});
  },
};
