import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBot/ChatBotWidget';

/** Estructura de las páginas protegidas: menú lateral + contenido + chatbot asistente. */
export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="contenido">
        <Outlet />
      </main>
      <ChatBotWidget />
    </div>
  );
}
