class CarritoPage {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.carritoManager = new CarritoManager(this.apiBase);
    }

    async init() {
        console.log('🔄 Inicializando página del carrito...');

        try {
            // Inicializar carrito
            await this.carritoManager.inicializar();

            // Cargar items del carrito
            await this.cargarCarrito();

            // Configurar eventos
            this.configurarEventos();

            console.log('✅ Página del carrito inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando página del carrito:', error);
            this.mostrarError('Error al cargar el carrito');
        }
    }

    async cargarCarrito() {
        try {
            const carrito = this.carritoManager.carrito;
            this.mostrarItemsCarrito(carrito);
            this.actualizarResumen(carrito);

        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            this.mostrarError('No se pudo cargar el carrito');
        }
    }

    mostrarItemsCarrito(carrito) {
        const container = document.getElementById('carrito-items');

        if (!container) return;

        if (!carrito.items || carrito.items.length === 0) {
            container.innerHTML = this.crearCarritoVacio();
            return;
        }

        container.innerHTML = carrito.items.map(item => this.crearItemCarrito(item)).join('');
    }

    crearCarritoVacio() {
        return `
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🛒</div>
                <p class="text-gray-500 text-lg font-semibold mb-2">Tu carrito está vacío</p>
                <p class="text-gray-400 mb-6">Agrega algunos productos para continuar</p>
                <a href="/productos?categoria=1" 
                   class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition font-semibold">
                    Explorar Productos
                </a>
            </div>
        `;
    }

    crearItemCarrito(item) {
        const subtotal = item.precio * item.cantidad;

        return `
            <div class="flex items-center space-x-4 py-4 border-b border-gray-200" data-producto-id="${item.producto_id}">
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
                            data-producto-id="${item.producto_id}"
                            data-action="decrement">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                    </button>
                    <span class="w-12 text-center font-semibold">${item.cantidad}</span>
                    <button class="cantidad-btn incremento w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                            data-producto-id="${item.producto_id}"
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
                            data-producto-id="${item.producto_id}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    actualizarResumen(carrito) {
        const subtotal = carrito.total || 0;
        const envio = subtotal > 500000 ? 0 : 15000; // Envío gratis sobre $500,000
        const total = subtotal + envio;

        document.getElementById('subtotal').textContent = `$${this.formatearPrecio(subtotal)}`;
        document.getElementById('envio').textContent = envio === 0 ? 'Gratis' : `$${this.formatearPrecio(envio)}`;
        document.getElementById('total').textContent = `$${this.formatearPrecio(total)}`;

        // Habilitar botón de pago si hay items
        const btnPagar = document.getElementById('btn-pagar');
        if (btnPagar) {
            btnPagar.disabled = !carrito.items || carrito.items.length === 0;
        }
    }

    configurarEventos() {
        // Eventos de cantidad
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('cantidad-btn') || e.target.closest('.cantidad-btn')) {
                const btn = e.target.classList.contains('cantidad-btn') ? e.target : e.target.closest('.cantidad-btn');
                const productoId = btn.dataset.productoId;
                const action = btn.dataset.action;

                await this.actualizarCantidad(productoId, action);
            }

            // Eliminar item
            if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
                const btn = e.target.classList.contains('eliminar-item') ? e.target : e.target.closest('.eliminar-item');
                const productoId = btn.dataset.productoId;

                await this.eliminarItem(productoId);
            }

            // Proceder al pago
            if (e.target.id === 'btn-pagar') {
                this.procederAlPago();
            }
        });
    }

    async actualizarCantidad(productoId, action) {
        try {
            const cantidadActual = this.carritoManager.getCantidadProducto(productoId);
            let nuevaCantidad = cantidadActual;

            if (action === 'increment') {
                nuevaCantidad = cantidadActual + 1;
            } else if (action === 'decrement' && cantidadActual > 1) {
                nuevaCantidad = cantidadActual - 1;
            }

            if (nuevaCantidad !== cantidadActual) {
                const result = await this.carritoManager.actualizarCantidad(productoId, nuevaCantidad);

                if (result.success) {
                    await this.cargarCarrito();
                    this.mostrarNotificacion('Cantidad actualizada', 'success');
                }
            }

        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            this.mostrarNotificacion('Error actualizando cantidad', 'error');
        }
    }

    async eliminarItem(productoId) {
        try {
            const result = await this.carritoManager.eliminarProducto(productoId);

            if (result.success) {
                await this.cargarCarrito();
                this.mostrarNotificacion('Producto eliminado del carrito', 'success');
            }

        } catch (error) {
            console.error('❌ Error eliminando item:', error);
            this.mostrarNotificacion('Error eliminando producto', 'error');
        }
    }

    procederAlPago() {
        // Por ahora solo muestra un mensaje
        this.mostrarNotificacion('🚧 Función de pago en desarrollo. Próximamente podrás completar tu compra aquí.', 'info');

        // Aquí integrarás el sistema de autenticación después
        // window.location.href = '/checkout';
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        if (window.app && typeof window.app.mostrarNotificacion === 'function') {
            window.app.mostrarNotificacion(mensaje, tipo);
        } else {
            // Notificación simple
            alert(mensaje);
        }
    }

    mostrarError(mensaje) {
        const container = document.getElementById('carrito-items');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <p class="text-red-500 text-lg font-semibold mb-2">${mensaje}</p>
                    <button onclick="window.location.reload()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition font-semibold">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
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


// Al final del archivo CarritoPage.js, agregar:
document.addEventListener('carritoActualizado', function(e) {
    console.log('🔄 Carrito actualizado en CarritoPage');
    carritoPage.cargarCarrito();
});