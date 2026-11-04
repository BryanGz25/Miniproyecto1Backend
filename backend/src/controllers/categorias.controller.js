const { Categoria } = require('../models');
const { textoRequerido, textoOpcional, parsearId } = require('../utils/validaciones');

// Valida el cuerpo y devuelve solo los campos permitidos (evita asignación masiva).
const validarCategoria = (body = {}) => {
  const errores = [];
  const datos = {
    nombre: textoRequerido(errores, 'nombre', body.nombre, 80),
    descripcion: textoOpcional(errores, 'descripcion', body.descripcion, 255),
  };
  return { errores, datos };
};

const buscarPorId = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    res.status(404).json({ error: `No existe la categoría con id ${id}.` });
    return null;
  }
  return categoria;
};

// POST /api/categorias
const crear = async (req, res) => {
  const { errores, datos } = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const categoria = await Categoria.create(datos);
  return res.status(201).json(categoria);
};

// GET /api/categorias
const listar = async (_req, res) => {
  const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
  return res.status(200).json(categorias);
};

// GET /api/categorias/:id
const obtener = async (req, res) => {
  const categoria = await buscarPorId(req, res);
  if (categoria) res.status(200).json(categoria);
};

// PUT /api/categorias/:id
const actualizar = async (req, res) => {
  const categoria = await buscarPorId(req, res);
  if (!categoria) return;

  const { errores, datos } = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  await categoria.update(datos);
  return res.status(200).json(categoria);
};

// DELETE /api/categorias/:id
const eliminar = async (req, res) => {
  const categoria = await buscarPorId(req, res);
  if (!categoria) return;

  await categoria.destroy(); // si tiene productos, la FK RESTRICT lo impide (409)
  return res.status(200).json({ mensaje: 'Categoría eliminada.', id: categoria.id });
};

module.exports = { crear, listar, obtener, actualizar, eliminar };
