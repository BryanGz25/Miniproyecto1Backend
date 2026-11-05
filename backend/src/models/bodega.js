'use strict';
const { Model } = require('sequelize');

// Almacenes físicos de la empresa.
module.exports = (sequelize, DataTypes) => {
  class Bodega extends Model {
    static associate(models) {
      Bodega.hasMany(models.Ubicacion, { foreignKey: 'bodegaId', as: 'ubicaciones' });
      Bodega.hasMany(models.OrdenCompra, { foreignKey: 'bodegaId', as: 'ordenesCompra' });
    }
  }

  Bodega.init(
    {
      nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      direccion: { type: DataTypes.STRING(255), allowNull: true },
      telefono: { type: DataTypes.STRING(20), allowNull: true },
      activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, modelName: 'Bodega', tableName: 'Bodegas' },
  );

  return Bodega;
};
