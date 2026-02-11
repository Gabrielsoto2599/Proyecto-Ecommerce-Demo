// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
const TASA_BCV = 36.50; 
let mostrarEnBolivares = false;
let inventario = [];
let sedeActual = 'Todas';

class Cl_Producto {
    constructor(nombre, sede, precioBase, cantidad = 1) {
        this.nombre = nombre;
        this.sede = sede;
        this.precioBase = precioBase;
        this.cantidad = cantidad;
    }
    montoVenta() {
        let subtotal = this.precioBase * this.cantidad;
        if (this.cantidad >= 12) subtotal *= 0.85; // Descuento Mayorista
        return this.sede === "Puerto Ordaz" ? subtotal : subtotal * 1.05;
    }
}

class Cl_Empresa {
    constructor() {
        this.contVentas = 0;
        this.totalFacturado = 0;
    }
    procesar(prod) {
        this.contVentas += prod.cantidad;
        this.totalFacturado += prod.montoVenta();
    }
}

const empresaKS = new Cl_Empresa();

// ==========================================
// 2. INICIO DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarInventario();
});

function configurarEventos() {
    document.addEventListener('click', (e) => {
        const btnMoneda = e.target.closest('#btn-moneda');
        if (btnMoneda) {
            mostrarEnBolivares = !mostrarEnBolivares;
            const textoBtn = document.getElementById('texto-boton-moneda');
            textoBtn.innerText = mostrarEnBolivares ? "Ver en Dólares ($)" : `Ver en Bs. (Tasa: ${TASA_BCV})`;
            renderizar(sedeActual === 'Todas' ? inventario : inventario.filter(p => p.sede === sedeActual));
        }

        if (e.target.closest('#open-login')) {
            e.preventDefault();
            mostrarInterfazLogin(false); // Inicia en modo Login por defecto
        }
    });

    const btnCatalogo = document.getElementById('btn-catalogo');
    if (btnCatalogo) {
        btnCatalogo.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('seccion-inventario').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ==========================================
// 3. CARGA Y RENDERIZADO
// ==========================================
async function cargarInventario() {
    try {
        const res = await fetch('ventas.json?v=' + Date.now());
        if (!res.ok) throw new Error("No se pudo cargar el inventario");
        inventario = await res.json();
        renderizar(inventario);
    } catch (err) {
        console.error("Error crítico:", err);
        alert("Atención: El inventario no cargó. Verifica ventas.json");
    }
}

function filtrarSede(sede) {
    sedeActual = sede;
    const dataFiltrada = sede === 'Todas' ? inventario : inventario.filter(p => p.sede === sede);
    renderizar(dataFiltrada);
}

function renderizar(data) {
    const lista = document.getElementById('lista-productos');
    if (!lista) return;

    lista.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";
    lista.innerHTML = data.map(p => {
        const precioFinal = mostrarEnBolivares ? (p.precio * TASA_BCV) : p.precio;
        const simbolo = mostrarEnBolivares ? "Bs." : "$";
        const rutaImagen = `${p.producto}.jpg`; 

        return `
        <li class="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 p-6 flex flex-col items-center relative group overflow-hidden">
            <span class="absolute top-4 right-4 bg-black text-amber-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest z-10">
                ${p.sede}
            </span>
            <div class="w-full h-44 mb-6 flex items-center justify-center rounded-xl bg-gray-50 p-2">
                <img src="${rutaImagen}" onerror="this.src='3.jpg'; this.style.opacity='0.5';" class="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500"> 
            </div>
            <div class="text-center w-full">
                <h3 class="text-gray-900 font-black text-[11px] mb-1 uppercase tracking-tight h-10 flex items-center justify-center leading-tight">${p.producto}</h3>
                <p class="text-[9px] font-bold text-gray-400 mb-2 uppercase">Disponible: <span class="${p.stock < 5 ? 'text-red-500' : 'text-green-600'}">${p.stock} unid.</span></p>
                <p class="text-2xl font-black text-gray-900 tracking-tighter mb-4">${simbolo}${precioFinal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                <div class="flex items-center gap-2 w-full pt-4 border-t border-gray-100">
                    <input type="number" id="q-${p.id}" value="1" min="1" max="${p.stock}" class="w-12 bg-gray-50 border border-gray-200 rounded-lg p-2 text-center text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500">
                    <button onclick="procesarCompra(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="${p.stock <= 0 ? 'bg-gray-300' : 'bg-black hover:bg-amber-600'} flex-1 text-white font-black py-2.5 rounded-lg transition-all text-[10px] tracking-widest uppercase shadow-md">
                        ${p.stock <= 0 ? 'Agotado' : 'Añadir'}
                    </button>
                </div>
            </div>
        </li>`;
    }).join('');
}

// ==========================================
// 4. LÓGICA DE COMPRA Y PDF
// ==========================================
function procesarCompra(id) {
    const item = inventario.find(i => i.id === id);
    const cantInput = document.getElementById(`q-${id}`);
    const cant = parseInt(cantInput.value);

    if (cant > item.stock) { alert("Stock insuficiente"); return; }

    item.stock -= cant;
    const pedido = new Cl_Producto(item.producto, item.sede, item.precio, cant);
    empresaKS.procesar(pedido);
    
    document.getElementById('cart-count').innerText = empresaKS.contVentas;
    filtrarSede(sedeActual);
    mostrarRecibo(pedido);
}

function mostrarInterfazLogin(esLogin) {
    // Mantengo tu lógica de login pero encapsulada
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="overlay flex items-center justify-center fixed inset-0 bg-black/60 z-[100]">
        <div class="bg-white flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-11/12 h-[500px]">
            <div class="bg-black text-white p-12 flex flex-col justify-center items-center text-center space-y-4 flex-1">
                <h2 class="text-3xl font-black italic uppercase italic">KS Alta Eficiencia</h2>
                <p class="text-xs tracking-widest opacity-60">DISTRIBUIDORES EXCLUSIVOS</p>
            </div>
            <div class="p-12 flex-1 flex flex-col justify-center bg-white">
                <h2 class="text-2xl font-black mb-6 text-gray-800 uppercase italic">Acceso B2B</h2>
                <input type="email" placeholder="Usuario" class="mb-3 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500">
                <input type="password" placeholder="Clave" class="mb-6 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500">
                <button onclick="document.getElementById('modal-root').innerHTML=''" class="bg-black text-white font-black py-3 rounded-xl uppercase tracking-widest hover:bg-amber-600 transition">Entrar</button>
                <button onclick="document.getElementById('modal-root').innerHTML=''" class="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Regresar al catálogo</button>
            </div>
        </div>
    </div>`;
}

document.getElementById('btn-catalogo').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('seccion-inventario').scrollIntoView({ behavior: 'smooth' });
});
    













