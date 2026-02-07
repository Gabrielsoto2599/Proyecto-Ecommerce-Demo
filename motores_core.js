/** * SECCIÓN 1: LÓGICA DE CLASES (Reutilizando tu lógica de Netflix)
 * Aquí adaptamos Cl_Suscriptor y Cl_Agencia para KS-Alta Eficiencia
 */

class Cl_Motor {
    constructor(sede, precioBase) {
        this.sede = sede;
        this.precioBase = precioBase;
    }

    // Adaptación de tu "montoPagar" con el recargo del 10%
    montoVenta() {
        // Digamos que las sedes lejanas (Puerto Ordaz) no pagan envío (como tu Plan C)
        if (this.sede === "Puerto Ordaz") {
            return this.precioBase; 
        } else {
            return this.precioBase * 1.10; // Recargo del 10% por transporte (como tus Planes A y B)
        }
    }
}

class Cl_Empresa {
    constructor() {
        this.contVentas = 0;
        this.acumuladoDinero = 0;
    }

    procesarVenta(motor) {
        this.contVentas++;
        this.acumuladoDinero += motor.montoVenta();
    }
}

/** * SECCIÓN 2: INTERACCIÓN CON EL NAVEGADOR Y JSON
 */

let inventarioGlobal = [];
const empresaKS = new Cl_Empresa();

document.addEventListener('DOMContentLoaded', () => {
    
    // Cargar los datos del JSON automáticamente
    fetch('ventas.json')
        .then(response => response.json())
        .then(datos => {
            inventarioGlobal = datos;
            console.log("Inventario cargado desde JSON:", inventarioGlobal);
        })
        .catch(err => console.error("Error al cargar JSON. ¿Estás usando Live Server?", err));

    // Lógica del Login (La que ya teníamos perfeccionada)
    const btnOpenLogin = document.getElementById('open-login');
    const modalRoot = document.getElementById('login-modal-root');

    if (btnOpenLogin && modalRoot) {
        btnOpenLogin.addEventListener('click', (e) => {
            e.preventDefault();
            modalRoot.innerHTML = `
                <div id="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 2000; cursor: pointer;">
                    <div class="container-form" style="cursor: default; background: white; padding: 20px; border-radius: 10px;">
                        <h2>Acceso KS-Alta Eficiencia</h2>
                        <p>Inicie sesión para ver precios mayoristas</p>
                        <input type="button" value="Cerrar" id="btn-close-modal">
                    </div>
                </div>`;
            
            document.getElementById('modal-overlay').addEventListener('click', (ev) => {
                if(ev.target.id === 'modal-overlay') modalRoot.innerHTML = '';
            });
        });
    }
});

// Función que se activa al darle al botón naranja de "COMPRAR AHORA"
function realizarCompraSimulada(nombreSede) {
    // 1. Buscamos los datos en el JSON (como buscabas suscriptores)
    const datosMotor = inventarioGlobal.find(m => m.sede === nombreSede);

    if (datosMotor) {
        // 2. Creamos una instancia de nuestra clase (POO)
        const nuevoMotor = new Cl_Motor(datosMotor.sede, datosMotor.precio);
        
        // 3. Procesamos en la empresa
        empresaKS.procesarVenta(nuevoMotor);

        // 4. Actualizamos el carrito visual
        const cartElement = document.getElementById('cart-count');
        cartElement.innerText = empresaKS.contVentas;

        // 5. Mostramos el resultado usando la lógica de la clase
        alert(`
            REGISTRO DE VENTA EXITOSO
            -------------------------
            Sede: ${nuevoMotor.sede}
            Precio Base: $${nuevoMotor.precioBase}
            Precio Final (+10% si aplica): $${nuevoMotor.montoVenta().toFixed(2)}
            -------------------------
            Ventas totales hoy: ${empresaKS.contVentas}
            Total en caja: $${empresaKS.acumuladoDinero.toFixed(2)}
        `);
    }
}




    

