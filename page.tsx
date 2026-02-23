"use client";
import React from 'react';
import productosData from './ventas.json'; 

// Esto es lo que soluciona el error que recordaste de ayer
interface Producto {
  id: number;
  producto: string;
  precio: number;
  stock: number;
  sede: string;
  imagen: string;
}

export default function CatalogoPage() {
  return (
    <main className="min-h-screen p-4 bg-[var(--ks-gray)]">
      <header className="text-center my-12">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
          <span style={{ color: 'var(--ks-black)' }}>SOTO SYSTEM</span>
          <span style={{ 
            background: 'var(--soto-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginLeft: '10px'
          }}>
            DIGITAL
          </span>
        </h1>
        <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">
          Inventario B2B Multi-Sede | 2026 Professional System
        </p>
      </header>

      <div className="catalogo-grid max-w-7xl mx-auto">
        {/* Usamos la interfaz Producto aquí */}
        div key={item.id} className="product-card group">
  {/* Imagen limpia sin textos encima para máxima elegancia */}
  <div className="relative flex justify-center items-center h-[220px] bg-slate-50 rounded-2xl overflow-hidden mb-4">
    <img 
      src={item.imagen} 
      alt={item.producto} 
      className="max-h-[90%] w-auto object-contain transition-transform duration-700 group-hover:rotate-2 group-hover:scale-110"
    />
    {/* Stock ahora es una píldora discreta */}
    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] px-2 py-1 rounded-full font-black shadow-sm">
      STOCK: {item.stock}
    </div>
  </div>

  <div className="flex flex-col flex-grow">
    {/* Sede con color de acento dinámico */}
    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-tighter mb-1">
      ● {item.sede}
    </span>
    
    <h3 className="text-[15px] font-bold text-slate-800 leading-tight mb-4 min-h-[40px]">
      {item.producto}
    </h3>
    
    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase">Precio Unit.</span>
        <span className="text-xl font-black text-slate-900">${item.precio.toFixed(2)}</span>
      </div>
      
      <button className="btn-tecnicolor px-6">
        Cotizar
      </button>
    </div>
  </div>
</div>
