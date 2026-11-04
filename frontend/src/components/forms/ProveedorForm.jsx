import Campo from '../Campo';
import FormBase from '../FormBase';
import { useFormulario } from '../../hooks/useFormulario';

const validar = (v) => {
  const errores = [];
  if (!v.nombre.trim()) errores.push('El nombre es obligatorio.');
  if (!v.identificacion.trim()) errores.push('La identificación es obligatoria.');
  return errores;
};

export default function ProveedorForm({ inicial, onGuardar, onCancelar, textoGuardar }) {
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    {
      nombre: inicial.nombre ?? '',
      identificacion: inicial.identificacion ?? '',
      telefono: inicial.telefono ?? '',
      email: inicial.email ?? '',
      direccion: inicial.direccion ?? '',
      activo: inicial.activo ?? true,
    },
    { validar },
  );

  return (
    <FormBase errores={errores} enviando={enviando} onSubmit={enviar(onGuardar)} onCancelar={onCancelar} textoGuardar={textoGuardar}>
      <Campo etiqueta="Nombre" requerido completo>
        {(id) => <input id={id} name="nombre" className="campo" maxLength={120} value={valores.nombre} onChange={cambiar} placeholder="Distribuidora Central S.A." />}
      </Campo>
      <Campo etiqueta="Identificación" requerido ayuda="Cédula jurídica o física">
        {(id) => <input id={id} name="identificacion" className="campo" maxLength={20} value={valores.identificacion} onChange={cambiar} placeholder="3-101-123456" />}
      </Campo>
      <Campo etiqueta="Teléfono">
        {(id) => <input id={id} name="telefono" type="tel" className="campo" maxLength={20} value={valores.telefono} onChange={cambiar} placeholder="+506 2222-3333" />}
      </Campo>
      <Campo etiqueta="Email" completo>
        {(id) => <input id={id} name="email" type="email" className="campo" maxLength={120} value={valores.email} onChange={cambiar} placeholder="ventas@proveedor.cr" />}
      </Campo>
      <Campo etiqueta="Dirección" completo>
        {(id) => <input id={id} name="direccion" className="campo" maxLength={255} value={valores.direccion} onChange={cambiar} placeholder="San José, Costa Rica" />}
      </Campo>
      <div className="completo">
        <label className="check">
          <input type="checkbox" name="activo" checked={valores.activo} onChange={cambiar} />
          Proveedor activo
        </label>
      </div>
    </FormBase>
  );
}
