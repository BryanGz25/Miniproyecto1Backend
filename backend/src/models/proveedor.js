'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      // 1:N  Un proveedor abastece muchos productos
      Proveedor.hasMany(models.Producto, { foreignKey: 'proveedorId', as: 'productos' });
    }
  }

  Proveedor.init(
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      identificacion: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      telefono: { type: DataTypes.STRING(20), allowNull: true },
      email: { type: DataTypes.STRING(120), allowNull: true, unique: true, validate: { isEmail: true } },
      direccion: { type: DataTypes.STRING(255), allowNull: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'Proveedor', tableName: 'Proveedores' },
  );

  return Proveedor;
};
