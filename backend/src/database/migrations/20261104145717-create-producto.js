'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Productos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sku: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      descripcion: { type: Sequelize.STRING(255), allowNull: true },
      precioCosto: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      precioVenta: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      stockActual: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      stockMinimo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categorias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // no se borra una categoría que tiene productos
      },
      proveedorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Proveedores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // el producto sobrevive si se elimina el proveedor
      },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // Reglas de negocio garantizadas también por la base de datos (MySQL 8.0.16+).
    const { gte } = Sequelize.Op;
    const checks = ['precioCosto', 'precioVenta', 'stockActual', 'stockMinimo'];
    for (const campo of checks) {
      await queryInterface.addConstraint('Productos', {
        fields: [campo],
        type: 'check',
        name: `chk_productos_${campo}`,
        where: { [campo]: { [gte]: 0 } },
      });
    }
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Productos');
  },
};
