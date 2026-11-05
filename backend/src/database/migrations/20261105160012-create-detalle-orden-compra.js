'use strict';
// Productos y cantidades de cada orden de compra.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DetallesOrdenCompra', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ordenCompraId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'OrdenesCompra', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      productoId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Productos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      costoUnitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('DetallesOrdenCompra', { fields: ['ordenCompraId','productoId'], type: 'unique', name: 'uq_detallesordencompra_ordenCompraId_productoId' });
    await queryInterface.addConstraint('DetallesOrdenCompra', { fields: ['cantidad'], type: 'check', name: 'chk_detallesordencompra_cantidad', where: { cantidad: { [Sequelize.Op.gte]: 1 } } });
    await queryInterface.addConstraint('DetallesOrdenCompra', { fields: ['costoUnitario'], type: 'check', name: 'chk_detallesordencompra_costoUnitario', where: { costoUnitario: { [Sequelize.Op.gte]: 0 } } });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('DetallesOrdenCompra');
  },
};
