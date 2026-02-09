'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FormularioEvento({ onEventoCreado }) {
  const [cargando, setCargando] = useState(false);
  const [evento, setEvento] = useState({
    tipo: 'rodada', // rodada, running, social
    titulo: '',
    imagen: '',
    fecha: '',
    horaSalida: '',
    horaLlegada: '',
    puntoEncuentro: '',
    distancia: '',
    altimetria: '',
    descripcion: '',
    nivel: 'Básico'
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setEvento({ ...evento, [name]: value });
  };

  // NUEVA FUNCIÓN PARA PROCESAR EL ARCHIVO
  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvento({ ...evento, imagen: reader.result }); // Guarda el base64
      };
      reader.readAsDataURL(file);
    }
  };

  const crearEvento = async (e) => {
    e.preventDefault();
    if (cargando) return;

    setCargando(true);
    try {
      // AJUSTE: Forzamos que las horas se envíen como strings literales
      const nuevoEvento = {
        ...evento,
        horaSalida: String(evento.horaSalida),
        horaLlegada: String(evento.horaLlegada),
        asistentes: [],
        creadoEn: serverTimestamp()
      };

      await addDoc(collection(db, "eventos"), nuevoEvento);
      alert("¡Publicado en el Sufrimiento! 🚀");
      
      if (onEventoCreado) onEventoCreado();

      setEvento({
        tipo: 'rodada', titulo: '', imagen: '', fecha: '',
        horaSalida: '', horaLlegada: '', puntoEncuentro: '',
        distancia: '', altimetria: '', descripcion: '', nivel: 'Básico'
      });

    } catch (error) {
      console.error("Error:", error);
      alert("Se rompió la cadena: No pudimos subir el evento.");
    } finally {
      setCargando(false);
    }
  };

  const inputBase = "w-full bg-[#F3F3FC] border-b border-gray-200 p-3 outline-none focus:border-[#8CAACF] transition-colors font-bold text-sm text-black placeholder:text-gray-300";
  const labelBase = "text-[10px] font-bold uppercase text-[#7E8285] tracking-[0.2em] ml-1 mb-1 block";

  return (
    <form onSubmit={crearEvento} className="max-w-2xl mx-auto p-8 bg-white shadow-xl shadow-black/5 rounded-[32px] mt-10 space-y-8 border border-gray-100 relative overflow-hidden font-['Roboto',sans-serif]">
      
      {cargando && (
        <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
          <div className="w-10 h-10 border-2 border-[#8CAACF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase leading-none text-black">Nuevo Sufrimiento</h2>
          <p className="text-[9px] font-bold text-[#7E8285] tracking-[0.2em] uppercase mt-2">Configuración de Mood</p>
        </div>
        
        <select 
          name="tipo" 
          value={evento.tipo} 
          onChange={manejarCambio}
          className={`font-bold py-2.5 px-5 rounded-xl text-[10px] outline-none border-none uppercase tracking-widest cursor-pointer transition-all shadow-sm ${
            evento.tipo === 'rodada' ? 'bg-[#8CAACF] text-white' : 
            evento.tipo === 'running' ? 'bg-gray-800 text-white' : 
            'bg-black text-white'
          }`}
        >
          <option value="rodada">🚲 Bici</option>
          <option value="running">👟 Raaning</option>
          <option value="social">🥂 Chisme</option>
        </select>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label className={labelBase}>Título del {evento.tipo === 'social' ? 'Chisme' : 'Sufrimiento'}</label>
          <input type="text" name="titulo" value={evento.titulo} onChange={manejarCambio} placeholder="Ej: Ruta de los Muertos" className={`${inputBase} text-lg rounded-t-xl`} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className={labelBase}>📅 Fecha</label>
            <input type="date" name="fecha" value={evento.fecha} onChange={manejarCambio} className={`${inputBase} rounded-xl border-none`} required />
          </div>
          <div className="flex flex-col">
            <label className={labelBase}>🕒 Salida</label>
            <input type="time" name="horaSalida" value={evento.horaSalida} onChange={manejarCambio} className={`${inputBase} rounded-xl border-none`} required />
          </div>
          <div className="flex flex-col">
            <label className={labelBase}>🏁 Regreso aprox</label>
            <input type="time" name="horaLlegada" value={evento.horaLlegada} onChange={manejarCambio} className={`${inputBase} rounded-xl border-none`} />
          </div>
        </div>

        {evento.tipo !== 'social' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#F3F3FC] p-4 rounded-2xl border border-gray-100">
              <label className="text-[9px] font-bold uppercase block mb-1 text-[#8CAACF] tracking-widest">
                Distancia ({evento.tipo === 'running' ? 'Pasos/KM' : 'KM'})
              </label>
              <input type="number" name="distancia" value={evento.distancia} onChange={manejarCambio} placeholder="0" className="w-full bg-transparent outline-none font-bold text-xl text-black" />
            </div>
            <div className="bg-[#F3F3FC] p-4 rounded-2xl border border-gray-100">
              <label className="text-[9px] font-bold uppercase block mb-1 text-[#8CAACF] tracking-widest">Elevación (D+)</label>
              <input type="number" name="altimetria" value={evento.altimetria} onChange={manejarCambio} placeholder="0" className="w-full bg-transparent outline-none font-bold text-xl text-black" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>📍 ¿Dónde nos vemos?</label>
            <input type="text" name="puntoEncuentro" value={evento.puntoEncuentro} onChange={manejarCambio} placeholder="Starbucks / Punto exacto" className={`${inputBase} rounded-xl border-none`} required />
          </div>
          <div>
            {/* INPUT DE IMAGEN MODIFICADO A TYPE FILE */}
            <label className={labelBase}>🖼️ Foto de la ruta (Subir)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={manejarArchivo} 
              className={`${inputBase} rounded-xl border-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#8CAACF] file:text-white cursor-pointer`} 
            />
          </div>
        </div>

        <div>
          <label className={labelBase}>📝 Briefing del {evento.tipo === 'social' ? 'Chisme' : 'Sufrimiento'}</label>
          <textarea name="descripcion" value={evento.descripcion} onChange={manejarCambio} placeholder="Ritmo, si hay café al final, equipo necesario..." className="w-full bg-[#F3F3FC] p-4 rounded-2xl outline-none focus:border-[#8CAACF] border border-transparent transition-colors h-28 text-sm font-medium text-black placeholder:text-gray-300"></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={cargando}
        className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-[#8CAACF] transition-all shadow-lg shadow-black/10 uppercase tracking-[0.2em] text-xs active:scale-[0.98]"
      >
        {cargando ? "Sincronizando..." : "LANZAR EVENTO 📢"}
      </button>
    </form>
  );
}