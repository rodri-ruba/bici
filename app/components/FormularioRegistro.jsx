'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function FormularioRegistro({ datosIniciales, alGuardar, onFinalizar }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    apellidos: '',
    telefonoCiclista: '',
    tipoSangre: '',
    seguroMedico: '',
    nss: '',
    contactoEmergenciaNombre: '',
    parentesco: '',
    contactoEmergenciaTelefono: '',
    fotoPerfil: '', 
    alergias: '',
    fechaNacimiento: '',
    hospitalPreferencia: '',
    fechaUltimoServicio: '',
    kmEnUltimoServicio: '',
    rodadasCount: 0,
    role: 'user',
    ultimaInscripcion: Date.now()
  });

  useEffect(() => {
    if (datosIniciales) {
      setFormData({ ...datosIniciales });
      setPreview(datosIniciales.fotoPerfil);
    }
  }, [datosIniciales]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const manejarImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData((prev) => ({ ...prev, fotoPerfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (cargando) return;

    setCargando(true);
    try {
      const dataLimpia = {
        ...formData,
        usuario: formData.usuario.trim().toLowerCase(),
        password: formData.password.trim(),
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim()
      };

      if (datosIniciales?.id) {
        const docRef = doc(db, "usuarios", datosIniciales.id);
        const { nombre, apellidos, usuario, ...datosActualizables } = dataLimpia;
        await updateDoc(docRef, datosActualizables);
        alert("¡Perfil actualizado! ⚡");
        if (onFinalizar) onFinalizar();
      } else {
        const q = query(collection(db, "usuarios"), where("usuario", "==", dataLimpia.usuario));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          alert("Ese nombre de usuario ya está registrado. Elige otro. ❌");
          setCargando(false);
          return;
        }

        await addDoc(collection(db, "usuarios"), dataLimpia);
        setMensajeExito(true);

        setTimeout(() => {
          window.location.href = '/'; 
        }, 2000);
      }
    } catch (error) {
      console.error("Error guardando ciclista:", error);
      alert("Error al procesar el registro. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  if (mensajeExito) {
    return (
      <div className="p-10 text-center space-y-4 animate-in zoom-in duration-300 font-['Roboto',sans-serif]">
        <div className="text-6xl">☕️</div>
        <h2 className="text-2xl font-bold text-black tracking-tight">¡Registro Exitoso!</h2>
        <p className="text-xs font-bold text-[#7E8285] uppercase tracking-widest">
          Tu café se está preparando... <br/> Redirigiendo al inicio de sesión.
        </p>
        <div className="w-10 h-10 border-2 border-gray-100 border-t-[#8CAACF] rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    );
  }

  const esEdicion = !!datosIniciales;

  // Estilos comunes para inputs
  const inputBase = "bg-transparent border-b border-gray-200 outline-none p-2 font-medium text-black focus:border-[#8CAACF] transition-colors placeholder:text-gray-300 text-sm";

  return (
    <form onSubmit={manejarEnvio} className="p-6 space-y-8 bg-white rounded-[32px] font-['Roboto',sans-serif] shadow-xl shadow-black/5 border border-gray-100">
      
      {/* SECCIÓN FOTO */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-105 duration-300">
            <img 
              src={preview || `https://ui-avatars.com/api/?name=Rider&background=8CAACF&color=fff`} 
              className="w-full h-full object-cover"
              alt="Rider"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl shadow-lg text-[10px]">📸</div>
        </div>
        <input type="file" ref={fileInputRef} onChange={manejarImagen} className="hidden" accept="image/*" />
        <p className="text-[10px] font-bold uppercase text-[#7E8285] tracking-[0.2em]">Foto de perfil</p>
      </div>

      <div className="space-y-6">
        {/* CREDENCIALES */}
        <div className="bg-[#F3F3FC] p-6 rounded-[24px] space-y-4">
          <div className="text-[10px] font-bold text-[#8CAACF] uppercase tracking-[0.2em]">🔑 Acceso</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="usuario" placeholder="Usuario" disabled={esEdicion} value={formData.usuario} onChange={manejarCambio} required className={inputBase} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={manejarCambio} required={!esEdicion} className={inputBase} />
          </div>
        </div>

        {/* DATOS PERSONALES */}
        <div className="bg-white p-2 space-y-5">
          <div className="text-[10px] font-bold text-[#7E8285] uppercase tracking-[0.2em] px-4">👤 Perfil Ciclista</div>
          <div className="grid grid-cols-2 gap-4 px-4">
            <input type="text" name="nombre" placeholder="Nombre" disabled={esEdicion} value={formData.nombre} onChange={manejarCambio} required className={inputBase} />
            <input type="text" name="apellidos" placeholder="Apellidos" disabled={esEdicion} value={formData.apellidos} onChange={manejarCambio} required className={inputBase} />
          </div>
          <div className="px-4">
            <input type="tel" name="telefonoCiclista" placeholder="Tu celular" value={formData.telefonoCiclista} onChange={manejarCambio} required className={`${inputBase} w-full`} />
          </div>
          <div className="flex flex-col px-4">
            <label className="text-[9px] font-bold text-[#7E8285] uppercase tracking-widest ml-2 mb-1">Fecha Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={manejarCambio} required className={inputBase} />
          </div>
        </div>

        {/* SOS */}
        <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-50 space-y-4">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">🚑 Emergencias</p>
          <input type="text" name="hospitalPreferencia" placeholder="Hospital de preferencia" value={formData.hospitalPreferencia} onChange={manejarCambio} required className={`${inputBase} w-full !border-red-100 focus:!border-red-300`} />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="contactoEmergenciaNombre" placeholder="Contacto Nombre" value={formData.contactoEmergenciaNombre} onChange={manejarCambio} required className={`${inputBase} !border-red-100 focus:!border-red-300 text-xs`} />
            <input type="text" name="parentesco" placeholder="Parentesco" value={formData.parentesco} onChange={manejarCambio} required className={`${inputBase} !border-red-100 focus:!border-red-300 text-xs`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <select name="tipoSangre" value={formData.tipoSangre} onChange={manejarCambio} required className={`${inputBase} !border-red-100 focus:!border-red-300 text-xs`}>
                <option value="">Sangre</option>
                <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
             </select>
             <input type="tel" name="contactoEmergenciaTelefono" placeholder="Tel. Emergencia" value={formData.contactoEmergenciaTelefono} onChange={manejarCambio} required className={`${inputBase} !border-red-100 focus:!border-red-300 text-xs`} />
          </div>
        </div>

        {/* MECÁNICA */}
        <div className="bg-black p-6 rounded-[24px] space-y-4 shadow-lg shadow-black/10">
          <p className="text-[10px] font-bold text-[#8CAACF] uppercase tracking-[0.2em]">⚙️ La Máquina</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Último Servicio</label>
              <input type="date" name="fechaUltimoServicio" value={formData.fechaUltimoServicio} onChange={manejarCambio} required className="bg-transparent border-b border-gray-800 outline-none p-2 text-xs text-white focus:border-[#8CAACF] transition-colors" />
            </div>
            <div className="flex flex-col">
              <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Km Totales Bici</label>
              <input type="number" name="kmEnUltimoServicio" placeholder="Ej. 1500" value={formData.kmEnUltimoServicio} onChange={manejarCambio} required className="bg-transparent border-b border-gray-800 outline-none p-2 text-xs font-bold text-[#8CAACF] focus:border-white transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={cargando} 
        className={`w-full text-white font-bold py-5 rounded-2xl transition-all shadow-lg uppercase tracking-[0.2em] text-xs 
        ${cargando ? 'bg-[#7E8285] cursor-wait' : 'bg-black hover:bg-[#8CAACF] shadow-black/10 active:scale-[0.98]'}`}
      >
        {cargando ? 'SINCRONIZANDO...' : '¡UNIRME AL GRUPO! ☕️🚴‍♂️'}
      </button>
    </form>
  );
}