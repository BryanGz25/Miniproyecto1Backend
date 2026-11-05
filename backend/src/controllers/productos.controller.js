const { Producto, Categoria, Proveedor, Marca, UnidadMedida, Impuesto } = require('../models');
const {
  textoRequerido,
  textoOpcional,
  numeroNoNegativo,
  idValido,
  booleanoOpcional,
  parsearId,
} = require('../utils/validaciones');

const INCLUIR_RELACIONES = [
  { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
  { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] },
  { model: Marca, as: 'marca', attributes: ['id', 'nombre'] },
  { model: UnidadMedida, as: 'unidadMedida', attributes: ['id', 'nombre', 'abreviatura'] },
  { model: Impuesto, as: 'impuesto', attributes: ['id', 'nombre', 'porcentaje'] },
];

// Claves foráneas opcionales: [campo, modelo, cómo se nombra en los errores]
const FK_OPCIONALES = [
  ['proveedorId', Proveedor, 'el proveedor'],
  ['marcaId', Marca, 'la marca'],
  ['unidadMedidaId', UnidadMedida, 'la unidad de medida'],
  ['impuestoId', Impuesto, 'el impuesto'],
];

const validarProducto = (body = {}) => {
  const errores = [];
  const datos = {
    sku: textoRequerido(errores, 'sku', body.sku, 30)?.toUpperCase(),
    nombre: textoRequerido(errores, 'nombre', body.nombre, 120),
    descripcion: textoOpcional(errores, 'descripcion', body.descripcion, 255),
    precioCosto: numeroNoNegativo(errores, 'precioCosto', body.precioCosto),
    precioVenta: numeroNoNegativo(errores, 'precioVenta', body.precioVenta),
    stockActual: numeroNoNegativo(errores, 'stockActual', body.stockActual ?? 0, { entero: true }),
    stockMinimo: numeroNoNegativo(errores, 'stockMinimo', body.stockMinimo ?? 0, { entero: true }),
    categoriaId: body.categoriaId,
    activo: booleanoOpcional(errores, 'activo', body.activo),
  };

  if (!idValido(datos.categoriaId)) errores.push("El campo 'categoriaId' es obligatorio y debe ser un entero positivo.");
  for (const [campo] of FK_OPCIONALES) {
    datos[campo] = body[campo] ?? null;
    if (datos[campo] !== null && !idValido(datos[campo])) errores.push(`El campo '${campo}' debe ser un entero positivo o null.`);
  }
  if (datos.activo === undefined) delete datos.activo;

  return { errores, datos };
};

// Verifica que las claves foráneas apunten a registros existentes.
const validarRelaciones = async (datos) => {
  const errores = [];
  if (!(await Categoria.findByPk(datos.categoriaId))) errores.push(`No existe la categoría con id ${datos.categoriaId}.`);
  for (const [campo, modelo, nombre] of FK_OPCIONALES) {
    if (datos[campo] !== null && !(await modelo.findByPk(datos[campo]))) errores.push(`No existe ${nombre} con id ${datos[campo]}.`);
  }
  return errores;
};

const validarTodo = async (body) => {
  const { errores, datos } = validarProducto(body);
  if (errores.length) return { errores, datos };
  return { errores: await validarRelaciones(datos), datos };
};

const buscarPorId = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const producto = await Producto.findByPk(id, { include: INCLUIR_RELACIONES });
  if (!producto) {
    res.status(404).json({ error: `No existe el producto con id ${id}.` });
    return null;
  }
  return producto;
};

// POST /api/productos
const crear = async (req, res) => {
  const { errores, datos } = await validarTodo(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const { id } = await Producto.create(datos);
  const producto = await Producto.findByPk(id, { include: INCLUIR_RELACIONES });
  return res.status(201).json(producto);
};

// GET /api/productos
const listar = async (_req, res) => {
  const productos = await Producto.findAll({ include: INCLUIR_RELACIONES, order: [['nombre', 'ASC']] });
  return res.status(200).json(productos);
};

// GET /api/productos/:id
const obtener = async (req, res) => {
  const producto = await buscarPorId(req, res);
  if (producto) res.status(200).json(producto);
};

// PUT /api/productos/:id
const actualizar = async (req, res) => {
  const producto = await buscarPorId(req, res);
  if (!producto) return;

  const { errores, datos } = await validarTodo(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  await producto.update(datos);
  await producto.reload({ include: INCLUIR_RELACIONES });
  return res.status(200).json(producto);
};

// DELETE /api/productos/:id
const eliminar = async (req, res) => {
  const producto = await buscarPorId(req, res);
  if (!producto) return;

  await producto.destroy(); // si tiene movimientos, la FK RESTRICT lo impide (409)
  return res.status(200).json({ mensaje: 'Producto eliminado.', id: producto.id });
};

module.exports = { crear, listar, obtener, actualizar, eliminar };
