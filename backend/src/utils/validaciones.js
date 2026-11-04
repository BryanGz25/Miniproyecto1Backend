// Validadores reutilizables. Cada uno agrega un mensaje a `errores` si el valor no es válido
// y devuelve el valor ya normalizado (por ejemplo, texto sin espacios al inicio o al final).

const textoRequerido = (errores, campo, valor, max) => {
  if (valor === undefined || valor === null || valor === '') {
    errores.push(`El campo '${campo}' es obligatorio.`);
    return undefined;
  }
  if (typeof valor !== 'string') {
    errores.push(`El campo '${campo}' debe ser texto.`);
    return undefined;
  }
  const limpio = valor.trim();
  if (limpio.length === 0) errores.push(`El campo '${campo}' no puede estar vacío.`);
  if (limpio.length > max) errores.push(`El campo '${campo}' admite máximo ${max} caracteres.`);
  return limpio;
};

const textoOpcional = (errores, campo, valor, max) => {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') {
    errores.push(`El campo '${campo}' debe ser texto.`);
    return undefined;
  }
  const limpio = valor.trim();
  if (limpio.length > max) errores.push(`El campo '${campo}' admite máximo ${max} caracteres.`);
  return limpio || null;
};

const numeroNoNegativo = (errores, campo, valor, { requerido = true, entero = false } = {}) => {
  if (valor === undefined || valor === null) {
    if (requerido) errores.push(`El campo '${campo}' es obligatorio.`);
    return undefined;
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    errores.push(`El campo '${campo}' debe ser numérico.`);
    return undefined;
  }
  if (entero && !Number.isInteger(valor)) errores.push(`El campo '${campo}' debe ser un número entero.`);
  if (valor < 0) errores.push(`El campo '${campo}' no puede ser negativo.`);
  return valor;
};

const idValido = (valor) => Number.isInteger(valor) && valor > 0;

const booleanoOpcional = (errores, campo, valor) => {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'boolean') errores.push(`El campo '${campo}' debe ser true o false.`);
  return valor;
};

// Convierte el :id de la URL en entero positivo, o null si no es válido.
const parsearId = (param) => {
  const id = Number(param);
  return idValido(id) ? id : null;
};

module.exports = { textoRequerido, textoOpcional, numeroNoNegativo, idValido, booleanoOpcional, parsearId };
