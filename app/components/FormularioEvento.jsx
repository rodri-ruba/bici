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

  const crearEvento = async (e) => {
    e.preventDefault();
    if (cargando) return;

    setCargando(true);
    try {
      const nuevoEvento = {
        ...evento,
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

  return (
    <form onSubmit={crearEvento} className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-[40px] mt-10 space-y-6 text-gray-800 border-4 border-black relative overflow-hidden">
      
      {cargando && (
        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Nuevo Sufrimiento</h2>
          <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-1">Configuración de Mood</p>
        </div>
        
        {/* SELECTOR DE DISCIPLINA ACTUALIZADO */}
        <select 
          name="tipo" 
          value={evento.tipo} 
          onChange={manejarCambio}
          className={`font-black py-2 px-4 rounded-2xl text-[10px] outline-none border-b-4 uppercase italic cursor-pointer transition-colors ${
            evento.tipo === 'rodada' ? 'bg-orange-500 text-white border-orange-700' : 
            evento.tipo === 'running' ? 'bg-sky-400 text-white border-sky-600' : 
            'bg-purple-600 text-white border-purple-800'
          }`}
        >
          <option value="rodada">🚲 Bici</option>
          <option value="running">👟 Raaning</option>
          <option value="social">🥂 Chisme</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título del {evento.tipo === 'social' ? 'Chisme' : 'Sufrimiento'}</label>
          <input type="text" name="titulo" value={evento.titulo} onChange={manejarCambio} placeholder="Ej: Ruta de los Muertos" className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 rounded-t-xl outline-none focus:border-orange-500 transition-colors font-bold text-lg" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-2xl border-b-2 border-gray-100">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">📅 Fecha</label>
            <input type="date" name="fecha" value={evento.fecha} onChange={manejarCambio} className="w-full bg-transparent outline-none font-bold text-sm" required />
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border-b-2 border-gray-100">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">🕒 Salida</label>
            <input type="time" name="horaSalida" value={evento.horaSalida} onChange={manejarCambio} className="w-full bg-transparent outline-none font-bold text-sm" required />
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border-b-2 border-gray-100">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">🏁 Regreso aprox</label>
            <input type="time" name="horaLlegada" value={evento.horaLlegada} onChange={manejarCambio} className="w-full bg-transparent outline-none font-bold text-sm" />
          </div>
        </div>

        {/* DISTANCIA Y ALTIMETRIA (Ocultar solo si es Chisme/Social) */}
        {evento.tipo !== 'social' && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-2xl border-b-2 ${evento.tipo === 'running' ? 'bg-sky-50 border-sky-100' : 'bg-orange-50 border-orange-100'}`}>
              <label className={`text-[9px] font-black uppercase block mb-1 ${evento.tipo === 'running' ? 'text-sky-500' : 'text-orange-500'}`}>
                Distancia ({evento.tipo === 'running' ? 'Pasos/KM' : 'KM'})
              </label>
              <input type="number" name="distancia" value={evento.distancia} onChange={manejarCambio} placeholder="0" className={`w-full bg-transparent outline-none font-black text-lg ${evento.tipo === 'running' ? 'text-sky-600' : 'text-orange-600'}`} />
            </div>
            <div className={`p-3 rounded-2xl border-b-2 ${evento.tipo === 'running' ? 'bg-sky-50 border-sky-100' : 'bg-orange-50 border-orange-100'}`}>
              <label className={`text-[9px] font-black uppercase block mb-1 ${evento.tipo === 'running' ? 'text-sky-500' : 'text-orange-500'}`}>Elevación (D+)</label>
              <input type="number" name="altimetria" value={evento.altimetria} onChange={manejarCambio} placeholder="0" className={`w-full bg-transparent outline-none font-black text-lg ${evento.tipo === 'running' ? 'text-sky-600' : 'text-orange-600'}`} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">📍 ¿Dónde nos vemos?</label>
            <input type="text" name="puntoEncuentro" value={evento.puntoEncuentro} onChange={manejarCambio} placeholder="Starbucks / Punto exacto" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-orange-500 font-bold text-sm" required />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">🖼️ Foto de la ruta (URL)</label>
            <input type="text" name="imagen" value={evento.imagen} onChange={manejarCambio} placeholder="Link de imagen" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-orange-500 font-bold text-sm" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">📝 Briefing del {evento.tipo === 'social' ? 'Chisme' : 'Sufrimiento'}</label>
          <textarea name="descripcion" value={evento.descripcion} onChange={manejarCambio} placeholder="Ritmo, si hay café al final, equipo necesario..." className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 h-24 text-sm font-medium"></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={cargando}
        className="w-full bg-black text-white font-black py-5 rounded-[25px] hover:bg-orange-600 transition-all shadow-[0_8px_0_0_#444] active:shadow-none active:translate-y-1 uppercase italic tracking-widest text-lg"
      >
        {cargando ? "Sincronizando..." : "LANZAR EVENTO 📢"}
      </button>
    </form>
  );
}