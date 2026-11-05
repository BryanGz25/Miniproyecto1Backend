'use strict';
// Productos, cantidades y precios de cada venta.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DetallesVenta', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ventaId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Ventas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      productoId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Productos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      precioUnitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      descuento: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('DetallesVenta', { fields: ['ventaId','productoId'], type: 'unique', name: 'uq_detallesventa_ventaId_productoId' });
    await queryInterface.addConstraint('DetallesVenta', { fields: ['cantidad'], type: 'check', name: 'chk_detallesventa_cantidad', where: { cantidad: { [Sequelize.Op.gte]: 1 } } });
    await queryInterface.addConstraint('DetallesVenta', { fields: ['precioUnitario'], type: 'check', name: 'chk_detallesventa_precioUnitario', where: { precioUnitario: { [Sequelize.Op.gte]: 0 } } });
    await queryInterface.addConstraint('DetallesVenta', { fields: ['descuento'], type: 'check', name: 'chk_detallesventa_descuento', where: { descuento: { [Sequelize.Op.gte]: 0, [Sequelize.Op.lte]: 100 } } });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('DetallesVenta');
  },
};
