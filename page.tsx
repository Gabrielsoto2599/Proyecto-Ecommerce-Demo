"use client";
import Image from 'next/image'; // Importante para la optimización de Next.js
import inventory from '../../public/ventas.json';

interface Producto {
  id: number;
  producto: string;
  precio: number;
  sede: string;
  stock: number;
  imagen: string;
}

export default function CatalogoPage() {
  const productos = (inventory as unknown) as Producto[];
  const [busqueda, setBusqueda] = useState("");

// Esta es la lógica que filtra los 40 productos mientras escribes
const productosFiltrados = productos.filter((item) =>
  item.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
  item.sede.toLowerCase().includes(busqueda.toLowerCase())
);
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado Nivel SaaS de $10,000 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              SOTO SYSTEM <span className="text-blue-600 italic">DIGITAL</span>
            </h1>
            <p className="text-slate-400 font-medium">Inventario B2B Multi-Sede</p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm border border-blue-100">
            {productos.length} Productos en Red Nacional
          </div>
        </div>

        {/* El Grid que DOMA las imágenes gigantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productos.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col h-[460px]"
            >
              {/* Contenedor de Imagen con Altura FIJA (Esto quita lo "Gigante") */}
              <div className="h-52 w-full bg-white flex items-center justify-center p-6 relative overflow-hidden border-b border-gray-50">
                <img 
                  src={item.imagen} 
                  alt={item.producto} 
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300?text=Revisar+Imagen"; }}
                />

                
              </div>
              
              {/* Información del Repuesto */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">
                    {item.sede}
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold">ID-{item.id}</span>
                </div>

                <h2 className="text-md font-bold text-slate-800 leading-snug h-12 line-clamp-2 mb-4">
                  {item.producto}
                </h2>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Precio Mayorista</span>
                      <span className="text-2xl font-black text-slate-900">${item.precio}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        STOCK: {item.stock}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 text-xs tracking-widest">
                    SOLICITAR COTIZACIÓN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
