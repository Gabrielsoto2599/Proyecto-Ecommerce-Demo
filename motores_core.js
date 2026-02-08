/// --- 1. LÓGICA DE NEGOCIO ---
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
let inventario = [];

// --- 2. INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarInventario();
});

function configurarEventos() {
    // Botón Login
    document.getElementById('open-login').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarInterfazLogin(true);
    });

    // Botón Catálogo (Scroll)
    document.getElementById('btn-catalogo').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('seccion-inventario').scrollIntoView({ behavior: 'smooth' });
    });
}

// --- 3. LÓGICA DEL LOGIN (RECUPERADA) ---
function mostrarInterfazLogin(esLogin) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div id="modal-overlay" class="overlay">
        <div class="information">
            <div class="info-childs" style="background: #1a1a1a; color: white; padding: 40px; text-align: center;">
                <h2>${esLogin ? '¡Bienvenido!' : '¡Únete a KS!'}</h2>
                <p>${esLogin ? 'Accede para gestionar pedidos.' : 'Regístrate para precios mayoristas.'}</p>
                <input type="button" value="${esLogin ? 'REGISTRARSE' : 'INICIAR SESIÓN'}" id="btn-switch-view" class="btn-ks-outline">
            </div>
            <div class="form-information" style="background: white; padding: 40px; width: 100%;">
                <h2 style="color: #333;">${esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                <form id="login-form" class="form">
                    ${!esLogin ? '<input type="text" placeholder="Nombre de la Empresa" required style="width:100%; margin-bottom:10px; padding:10px;">' : ''}
                    <input type="email" placeholder="Correo Electrónico" required style="width:100%; margin-bottom:10px; padding:10px;">
                    <input type="password" placeholder="Contraseña" required style="width:100%; margin-bottom:10px; padding:10px;">
                    <input type="submit" value="${esLogin ? 'ENTRAR' : 'REGISTRAR'}" class="btn-ks">
                    <button type="button" onclick="document.getElementById('modal-root').innerHTML=''" style="background:none; border:none; color:gray; cursor:pointer; width:100%; margin-top:10px;">Cerrar</button>
                </form>
            </div>
        </div>
    </div>`;

    document.getElementById('btn-switch-view').addEventListener('click', () => mostrarInterfazLogin(!esLogin));
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert(esLogin ? "Sesión iniciada como Mayorista" : "Registro completado");
        root.innerHTML = '';
    });
}

// --- 4. CARGA DE CATÁLOGO ---
async function cargarInventario() {
    try {
        const res = await fetch('ventas.json');
        inventario = await res.json();
        renderizar(inventario);
    } catch (err) {
        console.error("Error", err);
    }
}

function renderizar(data) {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = data.map(p => `
        <li class="producto-card">
            <span class="badge">${p.sede}</span>
            <div style="font-size: 3rem; margin: 15px 0;">${p.producto.includes('Aceite') ? '🛢️' : '⚙️'}</div>
            <h3 style="font-size: 1rem;">${p.producto}</h3>
            <p style="font-weight: bold; color: #b8860b;">$${p.precio.toFixed(2)}</p>
            <div style="margin-top: 10px;">
                <input type="number" id="q-${p.id}" value="1" min="1" style="width: 45px;">
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
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="overlay">
        <div class="factura-modal">
            <h2 style="color: #b8860b;">FACTURA B2B</h2>
            <p><strong>Sede:</strong> ${pedido.sede}</p>
            <p><strong>Item:</strong> ${pedido.nombre} (x${pedido.cantidad})</p>
            <p><strong>Total:</strong> $${pedido.montoVenta().toFixed(2)}</p>
            ${pedido.cantidad >= 12 ? '<p style="color:green; font-size:0.8rem;">Descuento por caja aplicado</p>' : ''}
            <button class="btn-ks" onclick="document.getElementById('modal-root').innerHTML=''">ACEPTAR</button>
        </div>
    </div>`;
}


    



