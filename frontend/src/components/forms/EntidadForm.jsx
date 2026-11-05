import Campo from '../Campo';
import FormBase from '../FormBase';
import { aNumero, useFormulario } from '../../hooks/useFormulario';
import { aInputFecha } from '../../utils/formato';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valor inicial de cada campo como texto (los inputs de HTML trabajan con strings).
const valorInicial = (campo, inicial) => {
  const v = inicial[campo.nombre];
  switch (campo.tipo) {
    case 'booleano':
      return v ?? true;
    case 'enum':
      return v ?? campo.valores[0];
    case 'fechaHora':
      return aInputFecha(v);
    case 'password':
      return '';
    default:
      return v === null || v === undefined ? '' : String(v);
  }
};

// Convierte lo escrito al tipo que espera la API.
const convertirCampo = (campo, v) => {
  switch (campo.tipo) {
    case 'entero':
    case 'decimal':
    case 'fk':
      return aNumero(v);
    case 'booleano':
      return Boolean(v);
    case 'fecha':
    case 'fechaHora':
      return v || null;
    case 'password':
      return v || undefined; // vacío al editar = conservar la actual
    default:
      return v;
  }
};

const crearValidacion = (campos, esNuevo) => (valores) => {
  const errores = [];
  for (const c of campos) {
    const v = valores[c.nombre];
    if (c.tipo === 'password') {
      if (esNuevo && !v) errores.push(`${c.etiqueta}: campo obligatorio.`);
      else if (v && v.length < 8) errores.push(`${c.etiqueta}: mínimo 8 caracteres.`);
      continue;
    }
    if (c.requerido && (v === '' || v === null)) errores.push(`${c.etiqueta}: campo obligatorio.`);
    if (c.tipo === 'email' && v && !EMAIL_VALIDO.test(v.trim())) errores.push(`${c.etiqueta}: formato de correo no válido.`);
  }
  return errores;
};

/** Formulario generado a partir de la configuración de campos (config/entidades.js). */
export default function EntidadForm({ inicial, onGuardar, onCancelar, textoGuardar, campos, opciones }) {
  const esNuevo = !inicial.id;
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    Object.fromEntries(campos.map((c) => [c.nombre, valorInicial(c, inicial)])),
    {
      validar: crearValidacion(campos, esNuevo),
      convertir: (v) => Object.fromEntries(campos.map((c) => [c.nombre, convertirCampo(c, v[c.nombre])])),
    },
  );

  const control = (c, id) => {
    const comun = { id, name: c.nombre, className: 'campo', value: valores[c.nombre], onChange: cambiar, placeholder: c.placeholder };
    switch (c.tipo) {
      case 'fk':
        return (
          <select {...comun}>
            <option value="">{c.requerido ? 'Selecciona…' : 'Ninguno'}</option>
            {(opciones[c.recurso] ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {c.opcion(o)}
              </option>
            ))}
          </select>
        );
      case 'enum':
        return (
          <select {...comun}>
            {c.valores.map((v) => (
              <option key={v} value={v}>
                {v.charAt(0) + v.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        );
      case 'entero':
      case 'decimal':
        return <input {...comun} type="number" min={c.min} max={c.max} step={c.tipo === 'entero' ? 1 : 0.01} />;
      case 'fecha':
        return <input {...comun} type="date" />;
      case 'fechaHora':
        return <input {...comun} type="datetime-local" />;
      case 'email':
        return <input {...comun} type="email" maxLength={120} autoComplete="off" />;
      case 'telefono':
        return <input {...comun} type="tel" maxLength={20} />;
      case 'password':
        return <input {...comun} type="password" maxLength={72} autoComplete="new-password" />;
      default:
        return <input {...comun} maxLength={c.max} />;
    }
  };

  return (
    <FormBase errores={errores} enviando={enviando} onSubmit={enviar(onGuardar)} onCancelar={onCancelar} textoGuardar={textoGuardar}>
      {campos.map((c) =>
        c.tipo === 'booleano' ? (
          <div key={c.nombre} className="completo">
            <label className="check">
              <input type="checkbox" name={c.nombre} checked={valores[c.nombre]} onChange={cambiar} />
              {c.etiqueta}
            </label>
          </div>
        ) : (
          <Campo
            key={c.nombre}
            etiqueta={c.etiqueta}
            requerido={c.requerido || (c.tipo === 'password' && esNuevo)}
            ayuda={c.ayuda}
            completo={c.completo}
          >
            {(id) => control(c, id)}
          </Campo>
        ),
      )}
    </FormBase>
  );
}
