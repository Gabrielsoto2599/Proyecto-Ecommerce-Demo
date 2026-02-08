// --- 1. LÓGICA DE NEGOCIO ---
class Cl_Producto {
    constructor(nombre, sede, precioBase, cantidad = 1) {
        this.nombre = nombre;
        this.sede = sede;
        this.precioBase = precioBase;
        this.cantidad = cantidad;
    }
    montoVenta() {
        let subtotal = this.precioBase * this.cantidad;
        if (this.cantidad >= 12) subtotal *= 0.85; // Descuento B2B
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
let inventario = [];

// --- 2. INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarInventario();
});

function configurarEventos() {
    const btnLogin = document.getElementById('open-login');
    const btnCatalogo = document.getElementById('btn-catalogo');

    if (btnLogin) {
        btnLogin.onclick = (e) => { e.preventDefault(); mostrarInterfazLogin(true); };
    }
    if (btnCatalogo) {
        btnCatalogo.onclick = (e) => {
            e.preventDefault();
            document.getElementById('seccion-inventario').scrollIntoView({ behavior: 'smooth' });
        };
    }
}

// --- 3. LOGIN RECUPERADO Y MEJORADO ---
function mostrarInterfazLogin(esLogin) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="overlay">
        <div class="information">
            <div class="info-childs" style="background-color: #1a1a1a; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 20px; flex: 1;">
                <h2 style="margin-bottom: 10px;">${esLogin ? '¡Hola!' : 'Registro'}</h2>
                <p style="font-size: 0.8rem; opacity: 0.8;">Acceso exclusivo para distribuidores KS.</p>
                <input type="button" value="${esLogin ? 'REGISTRAR' : 'LOGIN'}" id="btn-switch" class="btn-ks-outline" style="margin-top: 20px;">
            </div>
            <div class="form-information" style="background: white; flex: 1.5; padding: 30px;">
                <h2 style="color: #333; margin-bottom: 20px;">${esLogin ? 'Iniciar Sesión' : 'Nueva Cuenta'}</h2>
                <form id="f-login">
                    <input type="email" placeholder="Correo" required style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <input type="password" placeholder="Contraseña" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <input type="submit" value="CONTINUAR" class="btn-ks">
                    <button type="button" onclick="document.getElementById('modal-root').innerHTML=''" style="width: 100%; background: none; border: none; color: #999; margin-top: 10px; cursor: pointer;">Cerrar</button>
                </form>
            </div>
        </div>
    </div>`;

    document.getElementById('btn-switch').onclick = () => mostrarInterfazLogin(!esLogin);
}

// --- 4. CARGA DE CATÁLOGO (CON RESPALDO INTEGRADO) ---
async function cargarInventario() {
    try {
        const res = await fetch('ventas.json');
        if (!res.ok) throw new Error();
        inventario = await res.json();
    } catch (err) {
        // SI EL JSON FALLA, USAMOS ESTOS DATOS AUTOMÁTICAMENTE
        inventario = [
            { "id": 1, "sede": "Caracas", "producto": "Aceite 10W-40 Sintético", "precio": 12.5, "stock": 150 },
            { "id": 11, "sede": "Valencia", "producto": "Aceite 15W-40 Diesel", "precio": 9.5, "stock": 180 },
            { "id": 21, "sede": "Maracaibo", "producto": "Filtro Gasolina", "precio": 4.5, "stock": 150 },
            { "id": 31, "sede": "Puerto Ordaz", "producto": "Pistón Cummins Heavy", "precio": 120.0, "stock": 8 }
            // Agregué solo 4 para no saturar el código, pero el renderizador los tomará.
        ];
    }
    renderizar(inventario);
}

function renderizar(data) {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = data.map(p => `
        <li class="producto-card">
            <span class="badge">${p.sede}</span>
            <div style="font-size: 3rem; margin: 10px 0;">${p.producto.includes('Aceite') ? '🛢️' : '⚙️'}</div>
            <h3 style="font-size: 0.9rem;">${p.producto}</h3>
            <p style="color: #b8860b; font-weight: bold; font-size: 1.1rem;">$${p.precio.toFixed(2)}</p>
            <div style="margin-top: 10px; display: flex; justify-content: center; gap: 5px;">
                <input type="number" id="q-${p.id}" value="1" min="1" style="width: 40px; border-radius: 4px; border: 1px solid #ccc;">
                <button class="btn-add" onclick="procesarCompra(${p.id})">AÑADIR</button>
            </div>
        </li>
    `).join('');
}

function procesarCompra(id) {
    const item = inventario.find(i => i.id === id);
    const cant = parseInt(document.getElementById(`q-${id}`).value);
    const pedido = new Cl_Producto(item.producto, item.sede, item.precio, cant);
    empresaKS.procesar(pedido);
    document.getElementById('cart-count').innerText = empresaKS.contVentas;
    mostrarRecibo(pedido);
}

function mostrarRecibo(pedido) {
    document.getElementById('modal-root').innerHTML = `
    <div class="overlay">
        <div class="factura-modal">
            <h2 style="color: #b8860b;">ORDEN KS</h2>
            <hr>
            <p style="text-align: left; font-size: 0.9rem; margin-top: 10px;">
                <strong>Item:</strong> ${pedido.nombre}<br>
                <strong>Sede:</strong> ${pedido.sede}<br>
                <strong>Cant:</strong> ${pedido.cantidad}
            </p>
            <h3 style="margin: 15px 0;">TOTAL: $${pedido.montoVenta().toFixed(2)}</h3>
            <button class="btn-ks" onclick="document.getElementById('modal-root').innerHTML=''">CONFIRMAR</button>
        </div>
    </div>`;
}




    




