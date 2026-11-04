'use strict';
// Carga todos los modelos de esta carpeta y ejecuta sus asociaciones.
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== path.basename(__filename) && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
