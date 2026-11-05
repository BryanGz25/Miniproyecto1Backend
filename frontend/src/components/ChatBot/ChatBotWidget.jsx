import { useState, useRef, useEffect } from 'react';
import Icono from '../Icono';
import { agentesService } from '../../services/agentes.service';

const PREGUNTAS_RAPIDAS = [
  '¿Cuáles productos están agotados o bajos?',
  '¿Cómo funciona el agente de alertas por correo?',
  '¿Cómo registro una nueva venta?',
  '¿Cuál es el valor total del inventario?',
  '¿Cuáles proveedores tenemos registrados?',
];

export default function ChatBotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: 'bienvenida',
      rol: 'asistente',
      texto:
        '👋 **¡Hola! Soy tu Asistente Virtual del Sistema.**\n\nPuedo responder cualquier duda sobre la plataforma, su navegación, productos, stock, ventas, proveedores y más.\n\n🔒 *Modo seguro activo: por políticas de protección, no puedo divulgar contraseñas ni datos sensibles.*',
      fecha: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const chatFinRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      chatFinRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [abierto, mensajes, cargando]);

  const enviar = async (textoAEnviar) => {
    const textoFinal = (textoAEnviar || input).trim();
    if (!textoFinal || cargando) return;

    const mensajeUsuario = {
      id: String(Date.now()),
      rol: 'usuario',
      texto: textoFinal,
      fecha: new Date(),
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);
    setInput('');
    setCargando(true);

    try {
      // Pasamos historial simple
      const historial = mensajes.slice(-6).map((m) => ({
        rol: m.rol,
        texto: m.texto,
      }));

      const res = await agentesService.enviarMensajeChat({
        mensaje: textoFinal,
        historial,
      });

      const mensajeAsistente = {
        id: String(Date.now() + 1),
        rol: 'asistente',
        texto: res.respuesta || 'No se recibió respuesta del asistente.',
        fecha: new Date(),
      };

      setMensajes((prev) => [...prev, mensajeAsistente]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          rol: 'asistente',
          texto: `⚠️ *Error al comunicarse con el asistente:* ${error.message || 'Inténtalo de nuevo más tarde.'}`,
          fecha: new Date(),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const limpiarChat = () => {
    setMensajes([
      {
        id: 'bienvenida-reinicio',
        rol: 'asistente',
        texto: '🧹 Conversación reiniciada. ¿En qué te puedo colaborar hoy?',
        fecha: new Date(),
      },
    ]);
  };

  // Formateador simple de markdown a elementos legibles
  const formatearTexto = (texto) => {
    const lineas = texto.split('\n');
    return lineas.map((linea, idx) => {
      // Líneas con viñetas
      if (linea.startsWith('- ') || linea.startsWith('* ')) {
        const contenido = linea.slice(2);
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px' }}>
            {renderizarNegritaYCodigo(contenido)}
          </li>
        );
      }
      if (linea.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      return (
        <p key={idx} style={{ margin: '0 0 4px 0', lineHeight: 1.45 }}>
          {renderizarNegritaYCodigo(linea)}
        </p>
      );
    });
  };

  const renderizarNegritaYCodigo = (str) => {
    // Procesa **negrita** y `codigo`
    const partes = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let ultimoIndice = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > ultimoIndice) {
        partes.push(str.substring(ultimoIndice, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        partes.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        partes.push(
          <code
            key={match.index}
            style={{
              background: 'rgba(0,0,0,0.06)',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9em',
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        partes.push(<em key={match.index}>{token.slice(1, -1)}</em>);
      }
      ultimoIndice = match.index + token.length;
    }
    if (ultimoIndice < str.length) {
      partes.push(str.substring(ultimoIndice));
    }
    return partes.length > 0 ? partes : str;
  };

  return (
    <div className="chatbot-widget-container">
      {/* Botón Flotante */}
      {!abierto && (
        <button
          className="chatbot-boton-flotante"
          onClick={() => setAbierto(true)}
          title="Abrir Asistente Virtual con IA"
          aria-label="Abrir Asistente Virtual"
        >
          <Icono nombre="robot" tamano={24} />
          <span className="chatbot-pulso-punto" />
          <span className="chatbot-boton-texto">Asistente IA</span>
        </button>
      )}

      {/* Ventana de Chat */}
      {abierto && (
        <div className="chatbot-ventana glass">
          {/* Cabecera */}
          <div className="chatbot-encabezado">
            <div className="chatbot-encabezado-info">
              <div className="chatbot-avatar">
                <Icono nombre="robot" tamano={20} />
              </div>
              <div>
                <div className="chatbot-titulo-fila">
                  <h4>Asistente del Sistema</h4>
                  <span className="chatbot-en-linea-badge">En línea</span>
                </div>
                <div className="chatbot-seguro-badge">
                  <Icono nombre="escudo" tamano={12} />
                  <span>Modo Seguro Activo</span>
                </div>
              </div>
            </div>
            <div className="chatbot-encabezado-acciones">
              <button
                type="button"
                className="chatbot-btn-accion"
                onClick={limpiarChat}
                title="Limpiar conversación"
              >
                <Icono nombre="basura" tamano={15} />
              </button>
              <button
                type="button"
                className="chatbot-btn-accion"
                onClick={() => setAbierto(false)}
                title="Minimizar chat"
              >
                <Icono nombre="cerrar" tamano={16} />
              </button>
            </div>
          </div>

          {/* Sugerencias Rápidas */}
          <div className="chatbot-sugerencias-scroll">
            {PREGUNTAS_RAPIDAS.map((pregunta, i) => (
              <button
                key={i}
                type="button"
                className="chatbot-chip"
                onClick={() => enviar(pregunta)}
                disabled={cargando}
              >
                {pregunta}
              </button>
            ))}
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="chatbot-cuerpo">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`chatbot-mensaje ${m.rol === 'usuario' ? 'chatbot-mensaje-usuario' : 'chatbot-mensaje-asistente'}`}
              >
                {m.rol === 'asistente' && (
                  <div className="chatbot-mensaje-avatar">
                    <Icono nombre="robot" tamano={14} />
                  </div>
                )}
                <div className="chatbot-burbuja">{formatearTexto(m.texto)}</div>
              </div>
            ))}

            {cargando && (
              <div className="chatbot-mensaje chatbot-mensaje-asistente">
                <div className="chatbot-mensaje-avatar">
                  <Icono nombre="robot" tamano={14} />
                </div>
                <div className="chatbot-burbuja chatbot-escribiendo">
                  <span className="punto" />
                  <span className="punto" />
                  <span className="punto" />
                </div>
              </div>
            )}
            <div ref={chatFinRef} />
          </div>

          {/* Formulario de Entrada */}
          <form
            className="chatbot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Escribe tu pregunta sobre el sistema..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={cargando}
            />
            <button
              type="submit"
              className="chatbot-btn-enviar"
              disabled={!input.trim() || cargando}
              title="Enviar mensaje"
            >
              <Icono nombre="enviar" tamano={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

