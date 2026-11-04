'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

module.exports = (sequelize, DataTypes) => {
  class MovimientoStock extends Model {
    static associate(models) {
      MovimientoStock.belongsTo(models.Producto, { foreignKey: 'productoId', as: 'producto' });
    }
  }

  MovimientoStock.init(
    {
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'AJUSTE'), allowNull: false },
      cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      costoUnitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
        get: decimalComoNumero('costoUnitario'),
      },
      motivo: { type: DataTypes.STRING(255), allowNull: true },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'MovimientoStock', tableName: 'MovimientosStock' },
  );

  return MovimientoStock;
};
