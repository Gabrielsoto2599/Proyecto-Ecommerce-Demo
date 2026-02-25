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

    // RESTAURAMOS LA ESTRUCTURA HORIZONTAL (GRID) AQUÍ
    lista.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6";

    lista.innerHTML = data.map(p => {
        const precioFinal = mostrarEnBolivares ? (p.precio * TASA_BCV) : p.precio;
        const simbolo = mostrarEnBolivares ? "Bs." : "$";
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
            <div class="text-center w-full mt-auto">
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

function cerrarModal() {
    document.getElementById('modal-root').innerHTML = '';
}

function procesarCompra(nombre, sede, precio) {
    const cant = parseInt(document.getElementById('cant-venta').value);
    if (isNaN(cant) || cant <= 0) return alert("Cantidad inválida");

    const producto = new Cl_Producto(nombre, sede, precio, cant);
    empresaKS.procesar(producto);
    mostrarFactura(producto);
}

function mostrarFactura(prod) {
    const root = document.getElementById('modal-root');
    const montoBs = prod.montoVenta() * TASA_BCV;

    root.innerHTML = `
    <div class="overlay fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <div class="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full border-t-8 border-amber-500 relative overflow-hidden">
            <h2 class="text-center text-3xl font-black italic mb-2 tracking-tighter">ORDEN DE COMPRA</h2>
            <p class="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Documento No Válido como Factura Fiscal</p>
            
            <div class="space-y-6 border-y-2 border-gray-50 py-8 mb-8">
                <div class="flex justify-between text-sm"><span class="text-gray-500 font-bold uppercase">Producto:</span><span class="font-black text-gray-900">${prod.nombre.replace(/_/g, ' ')}</span></div>
                <div class="flex justify-between text-sm"><span class="text-gray-500 font-bold uppercase">Sede:</span><span class="font-black text-gray-900">${prod.sede}</span></div>
                <div class="flex justify-between text-sm"><span class="text-gray-500 font-bold uppercase">Cantidad:</span><span class="font-black text-gray-900">${prod.cantidad} Unds.</span></div>
                <div class="flex justify-between text-sm border-t border-dashed pt-4"><span class="text-amber-600 font-black uppercase">Total USD:</span><span class="font-black text-2xl text-gray-900">$${prod.montoVenta().toFixed(2)}</span></div>
                <div class="flex justify-between text-sm"><span class="text-gray-400 font-bold uppercase italic">Total Bs.:</span><span class="font-bold text-gray-400 italic">Bs. ${montoBs.toLocaleString('de-DE', {minimumFractionDigits: 2})}</span></div>
            </div>

            <button onclick="cerrarModal()" class="w-full bg-gray-100 text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-black hover:text-white transition-all">
                Finalizar y Salir
            </button>
        </div>
    </div>
    `;
}

function abrirLogin() {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white flex flex-col md:flex-row rounded-[32px] overflow-hidden shadow-2xl max-w-2xl w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div class="bg-black text-white p-10 flex-1 flex flex-col justify-center items-center text-center">
                <h3 class="text-2xl font-black italic text-amber-500">KS ALTA EFICIENCIA</h3>
                <p class="text-[8px] tracking-[0.4em] uppercase opacity-40 mt-2 italic text-white">Distribuidores Exclusivos</p>
            </div>
            <div class="p-8 md:p-12 flex-[1.5] flex flex-col justify-center relative bg-white">
                <button onclick="cerrarModal()" class="absolute top-4 right-6 text-gray-300 hover:text-black text-2xl">&times;</button>
                <h4 class="text-xl font-black uppercase mb-2">Acceso B2B</h4>
                <div class="space-y-4">
                    <input type="email" placeholder="Correo Corporativo" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-amber-500 outline-none transition-all">
                    <input type="password" placeholder="Contraseña" class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-amber-500 outline-none transition-all">
                    <button class="w-full bg-black text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-amber-600 transition-all">Entrar</button>
                </div>
            </div>
        </div>
    </div>
    `;
}
















