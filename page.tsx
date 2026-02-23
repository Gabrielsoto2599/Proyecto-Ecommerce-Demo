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
        {productosData.map((item: Producto) => (
          <div key={item.id} className="product-card group">
            <div className="relative flex justify-center items-center h-[240px] bg-white rounded-xl overflow-hidden border border-gray-100 transition-all">
              <img 
                src={item.imagen} 
                alt={item.producto} 
                className="max-h-[85%] w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Soto+System'; }}
              />
              <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 rounded-md font-bold">
                STOCK: {item.stock}
              </div>
            </div>

            <div className="mt-5 flex flex-col flex-grow">
              <span className="text-[10px] font-bold text-[var(--soto-blue)] uppercase mb-1">
                Sede {item.sede}
              </span>
              <h3 className="text-sm font-bold text-gray-800 uppercase leading-tight mb-2 h-10 overflow-hidden">
                {item.producto}
              </h3>
              
              <div className="mt-auto border-t border-gray-50 pt-4">
                <span className="precio-tag">$ {item.precio.toFixed(2)}</span>
                <button className="btn-tecnicolor w-full mt-4">
                  Solicitar Cotización
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}


