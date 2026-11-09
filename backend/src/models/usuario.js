'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // 1:N  Un usuario registra muchos movimientos de stock (auditoría)
      Usuario.hasMany(models.MovimientoStock, { foreignKey: 'usuarioId', as: 'movimientos' });
      Usuario.belongsTo(models.Perfil, { foreignKey: 'perfilId', as: 'perfil' });
      Usuario.hasMany(models.UsuarioPermiso, { foreignKey: 'usuarioId', as: 'permisosPersonalizados' });
    }

    // El hash nunca sale en las respuestas JSON, aunque se haya cargado.
    toJSON() {
      const { password, ...publico } = this.get();
      return publico;
    }
  }

  Usuario.init(
    {
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      correo: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING(60), allowNull: false }, // hash bcrypt (60 caracteres)
      perfilId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'Usuarios',
      createdAt: 'fechaCreacion',
      // Por defecto las consultas NO traen el hash; para el login se usa Usuario.scope('conPassword').
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: { conPassword: { attributes: { include: ['password'] } } },
    },
  );

  return Usuario;
};
