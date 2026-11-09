'use strict';
// Todo usuario pertenece a un perfil. A las cuentas que ya existían:
// el usuario demo y la cuenta más antigua quedan como Administrador (alguien debe poder asignar perfiles)
// y las demás como Consulta.
const CORREO_DEMO = 'demo@inventario.test';
const RESTRICCION = 'fk_usuarios_perfil';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;
    await queryInterface.addColumn('Usuarios', 'perfilId', { type: Sequelize.INTEGER, allowNull: true });

    const [perfiles] = await sequelize.query("SELECT id, nombre FROM Perfiles WHERE nombre IN ('Administrador', 'Consulta')");
    const idDe = Object.fromEntries(perfiles.map((p) => [p.nombre, p.id]));
    const [[{ masAntiguo }]] = await sequelize.query('SELECT MIN(id) AS masAntiguo FROM Usuarios');

    await sequelize.query('UPDATE Usuarios SET perfilId = :consulta', { replacements: { consulta: idDe.Consulta } });
    await sequelize.query('UPDATE Usuarios SET perfilId = :admin WHERE correo = :demo OR id = :masAntiguo', {
      replacements: { admin: idDe.Administrador, demo: CORREO_DEMO, masAntiguo: masAntiguo ?? 0 },
    });

    await queryInterface.changeColumn('Usuarios', 'perfilId', { type: Sequelize.INTEGER, allowNull: false });
    await queryInterface.addConstraint('Usuarios', {
      name: RESTRICCION,
      type: 'foreign key',
      fields: ['perfilId'],
      references: { table: 'Perfiles', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Usuarios', RESTRICCION);
    await queryInterface.removeColumn('Usuarios', 'perfilId');
  },
};
