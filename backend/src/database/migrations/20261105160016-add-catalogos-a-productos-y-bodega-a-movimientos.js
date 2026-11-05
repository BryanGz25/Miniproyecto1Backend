'use strict';
// Relaciona los productos con su marca, unidad de medida e impuesto,
// y cada movimiento de stock con la bodega donde ocurrió. Todas opcionales: los datos previos siguen válidos.
const COLUMNAS = [
  ['Productos', 'marcaId', 'Marcas'],
  ['Productos', 'unidadMedidaId', 'UnidadesMedida'],
  ['Productos', 'impuestoId', 'Impuestos'],
  ['MovimientosStock', 'bodegaId', 'Bodegas'],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const [tabla, columna, referencia] of COLUMNAS) {
      await queryInterface.addColumn(tabla, columna, {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: referencia, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // no se borra una marca, unidad, impuesto o bodega en uso
      });
    }
  },
  async down(queryInterface) {
    for (const [tabla, columna] of [...COLUMNAS].reverse()) {
      await queryInterface.removeColumn(tabla, columna);
    }
  },
};
