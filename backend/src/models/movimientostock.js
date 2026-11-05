'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

module.exports = (sequelize, DataTypes) => {
  class MovimientoStock extends Model {
    static associate(models) {
      MovimientoStock.belongsTo(models.Producto, { foreignKey: 'productoId', as: 'producto' });
      MovimientoStock.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      MovimientoStock.belongsTo(models.Bodega, { foreignKey: 'bodegaId', as: 'bodega' });
    }
  }

  MovimientoStock.init(
    {
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      usuarioId: { type: DataTypes.INTEGER, allowNull: true },
      bodegaId: { type: DataTypes.INTEGER, allowNull: true },
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
