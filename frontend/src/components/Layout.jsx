import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBot/ChatBotWidget';
import { useAuth } from '../context/AuthContext';

/** Estructura de las páginas protegidas: menú lateral + contenido + chatbot asistente. */
export default function Layout() {
  const { puede } = useAuth();

  return (
    <div className="layout">
      <Sidebar />
      <main className="contenido">
        <Outlet />
      </main>
      {puede('chatbot.usar') && <ChatBotWidget />}
    </div>
  );
}
