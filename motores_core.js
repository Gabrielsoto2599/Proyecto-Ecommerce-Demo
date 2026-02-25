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

async function cargarInventario() {
    try {
        const respuesta = await fetch('ventas.json');
        if (!respuesta.ok) throw new Error("No se pudo cargar el JSON");
        inventario = await respuesta.json();
        renderizar(inventario);
    } catch (error) {
        console.error("Error cargando inventario:", error);
        const lista = document.getElementById('lista-productos');
        if (lista) lista.innerHTML = `<p class="text-red-500 font-bold p-10 text-center uppercase tracking-widest">Error al conectar con la base de datos B2B</p>`;
    }
}

// ==========================================
// 3. LÓGICA DE RENDERIZADO (VISUAL)
// ==========================================
function renderizar(data) {
    const lista = document.getElementById('lista-productos');
    if (!lista) return;

    lista.innerHTML = data.map(p => {
        const precioFinal = mostrarEnBolivares ? (p.precio * TASA_BCV) : p.precio;
        const simbolo = mostrarEnBolivares ? "Bs." : "$";
        
        // Ajuste definitivo para las imágenes según tu carpeta public
        const rutaImagen = p.imagen;

        return `
        <li class="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 p-6 flex flex-col items-center relative group overflow-hidden">
            <span class="absolute top-4 right-4 bg-black text-amber-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest z-10">
                ${p.sede}
            </span>
            <div class="w-full h-44 mb-6 flex items-center justify-center rounded-xl bg-gray-50 p-2 overflow-hidden">
                <img src="${rutaImagen}" 
                     alt="${p.producto}"
                     onerror="this.src='https://via.placeholder.com/150?text=Motor'; this.style.opacity='0.5';" 
                     class="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500"> 
            </div>
            <div class="text-center w-full">
                <h3 class="text-gray-900 font-black text-[12px] mb-1 uppercase tracking-tight h-10 flex items-center justify-center leading-tight">
                    ${p.producto.replace(/_/g, ' ')} 
                </h3>
                <div class="flex items-center justify-center gap-2 mb-4">
                    <span class="text-amber-600 font-black text-xl">${simbolo}${precioFinal.toFixed(2)}</span>
                </div>
                <button onclick="abrirModalVenta('${p.producto}', '${p.sede}', ${p.precio})" 
                        class="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-amber-500 hover:text-black transition-all duration-300">
                    Solicitar Cotización
                </button>
            </div>
        </li>
        `;
    }).join('');
}

// ==========================================
// 4. FILTROS Y EVENTOS
// ==========================================
function filtrarPorSede(sede) {
    sedeActual = sede;
    const items = document.querySelectorAll('nav a');
    items.forEach(link => {
        if (link.innerText.includes(sede)) {
            link.classList.add('text-amber-500');
        } else {
            link.classList.remove('text-amber-500');
        }
    });

    if (sede === 'Todas') {
        renderizar(inventario);
    } else {
        const filtrados = inventario.filter(p => p.sede === sede);
        renderizar(filtrados);
    }
}

function cambiarMoneda() {
    mostrarEnBolivares = !mostrarEnBolivares;
    const btnTexto = document.getElementById('texto-boton-moneda');
    if (btnTexto) {
        btnTexto.innerText = mostrarEnBolivares ? `Ver en $ (Tasa: ${TASA_BCV})` : `Ver en Bs. (Tasa: ${TASA_BCV})`;
    }
    
    // Volvemos a renderizar según el filtro actual
    if (sedeActual === 'Todas') {
        renderizar(inventario);
    } else {
        const filtrados = inventario.filter(p => p.sede === sedeActual);
        renderizar(filtrados);
    }
}

function configurarEventos() {
    const btnMoneda = document.getElementById('btn-moneda');
    if (btnMoneda) btnMoneda.addEventListener('click', cambiarMoneda);
}

// ==========================================
// 5. SISTEMA DE COTIZACIÓN (MODALES)
// ==========================================
function abrirModalVenta(nombre, sede, precio) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="overlay fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
        <div class="bg-white rounded-[32px] overflow-hidden shadow-2xl max-w-lg w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div class="p-8">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="text-2xl font-black text-gray-900 uppercase">${nombre.replace(/_/g, ' ')}</h3>
                        <p class="text-amber-600 font-bold">Sede: ${sede}</p>
                    </div>
                    <button onclick="cerrarModal()" class="text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
                </div>
                
                <div class="space-y-4 mb-8">
                    <div class="flex flex-col">
                        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cantidad a solicitar</label>
                        <input type="number" id="cant-venta" value="1" min="1" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold focus:border-black outline-none transition-all">
                    </div>
                </div>

                <button onclick="procesarCompra('${nombre}', '${sede}', ${precio})" class="w-full bg-black text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-amber-500 hover:text-black transition-all duration-300 shadow-xl shadow-amber-500/10">
                    Generar Factura Proforma
                </button>
            </div>
        </div>
    </div>
    `;
}















