// Calcula qué puede hacer un usuario: permisos de su perfil + sus excepciones personales.
const { Perfil } = require('../models');

const PERFIL_ADMINISTRADOR = 'Administrador';
const PERFIL_POR_DEFECTO = 'Consulta';

// Lo que debe traer un Usuario para poder calcular su acceso.
const INCLUDE_ACCESO = [
  {
    association: 'perfil',
    attributes: ['id', 'nombre'],
    include: [{ association: 'permisos', attributes: ['codigo'], through: { attributes: [] } }],
  },
  {
    association: 'permisosPersonalizados',
    attributes: ['usuarioId', 'permisoId', 'habilitado'],
    separate: true,
    include: [{ association: 'permiso', attributes: ['codigo'] }],
  },
];

const esAdministrador = (usuario) => usuario.perfil.nombre === PERFIL_ADMINISTRADOR;

/** Recibe un Usuario cargado con INCLUDE_ACCESO. */
const accesoDe = (usuario) => {
  const admin = esAdministrador(usuario);
  const permisos = new Set(usuario.perfil.permisos.map((p) => p.codigo));
  for (const { habilitado, permiso } of usuario.permisosPersonalizados) {
    if (habilitado) permisos.add(permiso.codigo);
    else permisos.delete(permiso.codigo);
  }
  return { esAdministrador: admin, permisos, puede: (codigo) => admin || permisos.has(codigo) };
};

/** Forma pública del usuario autenticado (login, registro y /auth/me). */
const usuarioConAcceso = (usuario) => {
  const { perfil, permisosPersonalizados, ...datos } = usuario.toJSON();
  const acceso = accesoDe(usuario);
  return {
    ...datos,
    perfil: { id: perfil.id, nombre: perfil.nombre },
    esAdministrador: acceso.esAdministrador,
    permisos: [...acceso.permisos].sort(),
  };
};

const idPerfilPorDefecto = async () => (await Perfil.findOne({ where: { nombre: PERFIL_POR_DEFECTO }, attributes: ['id'] })).id;

module.exports = { INCLUDE_ACCESO, esAdministrador, accesoDe, usuarioConAcceso, idPerfilPorDefecto };
