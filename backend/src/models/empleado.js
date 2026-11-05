'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

// Personal de la empresa.
module.exports = (sequelize, DataTypes) => {
  class Empleado extends Model {
    static associate(models) {
      Empleado.belongsTo(models.Departamento, { foreignKey: 'departamentoId', as: 'departamento' });
      Empleado.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
    }
  }

  Empleado.init(
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      identificacion: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      departamentoId: { type: DataTypes.INTEGER, allowNull: false },
      usuarioId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
      puesto: { type: DataTypes.STRING(80), allowNull: true },
      fechaIngreso: { type: DataTypes.DATEONLY, allowNull: true },
      salario: { type: DataTypes.DECIMAL(12, 2), allowNull: true, validate: { min: 0 }, get: decimalComoNumero('salario') },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'Empleado', tableName: 'Empleados' },
  );

  return Empleado;
};
