// Iconos de línea (trazos estilo Tabler) sin dependencias externas.
const TRAZOS = {
  caja: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z M12 12l8-4.5 M12 12v9 M12 12L4 7.5',
  resumen: 'M4 4h6v8H4z M14 4h6v5h-6z M14 13h6v7h-6z M4 16h6v4H4z',
  etiqueta: 'M7.5 7.5h.01 M3 6v5.2a2 2 0 0 0 .6 1.4l7.8 7.8a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L11.6 4.6A2 2 0 0 0 10.2 4H5a2 2 0 0 0-2 2z',
  camion: 'M3 6h11v10H3z M14 10h4l3 3v3h-7z M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  flechas: 'M7 7h13 M16 3l4 4-4 4 M17 17H4 M8 13l-4 4 4 4',
  mas: 'M12 5v14 M5 12h14',
  editar: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z M13.5 6.5l4 4',
  basura: 'M4 7h16 M10 11v6 M14 11v6 M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12 M9 7V4h6v3',
  buscar: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-6-6',
  cerrar: 'M18 6L6 18 M6 6l12 12',
  salir: 'M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2 M9 12h12 M18 9l3 3-3 3',
  alerta: 'M12 9v4 M12 17h.01 M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
};

export default function Icono({ nombre, tamano = 18, ...props }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
