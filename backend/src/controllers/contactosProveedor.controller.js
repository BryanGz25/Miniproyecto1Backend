// Controlador de la entidad «contacto» · área Compras.
// CRUD completo de /api/contactos-proveedor: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { PROVEEDOR } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.ContactoProveedor,
  entidad: { singular: 'contacto', articulo: 'el' },
  incluir: [PROVEEDOR],
  orden: [['nombre', 'ASC']],
  campos: {
    proveedorId: { tipo: 'fk', requerido: true, modelo: 'Proveedor', etiqueta: 'el proveedor' },
    nombre: { tipo: 'texto', requerido: true, max: 100 },
    cargo: { tipo: 'texto', max: 60 },
    telefono: { tipo: 'telefono' },
    email: { tipo: 'email' },
  },
});
