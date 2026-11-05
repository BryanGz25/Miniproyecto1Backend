'use strict';
// Personas de contacto de cada proveedor.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactosProveedor', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      proveedorId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Proveedores', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      cargo: { type: Sequelize.STRING(60), allowNull: true },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(120), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ContactosProveedor');
  },
};
