'use strict';
const { Model } = require('sequelize');

// Unidades en que se venden o compran los productos.
module.exports = (sequelize, DataTypes) => {
  class UnidadMedida extends Model {
    static associate(models) {
      // sin relaciones salientes
    }
  }

  UnidadMedida.init(
    {
      nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      abreviatura: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    },
    { sequelize, modelName: 'UnidadMedida', tableName: 'UnidadesMedida' },
  );

  return UnidadMedida;
};
