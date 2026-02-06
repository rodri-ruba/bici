'use client';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useState } from 'react';

export default function CardEvento({ evento, usuarioActual, esAdmin }) {
  const [cargando, setCargando] = useState(false);
  
  // 1. LÓGICA DE FECHA (Para saber si ya pasó)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Limpiamos horas para comparar solo días
  
  const fechaEvento = new Date(evento.fecha + "T00:00:00"); // Forzamos formato local
  const esPasado = fechaEvento < hoy;

  // Verificamos si el usuario ya está anotado
  const nombreCompleto = `${usuarioActual.nombre} ${usuarioActual.apellidos}`;
  const yaEstaAnotado = evento.asistentes?.includes(nombreCompleto);

  const manejarClickAnotarse = async () => {
    if (yaEstaAnotado || cargando || esPasado) return;
    
    setCargando(true);
    try {
      const eventoRef = doc(db, "eventos", evento.id);
      await updateDoc(eventoRef, {
        asistentes: arrayUnion(nombreCompleto)
      });
      window.location.reload(); 
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el pelotón.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={`bg-white rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden border-2 flex flex-col transition-all 
      ${esPasado ? 'opacity-75 grayscale-[0.5] border-gray-200' : 'hover:scale-[1.02] border-gray-100'}`}>
      
      <div className="relative">
        <img 
          src={evento.imagen || "https://images.unsplash.com/photo-1541625602330-2277a4c46182"} 
          className="w-full h-44 object-cover" 
          alt={evento.titulo} 
        />
        
        {/* Badge Dinámico */}
        <div className={`absolute top-3 left-3 text-[10px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg ${esPasado ? 'bg-gray-500 text-white' : 'bg-orange-500 text-white'}`}>
          {esPasado ? '🏁 Finalizada' : (evento.tipo || 'Rodada')}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
          🚴‍♂️ {evento.asistentes?.length || 0} ASISTEN
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-2 leading-none ${esPasado ? 'text-gray-500' : 'text-black'}`}>
          {evento.titulo}
        </h3>
        
        <div className="flex gap-4 mb-4">
          <div className={`${esPasado ? 'bg-gray-100' : 'bg-orange-50'} px-3 py-1 rounded-xl`}>
            <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Distancia</p>
            <p className={`text-sm font-bold italic ${esPasado ? 'text-gray-500' : 'text-orange-600'}`}>{evento.distancia || '??'}km</p>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-xl">
            <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Ascenso</p>
            <p className="text-sm font-bold text-gray-700 italic">+{evento.altimetria || '0'}m</p>
          </div>
        </div>

        <div className="text-[11px] font-bold text-gray-500 space-y-1 mb-6">
          <p className="flex items-center gap-2">📅 {evento.fecha} {esPasado && <span className="text-red-400 font-black text-[9px] uppercase tracking-tighter">(Cerrada)</span>}</p>
          <p className="flex items-center gap-2 text-gray-400 italic">📍 {evento.puntoEncuentro || 'Punto por definir'}</p>
        </div>

        {/* LISTA DE ASISTENTES */}
        {evento.asistentes?.length > 0 && (
          <div className="mb-6">
            <p className="text-[9px] font-black uppercase text-gray-300 mb-2 tracking-widest">
              {esPasado ? 'Asistieron:' : 'Confirmados:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {evento.asistentes.map((nombre, i) => (
                <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold">
                  {nombre.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* BOTÓN CON TRES ESTADOS */}
        <button 
          onClick={manejarClickAnotarse}
          disabled={yaEstaAnotado || cargando || esPasado}
          className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-widest transition-all text-sm border-b-4 
            ${esPasado 
              ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
              : yaEstaAnotado 
                ? "bg-green-50 text-green-500 border-green-200 cursor-default" 
                : "bg-black text-white border-gray-700 hover:bg-orange-600 hover:border-orange-800 active:border-b-0 active:translate-y-1 shadow-xl"
            }`}
        >
          {cargando 
            ? "Sincronizando..." 
            : esPasado 
              ? "Evento Terminado" 
              : yaEstaAnotado 
                ? "✓ En el Pelotón" 
                : "¡Me anoto!"}
        </button>
      </div>
    </div>
  );
}