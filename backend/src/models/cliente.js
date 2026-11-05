'use strict';
const { Model } = require('sequelize');

// Clientes que compran a la empresa.
module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.hasMany(models.Venta, { foreignKey: 'clienteId', as: 'ventas' });
    }
  }

  Cliente.init(
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      identificacion: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      telefono: { type: DataTypes.STRING(20), allowNull: true },
      email: { type: DataTypes.STRING(120), allowNull: true },
      direccion: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'Cliente', tableName: 'Clientes' },
  );

  return Cliente;
};
