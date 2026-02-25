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

function mostrarRecibo(pedido) {
    const precioFinal = mostrarEnBolivares ? (pedido.montoVenta() * TASA_BCV) : pedido.montoVenta();
    const simbolo = mostrarEnBolivares ? "Bs." : "$";

    document.getElementById('modal-root').innerHTML = `
    <div class="overlay flex items-center justify-center fixed inset-0 bg-black/50 z-[100] p-4">
        <div class="bg-white p-8 rounded-3xl text-center border-t-8 border-amber-600 shadow-2xl w-full max-w-sm">
            <h2 class="text-amber-600 font-black text-xl uppercase italic">Orden KS Generada</h2>
            <div class="my-4 text-left text-xs space-y-2 border-y py-4 border-gray-100 font-bold text-gray-600 uppercase">
                <p>Producto: <span class="text-black">${pedido.nombre}</span></p>
                <p>Cantidad: <span class="text-black">${pedido.cantidad}</span></p>
                <p>Monto: <span class="text-black">${simbolo}${precioFinal.toLocaleString('es-VE')}</span></p>
            </div>
            <button onclick="generarPDF_B2B('${pedido.nombre}', '${pedido.sede}', ${pedido.cantidad}, ${precioFinal}, '${simbolo}')" class="w-full bg-amber-600 text-white font-black py-3 rounded-xl uppercase mb-2">Descargar PDF</button>
            <button onclick="document.getElementById('modal-root').innerHTML=''" class="w-full bg-black text-white font-black py-3 rounded-xl uppercase">Cerrar</button>
        </div>
    </div>`;
}

function generarPDF_B2B(prod, sede, cant, total, moneda) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(184, 134, 11); doc.text("KS ALTA EFICIENCIA", 10, 20);
    doc.setFontSize(12); doc.setTextColor(0); doc.text(`Pedido: ${prod} - Sede: ${sede}`, 10, 40);
    doc.text(`Cantidad: ${cant} | Total: ${moneda} ${total.toLocaleString('es-VE')}`, 10, 50);
    doc.save(`Pedido_KS_${prod}.pdf`);
}

// ==========================================
// 5. NUEVO LOGIN CON REGISTRO INTEGRADO
// ==========================================
function mostrarInterfazLogin(modoRegistro = false) {
    const root = document.getElementById('modal-root');
    
    // 1. Definimos el HTML dinámico según el modo
    let contenidoDinamico = "";
    
    if (modoRegistro) {
        // HTML PARA CREAR CUENTA
        contenidoDinamico = `
            <h2 class="text-2xl font-black mb-4 text-gray-800 uppercase italic">Crear Cuenta B2B</h2>
            <input type="text" placeholder="Empresa / RIF" class="mb-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 outline-none focus:border-amber-500 w-full text-xs font-bold">
            <input type="email" placeholder="Correo Corporativo" class="mb-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 outline-none focus:border-amber-500 w-full text-xs font-bold">
            <select class="mb-4 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 text-xs font-black uppercase w-full outline-none focus:border-amber-600">
                <option>Distribuidor Mayorista</option>
                <option>Cliente Detal</option>
            </select>
            <button onclick="alert('Solicitud enviada a revisión')" class="bg-amber-600 text-white font-black py-3 rounded-xl uppercase w-full shadow-lg">Solicitar Acceso</button>
            <p class="mt-4 text-[9px] font-black text-center text-gray-400 uppercase">
                ¿Ya tienes cuenta? <span onclick="mostrarInterfazLogin(false)" class="text-amber-600 cursor-pointer underline hover:text-black transition-colors">Inicia Sesión</span>
            </p>
        `;
    } else {
        // HTML PARA INICIAR SESIÓN (Lo que ves ahora)
        contenidoDinamico = `
            <h2 class="text-2xl font-black mb-6 text-gray-800 uppercase italic">Acceso B2B</h2>
            <input type="text" placeholder="Usuario" class="mb-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 outline-none focus:border-amber-500 w-full text-xs font-bold">
            <input type="password" placeholder="Clave" class="mb-6 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 outline-none focus:border-amber-500 w-full text-xs font-bold">
            <button onclick="alert('Ingresando al sistema...')" class="bg-black text-white font-black py-3 rounded-xl uppercase w-full shadow-lg hover:bg-amber-600 transition-all">Entrar</button>
            <p class="mt-6 text-[9px] font-black text-center text-gray-400 uppercase">
                ¿Nuevo distribuidor? <span onclick="mostrarInterfazLogin(true)" class="text-amber-600 cursor-pointer underline hover:text-black transition-colors">Regístrate aquí</span>
            </p>
        `;
    }

    // 2. Inyectamos todo el modal en el root
    root.innerHTML = `
    <div class="overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white flex flex-col md:flex-row rounded-[32px] overflow-hidden shadow-2xl max-w-2xl w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div class="bg-black text-white p-10 flex-1 flex flex-col justify-center items-center text-center">
                <h3 class="text-2xl font-black italic text-amber-500">KS ALTA EFICIENCIA</h3>
                <p class="text-[8px] tracking-[0.4em] uppercase opacity-40 mt-2 italic text-white">Distribuidores Exclusivos</p>
            </div>
            <div class="p-8 md:p-12 flex-[1.5] flex flex-col justify-center relative bg-white">
                <button onclick="document.getElementById('modal-root').innerHTML=''" class="absolute top-4 right-4 text-gray-300 hover:text-black font-bold text-xl transition-colors">✕</button>
                ${contenidoDinamico}
            </div>
        </div>
    </div>`;
}















