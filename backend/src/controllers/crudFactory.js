// Genera los 5 endpoints CRUD de una entidad a partir de la descripción de sus campos.
// Así las 15 entidades de catálogo, compras, ventas y personal validan igual que las del Día 1.
const models = require('../models');
const { textoRequerido, textoOpcional, numeroNoNegativo, booleanoOpcional, idValido, parsearId } = require('../utils/validaciones');

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_VALIDO = /^[0-9+\-\s()]{7,20}$/;
const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

const vacio = (v) => v === undefined || v === null || v === '';

/**
 * Tipos de campo admitidos:
 *  texto · email · telefono · entero · decimal · booleano · fecha (AAAA-MM-DD) · fechaHora · enum · fk
 * Opciones: requerido, max (largo o valor), min, mayusculas, valores (enum), modelo y etiqueta (fk).
 */
const VALIDADORES = {
  texto: (errores, campo, valor, op) => {
    const limpio = op.requerido ? textoRequerido(errores, campo, valor, op.max ?? 255) : textoOpcional(errores, campo, valor, op.max ?? 255);
    return op.mayusculas && limpio ? limpio.toUpperCase() : limpio;
  },
  email: (errores, campo, valor, op) => {
    const correo = VALIDADORES.texto(errores, campo, valor, { ...op, max: 120 })?.toLowerCase() ?? null;
    if (correo && !EMAIL_VALIDO.test(correo)) errores.push(`El campo '${campo}' no tiene un formato válido.`);
    return correo;
  },
  telefono: (errores, campo, valor, op) => {
    const tel = VALIDADORES.texto(errores, campo, valor, { ...op, max: 20 });
    if (tel && !TELEFONO_VALIDO.test(tel)) errores.push(`El campo '${campo}' solo admite números, espacios, +, - y paréntesis.`);
    return tel;
  },
  entero: (errores, campo, valor, op) => VALIDADORES.numero(errores, campo, valor, { ...op, entero: true }),
  decimal: (errores, campo, valor, op) => VALIDADORES.numero(errores, campo, valor, op),
  numero: (errores, campo, valor, op) => {
    if (vacio(valor) && !op.requerido) return op.defecto ?? null;
    const n = numeroNoNegativo(errores, campo, valor, { requerido: true, entero: op.entero });
    if (typeof n === 'number') {
      if (op.min !== undefined && n < op.min) errores.push(`El campo '${campo}' debe ser mayor o igual a ${op.min}.`);
      if (op.max !== undefined && n > op.max) errores.push(`El campo '${campo}' debe ser menor o igual a ${op.max}.`);
    }
    return n;
  },
  booleano: (errores, campo, valor) => booleanoOpcional(errores, campo, valor),
  fecha: (errores, campo, valor, op) => {
    if (vacio(valor)) {
      if (op.requerido) errores.push(`El campo '${campo}' es obligatorio.`);
      return null;
    }
    if (typeof valor !== 'string' || !FECHA_VALIDA.test(valor) || Number.isNaN(new Date(valor).getTime())) {
      errores.push(`El campo '${campo}' debe ser una fecha con formato AAAA-MM-DD.`);
    }
    return valor;
  },
  fechaHora: (errores, campo, valor, op) => {
    if (vacio(valor)) {
      if (op.requerido) errores.push(`El campo '${campo}' es obligatorio.`);
      return undefined; // usa el valor por defecto (ahora)
    }
    const fecha = new Date(valor);
    if (typeof valor !== 'string' || Number.isNaN(fecha.getTime())) errores.push(`El campo '${campo}' debe ser una fecha válida.`);
    return fecha;
  },
  enum: (errores, campo, valor, op) => {
    if (vacio(valor)) {
      if (op.requerido) errores.push(`El campo '${campo}' es obligatorio.`);
      return undefined; // usa el valor por defecto del modelo
    }
    const v = typeof valor === 'string' ? valor.trim().toUpperCase() : valor;
    if (!op.valores.includes(v)) errores.push(`El campo '${campo}' debe ser uno de: ${op.valores.join(', ')}.`);
    return v;
  },
  fk: (errores, campo, valor, op) => {
    if (vacio(valor)) {
      if (op.requerido) errores.push(`El campo '${campo}' es obligatorio.`);
      return null;
    }
    if (!idValido(valor)) errores.push(`El campo '${campo}' debe ser un id entero positivo.`);
    return valor;
  },
};

/**
 * @param {object} config
 * @param {import('sequelize').ModelStatic} config.modelo
 * @param {{ singular: string, articulo: 'el'|'la' }} config.entidad  ej. { singular: 'bodega', articulo: 'la' }
 * @param {Record<string, object>} config.campos
 * @param {Array} [config.incluir]  relaciones que se devuelven junto al registro
 * @param {(req) => object} [config.alCrear]  campos que pone el servidor (ej. usuarioId del token)
 */
function crearControladorCrud({ modelo, entidad, campos, incluir = [], orden = [['id', 'DESC']], alCrear = () => ({}) }) {
  const noExiste = (id) => `No existe ${entidad.articulo} ${entidad.singular} con id ${id}.`;
  const camposFk = Object.entries(campos).filter(([, op]) => op.tipo === 'fk');

  const validar = async (body = {}) => {
    const errores = [];
    const datos = {};
    for (const [campo, op] of Object.entries(campos)) {
      const valor = VALIDADORES[op.tipo](errores, campo, body[campo], op);
      if (valor !== undefined) datos[campo] = valor;
    }
    if (errores.length) return { errores, datos };

    // Las claves foráneas deben apuntar a registros que existan.
    for (const [campo, op] of camposFk) {
      if (datos[campo] && !(await models[op.modelo].findByPk(datos[campo]))) {
        errores.push(`No existe ${op.etiqueta} con id ${datos[campo]} (campo '${campo}').`);
      }
    }
    return { errores, datos };
  };

  const buscar = async (req, res) => {
    const id = parsearId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
      return null;
    }
    const registro = await modelo.findByPk(id, { include: incluir });
    if (!registro) res.status(404).json({ error: noExiste(id) });
    return registro;
  };

  return {
    crear: async (req, res) => {
      const { errores, datos } = await validar(req.body);
      if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
      const { id } = await modelo.create({ ...datos, ...alCrear(req) });
      return res.status(201).json(await modelo.findByPk(id, { include: incluir }));
    },

    // GET /api/<recurso>  · admite filtrar por cualquier clave foránea, ej. ?bodegaId=2
    listar: async (req, res) => {
      const where = {};
      for (const [campo] of camposFk) {
        if (req.query[campo] === undefined) continue;
        const id = parsearId(req.query[campo]);
        if (!id) return res.status(400).json({ error: `${campo} debe ser un entero positivo.` });
        where[campo] = id;
      }
      return res.status(200).json(await modelo.findAll({ where, include: incluir, order: orden }));
    },

    obtener: async (req, res) => {
      const registro = await buscar(req, res);
      if (registro) res.status(200).json(registro);
    },

    actualizar: async (req, res) => {
      const registro = await buscar(req, res);
      if (!registro) return;
      const { errores, datos } = await validar(req.body);
      if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
      await registro.update(datos);
      await registro.reload({ include: incluir });
      return res.status(200).json(registro);
    },

    // Si otros registros dependen de este, la FK RESTRICT lo impide y el middleware responde 409.
    eliminar: async (req, res) => {
      const registro = await buscar(req, res);
      if (!registro) return;
      await registro.destroy();
      return res.status(200).json({ mensaje: `${entidad.singular[0].toUpperCase()}${entidad.singular.slice(1)} eliminad${entidad.articulo === 'la' ? 'a' : 'o'}.`, id: registro.id });
    },
  };
}

/** Router Express con los 5 endpoints de un controlador CRUD. */
function crearRutasCrud(controller) {
  const router = require('express').Router();
  router.post('/', controller.crear);
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
}

module.exports = { crearControladorCrud, crearRutasCrud };
