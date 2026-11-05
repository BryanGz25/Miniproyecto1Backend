'use strict';
// Lotes de un producto con su fecha de vencimiento.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lotes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      productoId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Productos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      codigo: { type: Sequelize.STRING(40), allowNull: false },
      fechaVencimiento: { type: Sequelize.DATEONLY, allowNull: true },
      cantidad: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('Lotes', { fields: ['productoId','codigo'], type: 'unique', name: 'uq_lotes_productoId_codigo' });
    await queryInterface.addConstraint('Lotes', { fields: ['cantidad'], type: 'check', name: 'chk_lotes_cantidad', where: { cantidad: { [Sequelize.Op.gte]: 0 } } });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Lotes');
  },
};
