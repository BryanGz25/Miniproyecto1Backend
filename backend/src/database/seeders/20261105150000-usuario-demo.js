'use strict';
// Una cuenta de prueba por perfil para entrar a la app sin registrarse. Solo para desarrollo.
// Contraseña de todas: Demo12345
const bcrypt = require('bcrypt');

const CUENTAS = [
  { nombre: 'Usuario Demo', correo: 'demo@inventario.test', perfil: 'Administrador' },
  { nombre: 'Sofía Supervisora', correo: 'supervisor@inventario.test', perfil: 'Supervisor' },
  { nombre: 'Carlos Bodeguero', correo: 'bodeguero@inventario.test', perfil: 'Bodeguero' },
  { nombre: 'Daniela Vendedora', correo: 'vendedor@inventario.test', perfil: 'Vendedor' },
  { nombre: 'Luis Consulta', correo: 'consulta@inventario.test', perfil: 'Consulta' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ahora = new Date();
    const hash = await bcrypt.hash('Demo12345', 12);
    const [perfiles] = await queryInterface.sequelize.query('SELECT id, nombre FROM Perfiles');
    const idPerfil = Object.fromEntries(perfiles.map((p) => [p.nombre, p.id]));

    await queryInterface.bulkInsert(
      'Usuarios',
      CUENTAS.map(({ nombre, correo, perfil }) => ({ nombre, correo, password: hash, perfilId: idPerfil[perfil], fechaCreacion: ahora, updatedAt: ahora })),
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Usuarios', { correo: CUENTAS.map((c) => c.correo) });
  },
};
