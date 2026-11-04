'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      // 1:N  Una categoría clasifica muchos productos
      Categoria.hasMany(models.Producto, { foreignKey: 'categoriaId', as: 'productos' });
    }
  }

  Categoria.init(
    {
      nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      descripcion: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, modelName: 'Categoria', tableName: 'Categorias' },
  );

  return Categoria;
};
