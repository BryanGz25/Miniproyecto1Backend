/** Tarjeta de indicador: etiqueta pequeña y número grande. */
export default function Indicador({ etiqueta, valor, alerta = false }) {
  return (
    <div className={`indicador glass${alerta ? ' alerta' : ''}`}>
      <p>{etiqueta}</p>
      <strong>{valor}</strong>
    </div>
  );
}
