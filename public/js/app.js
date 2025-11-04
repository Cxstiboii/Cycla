// js/app.js - VERSIÓN CORREGIDA
const app = {
    async init() {
        console.log(`🔄 Inicializando la aplicación...`);

        try {
            this.inicializarRenders();
            this.inicializarCarrito();

            // Solo cargar landing page si estamos en la página principal
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                await this.cargarLandingPage();
            }

            this.inicializarEventosGlobales();
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando app:', error);
        }
    },

    inicializarRenders() {
        try {
            if (typeof ProductoRenderer !== 'undefined') {
                this.productoRenderer = new ProductoRenderer();
                console.log('✅ ProductoRenderer inicializado');
            }

            if (typeof MultiCategoriaRenderer !== 'undefined') {
                this.multiCategoriaRenderer = new MultiCategoriaRenderer();
                console.log('✅ MultiCategoriaRenderer inicializado');
            }
        } catch (error) {
            console.error('❌ Error inicializando renders:', error);
        }
    },

    async cargarLandingPage() {
        try {
            console.log('🔄 Cargando landing page...');
            if (this.multiCategoriaRenderer && typeof this.multiCategoriaRenderer.cargarTodasCategorias === 'function') {
                await this.multiCategoriaRenderer.cargarTodasCategorias(4);
                console.log('✅ Landing page cargada correctamente');
            }
        } catch (error) {
            console.error('❌ Error cargando landing page:', error);
        }
    },

    inicializarCarrito() {
        try {
            console.log('🔄 Inicializando carrito...');

            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
                this.carritoManager.inicializar();
            }

            this.actualizarNavbarCarrito();
            this.inicializarEventosCarrito();
            console.log('✅ Carrito inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando carrito:', error);
        }
    },

    actualizarNavbarCarrito() {
        console.log('🔄 Actualizando navbar carrito...');

        const navs = document.querySelectorAll('nav');
        navs.forEach(nav => {
            this.actualizarNavbarCarritoIndividual(nav);
        });

        this.actualizarMiniCarrito();
    },

    actualizarNavbarCarritoIndividual(nav) {
        const navDesktop = nav.querySelector('.hidden.lg\\:flex');
        if (navDesktop) {
            this.actualizarNavbarDesktopCarrito(navDesktop);
        }

        const navMobile = nav.querySelector('.lg\\:hidden');
        if (navMobile) {
            this.actualizarNavbarMobileCarrito(navMobile);
        }
    },

    actualizarNavbarDesktopCarrito(navDesktop) {
        const navContainer = navDesktop.querySelector('div:last-child');
        if (!navContainer) return;

        const carritoExistente = navDesktop.querySelector('#carrito-toggle-desktop');
        if (carritoExistente) {
            carritoExistente.closest('.relative').remove();
        }

        const carritoHtml = `
            <div class="relative">
                <button id="carrito-toggle-desktop" class="flex items-center space-x-1 text-black hover:text-gray-700 transition-colors p-2 relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span id="carrito-badge-desktop" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                </button>
                <div id="mini-carrito-desktop" class="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden">
                    <div class="p-4" id="mini-carrito-content-desktop"></div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', carritoHtml);
    },

    actualizarNavbarMobileCarrito(navMobile) {
        const menuList = navMobile.querySelector('ul');
        if (!menuList) return;

        const carritoExistente = navMobile.querySelector('#carrito-badge-mobile');
        if (carritoExistente) {
            // Solo actualizar el badge si ya existe
            const totalItems = this.carritoManager ? this.carritoManager.getTotalItems() : 0;
            carritoExistente.textContent = totalItems;
            carritoExistente.classList.toggle('hidden', totalItems === 0);
            return;
        }

        // Si no existe, agregar el enlace de carrito con badge
        const carritoLink = menuList.querySelector('a[href*="carrito"]');
        if (carritoLink && !carritoLink.querySelector('#carrito-badge-mobile')) {
            carritoLink.classList.add('relative');
            carritoLink.innerHTML += `<span id="carrito-badge-mobile" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>`;
        }
    },

    // ============= ACTUALIZAR MINI CARRITO CORREGIDO =============
    actualizarMiniCarrito() {
        this.actualizarMiniCarritoDesktop();
        this.actualizarMiniCarritoMobile();
    },

    actualizarMiniCarritoDesktop() {
        const miniCarritoContent = document.getElementById('mini-carrito-content-desktop');
        const carritoBadge = document.getElementById('carrito-badge-desktop');

        if (!miniCarritoContent || !carritoBadge || !this.carritoManager) return;

        const carritoItems = this.carritoManager.getItems();
        const totalItems = this.carritoManager.getTotalItems();

        // Actualizar badge
        carritoBadge.textContent = totalItems;
        carritoBadge.classList.toggle('hidden', totalItems === 0);

        if (carritoItems.length > 0) {
            const total = this.carritoManager.getTotal();
            miniCarritoContent.innerHTML = `
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">Tu Carrito</h3>
                <div class="max-h-64 overflow-y-auto">
                    ${carritoItems.map(item => `
                        <div class="flex items-center justify-between py-3 border-b">
                            <div class="flex items-center space-x-3 flex-1">
                                <img src="${item.imagen || '/assets/placeholder.jpg'}" 
                                     alt="${item.nombre}" 
                                     class="w-12 h-12 object-cover rounded">
                                <div class="flex-1">
                                    <p class="text-sm font-medium truncate">${item.nombre}</p>
                                    <p class="text-gray-600 text-sm">$${this.formatearPrecio(item.precio)} x ${item.cantidad}</p>
                                </div>
                            </div>
                            <button class="text-red-500 hover:text-red-700 transition eliminar-item ml-2" 
                                    data-producto-id="${item.id}">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4 pt-4 border-t">
                    <div class="flex justify-between items-center mb-4">
                        <span class="font-semibold text-lg">Total:</span>
                        <span class="font-bold text-xl">$${this.formatearPrecio(total)}</span>
                    </div>
                    <div class="flex space-x-2">
                        <a href="/carrito" class="flex-1 bg-black text-white text-center py-2 rounded hover:bg-gray-800 transition font-semibold">
                            Ver Carrito
                        </a>
                    </div>
                </div>
            `;
        } else {
            miniCarritoContent.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="text-gray-500">Tu carrito está vacío</p>
                </div>
            `;
        }
    },

    actualizarMiniCarritoMobile() {
        const carritoBadge = document.getElementById('carrito-badge-mobile');
        if (!carritoBadge || !this.carritoManager) return;

        const totalItems = this.carritoManager.getTotalItems();
        carritoBadge.textContent = totalItems;
        carritoBadge.classList.toggle('hidden', totalItems === 0);
    },

    inicializarEventosCarrito() {
        document.addEventListener('click', (e) => {
            const miniCarritoDesktop = document.getElementById('mini-carrito-desktop');
            const carritoToggleDesktop = document.getElementById('carrito-toggle-desktop');

            if (miniCarritoDesktop && carritoToggleDesktop &&
                !miniCarritoDesktop.contains(e.target) &&
                !carritoToggleDesktop.contains(e.target)) {
                miniCarritoDesktop.classList.add('hidden');
            }

            if (e.target.id === 'carrito-toggle-desktop' || e.target.closest('#carrito-toggle-desktop')) {
                this.toggleMiniCarritoDesktop();
            }
        });
    },

    inicializarEventosGlobales() {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('agregar-carrito-btn') ||
                e.target.closest('.agregar-carrito-btn') ||
                e.target.id === 'btn-agregar-carrito' ||
                e.target.closest('#btn-agregar-carrito') ||
                e.target.classList.contains('comprar-btn') ||
                e.target.closest('.comprar-btn')) {
                await this.manejarAgregarAlCarrito(e);
            }

            if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
                const btn = e.target.classList.contains('eliminar-item') ? e.target : e.target.closest('.eliminar-item');
                this.eliminarDelCarrito(btn.dataset.productoId);
            }
        });
    },

    async manejarAgregarAlCarrito(e) {
        e.preventDefault();

        let btn = e.target;
        if (!btn.classList.contains('agregar-carrito-btn') &&
            !btn.classList.contains('comprar-btn') &&
            btn.id !== 'btn-agregar-carrito') {
            btn = e.target.closest('.agregar-carrito-btn') ||
                e.target.closest('.comprar-btn') ||
                e.target.closest('#btn-agregar-carrito');
        }

        if (!btn) return;

        const productoId = btn.dataset.productoId ||
            btn.closest('[data-producto-id]')?.dataset.productoId;

        const productoNombre = btn.dataset.productoNombre ||
            btn.closest('[data-producto-nombre]')?.dataset.productoNombre ||
            'Producto';

        const productoPrecio = btn.dataset.productoPrecio ||
            btn.closest('[data-producto-precio]')?.dataset.productoPrecio;

        if (!productoId) {
            console.error('❌ No se pudo obtener el ID del producto');
            this.mostrarNotificacion('❌ Error: No se pudo identificar el producto', 'error');
            return;
        }

        await this.comprarProducto(productoId, productoNombre, parseFloat(productoPrecio || 0));
    },

    async comprarProducto(productoId, productoNombre, productoPrecio) {
        console.log(`🛒 Intentando agregar producto: ${productoNombre} (ID: ${productoId})`);

        try {
            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
            }

            if (!this.carritoManager) {
                this.mostrarNotificacion('❌ Error: Carrito no disponible', 'error');
                return;
            }

            const result = this.carritoManager.agregarProducto(
                productoId,
                1,
                {
                    nombre: productoNombre,
                    precio: productoPrecio
                }
            );

            if (result.success) {
                // ============= ACTUALIZACIÓN INSTANTÁNEA =============
                this.actualizarMiniCarrito();
                this.mostrarNotificacion(`✅ "${productoNombre}" añadido al carrito`, 'success');

                // Disparar evento para otras páginas
                document.dispatchEvent(new CustomEvent('carritoActualizado', {
                    detail: { carrito: this.carritoManager.carrito }
                }));
            } else {
                this.mostrarNotificacion(`❌ Error: ${result.error || 'No se pudo agregar al carrito'}`, 'error');
            }
        } catch (error) {
            console.error('Error en comprarProducto:', error);
            this.mostrarNotificacion(`❌ Error agregando "${productoNombre}" al carrito`, 'error');
        }
    },

    eliminarDelCarrito(productoId) {
        try {
            if (!this.carritoManager) {
                this.mostrarNotificacion('❌ Carrito no disponible', 'error');
                return;
            }

            const result = this.carritoManager.eliminarProducto(productoId);
            if (result.success) {
                // ============= ACTUALIZACIÓN INSTANTÁNEA =============
                this.actualizarMiniCarrito();
                this.mostrarNotificacion('✅ Producto eliminado del carrito', 'success');

                document.dispatchEvent(new CustomEvent('carritoActualizado', {
                    detail: { carrito: this.carritoManager.carrito }
                }));
            }
        } catch (error) {
            console.error('Error eliminando del carrito:', error);
            this.mostrarNotificacion('❌ Error eliminando producto', 'error');
        }
    },

    toggleMiniCarritoDesktop() {
        const miniCarrito = document.getElementById('mini-carrito-desktop');
        if (miniCarrito) {
            miniCarrito.classList.toggle('hidden');
            if (!miniCarrito.classList.contains('hidden')) {
                this.actualizarMiniCarritoDesktop();
            }
        }
    },

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacionExistente = document.getElementById('global-notification');
        if (notificacionExistente) {
            notificacionExistente.remove();
        }

        const colores = {
            success: 'bg-green-500 border-green-600',
            error: 'bg-red-500 border-red-600',
            warning: 'bg-yellow-500 border-yellow-600',
            info: 'bg-blue-500 border-blue-600'
        };

        const notificacion = document.createElement('div');
        notificacion.id = 'global-notification';
        notificacion.className = `fixed top-4 right-4 z-50 text-white px-6 py-3 rounded-lg shadow-lg border ${colores[tipo] || colores.info} transition-all duration-300`;
        notificacion.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="font-semibold">${mensaje}</span>
                <button class="text-white hover:text-gray-200 ml-2" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.remove();
            }
        }, 4000);
    },

    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(precio);
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    app.init();
    window.app = app;
});

// ============= LISTENER PARA ACTUALIZACIONES DEL CARRITO =============
document.addEventListener('carritoActualizado', function (e) {
    console.log('🔄 Carrito actualizado, refrescando mini carrito');
    if (window.app && window.app.actualizarMiniCarrito) {
        window.app.actualizarMiniCarrito();
    }
});