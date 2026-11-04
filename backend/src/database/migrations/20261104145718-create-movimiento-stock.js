'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MovimientosStock', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Productos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // el historial de inventario no se pierde
      },
      tipo: { type: Sequelize.ENUM('ENTRADA', 'SALIDA', 'AJUSTE'), allowNull: false },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      costoUnitario: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      motivo: { type: Sequelize.STRING(255), allowNull: true },
      fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addConstraint('MovimientosStock', {
      fields: ['cantidad'],
      type: 'check',
      name: 'chk_movimientos_cantidad',
      where: { cantidad: { [Sequelize.Op.gt]: 0 } },
    });
    await queryInterface.addIndex('MovimientosStock', ['productoId', 'fecha']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('MovimientosStock');
  },
};
