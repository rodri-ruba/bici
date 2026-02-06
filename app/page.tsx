'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

// Componentes
import LoginScreen from './components/LoginScreen';
import FormularioRegistro from './components/FormularioRegistro';
import FormularioEvento from './components/FormularioEvento';
import CardEvento from './components/CardEvento';
import SeccionCumpleaños from './components/SeccionCumpleaños';
import ModalEmergencia from './components/ModalEmergencia';

export default function Home() {
  // Ajuste de tipos para TypeScript (<any>)
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [vista, setVista] = useState('cartelera');
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<any>(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [cargando, setCargando] = useState(true);
  
  // Ajuste de tipos para arreglos (<any[]>)
  const [amigos, setAmigos] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  // Función estable para evitar errores de compilación
  const refrescarTodo = useCallback(async () => {
    try {
      const uSnap = await getDocs(collection(db, "usuarios"));
      const listaUsuarios = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAmigos(listaUsuarios);

      const eSnap = await getDocs(query(collection(db, "eventos"), orderBy("fecha", "asc")));
      const listaEventos = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEventos(listaEventos);
    } catch (e) { 
      console.error("Error al sincronizar:", e); 
    }
  }, []);

  useEffect(() => {
    const inicializarSesion = async () => {
      const sesion = localStorage.getItem('usuarioLogueado');
      if (sesion) {
        try {
          const userLocal = JSON.parse(sesion);
          setUsuarioActual(userLocal);
          await refrescarTodo();
        } catch (error) {
          console.error("Error al leer sesión:", error);
        }
      }
      setCargando(false);
    };
    inicializarSesion();
  }, [refrescarTodo]);

  const manejarSalida = () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/';
  };

  const obtenerRango = (num: number = 0) => {
    if (num >= 26) return { nombre: "Leyenda del Maillot de Oro", color: "text-yellow-600", emoji: "🏆" };
    if (num >= 16) return { nombre: "Maestro de la Grupeta", color: "text-purple-600", emoji: "🚴‍♂️" };
    if (num >= 9)  return { nombre: "Cadencia de Hierro", color: "text-blue-600", emoji: "⚙️" };
    if (num >= 4)  return { nombre: "Escalador de Banquetas", color: "text-green-600", emoji: "🧗" };
    return { nombre: "Novato del Piñón", color: "text-gray-500", emoji: "🐣" };
  };

  const esAdmin = usuarioActual?.role?.trim().toLowerCase() === 'admin';

  if (cargando) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!usuarioActual) return <LoginScreen />;

  return (
    <main className="bg-gray-50 min-h-screen pb-20 text-black font-sans">
      
      {miembroSeleccionado && (
        <ModalEmergencia usuario={miembroSeleccionado} alCerrar={() => setMiembroSeleccionado(null)} />
      )}

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 shadow-sm ${
        esAdmin ? 'bg-slate-950/95 text-white' : 'bg-white/90 text-black'
      } backdrop-blur-md border-b-2 border-orange-500`}>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setVista('cartelera')}>
              <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-orange-500 shadow-lg group-hover:scale-110 transition-transform bg-black">
                <img src="/logo.png" alt="CR&L" className="object-cover w-full h-full" />
              </div>
              <div className="hidden sm:block leading-none">
                <span className="text-lg font-black italic tracking-tighter">CR&L</span>
                <p className="text-[7px] font-bold text-orange-500 uppercase tracking-[0.2em]">Coffee Ride & Lies</p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 ml-4">
              <button onClick={() => setVista('cartelera')} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all whitespace-nowrap ${vista === 'cartelera' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Rodadas</button>
              <button onClick={() => setVista('sociales')} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all whitespace-nowrap ${vista === 'sociales' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Sociales</button>
              
              {esAdmin && (
                <>
                  <button onClick={() => setVista('miembros')} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all whitespace-nowrap ${vista === 'miembros' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Miembros</button>
                  <button onClick={() => setVista('crear')} className="px-3 py-2 rounded-xl text-[10px] font-black italic uppercase bg-orange-600 text-white border-2 border-orange-400 animate-pulse whitespace-nowrap">➕ Crear</button>
                </>
              )}

              <button onClick={() => setVista('registro')} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all whitespace-nowrap ${vista === 'registro' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Perfil</button>
              <button onClick={manejarSalida} className="text-[9px] text-red-500 font-black border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">SALIR</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        {vista === 'cartelera' && (
          <div className="animate-in fade-in duration-700">
            <SeccionCumpleaños amigos={amigos} />
            <div className="mb-8 flex items-baseline gap-3">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Rodadas</h1>
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.map(ev => (
                <CardEvento key={ev.id} evento={ev} usuarioActual={usuarioActual} esAdmin={esAdmin} />
              ))}
            </div>
          </div>
        )}

        {vista === 'crear' && esAdmin && (
          <div className="max-w-2xl mx-auto">
             <FormularioEvento onEventoCreado={() => { refrescarTodo(); setVista('cartelera'); }} />
          </div>
        )}

        {/* ... Otras vistas ... */}
      </div>
    </main>
  );
}