'use strict';
// Pedidos de mercadería a proveedores.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenesCompra', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      numero: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      proveedorId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Proveedores', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bodegaId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Bodegas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      usuarioId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      estado: { type: Sequelize.ENUM('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA'), allowNull: false, defaultValue: "BORRADOR" },
      observaciones: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('OrdenesCompra');
  },
};
