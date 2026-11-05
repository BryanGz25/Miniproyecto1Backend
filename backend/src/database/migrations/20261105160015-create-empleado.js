'use strict';
// Personal de la empresa.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Empleados', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      identificacion: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      departamentoId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Departamentos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      usuarioId: { type: Sequelize.INTEGER, allowNull: true, unique: true, references: { model: 'Usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      puesto: { type: Sequelize.STRING(80), allowNull: true },
      fechaIngreso: { type: Sequelize.DATEONLY, allowNull: true },
      salario: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('Empleados', { fields: ['salario'], type: 'check', name: 'chk_empleados_salario', where: { salario: { [Sequelize.Op.gte]: 0 } } });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Empleados');
  },
};
