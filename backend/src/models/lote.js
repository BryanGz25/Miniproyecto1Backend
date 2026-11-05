'use strict';
const { Model } = require('sequelize');

// Lotes de un producto con su fecha de vencimiento.
module.exports = (sequelize, DataTypes) => {
  class Lote extends Model {
    static associate(models) {
      Lote.belongsTo(models.Producto, { foreignKey: 'productoId', as: 'producto' });
    }
  }

  Lote.init(
    {
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      codigo: { type: DataTypes.STRING(40), allowNull: false },
      fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: true },
      cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    },
    { sequelize, modelName: 'Lote', tableName: 'Lotes' },
  );

  return Lote;
};
