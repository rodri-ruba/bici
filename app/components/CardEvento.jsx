'use client';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from "firebase/firestore"; 
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

  // AJUSTE: Usamos la propiedad correcta 'horaSalida' que viene del formulario
  const horaSalida = evento.horaSalida || "07:00";
  
  // AJUSTE: Priorizamos la hora de llegada manual del formulario, si no existe, calculamos
  const horaRegreso = () => {
    if (evento.horaLlegada) return evento.horaLlegada;
    
    const [h, m] = horaSalida.split(':');
    const llegadaH = (parseInt(h) + (esRunning ? 2 : 4)) % 24;
    return `${llegadaH < 10 ? '0' + llegadaH : llegadaH}:${m}`;
  };

  const distanciasSociales = ["Hasta que truene CHSM"];
  const ascensosSociales = ["Elevación Espiritual"];
  const idx = evento.id ? evento.id.length % 5 : 0;

  // Validación de seguridad para usuarioActual
  const nombreCompleto = usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellidos}` : "";
  const yaEstaAnotado = evento.asistentes?.includes(nombreCompleto);

  const eliminarEvento = async () => {
    if (!window.confirm("¿Deseas eliminar este evento? Los ciclistas conservarán sus puntos de rodada acumulados.")) return;
    try {
      await deleteDoc(doc(db, "eventos", evento.id));
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el evento.");
    }
  };

  const manejarAsistencia = async (accion) => {
    if (cargando || esPasado || !usuarioActual) return;
    setCargando(true);
    try {
      const eventoRef = doc(db, "eventos", evento.id);
      const usuarioRef = doc(db, "usuarios", usuarioActual.id);

      if (accion === 'anotarse') {
        await updateDoc(eventoRef, { asistentes: arrayUnion(nombreCompleto) });
        await updateDoc(usuarioRef, {
          rodadasCount: increment(1),
          ultimaInscripcion: Date.now()
        });
      } else {
        await updateDoc(eventoRef, { asistentes: arrayRemove(nombreCompleto) });
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
    <div className={`bg-white rounded-[32px] overflow-hidden border border-gray-100 flex flex-col transition-all relative font-['Roboto',sans-serif] shadow-sm
      ${esPasado ? 'opacity-75 grayscale-[0.8]' : 'hover:shadow-xl hover:shadow-black/5'}`}>
      
      {esAdmin && (
        <button 
          onClick={eliminarEvento}
          className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 p-2.5 rounded-xl border border-gray-100 transition-all shadow-xl text-xs"
        >
          🗑️
        </button>
      )}

      <div className="relative">
        <img 
          src={evento.imagen || "https://images.unsplash.com/photo-1541625602330-2277a4c46182"} 
          className="w-full h-48 object-cover" 
          alt={evento.titulo} 
        />
        
        <div className={`absolute top-4 left-4 text-[9px] font-bold px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg z-10 
          ${esPasado ? 'bg-gray-500 text-white' : 
            esSocial ? 'bg-black text-white' : 
            esRunning ? 'bg-gray-700 text-white' : 'bg-[#8CAACF] text-white'}`}>
          {esPasado ? '🏁 Finalizado' : (esSocial ? '🥂 Chisme' : (esRunning ? '🏃‍♂️ Raaning' : '🚴‍♂️ Bici'))}
        </div>

        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[9px] font-bold px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">
          {evento.asistentes?.length || 0} Participantes
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className={`text-xl font-bold tracking-tight mb-4 leading-none ${esPasado ? 'text-gray-400' : 'text-black'}`}>
          {evento.titulo}
        </h3>

        <div className="flex gap-3 mb-6">
          <div className={`${esPasado ? 'bg-gray-50' : 'bg-[#F3F3FC]'} px-4 py-2 rounded-2xl flex-1 border border-blue-50/50`}>
            <p className="text-[8px] font-bold text-[#7E8285] uppercase tracking-widest mb-1">{esRunning ? 'Distancia' : 'Kilómetros'}</p>
            <p className={`text-xs font-bold ${esPasado ? 'text-gray-400' : 'text-black'}`}>
              {esSocial ? distanciasSociales[idx] : `${evento.distancia || '??'} KM`}
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-2xl flex-1 border border-gray-100">
            <p className="text-[8px] font-bold text-[#7E8285] uppercase tracking-widest mb-1">Elevación</p>
            <p className={`text-xs font-bold ${esPasado ? 'text-gray-400' : 'text-black'}`}>
              {esSocial ? ascensosSociales[idx] : `+${evento.altimetria || '0'} M`}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
            <span className="w-5">📅</span> {fechaFinal} 
            {esPasado && <span className="text-red-300 text-[8px] tracking-widest uppercase ml-auto">(Cerrada)</span>}
          </p>
          <p className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
            <span className="w-5">⏰</span> {horaSalida} hrs 
            <span className="text-gray-300 font-light">→</span> 
            <span className="font-medium text-gray-400">Regreso {horaRegreso()} hrs</span>
          </p>
          <p className="text-[11px] font-medium text-[#8CAACF] flex items-center gap-2 truncate">
            <span className="w-5 text-gray-400">📍</span> {evento.puntoEncuentro || 'Punto por definir'}
          </p>
        </div>

        <div className="mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <p className="text-[11px] text-[#7E8285] leading-relaxed line-clamp-3">
            "{evento.descripcion || "La Zuricata no dejó instrucciones, confía en tu instinto."}"
          </p>
        </div>

        {evento.asistentes?.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-1.5">
              {evento.asistentes.map((nombre, i) => (
                <span key={i} className="text-[8px] bg-white border border-gray-100 text-[#7E8285] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                  {nombre.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-50">
          {!yaEstaAnotado ? (
            <button 
              onClick={() => manejarAsistencia('anotarse')}
              disabled={cargando || esPasado}
              className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all text-[10px]
                ${esPasado 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-black text-white hover:bg-[#8CAACF] shadow-lg shadow-black/10 active:scale-[0.98]"
                }`}
            >
              {cargando ? "Sincronizando..." : esPasado ? "Se acabó" : "¡Me anoto!"}
            </button>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl font-bold uppercase tracking-[0.2em] text-center border border-green-100 text-[10px]">
                ✓ Dentro
              </div>
              <button 
                onClick={() => manejarAsistencia('cancelar')}
                disabled={cargando || esPasado}
                className="px-5 py-4 bg-gray-50 text-[#7E8285] rounded-2xl font-bold uppercase tracking-widest text-[8px] border border-gray-100 hover:bg-red-50 hover:text-red-400 transition-all"
              >
                Fuga ❄️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}