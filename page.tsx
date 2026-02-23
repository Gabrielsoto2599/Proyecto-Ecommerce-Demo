"use client";
import { useState } from 'react';
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
  
  // 1. ESTADOS
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  // 2. CATEGORÍAS
  const categorias = ["Todos", "Aceite", "Piston", "Filtro", "Bujía"];

  // 3. LÓGICA DE FILTRADO (Saneada y optimizada)
  const productosFiltrados = productos.filter((item) => {
    const nombreProducto = item.producto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const busquedaLimpia = busqueda.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const categoriaLimpia = categoriaActiva.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const coincideBusqueda = nombreProducto.includes(busquedaLimpia) || 
                             item.sede.toLowerCase().includes(busquedaLimpia);
    
    const coincideCategoria = categoriaActiva === "Todos" || nombreProducto.includes(categoriaLimpia);
    
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado Nivel SaaS Premium */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              SOTO SYSTEM <span className="text-blue-600 italic">DIGITAL</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
              Inventario B2B Multi-Sede
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 uppercase tracking-widest">
            {productosFiltrados.length} Items encontrados
          </div>
        </div>

        {/* BOTONES DE CATEGORÍA (Toque Cyber-Disney) */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                categoriaActiva === cat
                  ? "bg-slate-900 text-white scale-105 shadow-2xl shadow-slate-200"
                  : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative mb-16 group max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <input
            type="text"
            placeholder="🔎 Buscar repuesto o ciudad..."
            className="relative w-full bg-white px-10 py-7 rounded-[2rem] border-none focus:ring-2 focus:ring-blue-500 shadow-2xl text-slate-700 font-bold text-xl outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* GRID ESTILO MERCADO LIBRE (Sin gigantismo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productosFiltrados.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 flex flex-col h-full"
            >
              {/* Contenedor de Imagen Profesional */}
              <div className="h-56 w-full bg-white flex items-center justify-center p-8 relative overflow-hidden border-b border-slate-50">
                <img 
                  src={item.imagen} 
                  alt={item.producto} 
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300?text=Check+Image"; }}
                />
              </div>
              
              {/* Información del Producto */}
              <div className="p-7 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    {item.sede}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold tracking-tighter">REF-{item.id}</span>
                </div>

                <h2 className="text-sm font-black text-slate-800 leading-tight h-12 line-clamp-2 mb-6 group-hover:text-blue-600 transition-colors">
                  {item.producto}
                </h2>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Precio Mayorista</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">${item.precio}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg tracking-widest ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        STOCK: {item.stock}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 text-[10px] tracking-[0.2em] uppercase">
                    Solicitar Cotización
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado Vacío */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No hay coincidencias para tu búsqueda 🔍</p>
          </div>
        )}
      </div>
    </div>
  );
}


