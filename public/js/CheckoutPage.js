class CheckoutPage {
    constructor() {
        this.authManager = globalThis.authManager;
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    async init() {
        console.log('🔄 Inicializando página de checkout...');

        // Verificar autenticación
        if (!this.authManager.estaAutenticado()) {
            this.mostrarError('Debes iniciar sesión para acceder al checkout');
            setTimeout(() => {
                globalThis.location.href = '/login.html?redirect=/checkout.html';
            }, 2000);
            return;
        }

        // Verificar que el carrito no esté vacío
        if (this.carrito.length === 0) {
            this.mostrarError('Tu carrito está vacío');
            setTimeout(() => {
                globalThis.location.href = '/carrito.html';
            }, 2000);
            return;
        }

        this.cargarResumen();
        this.configurarEventos();
        this.actualizarNavbar();

        console.log('✅ Página de checkout inicializada correctamente');
    }

    cargarResumen() {
        const container = document.getElementById('resumen-checkout');
        const subtotalElement = document.getElementById('subtotal-checkout');
        const envioElement = document.getElementById('envio-checkout');
        const totalElement = document.getElementById('total-checkout');

        if (!container) return;

        // Calcular totales
        const subtotal = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = subtotal > 500000 ? 0 : 15000;
        const total = subtotal + envio;

        // Mostrar productos
        container.innerHTML = this.carrito.map(item => this.crearItemResumen(item)).join('');

        // Actualizar totales
        if (subtotalElement) subtotalElement.textContent = `$${this.formatearPrecio(subtotal)}`;
        if (envioElement) envioElement.textContent = envio === 0 ? 'Gratis' : `$${this.formatearPrecio(envio)}`;
        if (totalElement) totalElement.textContent = `$${this.formatearPrecio(total)}`;
    }

    crearItemResumen(item) {
        const subtotal = item.precio * item.cantidad;

        return `
            <div class="flex items-center justify-between py-3 border-b">
                <div class="flex items-center space-x-3">
                    <img src="${item.imagen || ''}" 
                         alt="${item.nombre}" 
                         class="w-12 h-12 object-cover rounded">
                    <div>
                        <p class="font-medium text-sm">${item.nombre}</p>
                        <p class="text-gray-600 text-xs">Cantidad: ${item.cantidad}</p>
                    </div>
                </div>
                <span class="font-semibold">$${this.formatearPrecio(subtotal)}</span>
            </div>
        `;
    }

    configurarEventos() {
        // Botón confirmar pedido
        const btnConfirmar = document.getElementById('btn-confirmar-pedido');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmarPedido();
            });
        }

        // Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.authManager.logout();
            });
        }
    }

    async confirmarPedido() {
        // Validar formularios
        if (!this.validarFormularios()) {
            this.mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        const btnConfirmar = document.getElementById('btn-confirmar-pedido');
        const textoOriginal = btnConfirmar.innerHTML;

        // Mostrar cargando
        btnConfirmar.innerHTML = `
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            Procesando...
        `;
        btnConfirmar.disabled = true;

        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Éxito
            this.mostrarNotificacion('✅ Pedido confirmado exitosamente', 'success');

            // Limpiar carrito
            localStorage.removeItem('carrito');

            // Redirigir a confirmación
            setTimeout(() => {
                globalThis.location.href = '/confirmacion.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Error confirmando pedido:', error);
            this.mostrarNotificacion('❌ Error al procesar el pedido', 'error');
            btnConfirmar.innerHTML = textoOriginal;
            btnConfirmar.disabled = false;
        }
    }

    validarFormularios() {
        const camposRequeridos = [
            'nombre', 'apellido', 'direccion', 'ciudad',
            'departamento', 'codigo-postal', 'telefono'
        ];

        for (let campo of camposRequeridos) {
            const input = document.getElementById(campo);
            if (!input || !input.value.trim()) {
                input?.focus();
                return false;
            }
        }

        // Validar tarjeta si se seleccionó ese método
        const metodoTarjeta = document.getElementById('tarjeta');
        if (metodoTarjeta?.checked) {
            const camposTarjeta = ['numero-tarjeta', 'fecha-expiracion', 'cvv'];
            for (let campo of camposTarjeta) {
                const input = document.getElementById(campo);
                if (!input || !input.value.trim()) {
                    input?.focus();
                    return false;
                }
            }
        }

        return true;
    }

    actualizarNavbar() {
        const usuario = this.authManager.getUsuario();
        const nombreUsuario = document.getElementById('nombre-usuario-nav');

        if (nombreUsuario && usuario) {
            nombreUsuario.textContent = usuario.nombre;
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold transform transition-transform duration-300 ${
            tipo === 'success' ? 'bg-green-500' :
                tipo === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } translate-x-full`;
        notification.textContent = mensaje;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    mostrarError(mensaje) {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <p class="text-red-500 text-lg font-semibold mb-2">${mensaje}</p>
                    <p class="text-gray-600 mb-4">Serás redirigido automáticamente</p>
                </div>
            `;
        }
    }

    formatearPrecio(precio) {
        if (!precio) return '0';
        return Number.parseFloat(precio).toLocaleString('es-CO');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const checkoutPage = new CheckoutPage();
    checkoutPage.init();
});