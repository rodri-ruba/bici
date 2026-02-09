'use client';
import { useState, useEffect } from 'react';
import FormularioRegistro from '../components/FormularioRegistro';
import { useRouter } from 'next/navigation';
import { db, storage } from '../../lib/firebase'; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function PaginaInvitacion() {
  const [aceptado, setAceptado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [claveInput, setClaveInput] = useState('');
  const [claveReal, setClaveReal] = useState('');
  const router = useRouter();

  // OBTENER LA CLAVE DINÁMICA DE FIRESTORE
  useEffect(() => {
    const obtenerClaveAcceso = async () => {
      try {
        const docRef = doc(db, "configuracion", "acceso");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClaveReal(docSnap.data().palabraSecreta);
        }
      } catch (error) {
        console.error("Error al obtener clave:", error);
      }
    };
    obtenerClaveAcceso();
  }, []);

  const validarClaveYEntrar = () => {
    if (claveInput.trim().toUpperCase() === claveReal.toUpperCase()) {
      setAceptado(true);
    } else {
      alert("❌ Clave incorrecta. Solo miembros invitados pueden entrar al pelotón.");
    }
  };

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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden font-['Roboto',sans-serif]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#8CAACF]/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7E8285]/10 blur-[100px]" />
        </div>

        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-12 rounded-[50px] shadow-2xl">
            <div className="w-20 h-20 bg-white inline-flex items-center justify-center rounded-3xl mb-8 shadow-xl rotate-3">
              <span className="text-4xl">☕️</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white uppercase mb-4 tracking-tighter leading-none">
              ¿Vienes a <span className="text-[#8CAACF]">Sufrir</span> o por el café?
            </h1>
            
            <p className="text-gray-400 font-medium text-xs mb-8 tracking-widest uppercase leading-relaxed">
              "Aquí no se deja a nadie... <br/> 
              <span className="text-white/40 font-bold">excepto si hay un KOM de por medio."</span>
            </p>

            {/* INPUT DE PALABRA CLAVE */}
            <div className="mb-6 space-y-2">
              <label className="text-[9px] font-bold text-[#8CAACF] uppercase tracking-[0.3em] block">Introduce la palabra secreta</label>
              <input 
                type="text" 
                value={claveInput}
                onChange={(e) => setClaveInput(e.target.value)}
                placeholder="PALABRA CLAVE"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-center font-bold tracking-[0.4em] outline-none focus:border-[#8CAACF] transition-all placeholder:text-white/10 text-sm"
              />
            </div>

            <button 
              onClick={validarClaveYEntrar} 
              className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#8CAACF] hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] shadow-xl active:scale-95"
            >
              Firmar mi Sentencia
            </button>
            
            <p className="mt-8 text-[8px] text-gray-300 uppercase tracking-[0.4em]">
              Al hacer clic, vendes tu alma (y tus piernas) a CR&L
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3FC] p-6 flex items-center justify-center font-['Roboto',sans-serif]">
      <div className="max-w-2xl w-full">
        {cargando ? (
          <div className="text-center p-20 bg-black rounded-[50px] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 border-2 border-[#8CAACF] border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-bold text-[10px] text-white uppercase tracking-[0.5em]">Inflando llantas y cargando piernas...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[45px] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-black py-6 text-center">
              <h2 className="text-white font-bold uppercase text-[10px] tracking-[0.4em]">Expediente de Nuevo Miembro</h2>
            </div>
            
            <div className="p-2 sm:p-6">
               <FormularioRegistro alGuardar={finalizarRegistro} />
            </div>

            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                 Coffee Ride & Lies • 2026
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}