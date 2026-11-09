// Error con el código HTTP que le corresponde; lo traduce middlewares/errores.js.
class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

module.exports = { ErrorHttp };
