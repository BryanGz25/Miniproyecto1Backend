'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

// Productos y cantidades de cada orden de compra.
module.exports = (sequelize, DataTypes) => {
  class DetalleOrdenCompra extends Model {
    static associate(models) {
      DetalleOrdenCompra.belongsTo(models.OrdenCompra, { foreignKey: 'ordenCompraId', as: 'ordenCompra' });
      DetalleOrdenCompra.belongsTo(models.Producto, { foreignKey: 'productoId', as: 'producto' });
    }
  }

  DetalleOrdenCompra.init(
    {
      ordenCompraId: { type: DataTypes.INTEGER, allowNull: false },
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      costoUnitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 }, get: decimalComoNumero('costoUnitario') },
    },
    { sequelize, modelName: 'DetalleOrdenCompra', tableName: 'DetallesOrdenCompra' },
  );

  return DetalleOrdenCompra;
};
