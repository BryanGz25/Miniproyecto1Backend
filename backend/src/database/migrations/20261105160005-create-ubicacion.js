'use strict';
// Pasillo o estante dentro de una bodega.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ubicaciones', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bodegaId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Bodegas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      codigo: { type: Sequelize.STRING(30), allowNull: false },
      descripcion: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('Ubicaciones', { fields: ['bodegaId','codigo'], type: 'unique', name: 'uq_ubicaciones_bodegaId_codigo' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Ubicaciones');
  },
};
