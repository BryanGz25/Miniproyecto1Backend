'use strict';
const { Model } = require('sequelize');

// Pasillo o estante dentro de una bodega.
module.exports = (sequelize, DataTypes) => {
  class Ubicacion extends Model {
    static associate(models) {
      Ubicacion.belongsTo(models.Bodega, { foreignKey: 'bodegaId', as: 'bodega' });
    }
  }

  Ubicacion.init(
    {
      bodegaId: { type: DataTypes.INTEGER, allowNull: false },
      codigo: { type: DataTypes.STRING(30), allowNull: false },
      descripcion: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'Ubicacion', tableName: 'Ubicaciones' },
  );

  return Ubicacion;
};
