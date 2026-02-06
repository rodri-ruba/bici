'use client';
import { useState, useEffect, useRef } from 'react';

export default function FormularioRegistro({ datosIniciales, alGuardar }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    apellidos: '',
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
    kmEnUltimoServicio: ''
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

  const esEdicion = !!datosIniciales;

  return (
    <form onSubmit={(e) => { e.preventDefault(); alGuardar(formData); }} className="p-4 space-y-6">
      
      {/* FOTO DE PERFIL */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <img 
            src={preview || `https://ui-avatars.com/api/?name=Rider&background=orange&color=fff`} 
            className="w-28 h-28 rounded-full object-cover border-4 border-black shadow-lg transition-transform hover:scale-105"
            alt="Rider"
          />
          <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full border-2 border-white shadow-md">📸</div>
        </div>
        <input type="file" ref={fileInputRef} onChange={manejarImagen} className="hidden" accept="image/*" />
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">
          Tu cara de "Hoy se sufre"
        </p>
      </div>

      <div className="space-y-4">
        {/* CREDENCIALES */}
        <div className="bg-orange-50 p-5 rounded-[30px] border-2 border-orange-100 grid grid-cols-2 gap-4">
          <div className="col-span-2 text-[10px] font-black text-orange-500 uppercase tracking-widest">🔑 Acceso al Pelotón</div>
          <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={manejarCambio} required className="bg-transparent border-b-2 border-orange-200 outline-none p-1 font-bold text-black focus:border-black transition-colors" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={manejarCambio} required={!esEdicion} className="bg-transparent border-b-2 border-orange-200 outline-none p-1 font-bold text-black focus:border-black transition-colors" />
        </div>

        {/* DATOS PERSONALES (CONTENEDOR UNIFICADO) */}
        <div className="bg-white p-5 rounded-[30px] border-2 border-gray-100 space-y-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">👤 Datos del Ciclista</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[9px] font-black text-gray-300 uppercase ml-1">Nombre</label>
              <input type="text" name="nombre" placeholder="Ej. Juan" value={formData.nombre} onChange={manejarCambio} required className="border-b-2 border-gray-100 p-2 outline-none focus:border-orange-500 text-black font-bold" />
            </div>
            <div className="flex flex-col">
              <label className="text-[9px] font-black text-gray-300 uppercase ml-1">Apellidos</label>
              <input type="text" name="apellidos" placeholder="Ej. Pérez" value={formData.apellidos} onChange={manejarCambio} required className="border-b-2 border-gray-100 p-2 outline-none focus:border-orange-500 text-black font-bold" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] font-black text-orange-400 uppercase ml-1">🎂 Fecha de Nacimiento</label>
            <input 
              type="date" 
              name="fechaNacimiento" 
              value={formData.fechaNacimiento} 
              onChange={manejarCambio} 
              required 
              className="w-full bg-orange-50/50 border-b-2 border-orange-100 p-2 rounded-t-lg outline-none focus:border-orange-500 text-black font-bold text-sm" 
            />
          </div>
        </div>

        {/* ZONA DE RESCATE (EMERGENCIAS) */}
        <div className="bg-red-50 p-5 rounded-[30px] border-2 border-red-100 space-y-4">
          <p className="text-[10px] font-black text-red-500 uppercase flex items-center gap-2">🚑 Zona de Rescate</p>
          
          <input type="text" name="hospitalPreferencia" placeholder="Hospital de preferencia" value={formData.hospitalPreferencia} onChange={manejarCambio} required className="w-full bg-transparent border-b-2 border-red-200 outline-none p-1 text-sm font-bold text-black focus:border-red-500" />

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="contactoEmergenciaNombre" placeholder="Contacto de Emergencia" value={formData.contactoEmergenciaNombre} onChange={manejarCambio} required className="bg-transparent border-b-2 border-red-200 outline-none p-1 text-xs text-black font-bold" />
            <input type="text" name="parentesco" placeholder="Parentesco (Ej. Esposa)" value={formData.parentesco} onChange={manejarCambio} required className="bg-transparent border-b-2 border-red-200 outline-none p-1 text-xs text-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <select name="tipoSangre" value={formData.tipoSangre} onChange={manejarCambio} required className="bg-transparent border-b-2 border-red-200 outline-none p-1 text-xs text-black font-bold">
                <option value="">Tipo Sangre</option>
                <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
             </select>
             <input type="tel" name="contactoEmergenciaTelefono" placeholder="Tel. de Contacto" value={formData.contactoEmergenciaTelefono} onChange={manejarCambio} required className="bg-transparent border-b-2 border-red-200 outline-none p-1 text-xs text-black font-bold" />
          </div>
        </div>

        {/* ESTADO DE LA MÁQUINA */}
        <div className="bg-gray-800 p-5 rounded-[30px] border-2 border-black space-y-4 shadow-lg">
          <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2">⚙️ Estado de la Máquina</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase">Último Servicio</label>
              <input type="date" name="fechaUltimoServicio" value={formData.fechaUltimoServicio} onChange={manejarCambio} required className="w-full bg-transparent border-b-2 border-gray-600 outline-none p-1 text-xs text-white" />
            </div>
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase">Km actuales bici</label>
              <input type="number" name="kmEnUltimoServicio" placeholder="Ej. 2500" value={formData.kmEnUltimoServicio} onChange={manejarCambio} required className="w-full bg-transparent border-b-2 border-gray-600 outline-none p-1 text-xs font-bold text-orange-400" />
            </div>
          </div>
        </div>

        <textarea name="alergias" placeholder="¿Alergias o condiciones médicas?" value={formData.alergias} onChange={manejarCambio} className="w-full border-2 border-gray-100 p-3 rounded-2xl h-20 outline-none focus:border-orange-500 text-sm text-black italic bg-white"></textarea>
      </div>

      <button type="submit" className="w-full bg-black text-white font-black py-5 rounded-[25px] hover:bg-orange-600 transition-all shadow-[0_8px_0_0_#444] active:shadow-none active:translate-y-1 uppercase italic tracking-widest text-lg">
        ¡LISTO PARA EL CAFÉ! ☕️🚴‍♂️
      </button>
    </form>
  );
}