'use client';

export default function SeccionCumpleaños({ amigos }) {
  const hoy = new Date();
  const nombreMes = hoy.toLocaleString('es-ES', { month: 'long' });
  const mesActual = hoy.getMonth() + 1;
  const diaHoy = hoy.getDate();

  // 1. Filtrar y ordenar por día del mes (más próximo primero)
  const cumpleañeros = amigos
    .filter(amigo => {
      if (!amigo.fechaNacimiento) return false;
      const partes = amigo.fechaNacimiento.replace(/\//g, '-').split('-');
      return partes.length >= 3 && parseInt(partes[1]) === mesActual;
    })
    .sort((a, b) => {
      const diaA = parseInt(a.fechaNacimiento.replace(/\//g, '-').split('-')[2]);
      const diaB = parseInt(b.fechaNacimiento.split('-')[2]);
      return diaA - diaB;
    });

  if (cumpleañeros.length === 0) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* TÍTULO MINIMALISTA */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg">🎂</span>
        <h2 className="text-[11px] font-black uppercase italic tracking-[0.2em] text-slate-400">
          Cumpleaños de <span className="text-orange-500">{nombreMes}</span>
        </h2>
      </div>

      {/* SLIDE HORIZONTAL */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
        {cumpleañeros.map((amigo) => {
          const diaCumple = parseInt(amigo.fechaNacimiento.replace(/\//g, '-').split('-')[2]);
          const esHoy = diaCumple === diaHoy;

          return (
            <div 
              key={amigo.id} 
              className={`flex-shrink-0 flex items-center gap-3 p-2 rounded-2xl border transition-all ${
                esHoy 
                ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-200 ring-2 ring-orange-200' 
                : 'bg-slate-800/5 border-slate-200/50'
              }`}
            >
              {/* FOTO CON BADGE DE DÍA */}
              <div className="relative">
                <img 
                  src={amigo.fotoPerfil || `https://ui-avatars.com/api/?name=${amigo.nombre}`} 
                  className={`w-10 h-10 rounded-xl object-cover border-2 ${esHoy ? 'border-white' : 'border-slate-100'}`}
                  alt={amigo.nombre}
                />
                <div className={`absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm border ${
                  esHoy ? 'bg-black text-white border-orange-400' : 'bg-white text-slate-800 border-slate-200'
                }`}>
                  {diaCumple}
                </div>
              </div>

              {/* NOMBRE Y ETIQUETA */}
              <div className="pr-2 leading-tight">
                <p className={`text-[10px] font-black uppercase italic truncate w-20 ${esHoy ? 'text-white' : 'text-slate-800'}`}>
                  {amigo.nombre}
                </p>
                <p className={`text-[8px] font-bold uppercase tracking-tighter ${esHoy ? 'text-orange-100' : 'text-slate-400'}`}>
                  {esHoy ? '¡Festeja hoy!' : 'Próximamente'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}