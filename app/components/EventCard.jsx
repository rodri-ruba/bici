export default function EventCard({ titulo, fecha, imagen, lugar }) {
  return (
    <div className="border rounded-xl shadow-md overflow-hidden bg-white max-w-sm">
      <img src={imagen} alt={titulo} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800">{titulo}</h3>
        <p className="text-orange-600 text-sm font-semibold">{fecha}</p>
        <div className="flex items-center mt-2 text-gray-500">
          <span>📍 {lugar}</span>
        </div>
        <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
          Ver detalles / Anotarse
        </button>
      </div>
    </div>
  );
}