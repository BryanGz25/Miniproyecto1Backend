'use strict';
const { Model } = require('sequelize');

// Áreas internas de la empresa.
module.exports = (sequelize, DataTypes) => {
  class Departamento extends Model {
    static associate(models) {
      Departamento.hasMany(models.Empleado, { foreignKey: 'departamentoId', as: 'empleados' });
    }
  }

  Departamento.init(
    {
      nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      descripcion: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'Departamento', tableName: 'Departamentos' },
  );

  return Departamento;
};
