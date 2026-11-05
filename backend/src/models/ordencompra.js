'use strict';
const { Model } = require('sequelize');

// Pedidos de mercadería a proveedores.
module.exports = (sequelize, DataTypes) => {
  class OrdenCompra extends Model {
    static associate(models) {
      OrdenCompra.belongsTo(models.Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
      OrdenCompra.belongsTo(models.Bodega, { foreignKey: 'bodegaId', as: 'bodega' });
      OrdenCompra.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      OrdenCompra.hasMany(models.DetalleOrdenCompra, { foreignKey: 'ordenCompraId', as: 'detallesOrdenCompra' });
    }
  }

  OrdenCompra.init(
    {
      numero: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      proveedorId: { type: DataTypes.INTEGER, allowNull: false },
      bodegaId: { type: DataTypes.INTEGER, allowNull: false },
      usuarioId: { type: DataTypes.INTEGER, allowNull: true },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      estado: { type: DataTypes.ENUM('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA'), allowNull: false, defaultValue: "BORRADOR" },
      observaciones: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'OrdenCompra', tableName: 'OrdenesCompra' },
  );

  return OrdenCompra;
};
