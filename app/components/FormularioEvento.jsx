'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FormularioEvento({ onEventoCreado }) {
  const [cargando, setCargando] = useState(false);
  const [evento, setEvento] = useState({
    tipo: 'rodada',
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
      // 1. Preparamos el objeto para Firestore
      const nuevoEvento = {
        ...evento,
        asistentes: [], // Lista vacía de inicio
        creadoEn: serverTimestamp() // Marca de tiempo del servidor
      };

      // 2. Guardamos en la colección "eventos" de la DB dbciclismo
      const docRef = await addDoc(collection(db, "eventos"), nuevoEvento);

      alert("¡Rodada publicada en la cartelera! 🚀");
      
      // 3. Notificamos al padre para que refresque la vista (opcional)
      if (onEventoCreado) onEventoCreado();

      // 4. Limpiamos el formulario
      setEvento({
        tipo: 'rodada', titulo: '', imagen: '', fecha: '',
        horaSalida: '', horaLlegada: '', puntoEncuentro: '',
        distancia: '', altimetria: '', descripcion: '', nivel: 'Básico'
      });

    } catch (error) {
      console.error("Error al crear evento:", error);
      alert("Se rompió la cadena: No pudimos subir el evento.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={crearEvento} className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-[40px] mt-10 space-y-6 text-gray-800 border-4 border-black relative overflow-hidden">
      
      {/* Indicador de carga sutil */}
      {cargando && (
        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Configurar Ruta</h2>
          <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-1">Panel de Control Admin</p>
        </div>
        <select 
          name="tipo" 
          value={evento.tipo} 
          onChange={manejarCambio}
          className="bg-black text-white font-black py-2 px-4 rounded-2xl text-[10px] outline-none border-b-4 border-gray-700 uppercase italic cursor-pointer"
        >
          <option value="rodada">🚲 Rodada</option>
          <option value="social">🍻 Social</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Título de la Rodada</label>
          <input type="text" name="titulo" value={evento.titulo} onChange={manejarCambio} placeholder="Ej: Ascenso al Ajusco" className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 rounded-t-xl outline-none focus:border-orange-500 transition-colors font-bold text-lg" required />
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
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">🏁 Regreso</label>
            <input type="time" name="horaLlegada" value={evento.horaLlegada} onChange={manejarCambio} className="w-full bg-transparent outline-none font-bold text-sm" />
          </div>
        </div>

        {evento.tipo === 'rodada' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded-2xl border-b-2 border-orange-100">
              <label className="text-[9px] font-black uppercase text-orange-500 block mb-1">Distancia (KM)</label>
              <input type="number" name="distancia" value={evento.distancia} onChange={manejarCambio} placeholder="60" className="w-full bg-transparent outline-none font-black text-orange-600 text-lg" />
            </div>
            <div className="bg-orange-50 p-3 rounded-2xl border-b-2 border-orange-100">
              <label className="text-[9px] font-black uppercase text-orange-500 block mb-1">Altimetría (D+)</label>
              <input type="number" name="altimetria" value={evento.altimetria} onChange={manejarCambio} placeholder="800" className="w-full bg-transparent outline-none font-black text-orange-600 text-lg" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">📍 Punto de Encuentro</label>
            <input type="text" name="puntoEncuentro" value={evento.puntoEncuentro} onChange={manejarCambio} placeholder="Starbucks / Gasolinera" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-orange-500 font-bold text-sm" required />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">🖼️ Link Imagen de Ruta</label>
            <input type="text" name="imagen" value={evento.imagen} onChange={manejarCambio} placeholder="URL de Unsplash o similar" className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-orange-500 font-bold text-sm" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">📝 Briefing de la rodada</label>
          <textarea name="descripcion" value={evento.descripcion} onChange={manejarCambio} placeholder="Indica el ritmo (ej. 25km/h promedio), paradas para café, etc." className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 h-24 text-sm font-medium"></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={cargando}
        className="w-full bg-black text-white font-black py-5 rounded-[25px] hover:bg-orange-600 transition-all shadow-[0_8px_0_0_#444] active:shadow-none active:translate-y-1 uppercase italic tracking-widest text-lg"
      >
        {cargando ? "Sincronizando..." : "LANZAR CONVOCATORIA 📢"}
      </button>
    </form>
  );
}