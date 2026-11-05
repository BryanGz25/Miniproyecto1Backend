'use strict';
// Facturas de venta a clientes.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ventas', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      numero: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      clienteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Clientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      metodoPagoId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'MetodosPago', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      usuarioId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      estado: { type: Sequelize.ENUM('PENDIENTE', 'PAGADA', 'ANULADA'), allowNull: false, defaultValue: "PENDIENTE" },
      observaciones: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Ventas');
  },
};
