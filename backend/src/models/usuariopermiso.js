'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // Excepción de un usuario frente a su perfil. Si no hay fila, manda lo que diga el perfil.
  class UsuarioPermiso extends Model {
    static associate(models) {
      UsuarioPermiso.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      UsuarioPermiso.belongsTo(models.Permiso, { foreignKey: 'permisoId', as: 'permiso' });
    }
  }

  UsuarioPermiso.init(
    {
      usuarioId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
      permisoId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
      habilitado: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    { sequelize, modelName: 'UsuarioPermiso', tableName: 'UsuarioPermisos', timestamps: false },
  );

  return UsuarioPermiso;
};
