'use strict';
// Usuario de prueba para entrar a la app sin registrarse. Solo para desarrollo.
// Correo: demo@inventario.test  ·  Contraseña: Demo12345
const bcrypt = require('bcrypt');

const CORREO = 'demo@inventario.test';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ahora = new Date();
    await queryInterface.bulkInsert(
      'Usuarios',
      [{ nombre: 'Usuario Demo', correo: CORREO, password: await bcrypt.hash('Demo12345', 12), fechaCreacion: ahora, updatedAt: ahora }],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Usuarios', { correo: CORREO });
  },
};
