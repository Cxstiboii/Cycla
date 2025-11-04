class CarritoPage {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.authManager = window.authManager;
    }

    init() {
        console.log('🔄 Inicializando página del carrito...');
        this.cargarCarrito();
        this.configurarEventos();
        console.log('✅ Página del carrito inicializada correctamente');
    }

    cargarCarrito() {
        this.mostrarItemsCarrito(this.carrito);
        this.actualizarResumen(this.carrito);
        this.actualizarEstadoBotonPago();
    }

    mostrarItemsCarrito(carrito) {
        const container = document.getElementById('carrito-items');

        if (!container) return;

        if (!carrito || carrito.length === 0) {
            container.innerHTML = this.crearCarritoVacio();
            return;
        }

        container.innerHTML = carrito.map(item => this.crearItemCarrito(item)).join('');
    }

    crearCarritoVacio() {
        return `
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🛒</div>
                <p class="text-gray-500 text-lg font-semibold mb-2">Tu carrito está vacío</p>
                <p class="text-gray-400 mb-6">Agrega algunos productos para continuar</p>
                <a href="/" 
                   class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition font-semibold">
                    Explorar Productos
                </a>
            </div>
        `;
    }

    crearItemCarrito(item) {
        const subtotal = item.precio * item.cantidad;

        return `
            <div class="flex items-center space-x-4 py-4 border-b border-gray-200" data-producto-id="${item.id}">
                <!-- Imagen -->
                <div class="flex-shrink-0">
                    <img src="${item.imagen || '/assets/placeholder.jpg'}" 
                         alt="${item.nombre}" 
                         class="w-20 h-20 object-cover rounded-lg">
                </div>
                
                <!-- Información -->
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${item.nombre}</h3>
                    <p class="text-gray-600">$${this.formatearPrecio(item.precio)} c/u</p>
                </div>
                
                <!-- Cantidad -->
                <div class="flex items-center space-x-2">
                    <button class="cantidad-btn decremento w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            data-producto-id="${item.id}"
                            data-action="decrement">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                    </button>
                    <span class="cantidad-value w-12 text-center font-semibold">${item.cantidad}</span>
                    <button class="cantidad-btn incremento w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                            data-producto-id="${item.id}"
                            data-action="increment">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Subtotal -->
                <div class="text-right">
                    <p class="text-lg font-semibold text-green-600">$${this.formatearPrecio(subtotal)}</p>
                    <button class="eliminar-item text-red-500 hover:text-red-700 text-sm mt-1"
                            data-producto-id="${item.id}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    actualizarResumen(carrito) {
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = subtotal > 500000 ? 0 : 15000; // Envío gratis sobre $500,000
        const total = subtotal + envio;

        const subtotalElement = document.getElementById('subtotal');
        const envioElement = document.getElementById('envio');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `$${this.formatearPrecio(subtotal)}`;
        if (envioElement) envioElement.textContent = envio === 0 ? 'Gratis' : `$${this.formatearPrecio(envio)}`;
        if (totalElement) totalElement.textContent = `$${this.formatearPrecio(total)}`;

        // Ocultar/mostrar sección de resumen basado en si hay items
        const resumenSection = document.querySelector('.lg\\:col-span-1');
        if (resumenSection) {
            resumenSection.style.display = carrito.length > 0 ? 'block' : 'none';
        }
    }

    actualizarEstadoBotonPago() {
        const btnPagar = document.getElementById('btn-pagar');
        if (btnPagar) {
            const tieneItems = this.carrito.length > 0;
            btnPagar.disabled = !tieneItems;

            if (!tieneItems) {
                btnPagar.classList.add('opacity-50', 'cursor-not-allowed');
                btnPagar.classList.remove('hover:bg-green-700');
            } else {
                btnPagar.classList.remove('opacity-50', 'cursor-not-allowed');
                btnPagar.classList.add('hover:bg-green-700');
            }
        }
    }

    configurarEventos() {
        // Eventos de cantidad
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cantidad-btn') || e.target.closest('.cantidad-btn')) {
                const btn = e.target.classList.contains('cantidad-btn') ? e.target : e.target.closest('.cantidad-btn');
                const productoId = btn.dataset.productoId;
                const action = btn.dataset.action;

                this.actualizarCantidad(productoId, action);
            }

            // Eliminar item
            if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
                const btn = e.target.classList.contains('eliminar-item') ? e.target : e.target.closest('.eliminar-item');
                const productoId = btn.dataset.productoId;

                this.eliminarItem(productoId);
            }
        });

        // Botón de proceder al pago
        const btnPagar = document.getElementById('btn-pagar');
        if (btnPagar) {
            btnPagar.addEventListener('click', (e) => {
                e.preventDefault();
                this.procederAlPago();
            });
        }

        // Continuar comprando
        const btnContinuar = document.getElementById('btn-continuar-comprando');
        if (btnContinuar) {
            btnContinuar.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
    }

    procederAlPago() {
        // Verificar si el carrito tiene items
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('Tu carrito está vacío', 'error');
            return;
        }

        // Verificar autenticación
        if (!this.authManager.estaAutenticado()) {
            // Guardar la URL de destino para redirigir después del login
            const checkoutPath = '/views/checkout.html'; // Ruta corregida
            localStorage.setItem('redirectAfterLogin', checkoutPath);

            // Mostrar mensaje y redirigir a login
            this.mostrarNotificacion('Debes iniciar sesión para continuar con la compra', 'info');

            setTimeout(() => {
                // Redirigir a login con parámetro de redirección
                window.location.href = `/views/login.html?redirect=${encodeURIComponent(checkoutPath)}`;
            }, 1500);
            return;
        }

        // Si está autenticado, redirigir a checkout
        window.location.href = '/views/checkout.html';
    }

    actualizarCantidad(productoId, action) {
        const productoIndex = this.carrito.findIndex(item => item.id === productoId);

        if (productoIndex === -1) return;

        if (action === 'increment') {
            this.carrito[productoIndex].cantidad += 1;
        } else if (action === 'decrement' && this.carrito[productoIndex].cantidad > 1) {
            this.carrito[productoIndex].cantidad -= 1;
        }

        this.guardarCarrito();
        this.actualizarVistaItem(productoId);
        this.actualizarResumen(this.carrito);
        this.actualizarEstadoBotonPago();
        this.mostrarNotificacion('Cantidad actualizada', 'success');
    }

    eliminarItem(productoId) {
        this.carrito = this.carrito.filter(item => item.id !== productoId);
        this.guardarCarrito();
        this.cargarCarrito();
        this.mostrarNotificacion('Producto eliminado del carrito', 'success');

        // Disparar evento para actualizar contador en otras páginas
        this.dispararEventoCarritoActualizado();
    }

    actualizarVistaItem(productoId) {
        const itemElement = document.querySelector(`[data-producto-id="${productoId}"]`);
        if (!itemElement) return;

        const producto = this.carrito.find(item => item.id === productoId);
        if (!producto) return;

        // Actualizar cantidad
        const cantidadElement = itemElement.querySelector('.cantidad-value');
        if (cantidadElement) {
            cantidadElement.textContent = producto.cantidad;
        }

        // Actualizar subtotal
        const subtotal = producto.precio * producto.cantidad;
        const subtotalElement = itemElement.querySelector('.text-green-600');
        if (subtotalElement) {
            subtotalElement.textContent = `$${this.formatearPrecio(subtotal)}`;
        }

        // Actualizar botones de cantidad
        const decrementBtn = itemElement.querySelector('.decremento');
        if (decrementBtn) {
            decrementBtn.disabled = producto.cantidad <= 1;
        }
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    dispararEventoCarritoActualizado() {
        const event = new CustomEvent('carritoActualizado', {
            detail: { carrito: this.carrito }
        });
        document.dispatchEvent(event);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación simple
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
            tipo === 'success' ? 'bg-green-500 text-white' :
                tipo === 'error' ? 'bg-red-500 text-white' :
                    tipo === 'info' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
        }`;
        toast.textContent = mensaje;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Animación de salida
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatearPrecio(precio) {
        if (!precio) return '0';
        return parseFloat(precio).toLocaleString('es-CO');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const carritoPage = new CarritoPage();
    carritoPage.init();

    // Hacer disponible globalmente para debugging
    window.carritoPage = carritoPage;
});

// Escuchar eventos de actualización del carrito desde otras páginas
document.addEventListener('carritoActualizado', function() {
    if (window.carritoPage) {
        window.carritoPage.cargarCarrito();
    }
});