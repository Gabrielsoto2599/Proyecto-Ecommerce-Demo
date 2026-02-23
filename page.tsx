"use client";
import inventory from '../../public/ventas.json';

// Definimos la estructura exacta de tu JSON
interface Producto {
  id: number;
  producto: string; // Cambiado de 'nombre' a 'producto' para coincidir con tu JSON
  precio: number;
  sede: string;
  stock: number;
  imagen: string;
}

export default function CatalogoPage() {
  // SOLUCIÓN AL ERROR: Usamos 'unknown' en lugar de 'any' para que el sistema sea feliz
  const productos = (inventory as unknown) as Producto[];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Catálogo de Motores y Repuestos
        </h1>

        {/* El Grid que evita que se vean gigantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            >
              {/* Contenedor con altura fija para controlar el tamaño de la imagen */}
              <div className="h-48 w-full bg-white flex items-center justify-center p-4">
                <img 
                  src={item.imagen} 
                  alt={item.producto} 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>

              <div className="p-4 border-t border-gray-100">
                <span className="text-xs font-bold text-blue-500 uppercase">{item.sede}</span>
                <h2 className="text-lg font-bold text-gray-800 truncate">{item.producto}</h2>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-extrabold text-gray-900">${item.precio}</span>
                  <span className="text-sm text-gray-500 font-medium">Stock: {item.stock}</span>
                </div>
                
                <button className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}