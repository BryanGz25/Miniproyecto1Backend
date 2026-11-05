'use strict';
const { Model } = require('sequelize');

// Personas de contacto de cada proveedor.
module.exports = (sequelize, DataTypes) => {
  class ContactoProveedor extends Model {
    static associate(models) {
      ContactoProveedor.belongsTo(models.Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
    }
  }

  ContactoProveedor.init(
    {
      proveedorId: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      cargo: { type: DataTypes.STRING(60), allowNull: true },
      telefono: { type: DataTypes.STRING(20), allowNull: true },
      email: { type: DataTypes.STRING(120), allowNull: true },
    },
    { sequelize, modelName: 'ContactoProveedor', tableName: 'ContactosProveedor' },
  );

  return ContactoProveedor;
};
