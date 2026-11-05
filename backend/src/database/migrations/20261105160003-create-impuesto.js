'use strict';
// Impuestos aplicables (IVA 13 %, exento…).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Impuestos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      porcentaje: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('Impuestos', { fields: ['porcentaje'], type: 'check', name: 'chk_impuestos_porcentaje', where: { porcentaje: { [Sequelize.Op.gte]: 0, [Sequelize.Op.lte]: 100 } } });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Impuestos');
  },
};
