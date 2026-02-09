'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';

// Componentes
import LoginScreen from './components/LoginScreen';
import FormularioRegistro from './components/FormularioRegistro';
import FormularioEvento from './components/FormularioEvento';
import CardEvento from './components/CardEvento';
import SeccionCumpleaños from './components/SeccionCumpleaños';
import ModalEmergencia from './components/ModalEmergencia';

export default function Home() {
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [vista, setVista] = useState('cartelera');
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [amigos, setAmigos] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const [usuarioParaSOS, setUsuarioParaSOS] = useState<any>(null);

  const refrescarTodo = useCallback(async () => {
    try {
      const uSnap = await getDocs(collection(db, "usuarios"));
      const listaUsuarios = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAmigos(listaUsuarios);

      const eSnap = await getDocs(query(collection(db, "eventos"), orderBy("fecha", "asc")));
      const ahora = new Date();
      const listaEventos = [];

      for (const d of eSnap.docs) {
        const data = d.data();
        const id = d.id;
        const [año, mes, dia] = data.fecha.split('-').map(Number);
        const [hora, min] = (data.hora || '00:00').split(':').map(Number);
        const fechaEvento = new Date(año, mes - 1, dia, hora, min);
        const diffHoras = (ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60);
        
        if (diffHoras > 48) {
          await deleteDoc(doc(db, "eventos", id));
        } else {
          listaEventos.push({ id, ...data, finalizado: ahora > fechaEvento });
        }
      }
      setEventos([...listaEventos.filter(e => !e.finalizado), ...listaEventos.filter(e => e.finalizado)]);

      const sesion = localStorage.getItem('usuarioLogueado');
      if (sesion) {
        const uLocal = JSON.parse(sesion);
        const fresco = listaUsuarios.find(u => u.id === uLocal.id || u.usuario === uLocal.usuario);
        if (fresco) setUsuarioActual(fresco);
      }
    } catch (e) { console.error(e); }
  }, []);

  const manejarSalida = () => {
    if (confirm("¿Te vas a la fuga?")) {
      localStorage.removeItem('usuarioLogueado');
      window.location.reload(); 
    }
  };

  useEffect(() => {
    const sesion = localStorage.getItem('usuarioLogueado');
    if (sesion) { setUsuarioActual(JSON.parse(sesion)); refrescarTodo(); }
    setCargando(false);
  }, [refrescarTodo]);

  if (cargando) return <div className="min-h-screen bg-[#F3F3FC] flex items-center justify-center font-bold text-[#8CAACF] animate-pulse">Cargando Sufrimiento...</div>;
  if (!usuarioActual) return <LoginScreen />;

  const esAdmin = usuarioActual?.role?.trim().toLowerCase() === 'admin';

  const navegarA = (nuevaVista: string) => {
    setVista(nuevaVista);
    setEditandoPerfil(false);
    setMenuMovilAbierto(false);
  };

  return (
    <main className="bg-[#F3F3FC] min-h-screen pb-20 font-['Roboto',sans-serif]">
      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 border-b border-gray-200 ${esAdmin ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navegarA('cartelera')}>
            <div className="relative">
              <img src={usuarioActual?.fotoPerfil || "/logo.png"} className="w-10 h-10 rounded-xl border border-gray-200 object-cover bg-black" alt="CR&L" />
              <span className="absolute -top-1 -right-1 text-[8px] bg-[#8CAACF] text-white w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                {usuarioActual?.rodadasCount || 0}
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xs uppercase tracking-tight line-clamp-1">{usuarioActual?.nombre}</span>
              <span className="text-[7px] font-bold text-[#8CAACF] uppercase tracking-widest">Pelotón CR&L</span>
            </div>
          </div>

          {/* MENÚ ESCRITORIO CON OPCIÓN CREAR PARA ADMIN */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navegarA('cartelera')} className={`text-[10px] font-bold uppercase tracking-widest ${vista === 'cartelera' ? 'text-[#8CAACF]' : 'opacity-50 hover:opacity-100'}`}>Actividades</button>
            <button onClick={() => navegarA('sociales')} className={`text-[10px] font-bold uppercase tracking-widest ${vista === 'sociales' ? 'text-[#8CAACF]' : 'opacity-50 hover:opacity-100'}`}>Sociales</button>
            {esAdmin && (
              <>
                <button onClick={() => navegarA('miembros')} className={`text-[10px] font-bold uppercase tracking-widest ${vista === 'miembros' ? 'text-[#8CAACF]' : 'opacity-50 hover:opacity-100'}`}>Miembros</button>
                <button onClick={() => navegarA('crear')} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${vista === 'crear' ? 'bg-[#8CAACF] border-[#8CAACF] text-white' : 'border-gray-500 opacity-70 hover:opacity-100'}`}>+ Nuevo</button>
              </>
            )}
            <button onClick={() => navegarA('registro')} className={`text-[10px] font-bold uppercase tracking-widest ${vista === 'registro' ? 'text-[#8CAACF]' : 'opacity-50 hover:opacity-100'}`}>Perfil</button>
            <button onClick={manejarSalida} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 ml-2">Fuga</button>
          </div>

          <div className="flex md:hidden items-center gap-3">
            {esAdmin && (
              <button onClick={() => navegarA('crear')} className="bg-[#8CAACF] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg font-light text-xl">+</button>
            )}
            <button onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} className="text-2xl p-2">
              {menuMovilAbierto ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuMovilAbierto && (
          <div className="md:hidden bg-white text-black p-8 border-t border-gray-100 flex flex-col gap-6 animate-in slide-in-from-top duration-300 shadow-xl font-['Roboto',sans-serif]">
            <button onClick={() => navegarA('cartelera')} className={`text-left text-xl font-bold uppercase tracking-tight ${vista === 'cartelera' ? 'text-[#8CAACF]' : ''}`}>Actividades</button>
            <button onClick={() => navegarA('sociales')} className={`text-left text-xl font-bold uppercase tracking-tight ${vista === 'sociales' ? 'text-[#8CAACF]' : ''}`}>Sociales</button>
            {esAdmin && (
              <>
                <button onClick={() => navegarA('miembros')} className={`text-left text-xl font-bold uppercase tracking-tight ${vista === 'miembros' ? 'text-[#8CAACF]' : ''}`}>Miembros</button>
                <button onClick={() => navegarA('crear')} className={`text-left text-xl font-bold uppercase tracking-tight ${vista === 'crear' ? 'text-[#8CAACF]' : ''}`}>➕ Crear Evento</button>
              </>
            )}
            <button onClick={() => navegarA('registro')} className={`text-left text-xl font-bold uppercase tracking-tight ${vista === 'registro' ? 'text-[#8CAACF]' : ''}`}>👤 Mi Perfil</button>
            <hr className="border-gray-100" />
            <button onClick={manejarSalida} className="text-left text-xs font-bold uppercase tracking-[0.2em] text-red-400">🚪 Cerrar Sesión</button>
          </div>
        )}
      </nav>

      <div className="max-w-6xl mx-auto p-6 sm:p-10">
        {(vista === 'cartelera' || vista === 'sociales') && (
          <div className="animate-in fade-in duration-500">
            {vista === 'cartelera' && <SeccionCumpleaños amigos={amigos} />}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-medium text-black tracking-tighter leading-none">{vista === 'cartelera' ? 'Actividades' : 'Sociales'}</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8CAACF] mt-3">{vista === 'cartelera' ? '— Sufrimiento por voluntad propia' : '— Chisme, lo realmente importante'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.filter(ev => vista === 'cartelera' ? (ev.tipo === 'rodada' || ev.tipo === 'running') : ev.tipo === 'social').map(ev => (
                <CardEvento key={ev.id} evento={ev} usuarioActual={usuarioActual} esAdmin={esAdmin} />
              ))}
            </div>
          </div>
        )}

        {/* VISTAS DE PERFIL, MIEMBROS Y CREAR SE MANTIENEN IGUAL A LO ACORDADO */}
        {vista === 'registro' && (
          <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {!editandoPerfil ? (
              <div className="bg-white rounded-[32px] shadow-xl shadow-black/5 overflow-hidden border border-gray-100 relative">
                <div className="h-28 bg-gradient-to-r from-[#8CAACF] to-[#7E8285]/20" />
                <div className="px-8 pb-10 flex flex-col items-center">
                  <div className="w-28 h-28 bg-white rounded-3xl border-4 border-white -mt-14 shadow-2xl overflow-hidden">
                    <img src={usuarioActual?.fotoPerfil || "/logo.png"} className="w-full h-full object-cover" alt="Perfil" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-black tracking-tight text-center leading-none">{usuarioActual?.nombre} {usuarioActual?.apellidos}</h2>
                  <div className="w-full mt-8">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-[#F3F3FC] p-5 rounded-2xl text-center border border-blue-50">
                        <p className="text-[9px] font-bold text-[#7E8285] uppercase mb-1">Actividades</p>
                        <p className="text-2xl font-bold text-black">{usuarioActual?.rodadasCount || 0}</p>
                      </div>
                      <div className="bg-[#F3F3FC] p-5 rounded-2xl text-center border border-blue-50 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-[#7E8285] uppercase mb-1">Estatus</p>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">🔥 On Fire</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditandoPerfil(true)} className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#8CAACF] transition-all">Editar Perfil</button>
                </div>
              </div>
            ) : (
              <FormularioRegistro datosIniciales={usuarioActual} onFinalizar={() => { refrescarTodo(); setEditandoPerfil(false); }} />
            )}
          </div>
        )}

        {vista === 'miembros' && esAdmin && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-4xl font-medium text-black tracking-tight mb-10">El team</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {amigos.map(amigo => (
                <div key={amigo.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={amigo.fotoPerfil || "/logo.png"} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-black truncate">{amigo.nombre}</p>
                      <p className="text-[9px] font-bold text-[#8CAACF] mt-1 uppercase">Rodadas: {amigo.rodadasCount || 0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setUsuarioParaSOS(amigo)} className="bg-red-50 text-red-500 py-3 rounded-xl font-bold text-[10px] uppercase">SOS</button>
                    <button onClick={async () => { if(confirm('¿Expulsar?')) { await deleteDoc(doc(db, "usuarios", amigo.id)); refrescarTodo(); } }} className="bg-gray-50 text-[#7E8285] py-3 rounded-xl font-bold text-[10px] uppercase">Baja</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vista === 'crear' && esAdmin && <FormularioEvento onEventoCreado={() => { refrescarTodo(); navegarA('cartelera'); }} />}
        {usuarioParaSOS && <ModalEmergencia usuario={usuarioParaSOS} alCerrar={() => setUsuarioParaSOS(null)} />}
      </div>
    </main>
  );
}