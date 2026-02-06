'use client';

export default function ModalEmergencia({ usuario, alCerrar }) {
  if (!usuario) return null;

  // Función para calcular edad
  const calcularEdad = (fecha) => {
    if (!fecha) return '--';
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      {/* Contenedor: max-w-sm para que no sea gigante en móvil */}
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border-b-8 border-red-600">
        
        {/* CABECERA COMPACTA */}
        <div className="bg-red-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="text-sm font-black uppercase italic tracking-tighter">Ficha SOS</h2>
          </div>
          <button onClick={alCerrar} className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full uppercase">Cerrar</button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* PERFIL Y EDAD */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-100">
            <img 
              src={usuario.fotoPerfil || `https://ui-avatars.com/api/?name=${usuario.nombre}`} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            <div className="leading-tight">
              <h3 className="text-base font-black text-slate-900 uppercase italic truncate w-40">
                {usuario.nombre}
              </h3>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                {calcularEdad(usuario.fechaNacimiento)} Años • {usuario.tipoSangre || 'S/T'}
              </p>
            </div>
          </div>

          {/* INFORMACIÓN CRÍTICA EN GRID PEQUEÑO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3 rounded-2xl text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase">Seguro / NSS</p>
              <p className="text-[10px] font-bold text-white truncate">{usuario.nss || 'S/N'}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[8px] font-black text-emerald-600 uppercase">Hospital</p>
              <p className="text-[10px] font-bold text-emerald-900 truncate">{usuario.hospitalPreferencia || 'Cercano'}</p>
            </div>
          </div>

          {/* CONTACTO - MÁS PEQUEÑO */}
          <div className="bg-blue-600 p-4 rounded-[2rem] text-white flex items-center justify-between shadow-lg shadow-blue-100">
            <div className="leading-none">
              <p className="text-[8px] font-black uppercase opacity-80 mb-1">Avisar a ({usuario.parentesco || 'S/P'})</p>
              <p className="text-sm font-black uppercase italic truncate w-32">{usuario.contactoEmergenciaNombre || 'Emergencia'}</p>
            </div>
            <a 
              href={`tel:${usuario.contactoEmergenciaTelefono}`}
              className="bg-white text-blue-600 h-10 w-10 flex items-center justify-center rounded-xl shadow-md active:scale-90 transition-transform"
            >
              📞
            </a>
          </div>

          {/* ALERGIAS ACORTADAS */}
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Alergias / Notas</p>
            <p className="text-[10px] font-bold text-amber-900 leading-tight italic line-clamp-2">
              {usuario.alergias || "Sin observaciones médicas registradas."}
            </p>
          </div>
        </div>

        {/* BOTÓN FINAL ACCIÓN */}
        <div className="px-5 pb-5">
          <button 
            onClick={alCerrar}
            className="w-full bg-slate-100 text-slate-500 font-black py-3 rounded-xl uppercase italic tracking-widest text-[9px] hover:bg-black hover:text-white transition-all"
          >
            Finalizar Revisión
          </button>
        </div>
      </div>
    </div>
  );
}