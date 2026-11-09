'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Perfil extends Model {
    static associate(models) {
      Perfil.hasMany(models.Usuario, { foreignKey: 'perfilId', as: 'usuarios' });
      Perfil.belongsToMany(models.Permiso, { through: 'PerfilPermisos', foreignKey: 'perfilId', otherKey: 'permisoId', as: 'permisos', timestamps: false });
    }
  }

  Perfil.init(
    {
      nombre: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      descripcion: { type: DataTypes.STRING(255), allowNull: false },
    },
    { sequelize, modelName: 'Perfil', tableName: 'Perfiles', timestamps: false },
  );

  return Perfil;
};
