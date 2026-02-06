'use client';

export default function SeccionCumpleaños({ amigos }) {
  if (!amigos || amigos.length === 0) return null;

  const hoy = new Date();
  const nombreMes = hoy.toLocaleString('es-ES', { month: 'long' });
  const mesActual = hoy.getMonth() + 1;
  const diaHoy = hoy.getDate();

  // Filtrar y ordenar por día del mes
  const cumpleañeros = amigos
    .filter(amigo => {
      if (!amigo.fechaNacimiento) return false;
      const partes = amigo.fechaNacimiento.replace(/\//g, '-').split('-');
      return partes.length >= 2 && parseInt(partes[1]) === mesActual;
    })
    .sort((a, b) => {
      const diaA = parseInt(a.fechaNacimiento.replace(/\//g, '-').split('-')[2]);
      const diaB = parseInt(b.fechaNacimiento.replace(/\//g, '-').split('-')[2]);
      return diaA - diaB;
    });

  if (cumpleañeros.length === 0) return null;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎂</span>
          <h2 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400">
            Pasteles de <span className="text-orange-500">{nombreMes}</span>
          </h2>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1">
        {cumpleañeros.map((amigo) => {
          const diaCumple = parseInt(amigo.fechaNacimiento.replace(/\//g, '-').split('-')[2]);
          const esHoy = diaCumple === diaHoy;
          const yaPaso = diaCumple < diaHoy;

          return (
            <div 
              key={amigo.id} 
              className={`flex-shrink-0 flex items-center gap-4 p-3 rounded-[24px] border-2 transition-all ${
                esHoy 
                ? 'bg-orange-500 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              {/* FOTO CON BADGE DE DÍA */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${esHoy ? 'border-black' : 'border-gray-200'}`}>
                  <img 
                    src={amigo.fotoPerfil || `https://ui-avatars.com/api/?name=${amigo.nombre}&background=000&color=fff`} 
                    className="w-full h-full object-cover"
                    alt={amigo.nombre}
                  />
                </div>
                <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                  esHoy ? 'bg-white text-black border-black' : 'bg-black text-white border-white'
                }`}>
                  {diaCumple}
                </div>
              </div>

              {/* NOMBRE Y ETIQUETA DINÁMICA */}
              <div className="pr-2 leading-none">
                <p className={`text-xs font-black uppercase italic truncate w-24 ${esHoy ? 'text-black' : 'text-gray-800'}`}>
                  {amigo.nombre}
                </p>
                <p className={`text-[8px] font-black uppercase italic mt-1 ${
                  esHoy ? 'text-white' : (yaPaso ? 'text-gray-400' : 'text-orange-500')
                }`}>
                  {esHoy ? '¡Es hoy, es hoy!' : (yaPaso ? `Fue el ${diaCumple}` : 'Próximo festejado')}
                </p>
              </div>

              {esHoy && <div className="text-xl animate-bounce">✨</div>}
            </div>
          );
        })}
      </div>
      
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full mt-2"></div>
    </div>
  );
}