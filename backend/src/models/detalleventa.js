'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

// Productos, cantidades y precios de cada venta.
module.exports = (sequelize, DataTypes) => {
  class DetalleVenta extends Model {
    static associate(models) {
      DetalleVenta.belongsTo(models.Venta, { foreignKey: 'ventaId', as: 'venta' });
      DetalleVenta.belongsTo(models.Producto, { foreignKey: 'productoId', as: 'producto' });
    }
  }

  DetalleVenta.init(
    {
      ventaId: { type: DataTypes.INTEGER, allowNull: false },
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      precioUnitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 }, get: decimalComoNumero('precioUnitario') },
      descuento: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 }, get: decimalComoNumero('descuento') },
    },
    { sequelize, modelName: 'DetalleVenta', tableName: 'DetallesVenta' },
  );

  return DetalleVenta;
};
