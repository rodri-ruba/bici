'use client';
import { useState } from 'react';
import FormularioRegistro from '../components/FormularioRegistro';
import { useRouter } from 'next/navigation';
import { db, storage } from '../../lib/firebase'; 
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function PaginaInvitacion() {
  const [aceptado, setAceptado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const finalizarRegistro = async (datosCompletos) => {
    setCargando(true);
    try {
      let urlFoto = "";
      if (datosCompletos.fotoPerfil && datosCompletos.fotoPerfil.startsWith('data:image')) {
        const nombreArchivo = `perfiles/${datosCompletos.usuario}_${Date.now()}.jpg`;
        const storageRef = ref(storage, nombreArchivo);
        const snapshot = await uploadString(storageRef, datosCompletos.fotoPerfil, 'data_url');
        urlFoto = await getDownloadURL(snapshot.ref);
      }

      const usuarioParaGuardar = {
        ...datosCompletos,
        mantenimiento: {
          fechaUltimoServicio: datosCompletos.fechaUltimoServicio,
          kmEnUltimoServicio: Number(datosCompletos.kmEnUltimoServicio) || 0,
        },
        kmAcumuladosDesdeRegistro: 0,
        asistencias: 0,
        role: 'miembro',
        fotoPerfil: urlFoto || `https://ui-avatars.com/api/?name=${datosCompletos.nombre}`,
        fechaRegistro: new Date().toISOString()
      };

      await setDoc(doc(db, "usuarios", usuarioParaGuardar.usuario.toLowerCase()), usuarioParaGuardar);
      alert(`¡Bienvenido al pelotón, ${datosCompletos.nombre}!`);
      router.push('/'); 

    } catch (error) {
      console.error(error);
      alert("Se nos salió la cadena (Error de conexión).");
    } finally {
      setCargando(false);
    }
  };

  if (!aceptado) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-[#2a2a2a] border-4 border-orange-500 p-10 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(249,115,22,1)]">
            <span className="text-6xl mb-6 block animate-bounce">☕️</span>
            <h1 className="text-4xl font-black italic text-white uppercase mb-4 tracking-tighter">
              ¿Estás listo para <span className="text-orange-500">Sufrir?</span>
            </h1>
            <p className="text-gray-400 font-bold text-sm mb-8 italic italic">
              "En esta grupeta no se deja a nadie... excepto si hay un KOM."
            </p>
            <button onClick={() => setAceptado(true)} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl hover:bg-white hover:text-orange-500 transition-all uppercase tracking-widest italic text-lg">
              Firmar Sentencia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-500 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {cargando ? (
          <div className="text-center p-20 bg-black rounded-[50px]">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-black italic text-white uppercase tracking-widest">Inflando llantas...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[40px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black">
            <div className="bg-black p-4 text-center">
              <p className="text-orange-500 font-black italic uppercase text-xs tracking-[0.3em]">Hoja de Vida del Ciclista</p>
            </div>
            <FormularioRegistro alGuardar={finalizarRegistro} />
          </div>
        )}
      </div>
    </div>
  );
}