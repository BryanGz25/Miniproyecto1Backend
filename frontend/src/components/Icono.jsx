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
  estrella: 'M12 17.8l-6.2 3.2 1.2-6.9-5-4.9 6.9-1L12 2l3.1 6.2 6.9 1-5 4.9 1.2 6.9z',
  regla: 'M5 4h14v16H5z M5 8h4 M5 12h6 M5 16h4',
  porcentaje: 'M19 5L5 19 M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  almacen: 'M3 21V8l9-5 9 5v13 M7 21v-8h10v8 M7 17h10',
  pin: 'M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  calendario: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  contacto: 'M4 4h16v16H4z M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M7.5 17a4.5 4.5 0 0 1 9 0',
  documento: 'M14 3H6v18h12V7z M14 3v4h4 M9 13h6 M9 17h6',
  lista: 'M9 6h11 M9 12h11 M9 18h11 M5 6h.01 M5 12h.01 M5 18h.01',
  persona: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  tarjeta: 'M3 6h18v12H3z M3 10h18 M7 15h3',
  recibo: 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z M9 8h6 M9 12h6',
  edificio: 'M4 21V4h10v17 M14 9h6v12 M8 8h2 M8 12h2 M8 16h2 M17 13h.01 M17 17h.01',
  usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M16 3.1a4 4 0 0 1 0 7.8 M22 21a7 7 0 0 0-4-6.3',
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
