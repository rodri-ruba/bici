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

  // Función para sumar rodada (necesaria para la vista de miembros)
  const sumarRodada = async (id: string) => {
    try {
      await updateDoc(doc(db, "usuarios", id), { rodadasCount: increment(1) });
      refrescarTodo();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const sesion = localStorage.getItem('usuarioLogueado');
    if (sesion) { setUsuarioActual(JSON.parse(sesion)); refrescarTodo(); }
    setCargando(false);
  }, [refrescarTodo]);

  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-orange-500 italic uppercase">Cargando Sufrimiento...</div>;
  if (!usuarioActual) return <LoginScreen />;

  const esAdmin = usuarioActual?.role?.trim().toLowerCase() === 'admin';

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 border-b-2 border-orange-500 ${esAdmin ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          {/* LOGO Y USUARIO CON INSIGNIA DE RANGO */}
<div 
  className="flex items-center gap-3 cursor-pointer group" 
  onClick={() => {setVista('cartelera'); setEditandoPerfil(false);}}
>
  <div className="relative">
    <img 
      src="/logo.png" 
      className="w-10 h-10 rounded-full border-2 border-orange-500 bg-black shadow-sm group-hover:scale-110 transition-transform" 
      alt="CR&L" 
    />
    
    {/* BADGE DE RANGO (REEMPLAZA AL AD) */}
    {(() => {
      const conteo = usuarioActual?.rodadasCount || 0;
      let insignia = "👶"; // Recluta
      let bgBadge = "bg-gray-400";

      if (conteo >= 50) { insignia = "👑"; bgBadge = "bg-yellow-500"; } // Leyenda
      else if (conteo >= 25) { insignia = "🔥"; bgBadge = "bg-orange-500"; } // Líder
      else if (conteo >= 10) { insignia = "🏔️"; bgBadge = "bg-blue-500"; } // Escalador

      return (
        <span className={`absolute -top-1 -right-1 text-[10px] ${bgBadge} text-white w-5 h-5 flex items-center justify-center rounded-full font-black border border-white shadow-sm shadow-black/20 animate-in zoom-in`}>
          {insignia}
        </span>
      );
    })()}
  </div>
  
  <div className="flex flex-col leading-none">
    <span className="font-black italic text-sm uppercase tracking-tighter">
      {usuarioActual?.nombre || 'Zuricata'}
    </span>
    {/* Subtítulo dinámico según rango */}
    <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest">
      {(() => {
        const c = usuarioActual?.rodadasCount || 0;
        if (c >= 50) return "Leyenda Viva";
        if (c >= 25) return "Zuricata Senior";
        if (c >= 10) return "Ya se siente Pro";
        return "Recluta";
      })()}
    </span>
  </div>
</div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => {setVista('cartelera'); setEditandoPerfil(false);}} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all ${vista === 'cartelera' ? 'bg-orange-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}>Sufrimiento</button>
            <button onClick={() => {setVista('sociales'); setEditandoPerfil(false);}} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all ${vista === 'sociales' ? 'bg-purple-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}>Chisme</button>
            {esAdmin && <button onClick={() => {setVista('miembros'); setEditandoPerfil(false);}} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all ${vista === 'miembros' ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}>Grupeta</button>}
            <button onClick={() => {setVista('registro'); setEditandoPerfil(false);}} className={`text-[10px] font-black uppercase italic px-3 py-2 rounded-xl transition-all ${vista === 'registro' ? 'bg-green-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}>Perfil</button>
            <button onClick={manejarSalida} className="text-[10px] font-black uppercase italic px-3 py-2 rounded-xl text-red-500 bg-red-50">Fuga</button>
            {esAdmin && <button onClick={() => setVista('crear')} className="bg-orange-600 text-white w-9 h-9 rounded-full flex items-center justify-center ml-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+</button>}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {(vista === 'cartelera' || vista === 'sociales') && (
          <div className="animate-in fade-in">
            {vista === 'cartelera' && <SeccionCumpleaños amigos={amigos} />}
            <div className="mb-8">
              <h1 className="text-4xl font-black italic uppercase leading-none">{vista === 'cartelera' ? 'Sufrimiento' : 'Chisme'}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-1">{vista === 'cartelera' ? '— Por voluntad propia' : '— Lo realmente importante'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.filter(ev => vista === 'cartelera' ? (ev.tipo === 'rodada' || ev.tipo === 'running') : ev.tipo === 'social').map(ev => (
                <CardEvento key={ev.id} evento={ev} usuarioActual={usuarioActual} esAdmin={esAdmin} />
              ))}
            </div>
          </div>
        )}

        {/* VISTA REGISTRO / PERFIL */}
        {/* VISTA REGISTRO / PERFIL RESTAURADA AL 100% */}
{vista === 'registro' && (
  <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
    {!editandoPerfil ? (
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-black relative">
        
        {/* Banner de Mantenimiento / Servicio */}
        {(() => {
          const kmsTotales = usuarioActual?.rodadasCount * 50 || 0; // Ajusta según tu lógica de kms
          const ultimoServicio = usuarioActual?.ultimoServicio || 0;
          if (kmsTotales - ultimoServicio > 500) { // Ejemplo: cada 500km
            return (
              <div className="bg-yellow-400 text-black text-[9px] font-black uppercase italic py-2 px-4 flex justify-center items-center gap-2 border-b-2 border-black">
                ⚠️ ¡Aviso! Tu nave requiere mantenimiento (Km: {kmsTotales})
              </div>
            );
          }
        })()}

        <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600" />
        
        <div className="px-8 pb-8 flex flex-col items-center">
          {/* Foto de Perfil */}
          <div className="w-32 h-32 bg-black rounded-[40px] border-8 border-white -mt-16 shadow-xl overflow-hidden">
            <img 
              src={usuarioActual?.fotoPerfil || "/logo.png"} 
              className="w-full h-full object-cover" 
              alt="Perfil" 
            />
          </div>

          {/* Info Básica */}
          <h2 className="mt-4 text-3xl font-black uppercase italic leading-none text-center">
            {usuarioActual?.nombre} {usuarioActual?.apellidos}
          </h2>
          
          {/* Rango */}
          {(() => {
            const conteo = usuarioActual?.rodadasCount || 0;
            let rango = "Recluta";
            let color = "text-gray-400";
            let meta = 10;
            
            if (conteo >= 50) { rango = "Leyenda del Maillot de Oro"; color = "text-yellow-500"; meta = 100; }
            else if (conteo >= 25) { rango = "Líder del Pelotón"; color = "text-orange-500"; meta = 50; }
            else if (conteo >= 10) { rango = "Escalador Pro"; color = "text-blue-500"; meta = 25; }

            const progreso = (conteo / meta) * 100;

            return (
              <div className="w-full mt-4 flex flex-col items-center">
                <p className={`text-xs font-black uppercase italic ${color} mb-4 tracking-widest animate-pulse`}>
                  ⭐ {rango}
                </p>
                
                {/* Barra de Progreso */}
                <div className="w-full bg-gray-100 h-4 rounded-full border-2 border-black overflow-hidden relative">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${progreso}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase">
                    {conteo} / {meta} Actividades
                  </span>
                </div>
                <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase">Próximo nivel a las {meta} rodadas</p>
              </div>
            );
          })()}

          {/* Estadísticas */}
          {/* ESTADÍSTICAS Y ESTATUS CHISTOSO */}
<div className="grid grid-cols-2 gap-3 w-full mt-8">
  <div className="bg-gray-50 p-4 rounded-2xl border-b-4 border-gray-100 text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Actividades</p>
    <p className="text-xl font-black italic">{usuarioActual?.rodadasCount || 0}</p>
  </div>

  <div className="bg-gray-50 p-4 rounded-2xl border-b-4 border-gray-100 text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Mood actual</p>
    {(() => {
      // Lógica de tiempo basada en la última inscripción
      const ahora = new Date().getTime();
      const ultima = usuarioActual?.ultimaInscripcion || ahora; 
      const unaSemana = 7 * 24 * 60 * 60 * 1000;
      const tresDias = 3 * 24 * 60 * 60 * 1000;
      
      const tiempoPasado = ahora - ultima;

      if (tiempoPasado > unaSemana) {
        return (
          <div className="animate-bounce mt-1">
            <p className="text-[10px] font-black italic text-red-500 uppercase leading-tight">👻 ¿Hay alguien ahí?</p>
          </div>
        );
      } else if (tiempoPasado > tresDias) {
        return (
          <div className="mt-1">
            <p className="text-[10px] font-black italic text-yellow-600 uppercase leading-tight">🤨 Sospechoso</p>
          </div>
        );
      }
      return (
        <div className="mt-1">
          <p className="text-[10px] font-black italic text-green-500 uppercase leading-tight">🔥 On Fire</p>
        </div>
      );
    })()}
  </div>
</div>

          {/* Botón Actualizar */}
          <button 
            onClick={() => setEditandoPerfil(true)} 
            className="w-full mt-8 bg-black text-white py-5 rounded-[25px] font-black uppercase italic shadow-[0_6px_0_0_#444] hover:bg-orange-600 active:shadow-none active:translate-y-1 transition-all"
          >
            Actualizar mis datos
          </button>
        </div>
      </div>
    ) : (
      <FormularioRegistro 
        datosIniciales={usuarioActual} 
        onFinalizar={() => { refrescarTodo(); setEditandoPerfil(false); }} 
      />
    )}
  </div>
)}

 {/* VISTA MIEMBROS / GRUPETA (SIN +1) */}
{vista === 'miembros' && esAdmin && (
  <div className="animate-in fade-in duration-500">
    <div className="mb-8">
      <h1 className="text-4xl font-black italic uppercase leading-none text-blue-600">La Grupeta</h1>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">— Central de Inteligencia Zuricata</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {amigos.map(amigo => (
        <div key={amigo.id} className="bg-white p-5 rounded-[35px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative overflow-hidden group">
          
          {/* Header del Miembro */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={amigo.fotoPerfil || "/logo.png"} className="w-14 h-14 rounded-2xl border-2 border-black object-cover" />
              <span className="absolute -bottom-2 -right-2 bg-black text-white text-[8px] font-black px-2 py-1 rounded-lg border border-white">
                KM {amigo.rodadasCount * 45 || 0}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black italic uppercase text-base leading-none truncate">{amigo.nombre}</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1">
                {amigo.rodadasCount >= 50 ? '👑 Leyenda' : amigo.rodadasCount >= 25 ? '🦎 Senior' : '👶 Recluta'}
              </p>
            </div>
          </div>

          {/* PANEL DE ACCIONES ADMIN (SOLO SOS Y ELIMINAR) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-slate-50">
            {/* BOTÓN SOS */}
            <button 
              onClick={() => setUsuarioParaSOS(amigo)} 
              className="bg-red-600 text-white p-4 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(100,0,0,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
              title="Ficha SOS"
            >
              <span className="text-lg">🚨</span>
              <span className="text-[10px] uppercase italic">Ficha SOS</span>
            </button>

            {/* BOTÓN ELIMINAR */}
            <button 
              onClick={async () => {
                if(confirm(`¿Expulsar a ${amigo.nombre} de la grupeta? No hay vuelta atrás.`)) {
                   await deleteDoc(doc(db, "usuarios", amigo.id));
                   refrescarTodo();
                }
              }} 
              className="bg-slate-100 text-slate-400 p-4 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] hover:bg-black hover:text-white hover:shadow-black active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
              title="Eliminar Miembro"
            >
              <span className="text-lg">🗑️</span>
              <span className="text-[10px] uppercase italic">Expulsar</span>
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* RENDER DEL MODAL SOS */}
    {usuarioParaSOS && (
      <ModalEmergencia 
        usuario={usuarioParaSOS} 
        alCerrar={() => setUsuarioParaSOS(null)} 
      />
    )}
  </div>
)}

        {vista === 'crear' && esAdmin && <FormularioEvento onEventoCreado={() => { refrescarTodo(); setVista('cartelera'); }} />}
      </div>
    </main>
  );
}