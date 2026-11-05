'use strict';
const fs = require('fs');
const path = require('path');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'destinatariosAlerta.json');

const leerDestinatarios = () => {
  try {
    if (!fs.existsSync(RUTA_ARCHIVO)) {
      const inicial = [
        {
          correo: 'bryangomezfwd@gmail.com',
          etiqueta: 'Correo Principal',
          activo: true,
          fechaAgregado: new Date().toISOString(),
        },
      ];
      fs.mkdirSync(path.dirname(RUTA_ARCHIVO), { recursive: true });
      fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(inicial, null, 2), 'utf-8');
      return inicial;
    }
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer destinatarios:', error.message);
    return [
      {
        correo: 'bryangomezfwd@gmail.com',
        etiqueta: 'Correo Principal',
        activo: true,
        fechaAgregado: new Date().toISOString(),
      },
    ];
  }
};

const guardarDestinatarios = (lista) => {
  fs.mkdirSync(path.dirname(RUTA_ARCHIVO), { recursive: true });
  fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(lista, null, 2), 'utf-8');
};

const agregarDestinatario = (correo, etiqueta = 'Prueba') => {
  const normalizado = String(correo).trim().toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(normalizado)) {
    throw new Error('El formato del correo electrónico no es válido.');
  }

  const lista = leerDestinatarios();
  const existe = lista.find((d) => d.correo.toLowerCase() === normalizado);
  if (existe) {
    throw new Error(`El correo ${normalizado} ya se encuentra registrado en la lista de pruebas.`);
  }

  const nuevo = {
    correo: normalizado,
    etiqueta: etiqueta?.trim() || 'Prueba',
    activo: true,
    fechaAgregado: new Date().toISOString(),
  };

  lista.push(nuevo);
  guardarDestinatarios(lista);
  return nuevo;
};

const eliminarDestinatario = (correo) => {
  const normalizado = String(correo).trim().toLowerCase();
  const lista = leerDestinatarios();
  const filtrada = lista.filter((d) => d.correo.toLowerCase() !== normalizado);

  if (filtrada.length === lista.length) {
    throw new Error(`No se encontró el correo ${normalizado} en la lista.`);
  }

  guardarDestinatarios(filtrada);
  return { mensaje: `Correo ${normalizado} eliminado correctamente.` };
};

module.exports = {
  leerDestinatarios,
  agregarDestinatario,
  eliminarDestinatario,
};

