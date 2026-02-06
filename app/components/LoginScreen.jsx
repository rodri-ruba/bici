'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from "firebase/firestore";

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

    try {
      // Intentar loguear como Admin primero (hardcoded)
      if (usuarioLimpio === 'admin_crl' && password === 'admin123') {
        const adminData = { nombre: "Admin", apellidos: "CR&L", role: 'admin', usuario: 'admin_crl', fotoPerfil: '' };
        localStorage.setItem('usuarioLogueado', JSON.stringify(adminData));
        window.location.href = '/';
        return;
      }

      // Buscar en Firebase
      const userRef = doc(db, "usuarios", usuarioLimpio);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const datosUsuario = userSnap.data();
        if (datosUsuario.password === password) {
          localStorage.setItem('usuarioLogueado', JSON.stringify(datosUsuario));
          window.location.href = '/'; // Reinicia la app con la sesión activa
        } else {
          setErrorLogin(true);
        }
      } else {
        setErrorLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center">
        <div className="mb-8">
          <div className="text-5xl mb-2 animate-bounce">🚴‍♂️</div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black italic leading-none">
            Coffee Ride & Lies <span className="text-orange-500">CR&L</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Control de Acceso</p>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Usuario</label>
            <input 
              type="text" 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border-b-4 border-gray-100 p-4 outline-none focus:border-orange-500 text-black font-bold bg-gray-50 rounded-2xl"
              placeholder="Tu alias"
              required
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-4 border-gray-100 p-4 outline-none focus:border-orange-500 text-black font-bold bg-gray-50 rounded-2xl"
              placeholder="••••••••"
              required
            />
          </div>

          {errorLogin && (
            <p className="text-red-500 text-[10px] font-black uppercase italic bg-red-50 p-2 rounded-lg border border-red-100">
              ❌ Los datos no coinciden en el radar
            </p>
          )}

          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-black text-white font-black py-5 rounded-[20px] shadow-[0_5px_0_0_#444] active:translate-y-1 active:shadow-none hover:bg-orange-600 transition-all uppercase tracking-widest italic"
          >
            {cargando ? 'Pedaleando...' : 'Entrar al Pelotón'}
          </button>
        </form>
      </div>
    </div>
  );
}