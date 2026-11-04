import Campo from '../Campo';
import FormBase from '../FormBase';
import { useFormulario } from '../../hooks/useFormulario';

const validar = (v) => (v.nombre.trim() ? [] : ['El nombre es obligatorio.']);

export default function CategoriaForm({ inicial, onGuardar, onCancelar, textoGuardar }) {
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    { nombre: inicial.nombre ?? '', descripcion: inicial.descripcion ?? '' },
    { validar },
  );

  return (
    <FormBase errores={errores} enviando={enviando} onSubmit={enviar(onGuardar)} onCancelar={onCancelar} textoGuardar={textoGuardar}>
      <Campo etiqueta="Nombre" requerido completo>
        {(id) => <input id={id} name="nombre" className="campo" maxLength={80} value={valores.nombre} onChange={cambiar} placeholder="Bebidas" />}
      </Campo>
      <Campo etiqueta="Descripción" completo>
        {(id) => (
          <textarea id={id} name="descripcion" className="campo" rows={3} maxLength={255} value={valores.descripcion} onChange={cambiar} placeholder="Refrescos, jugos y agua" />
        )}
      </Campo>
    </FormBase>
  );
}
