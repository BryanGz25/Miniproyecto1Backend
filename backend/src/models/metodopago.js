'use strict';
const { Model } = require('sequelize');

// Formas de pago aceptadas (efectivo, SINPE, tarjeta…).
module.exports = (sequelize, DataTypes) => {
  class MetodoPago extends Model {
    static associate(models) {
      MetodoPago.hasMany(models.Venta, { foreignKey: 'metodoPagoId', as: 'ventas' });
    }
  }

  MetodoPago.init(
    {
      nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'MetodoPago', tableName: 'MetodosPago' },
  );

  return MetodoPago;
};
