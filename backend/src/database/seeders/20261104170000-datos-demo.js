'use strict';
// Datos de ejemplo para probar la app. Se puede correr varias veces: ignora duplicados.
// Uso: npm run db:seed   |   Deshacer: npx sequelize-cli db:seed:undo:all

const CATEGORIAS = [
  { nombre: 'Bebidas', descripcion: 'Refrescos, jugos y agua' },
  { nombre: 'Abarrotes', descripcion: 'Granos, harinas y enlatados' },
  { nombre: 'Limpieza', descripcion: 'Artículos de aseo y limpieza' },
  { nombre: 'Lácteos', descripcion: 'Leche, quesos y yogures' },
];

const PROVEEDORES = [
  { nombre: 'Distribuidora Central S.A.', identificacion: '3-101-123456', telefono: '+506 2222-3333', email: 'ventas@distcentral.cr', direccion: 'San José' },
  { nombre: 'Lácteos del Valle', identificacion: '3-101-654321', telefono: '+506 2444-5566', email: 'pedidos@lacteosvalle.cr', direccion: 'Alajuela' },
  { nombre: 'Química Limpia', identificacion: '3-102-778899', telefono: '+506 2555-0101', email: null, direccion: 'Heredia' },
];

// [sku, nombre, categoría, proveedor, costo, venta, stock, mínimo]
const PRODUCTOS = [
  ['BEB-001', 'Agua 600 ml', 'Bebidas', 'Distribuidora Central S.A.', 250, 450, 120, 24],
  ['BEB-002', 'Jugo de naranja 1 L', 'Bebidas', 'Distribuidora Central S.A.', 780.5, 1200, 40, 10],
  ['BEB-003', 'Refresco cola 2 L', 'Bebidas', 'Distribuidora Central S.A.', 900, 1450, 6, 12],
  ['ABA-001', 'Arroz 2 kg', 'Abarrotes', 'Distribuidora Central S.A.', 1500, 2150, 0, 15],
  ['ABA-002', 'Frijoles negros 800 g', 'Abarrotes', 'Distribuidora Central S.A.', 1100, 1650, 35, 10],
  ['ABA-003', 'Atún en lata 140 g', 'Abarrotes', null, 650, 990, 60, 20],
  ['LIM-001', 'Cloro 1 L', 'Limpieza', 'Química Limpia', 650.75, 990, 8, 12],
  ['LIM-002', 'Jabón lavaplatos 500 g', 'Limpieza', 'Química Limpia', 720, 1100, 45, 10],
  ['LAC-001', 'Leche entera 1 L', 'Lácteos', 'Lácteos del Valle', 820, 1150, 72, 30],
  ['LAC-002', 'Queso turrialba 500 g', 'Lácteos', 'Lácteos del Valle', 2300, 3200, 14, 8],
];

const idsPorNombre = async (queryInterface, tabla) => {
  const [filas] = await queryInterface.sequelize.query(`SELECT id, nombre FROM ${tabla}`);
  return Object.fromEntries(filas.map((f) => [f.nombre, f.id]));
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ahora = new Date();
    const conFechas = (fila) => ({ ...fila, createdAt: ahora, updatedAt: ahora });

    await queryInterface.bulkInsert('Categorias', CATEGORIAS.map(conFechas), { ignoreDuplicates: true });
    await queryInterface.bulkInsert(
      'Proveedores',
      PROVEEDORES.map((p) => conFechas({ ...p, activo: true })),
      { ignoreDuplicates: true },
    );

    const categorias = await idsPorNombre(queryInterface, 'Categorias');
    const proveedores = await idsPorNombre(queryInterface, 'Proveedores');

    const productos = PRODUCTOS.map(([sku, nombre, cat, prov, precioCosto, precioVenta, stockActual, stockMinimo]) =>
      conFechas({
        sku,
        nombre,
        categoriaId: categorias[cat],
        proveedorId: prov ? proveedores[prov] : null,
        precioCosto,
        precioVenta,
        stockActual,
        stockMinimo,
        activo: true,
      }),
    );
    await queryInterface.bulkInsert('Productos', productos, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    const { in: enLista } = Sequelize.Op;
    await queryInterface.bulkDelete('Productos', { sku: { [enLista]: PRODUCTOS.map((p) => p[0]) } });
    await queryInterface.bulkDelete('Proveedores', { identificacion: { [enLista]: PROVEEDORES.map((p) => p.identificacion) } });
    await queryInterface.bulkDelete('Categorias', { nombre: { [enLista]: CATEGORIAS.map((c) => c.nombre) } });
  },
};
