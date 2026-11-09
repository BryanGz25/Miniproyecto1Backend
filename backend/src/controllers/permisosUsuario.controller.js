// El administrador habilita o deshabilita permisos de los demás usuarios.
// Solo se guarda lo que difiere del perfil; si coincide, la excepción se borra.
const { Usuario, Permiso, UsuarioPermiso } = require('../models');
const { parsearId } = require('../utils/validaciones');
const { INCLUDE_ACCESO, esAdministrador } = require('../services/acceso.service');

const cargar = (id) => Usuario.findByPk(id, { include: INCLUDE_ACCESO });

const buscar = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const usuario = await cargar(id);
  if (!usuario) res.status(404).json({ error: `No existe el usuario con id ${id}.` });
  return usuario;
};

const motivoNoEditable = (usuario, solicitante) => {
  if (usuario.id === solicitante.id) return 'No puedes cambiar tus propios permisos.';
  if (esAdministrador(usuario)) return 'Los administradores tienen todos los permisos.';
  return null;
};

const buscarEditable = async (req, res) => {
  const usuario = await buscar(req, res);
  if (!usuario) return null;
  const motivo = motivoNoEditable(usuario, req.usuario);
  if (motivo) {
    res.status(409).json({ error: motivo });
    return null;
  }
  return usuario;
};

const delPerfil = (usuario, codigo) => usuario.perfil.permisos.some((p) => p.codigo === codigo);

const presentar = async (usuario, solicitante) => {
  const admin = esAdministrador(usuario);
  const personalizados = new Map(usuario.permisosPersonalizados.map((o) => [o.permiso.codigo, o.habilitado]));
  const catalogo = await Permiso.findAll({ order: [['id', 'ASC']] });
  const motivo = motivoNoEditable(usuario, solicitante);

  return {
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, perfil: { id: usuario.perfil.id, nombre: usuario.perfil.nombre } },
    editable: !motivo,
    motivoNoEditable: motivo,
    permisos: catalogo.map(({ codigo, grupo, recurso, accion }) => {
      const base = delPerfil(usuario, codigo);
      const personalizado = personalizados.get(codigo) ?? null;
      return { codigo, grupo, recurso, accion, delPerfil: base, personalizado, habilitado: admin || (personalizado ?? base) };
    }),
  };
};

// GET /api/usuarios/:id/permisos
const obtener = async (req, res) => {
  const usuario = await buscar(req, res);
  if (usuario) res.status(200).json(await presentar(usuario, req.usuario));
};

// PUT /api/usuarios/:id/permisos/:codigo  { "habilitado": true | false }
const cambiar = async (req, res) => {
  if (typeof req.body?.habilitado !== 'boolean') {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: ["El campo 'habilitado' debe ser true o false."] });
  }
  const usuario = await buscarEditable(req, res);
  if (!usuario) return undefined;

  const { codigo } = req.params;
  const permiso = await Permiso.findOne({ where: { codigo } });
  if (!permiso) return res.status(404).json({ error: `No existe el permiso '${codigo}'.` });

  const { habilitado } = req.body;
  const clave = { usuarioId: usuario.id, permisoId: permiso.id };
  if (habilitado === delPerfil(usuario, codigo)) await UsuarioPermiso.destroy({ where: clave });
  else await UsuarioPermiso.upsert({ ...clave, habilitado });

  return res.status(200).json(await presentar(await cargar(usuario.id), req.usuario));
};

// DELETE /api/usuarios/:id/permisos  (vuelve a lo que indica su perfil)
const restablecer = async (req, res) => {
  const usuario = await buscarEditable(req, res);
  if (!usuario) return undefined;
  await UsuarioPermiso.destroy({ where: { usuarioId: usuario.id } });
  return res.status(200).json(await presentar(await cargar(usuario.id), req.usuario));
};

module.exports = { obtener, cambiar, restablecer };
