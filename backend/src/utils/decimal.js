// MySQL devuelve DECIMAL como texto ("250.00"). Este getter lo expone como número en el JSON.
const decimalComoNumero = (campo) =>
  function get() {
    const valor = this.getDataValue(campo);
    return valor === null || valor === undefined ? valor : Number(valor);
  };

module.exports = { decimalComoNumero };
