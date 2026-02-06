'use client';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore"; // Añadido increment
import { useState } from 'react';

export default function CardEvento({ evento, usuarioActual, esAdmin }) {
  const [cargando, setCargando] = useState(false);
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaEvento = new Date(evento.fecha + "T00:00:00");
  const esPasado = fechaEvento < hoy;
  
  const esSocial = evento.tipo?.toLowerCase() === 'social';
  const esRunning = evento.tipo?.toLowerCase() === 'running';

  const fechaFormateada = fechaEvento.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const fechaFinal = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  const horaSalida = evento.hora || "07:00";
  const horaRegreso = () => {
    const [h, m] = horaSalida.split(':');
    const llegadaH = (parseInt(h) + (esRunning ? 2 : 4)) % 24;
    return `${llegadaH < 10 ? '0' + llegadaH : llegadaH}:${m}`;
  };

  const distanciasSociales = ["Hasta que truene CHSM"];
  const ascensosSociales = ["Elevación Espiritual"];
  const idx = evento.id ? evento.id.length % 5 : 0;

  const nombreCompleto = `${usuarioActual.nombre} ${usuarioActual.apellidos}`;
  const yaEstaAnotado = evento.asistentes?.includes(nombreCompleto);

  const manejarAsistencia = async (accion) => {
    if (cargando || esPasado) return;
    setCargando(true);
    try {
      const eventoRef = doc(db, "eventos", evento.id);
      const usuarioRef = doc(db, "usuarios", usuarioActual.id); // Referencia al usuario

      if (accion === 'anotarse') {
        // ACTUALIZACIÓN DE EVENTO Y USUARIO (FECHA Y CONTADOR)
        await updateDoc(eventoRef, {
          asistentes: arrayUnion(nombreCompleto)
        });
        await updateDoc(usuarioRef, {
          rodadasCount: increment(1),
          ultimaInscripcion: Date.now() // Activa el modo "On Fire"
        });
      } else {
        // CANCELAR: QUITA NOMBRE Y RESTA CONTADOR
        await updateDoc(eventoRef, {
          asistentes: arrayRemove(nombreCompleto)
        });
        await updateDoc(usuarioRef, {
          rodadasCount: increment(-1)
        });
      }

      window.location.reload(); 
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={`bg-white rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden border-2 flex flex-col transition-all 
      ${esPasado ? 'opacity-75 grayscale-[0.8] border-gray-200' : 'hover:scale-[1.02] border-gray-100'}`}>
      
      <div className="relative">
        <img 
          src={evento.imagen || "https://images.unsplash.com/photo-1541625602330-2277a4c46182"} 
          className="w-full h-44 object-cover" 
          alt={evento.titulo} 
        />
        
        <div className={`absolute top-3 left-3 text-[9px] font-black px-3 py-1.5 rounded-full uppercase italic shadow-lg border-2 
          ${esPasado ? 'bg-gray-500 text-white border-white' : 
            esSocial ? 'bg-purple-600 text-white border-black' : 
            esRunning ? 'bg-sky-400 text-white border-black' : 'bg-orange-500 text-white border-black'}`}>
          {esPasado ? '🏁 Murió' : (esSocial ? '🥂 Chisme' : (esRunning ? '🏃‍♂️ Raaning' : '🚴‍♂️ Bici'))}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
          ⚡ {evento.asistentes?.length || 0} EN EL PELOTÓN
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-2 leading-none ${esPasado ? 'text-gray-500' : 'text-black'}`}>
          {evento.titulo}
        </h3>

        <div className="flex gap-4 mb-4">
          <div className={`${esPasado ? 'bg-gray-100' : 'bg-orange-50'} px-3 py-1 rounded-xl flex-1`}>
            <p className="text-[8px] font-black text-gray-400 uppercase leading-none">{esRunning ? 'Distancia' : 'Kilómetros'}</p>
            <p className={`text-[10px] font-bold italic ${esPasado ? 'text-gray-500' : (esSocial ? 'text-purple-600' : 'text-orange-600')}`}>
              {esSocial ? distanciasSociales[idx] : `${evento.distancia || '??'}km`}
            </p>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-xl flex-1">
            <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Elevación</p>
            <p className="text-[10px] font-bold text-gray-700 italic">
              {esSocial ? ascensosSociales[idx] : `+${evento.altimetria || '0'}m`}
            </p>
          </div>
        </div>
        
        <div className="text-[11px] font-bold text-gray-500 space-y-1 mb-2">
          <p className="flex items-center gap-2">📅 {fechaFinal} {esPasado && <span className="text-red-400 font-black text-[9px] uppercase tracking-tighter">(Cerrada)</span>}</p>
          <p className="flex items-center gap-2">⏰ {horaSalida} hrs <span className="text-gray-300">→</span> <span className="font-normal italic">Regreso {horaRegreso()} hrs</span></p>
          <p className="flex items-center gap-2 text-gray-400 italic truncate">📍 {evento.puntoEncuentro || 'Punto por definir'}</p>
        </div>

        <div className="mb-4 pt-2 border-t border-gray-50">
          <p className="text-[11px] text-gray-500 italic leading-tight">
            "{evento.descripcion || "La Zuricata no dejó instrucciones, confía en tu instinto."}"
          </p>
        </div>

        {evento.asistentes?.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-1">
              {evento.asistentes.map((nombre, i) => (
                <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold">
                  {nombre.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {!yaEstaAnotado ? (
            <button 
              onClick={() => manejarAsistencia('anotarse')}
              disabled={cargando || esPasado}
              className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-widest transition-all text-sm border-b-4 
                ${esPasado 
                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
                  : "bg-black text-white border-gray-700 hover:bg-orange-600 hover:border-orange-800 active:border-b-0 active:translate-y-1 shadow-xl"
                }`}
            >
              {cargando ? "Sincronizando..." : esPasado ? "Se acabó" : "¡Me anoto!"}
            </button>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 py-4 bg-green-50 text-green-500 rounded-2xl font-black uppercase italic text-center border-2 border-green-100 text-sm">
                ✓ Dentro
              </div>
              <button 
                onClick={() => manejarAsistencia('cancelar')}
                disabled={cargando || esPasado}
                className="px-4 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase italic text-[9px] border-b-4 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
              >
                Me dio frío ❄️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}