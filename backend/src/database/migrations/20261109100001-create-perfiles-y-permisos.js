'use strict';
// Perfiles del sistema, catálogo de permisos y qué permisos trae cada perfil.
// Los códigos son "<recurso>.<acción>"; el recurso coincide con la ruta de la API (/api/<recurso>).

const INVENTARIO = [
  ['productos', 'Productos'],
  ['categorias', 'Categorías'],
  ['marcas', 'Marcas'],
  ['unidades-medida', 'Unidades de medida'],
  ['impuestos', 'Impuestos'],
  ['lotes', 'Lotes'],
  ['movimientos', 'Movimientos'],
];
const BODEGAS = [
  ['bodegas', 'Bodegas'],
  ['ubicaciones', 'Ubicaciones'],
];
const COMPRAS = [
  ['proveedores', 'Proveedores'],
  ['contactos-proveedor', 'Contactos de proveedor'],
  ['ordenes-compra', 'Órdenes de compra'],
  ['detalles-orden-compra', 'Detalle de órdenes'],
];
const VENTAS = [
  ['clientes', 'Clientes'],
  ['metodos-pago', 'Métodos de pago'],
  ['ventas', 'Ventas'],
  ['detalles-venta', 'Detalle de ventas'],
];
const PERSONAL = [
  ['departamentos', 'Departamentos'],
  ['empleados', 'Empleados'],
];

const ACCIONES_CRUD = ['ver', 'crear', 'editar', 'eliminar'];
const GRUPOS = { Inventario: INVENTARIO, Bodegas: BODEGAS, Compras: COMPRAS, Ventas: VENTAS, Personal: PERSONAL };

const CATALOGO = [
  ...Object.entries(GRUPOS).flatMap(([grupo, recursos]) =>
    recursos.flatMap(([slug, recurso]) => ACCIONES_CRUD.map((accion) => ({ codigo: `${slug}.${accion}`, grupo, recurso, accion }))),
  ),
  // Crear, editar o borrar usuarios no es un permiso delegable: es exclusivo del perfil Administrador.
  { codigo: 'usuarios.ver', grupo: 'Personal', recurso: 'Usuarios', accion: 'ver' },
  { codigo: 'alertas.ver', grupo: 'Agentes IA', recurso: 'Alertas de stock', accion: 'ver' },
  { codigo: 'alertas.gestionar', grupo: 'Agentes IA', recurso: 'Alertas de stock', accion: 'gestionar' },
  { codigo: 'alertas.enviar', grupo: 'Agentes IA', recurso: 'Alertas de stock', accion: 'enviar' },
  { codigo: 'chatbot.usar', grupo: 'Agentes IA', recurso: 'Chatbot', accion: 'usar' },
];

const codigos = (recursos, acciones) => recursos.flatMap(([slug]) => acciones.map((accion) => `${slug}.${accion}`));
const VER_INVENTARIO_Y_BODEGAS = codigos([...INVENTARIO, ...BODEGAS], ['ver']);
const CATALOGO_DE_VENTA = INVENTARIO.filter(([slug]) => slug !== 'movimientos');

const PERFILES = [
  {
    nombre: 'Administrador',
    descripcion: 'Acceso total. Administra usuarios y sus permisos.',
    permisos: CATALOGO.map((p) => p.codigo),
  },
  {
    nombre: 'Supervisor',
    descripcion: 'Ve y modifica toda la operación, pero no elimina registros.',
    permisos: CATALOGO.filter((p) => p.accion !== 'eliminar').map((p) => p.codigo),
  },
  {
    nombre: 'Bodeguero',
    descripcion: 'Productos, lotes, ubicaciones y movimientos de stock.',
    permisos: [
      ...VER_INVENTARIO_Y_BODEGAS,
      ...codigos(COMPRAS.filter(([slug]) => slug !== 'contactos-proveedor'), ['ver']),
      ...codigos([['productos'], ['lotes'], ['movimientos'], ['ubicaciones']], ['crear', 'editar']),
      'alertas.ver',
      'chatbot.usar',
    ],
  },
  {
    nombre: 'Vendedor',
    descripcion: 'Clientes y ventas; consulta el catálogo de productos.',
    permisos: [
      ...codigos(CATALOGO_DE_VENTA, ['ver']),
      'metodos-pago.ver',
      ...codigos([['clientes'], ['ventas'], ['detalles-venta']], ['ver', 'crear', 'editar']),
      'chatbot.usar',
    ],
  },
  {
    nombre: 'Consulta',
    descripcion: 'Solo lectura de inventario y bodegas. Perfil de quien se registra por su cuenta.',
    permisos: [...VER_INVENTARIO_Y_BODEGAS, 'chatbot.usar'],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fk = (tabla) => ({
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: tabla, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.createTable('Perfiles', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      descripcion: { type: Sequelize.STRING(255), allowNull: false },
    });
    await queryInterface.createTable('Permisos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      codigo: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      grupo: { type: Sequelize.STRING(40), allowNull: false },
      recurso: { type: Sequelize.STRING(60), allowNull: false },
      accion: { type: Sequelize.STRING(20), allowNull: false },
    });
    await queryInterface.createTable('PerfilPermisos', { perfilId: fk('Perfiles'), permisoId: fk('Permisos') });
    // Excepciones por usuario frente a su perfil: true concede un permiso, false lo retira.
    await queryInterface.createTable('UsuarioPermisos', {
      usuarioId: fk('Usuarios'),
      permisoId: fk('Permisos'),
      habilitado: { type: Sequelize.BOOLEAN, allowNull: false },
    });

    await queryInterface.bulkInsert('Permisos', CATALOGO);
    await queryInterface.bulkInsert('Perfiles', PERFILES.map(({ nombre, descripcion }) => ({ nombre, descripcion })));

    const [permisos] = await queryInterface.sequelize.query('SELECT id, codigo FROM Permisos');
    const [perfiles] = await queryInterface.sequelize.query('SELECT id, nombre FROM Perfiles');
    const idPermiso = Object.fromEntries(permisos.map((p) => [p.codigo, p.id]));
    const idPerfil = Object.fromEntries(perfiles.map((p) => [p.nombre, p.id]));

    await queryInterface.bulkInsert(
      'PerfilPermisos',
      PERFILES.flatMap((perfil) => perfil.permisos.map((codigo) => ({ perfilId: idPerfil[perfil.nombre], permisoId: idPermiso[codigo] }))),
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UsuarioPermisos');
    await queryInterface.dropTable('PerfilPermisos');
    await queryInterface.dropTable('Permisos');
    await queryInterface.dropTable('Perfiles');
  },
};
