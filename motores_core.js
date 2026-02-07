// --- PARTE 1: LÓGICA DE COMPRA RECUPERADA Y MEJORADA ---
function realizarCompraSimulada(sede, cantidad) {
    const precioUnitario = 4500; // Precio ficticio en USD
    const tasaIva = 0.16;
    const tasaDescuento = 0.10;

    // Cálculos matemáticos
    const subtotal = precioUnitario * cantidad;
    const montoIva = subtotal * tasaIva;
    const montoDescuento = subtotal * tasaDescuento;
    const total = subtotal + montoIva - montoDescuento;

    // El truco de magia: Mostrarlo en un alerta profesional
    alert(
        "--- RECIBO DE COMPRA (SIMULACIÓN) ---\n" +
        "Sede: " + sede + "\n" +
        "Motor: Cummins 6.7L Alta Eficiencia\n" +
        "-----------------------------------\n" +
        "Subtotal: $" + subtotal.toFixed(2) + "\n" +
        "IVA (16%): $" + montoIva.toFixed(2) + "\n" +
        "Descuento (10%): -$" + montoDescuento.toFixed(2) + "\n" +
        "-----------------------------------\n" +
        "TOTAL A PAGAR: $" + total.toFixed(2) + "\n\n" +
        "¡Gracias por su preferencia en KS-Alta Eficiencia!"
    );
    
    console.log("Venta procesada para " + sede + " por un total de $" + total);
}

// --- PARTE 2: LÓGICA DEL LOGIN (Lo que estamos agregando) ---
const btnSignIn = document.getElementById("sing-in");
const btnSignUp = document.getElementById("sing-up");
const formRegister = document.querySelector(".register");
const formLogin = document.querySelector(".login");
const modal = document.getElementById("modal-registro"); 
const openModalBtn = document.getElementById("open-login"); 

// Función para abrir el modal
if (openModalBtn) {
    openModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("show");
    });
}

// Lógica de intercambio entre Login y Registro
if (btnSignIn && btnSignUp) {
    btnSignIn.addEventListener("click", e => {
         e.preventDefault();
         formRegister.classList.add("hide");
         formLogin.classList.remove("hide");
    });

    btnSignUp.addEventListener("click", e => {
         e.preventDefault();
         formLogin.classList.add("hide");
         formRegister.classList.remove("hide");
    });
}


    
