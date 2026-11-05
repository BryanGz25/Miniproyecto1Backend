'use strict';
const { Model } = require('sequelize');

// Facturas de venta a clientes.
module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      Venta.belongsTo(models.Cliente, { foreignKey: 'clienteId', as: 'cliente' });
      Venta.belongsTo(models.MetodoPago, { foreignKey: 'metodoPagoId', as: 'metodoPago' });
      Venta.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Venta.hasMany(models.DetalleVenta, { foreignKey: 'ventaId', as: 'detallesVenta' });
    }
  }

  Venta.init(
    {
      numero: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      clienteId: { type: DataTypes.INTEGER, allowNull: false },
      metodoPagoId: { type: DataTypes.INTEGER, allowNull: false },
      usuarioId: { type: DataTypes.INTEGER, allowNull: true },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      estado: { type: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'ANULADA'), allowNull: false, defaultValue: "PENDIENTE" },
      observaciones: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'Venta', tableName: 'Ventas' },
  );

  return Venta;
};
