// PIEZA 1: EL INVENTARIO CENTRALIZADO (Basado en tu Bodega)
const sucursales = {
    "Caracas": { stock: 50, ventas: 0 },
    "Valencia": { stock: 30, ventas: 0 },
    "Maracaibo": { stock: 20, ventas: 0 },
    "Puerto Ordaz": { stock: 15, ventas: 0 }
};

// PIEZA 2: LÓGICA DE PRECIOS AL MAYOR (Basada en tu lógica de Netflix)
function calcularFactura(cantidad, precioUnitario) {
    let subtotal = cantidad * precioUnitario;
    let descuento = 0;

    // Si compra más de 5 motores (Venta al mayor)
    if (cantidad >= 5) {
        descuento = subtotal * 0.15; // 15% de descuento (Tu lógica de suscripción)
    }
let total = subtotal - descuento;
    return { subtotal, descuento, total };
}

// PIEZA 3: AJUSTE POR TASA (Basada en tu lógica de Aumento de Sueldo)
function precioEnBolivares(precioDolar, tasaBCV) {
    return precioDolar * tasaBCV; 
}

// FUNCIÓN DE VENTA ANCLADA A CAJA
function procesarVenta(ciudad, cantidad, modeloMotor) {
    if (sucursales[ciudad].stock >= cantidad) {
        sucursales[ciudad].stock -= cantidad;
        sucursales[ciudad].ventas += cantidad;
        console.log(`✅ Venta exitosa en ${ciudad}. Quedan ${sucursales[ciudad].stock} motores.`);
    } else {
        console.log(`❌ No hay stock suficiente en la sucursal de ${ciudad}`);
    }

    // Esta función "escucha" los clics de tu Landing Page
function realizarCompraSimulada(sede, cantidad) {
    const precioMotor = 1200; // Precio base en $
    const tasaCambio = 36.5; // Tasa de ejemplo
    const burbuja = document.getElementById('cart-count');
    if (burbuja) {
    burbuja.innerText = parseInt(burbuja.innerText) + cantidad;

    // 1. Ejecutamos tu lógica de stock
    procesarVenta(sede, cantidad, "Motor Cummins 6BT");

    // 2. Calculamos la factura con tu lógica de mayoristas
    const factura = calcularFactura(cantidad, precioMotor);
    const montoBs = precioEnBolivares(factura.total, tasaCambio);

    // 3. ACTUALIZAMOS EL CARRITO VISUALMENTE
    const burbuja = document.getElementById('cart-count');
    if (burbuja) {
        let actual = parseInt(burbuja.innerText);
        burbuja.innerText = actual + cantidad;
    }

    // 4. Feedback para el cliente (puedes usar un alert o un div)
    alert(`🛒 Compra en ${sede} exitosa. 
    Total: $${factura.total} 
    Equivalente a: Bs. ${montoBs.toLocaleString()}`);
}

}
 
 }