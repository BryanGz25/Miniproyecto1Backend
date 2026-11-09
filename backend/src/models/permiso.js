'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      Permiso.belongsToMany(models.Perfil, { through: 'PerfilPermisos', foreignKey: 'permisoId', otherKey: 'perfilId', as: 'perfiles', timestamps: false });
    }
  }

  Permiso.init(
    {
      codigo: { type: DataTypes.STRING(60), allowNull: false, unique: true }, // ej. "productos.crear"
      grupo: { type: DataTypes.STRING(40), allowNull: false },
      recurso: { type: DataTypes.STRING(60), allowNull: false },
      accion: { type: DataTypes.STRING(20), allowNull: false },
    },
    { sequelize, modelName: 'Permiso', tableName: 'Permisos', timestamps: false },
  );

  return Permiso;
};
