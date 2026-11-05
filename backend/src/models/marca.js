'use strict';
const { Model } = require('sequelize');

// Marcas comerciales de los productos.
module.exports = (sequelize, DataTypes) => {
  class Marca extends Model {
    static associate(models) {
      // sin relaciones salientes
    }
  }

  Marca.init(
    {
      nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      paisOrigen: { type: DataTypes.STRING(60), allowNull: true },
    },
    { sequelize, modelName: 'Marca', tableName: 'Marcas' },
  );

  return Marca;
};
