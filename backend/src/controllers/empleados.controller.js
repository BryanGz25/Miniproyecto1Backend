// Controlador de la entidad «empleado» · área Personal.
// CRUD completo de /api/empleados: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { USUARIO } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.Empleado,
  entidad: { singular: 'empleado', articulo: 'el' },
  incluir: [{ model: m.Departamento, as: 'departamento', attributes: ['id', 'nombre'] }, { ...USUARIO, attributes: ['id', 'nombre', 'correo'] }],
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 120 },
    identificacion: { tipo: 'texto', requerido: true, max: 20 },
    departamentoId: { tipo: 'fk', requerido: true, modelo: 'Departamento', etiqueta: 'el departamento' },
    usuarioId: { tipo: 'fk', modelo: 'Usuario', etiqueta: 'el usuario' },
    puesto: { tipo: 'texto', max: 80 },
    fechaIngreso: { tipo: 'fecha' },
    salario: { tipo: 'decimal', min: 0 },
    activo: { tipo: 'booleano' },
  },
});
