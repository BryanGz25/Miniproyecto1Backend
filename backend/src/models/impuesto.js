'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

// Impuestos aplicables (IVA 13 %, exento…).
module.exports = (sequelize, DataTypes) => {
  class Impuesto extends Model {
    static associate(models) {
      // sin relaciones salientes
    }
  }

  Impuesto.init(
    {
      nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      porcentaje: { type: DataTypes.DECIMAL(5, 2), allowNull: false, validate: { min: 0, max: 100 }, get: decimalComoNumero('porcentaje') },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'Impuesto', tableName: 'Impuestos' },
  );

  return Impuesto;
};
