import Icono from './Icono';

/** Tarjeta de vidrio centrada para las pantallas de login y registro. */
export default function AuthLayout({ titulo, subtitulo, children, pie }) {
  return (
    <main className="auth-pantalla">
      <section className="auth-card glass" aria-labelledby="auth-titulo">
        <div className="marca auth-marca">
          <Icono nombre="caja" tamano={24} />
          Inventario PYMES
        </div>
        <h1 id="auth-titulo">{titulo}</h1>
        <p className="secundario auth-subtitulo">{subtitulo}</p>
        {children}
        <p className="auth-pie">{pie}</p>
      </section>
    </main>
  );
}
