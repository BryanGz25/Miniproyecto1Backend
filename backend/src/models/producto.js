'use strict';
const { Model } = require('sequelize');
const { decimalComoNumero } = require('../utils/decimal');

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsTo(models.Categoria, { foreignKey: 'categoriaId', as: 'categoria' });
      Producto.belongsTo(models.Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
      // 1:N  Un producto registra muchos movimientos de stock
      Producto.hasMany(models.MovimientoStock, { foreignKey: 'productoId', as: 'movimientos' });
    }
  }

  Producto.init(
    {
      sku: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      descripcion: { type: DataTypes.STRING(255), allowNull: true },
      precioCosto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
        get: decimalComoNumero('precioCosto'),
      },
      precioVenta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
        get: decimalComoNumero('precioVenta'),
      },
      stockActual: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
      stockMinimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
      categoriaId: { type: DataTypes.INTEGER, allowNull: false },
      proveedorId: { type: DataTypes.INTEGER, allowNull: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'Producto', tableName: 'Productos' },
  );

  return Producto;
};
