// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
const TASA_BCV = 36.50; // Puedes actualizar este valor mañana
let mostrarEnBolivares = false;
let inventario = [];

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
    // Evento para el botón de moneda (Usa delegación de eventos para mayor seguridad)
    document.addEventListener('click', (e) => {
        const btnMoneda = e.target.closest('#btn-moneda');
        if (btnMoneda) {
            mostrarEnBolivares = !mostrarEnBolivares;
            const textoBtn = document.getElementById('texto-boton-moneda');
            textoBtn.innerText = mostrarEnBolivares ? "Ver en Dólares ($)" : `Ver en Bs. (Tasa: ${TASA_BCV})`;
            renderizar(inventario);
        }

        // Abrir login
        if (e.target.closest('#open-login')) {
            e.preventDefault();
            mostrarInterfazLogin(true);
        }
    });
}

// ==========================================
// 3. CARGA Y RENDERIZADO (EL CORAZÓN)
// ==========================================
async function cargarInventario() {
    try {
        const res = await fetch('ventas.json');
        inventario = await res.json();
    } catch (err) {
        // Datos de prueba por si el JSON no carga
        inventario = [
            { "id": 1, "sede": "Caracas", "producto": "Aceite 10W-40 Sintético", "precio": 12.5 },
            { "id": 11, "sede": "Valencia", "producto": "Aceite 15W-40 Diesel", "precio": 9.5 },
            { "id": 21, "sede": "Maracaibo", "producto": "Filtro Gasolina", "precio": 4.5 },
            { "id": 31, "sede": "Puerto Ordaz", "producto": "Pistón Cummins Heavy", "precio": 120.0 }
        ];
    }
    renderizar(inventario);
}

function renderizar(data) {
    const lista = document.getElementById('lista-productos');
    if (!lista) return;

    lista.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";

    lista.innerHTML = data.map(p => {
        // Lógica de Moneda
        const precioFinal = mostrarEnBolivares ? (p.precio * TASA_BCV) : p.precio;
        const simbolo = mostrarEnBolivares ? "Bs." : "$";
        const rutaImagen = `${p.producto}.jpg`; 

        return `
        <li class="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 p-6 flex flex-col items-center relative group overflow-hidden">
            <span class="absolute top-4 right-4 bg-black text-amber-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest z-10 shadow-md">
                ${p.sede}
            </span>
            
            <div class="w-full h-44 mb-6 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2">
                <img src="${rutaImagen}" 
                     alt="${p.producto}" 
                     class="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500"
                     onerror="this.src='motores_v8.svg'; this.style.opacity='0.5';"> 
            </div>

            <div class="text-center w-full">
                <h3 class="text-gray-900 font-black text-[11px] mb-2 uppercase tracking-tight h-10 flex items-center justify-center leading-tight">
                    ${p.producto}
                </h3>
                
                <p class="text-2xl font-black text-gray-900 tracking-tighter mb-4">
                    ${simbolo}${precioFinal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                
                <div class="flex items-center gap-2 w-full pt-4 border-t border-gray-100">
                    <input type="number" id="q-${p.id}" value="1" min="1" 
                           class="w-12 bg-gray-50 border border-gray-200 rounded-lg p-2 text-center text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500">
                    <button onclick="procesarCompra(${p.id})" 
                            class="flex-1 bg-black hover:bg-amber-600 text-white font-black py-2.5 rounded-lg transition-all duration-300 text-[10px] tracking-widest uppercase shadow-md active:scale-95">
                        Añadir
                    </button>
                </div>
            </div>
        </li>`;
    }).join('');
}

// ==========================================
// 4. LÓGICA DE COMPRA Y MODALES
// ==========================================
function procesarCompra(id) {
    const item = inventario.find(i => i.id === id);
    const cant = parseInt(document.getElementById(`q-${id}`).value);
    const pedido = new Cl_Producto(item.producto, item.sede, item.precio, cant);
    
    empresaKS.procesar(pedido);
    document.getElementById('cart-count').innerText = empresaKS.contVentas;
    mostrarRecibo(pedido);
}

function mostrarRecibo(pedido) {
    const precioFinal = mostrarEnBolivares ? (pedido.montoVenta() * TASA_BCV) : pedido.montoVenta();
    const simbolo = mostrarEnBolivares ? "Bs." : "$";

    document.getElementById('modal-root').innerHTML = `
    <div class="overlay flex items-center justify-center fixed inset-0 bg-black/50 z-[100]">
        <div class="bg-white p-8 rounded-3xl text-center border-t-8 border-amber-600 shadow-2xl w-[320px]">
            <h2 class="text-amber-600 font-black text-xl uppercase italic">Orden KS</h2>
            <div class="my-4 text-left text-xs space-y-2 border-y py-4 border-gray-100 font-bold text-gray-600 uppercase">
                <p>Producto: <span class="text-black">${pedido.nombre}</span></p>
                <p>Sede: <span class="text-black">${pedido.sede}</span></p>
                <p>Cantidad: <span class="text-black">${pedido.cantidad}</span></p>
            </div>
            <h3 class="text-3xl font-black mb-6">${simbolo}${precioFinal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</h3>
            <button onclick="document.getElementById('modal-root').innerHTML=''" class="w-full bg-black text-white font-black py-3 rounded-xl uppercase tracking-widest hover:bg-amber-600 transition">Confirmar</button>
        </div>
    </div>`;
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


    





