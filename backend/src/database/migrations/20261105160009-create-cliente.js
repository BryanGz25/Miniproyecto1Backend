'use strict';
// Clientes que compran a la empresa.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clientes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      identificacion: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(120), allowNull: true },
      direccion: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Clientes');
  },
};
