'use strict';
// Guarda qué usuario registró cada movimiento de stock (trazabilidad).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MovimientosStock', 'usuarioId', {
      type: Sequelize.INTEGER,
      allowNull: true, // los movimientos anteriores al Día 2 no tienen usuario
      references: { model: 'Usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // si se borra el usuario, el historial se conserva
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('MovimientosStock', 'usuarioId');
  },
};
