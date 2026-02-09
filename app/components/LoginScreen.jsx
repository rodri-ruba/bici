'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorLogin(false);

    const usuarioLimpio = usuario.trim().toLowerCase();
    const passwordLimpia = password.trim();

    try {
      if (usuarioLimpio === 'admin_crl' && passwordLimpia === 'admin123') {
        const adminData = { nombre: "Admin", apellidos: "CR&L", role: 'admin', usuario: 'admin_crl', fotoPerfil: '' };
        localStorage.setItem('usuarioLogueado', JSON.stringify(adminData));
        window.location.href = '/';
        return;
      }

      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("usuario", "==", usuarioLimpio));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const datosUsuario = docSnap.data();

        if (datosUsuario.password === passwordLimpia) {
          const sesionCompleta = { id: docSnap.id, ...datosUsuario };
          localStorage.setItem('usuarioLogueado', JSON.stringify(sesionCompleta));
          window.location.href = '/'; 
        } else {
          setErrorLogin(true);
        }
      } else {
        setErrorLogin(true);
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Pinchamos una llanta: Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    // CAMBIO: Gradiente de fondo más vivo para evitar el "negro total"
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-['Roboto',sans-serif] bg-[#0a0a0b]">
      
      {/* ESFERAS DE COLOR CON MÁS OPACIDAD */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] rounded-full bg-[#8CAACF] opacity-30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#7E8285] opacity-20 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#8CAACF] opacity-20 blur-[120px]" />
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative z-20 w-full max-w-sm px-6">
        {/* Vidrio con borde más definido y reflejo */}
        <div className="bg-white/[0.07] backdrop-blur-[25px] p-10 rounded-[45px] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
          
          <div className="text-center mb-10">
            <div className="bg-white inline-block p-4 rounded-3xl mb-6 shadow-2xl">
               <img src="/logo.png" className="w-12 h-12 object-contain" alt="CR&L" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tighter uppercase leading-none">
              Coffee Ride & Lies
            </h1>
            <p className="text-[9px] font-bold text-[#8CAACF] uppercase tracking-[0.4em] mt-3">
              Elite Access
            </p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Usuario</label>
              <input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-black/20 border border-white/10 p-4 outline-none text-white font-medium rounded-2xl focus:border-[#8CAACF] transition-all placeholder:text-white/10"
                placeholder="Rider ID"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 p-4 outline-none text-white font-medium rounded-2xl focus:border-[#8CAACF] transition-all placeholder:text-white/10"
                placeholder="••••••••"
                required
              />
            </div>

            {errorLogin && (
              <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl text-center">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  ⚠️ Credenciales Inválidas
                </p>
              </div>
            )}

            <button 
              type="submit"
              disabled={cargando}
              className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#8CAACF] hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] active:scale-[0.97] shadow-xl mt-4"
            >
              {cargando ? 'Validando...' : 'Entrar al Pelotón'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-white/50 text-[8px] font-bold uppercase tracking-[0.6em] mt-10">
          Coffee Ride & Lies - CR&L • 2026
        </p>
      </div>
    </div>
  );
}