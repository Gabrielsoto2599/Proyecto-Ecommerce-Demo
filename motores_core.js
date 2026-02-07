//**
// --- 1. SECCIÓN DE LÓGICA (POO) ---
class Cl_Motor {
    constructor(sede, precioBase) {
        this.sede = sede;
        this.precioBase = precioBase;
    }
    montoVenta() {
        // Lógica heredada de Netflix: Recargo del 10% si NO es Puerto Ordaz
        return this.sede === "Puerto Ordaz" ? this.precioBase : this.precioBase * 1.10;
    }
}

class Cl_Empresa {
    constructor() {
        this.contVentas = 0;
        this.acumulado = 0;
    }
    procesar(motor) {
        this.contVentas++;
        this.acumulado += motor.montoVenta();
    }
}

const empresaKS = new Cl_Empresa();
let datosDeSedes = []; // Aquí se guarda la info del JSON

// --- 2. INICIO Y CARGA DE DATOS ---
document.addEventListener('DOMContentLoaded', () => {
    configurarLogin();
    cargarInventarioJSON();
});

async function cargarInventarioJSON() {
    try {
        const res = await fetch('ventas.json');
        if (!res.ok) throw new Error("No se pudo leer el JSON");
        datosDeSedes = await res.json();
        console.log("✅ Inventario cargado desde JSON exitosamente");
    } catch (err) {
        console.error("⚠️ Error cargando JSON, usando datos de respaldo:", err.message);
        // Respaldo por si falla la lectura del archivo
        datosDeSedes = [
            { "sede": "Caracas", "precio": 3000 },
            { "sede": "Valencia", "precio": 3200 },
            { "sede": "Maracaibo", "precio": 2800 },
            { "sede": "Puerto Ordaz", "precio": 4000 }
        ];
    }
}

// --- 3. INTERFAZ DE LOGIN Y REGISTRO (SINCRONIZADA) ---
function configurarLogin() {
    const btnOpenLogin = document.getElementById('open-login');
    const modalRoot = document.getElementById('login-modal-root');

    if (btnOpenLogin && modalRoot) {
        btnOpenLogin.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarInterfazLogin(modalRoot, true); // true = vista login por defecto
        });
    }
}

function mostrarInterfazLogin(contenedor, esLogin) {
    contenedor.innerHTML = `
    <div id="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 2000; cursor: pointer;">
        <div class="container-form" style="cursor: default;">
            <div class="information">
                <div class="info-childs">
                    <h2>${esLogin ? '¡Bienvenido!' : '¡Únete a KS!'}</h2>
                    <p>${esLogin ? 'Para gestionar pedidos, inicia sesión.' : 'Regístrate para obtener precios mayoristas.'}</p>
                    <input type="button" value="${esLogin ? 'Registrarse' : 'Iniciar Sesión'}" id="btn-switch-view" style="background: transparent; border: 1px solid white; color: white; padding: 10px 20px; border-radius: 20px; cursor: pointer; margin-top: 20px;">
                </div>
                <div class="form-information">
                    <div class="form-information-childs">
                        <h2>${esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                        <form class="form" id="login-register-form">
                            ${!esLogin ? `
                                <label><input type="text" placeholder="Nombre Completo" required></label>
                                <label>
                                    <select style="width: 100%; padding: 10px; margin-top: 10px; border-radius: 5px; border: 1px solid #ddd;">
                                        <option value="detal">Cliente al Detal</option>
                                        <option value="mayorista">Mayorista</option>
                                    </select>
                                </label>
                            ` : ''}
                            <label><input type="email" placeholder="Correo Electrónico" required></label>
                            <label><input type="password" placeholder="Contraseña" required></label>
                            
                            <input type="submit" value="${esLogin ? 'Entrar' : 'Crear Cuenta'}" style="margin-bottom: 10px;">
                            
                            <input type="button" value="Cerrar" id="btn-cerrar-m" style="background: none; color: #888; border: none; cursor: pointer;">
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // Cerrar modal
    const cerrar = () => contenedor.innerHTML = '';
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if(e.target.id === 'modal-overlay' || e.target.id === 'btn-cerrar-m') cerrar();
    });

    // Intercambiar vistas (Login <-> Registro)
    document.getElementById('btn-switch-view').addEventListener('click', () => {
        mostrarInterfazLogin(contenedor, !esLogin);
    });

    // Simular envío de formulario
    document.getElementById('login-register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert(esLogin ? "Sesión Iniciada" : "Cuenta Creada");
        cerrar();
    });
}

// --- 4. SISTEMA DE COMPRAS Y FACTURA MODAL ---
function realizarCompraSimulada(nombreSede) {
    const sedeInfo = datosDeSedes.find(s => s.sede === nombreSede);
    if (!sedeInfo) return;

    // Lógica de Negocio (Clases)
    const miMotor = new Cl_Motor(sedeInfo.sede, sedeInfo.precio);
    empresaKS.procesar(miMotor);

    // Actualizar Carrito Visual
    const cartCount = document.getElementById('cart-count');
    if(cartCount) cartCount.innerText = empresaKS.contVentas;

    // Mostrar Factura con Cierre al Clic Afuera
    const modalRoot = document.getElementById('login-modal-root');
    modalRoot.innerHTML = `
    <div id="factura-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 3000; cursor: pointer;">
        <div style="background: white; padding: 40px; border-radius: 15px; width: 350px; cursor: default; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: left;">
            <h2 style="text-align: center; color: #e67e22; border-bottom: 2px solid #eee; padding-bottom: 10px;">RECIBO KS</h2>
            <div style="margin: 20px 0;">
                <p><strong>Sede:</strong> ${miMotor.sede}</p>
                <p><strong>Precio Base:</strong> $${miMotor.precioBase}</p>
                <p><strong>Recargo Conexión:</strong> $${(miMotor.montoVenta() - miMotor.precioBase).toFixed(2)}</p>
                <hr>
                <p style="font-size: 1.2rem;"><strong>TOTAL: $${miMotor.montoVenta().toFixed(2)}</strong></p>
            </div>
            <button id="btn-ok" style="width: 100%; background: #333; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">ACEPTAR</button>
            <p style="text-align: center; font-size: 0.7rem; color: #999; margin-top: 10px;">Haz clic fuera para cerrar</p>
        </div>
    </div>`;

    const cerrarFactura = () => modalRoot.innerHTML = '';
    document.getElementById('factura-overlay').addEventListener('click', (e) => {
        if(e.target.id === 'factura-overlay' || e.target.id === 'btn-ok') cerrarFactura();
    });
}


    


