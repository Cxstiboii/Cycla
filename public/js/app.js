// js/app.js - VERSIÓN SIMPLIFICADA (Sin autenticación)
const app = {
    async init() {
        console.log(`🔄 Inicializando la aplicación...`);

        try {
            // Inicializar componentes
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
            // Inicializar solo los renders que existen
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
            } else {
                console.warn('⚠️ MultiCategoriaRenderer no disponible para cargar landing page');
            }
        } catch (error) {
            console.error('❌ Error cargando landing page:', error);
        }
    },

    inicializarCarrito() {
        try {
            console.log('🔄 Inicializando carrito...');

            // Inicializar CarritoManager si no existe
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

        // Buscar todos los navbars en la página
        const navs = document.querySelectorAll('nav');

        navs.forEach(nav => {
            this.actualizarNavbarCarritoIndividual(nav);
        });

        this.actualizarMiniCarrito();
    },

    actualizarNavbarCarritoIndividual(nav) {
        // Agregar carrito al navbar desktop
        const navDesktop = nav.querySelector('.hidden.lg\\:flex');
        if (navDesktop) {
            this.actualizarNavbarDesktopCarrito(navDesktop);
        }

        // Agregar carrito al navbar mobile
        const navMobile = nav.querySelector('.lg\\:hidden');
        if (navMobile) {
            this.actualizarNavbarMobileCarrito(navMobile);
        }
    },

    actualizarNavbarDesktopCarrito(navDesktop) {
        const navContainer = navDesktop.querySelector('div:last-child');
        if (!navContainer) {
            console.warn('⚠️ Contenedor del navbar desktop no encontrado para carrito');
            return;
        }

        // Remover carrito existente si existe
        const carritoExistente = navDesktop.querySelector('#carrito-toggle-desktop');
        if (carritoExistente) {
            carritoExistente.closest('.relative').remove();
        }

        // Agregar carrito
        const carritoHtml = `
            <div class="relative">
                <button id="carrito-toggle-desktop" class="flex items-center space-x-1 text-black hover:text-gray-700 transition-colors p-2 relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span id="carrito-badge-desktop" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                </button>
                <div id="mini-carrito-desktop" class="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden">
                    <div class="p-4" id="mini-carrito-content-desktop">
                        <!-- Contenido dinámico del carrito -->
                    </div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', carritoHtml);
        console.log('✅ Carrito agregado al navbar desktop');
    },

    actualizarNavbarMobileCarrito(navMobile) {
        const menuList = navMobile.querySelector('ul');
        if (!menuList) {
            console.warn('⚠️ Menú mobile no encontrado para carrito');
            return;
        }

        // Remover carrito existente si existe
        const carritoExistente = navMobile.querySelector('#carrito-toggle-mobile');
        if (carritoExistente) {
            carritoExistente.closest('li').remove();
        }

        // Agregar carrito mobile
        const carritoHtml = `
            <li class="border-t border-gray-200 pt-4 mt-4">
                <div class="flex items-center justify-between">
                    <span class="text-xl text-black font-medium special-gothic-expanded-one-regular">Carrito</span>
                    <button id="carrito-toggle-mobile" class="flex items-center space-x-1 text-black p-2 relative">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span id="carrito-badge-mobile" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                    </button>
                </div>
                <div id="mini-carrito-mobile" class="mt-2 bg-gray-50 rounded-lg p-3 hidden">
                    <div id="mini-carrito-content-mobile">
                        <!-- Contenido dinámico del carrito mobile -->
                    </div>
                </div>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', carritoHtml);
        console.log('✅ Carrito agregado al navbar mobile');
    },

    actualizarMiniCarrito() {
        console.log('🔄 Actualizando mini carrito...');

        // Actualizar carrito desktop
        this.actualizarMiniCarritoDesktop();

        // Actualizar carrito mobile
        this.actualizarMiniCarritoMobile();
    },

    actualizarMiniCarritoDesktop() {
        const miniCarritoContent = document.getElementById('mini-carrito-content-desktop');
        const carritoBadge = document.getElementById('carrito-badge-desktop');

        if (!miniCarritoContent || !carritoBadge) {
            console.warn('⚠️ Elementos del mini carrito desktop no encontrados');
            return;
        }

        if (!this.carritoManager) {
            miniCarritoContent.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 mb-3">Carrito no disponible</p>
                </div>
            `;
            carritoBadge.classList.add('hidden');
            return;
        }

        const carritoItems = this.carritoManager.getItems();
        console.log('📦 Carrito items:', carritoItems);

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
                                    <p class="text-green-600 font-semibold text-sm">$${this.formatearPrecio(item.precio * item.cantidad)}</p>
                                </div>
                            </div>
                            <button class="text-red-500 hover:text-red-700 transition eliminar-item ml-2" 
                                    data-producto-id="${item.id}"
                                    title="Eliminar del carrito">
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
                        <a href="/carrito.html" class="flex-1 bg-black text-white text-center py-2 rounded hover:bg-gray-800 transition font-semibold">
                            Ver Carrito
                        </a>
                        <a href="/carrito.html" class="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold text-center">
                            Pagar
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
                    <p class="text-gray-400 text-sm mt-2">Agrega algunos productos</p>
                </div>
            `;
        }

        const totalItems = this.carritoManager.getTotalItems();
        console.log('🔢 Total items en carrito:', totalItems);
        carritoBadge.textContent = totalItems;
        carritoBadge.classList.toggle('hidden', totalItems === 0);
    },

    actualizarMiniCarritoMobile() {
        const miniCarritoContent = document.getElementById('mini-carrito-content-mobile');
        const carritoBadge = document.getElementById('carrito-badge-mobile');

        if (!miniCarritoContent || !carritoBadge) {
            console.warn('⚠️ Elementos del mini carrito mobile no encontrados');
            return;
        }

        if (!this.carritoManager) {
            miniCarritoContent.innerHTML = `<p class="text-gray-500 text-sm">Carrito no disponible</p>`;
            carritoBadge.classList.add('hidden');
            return;
        }

        const carritoItems = this.carritoManager.getItems();
        const total = this.carritoManager.getTotal();

        if (carritoItems.length > 0) {
            miniCarritoContent.innerHTML = `
                <div class="space-y-3">
                    ${carritoItems.map(item => `
                        <div class="flex items-center justify-between py-2 border-b">
                            <div class="flex items-center space-x-2 flex-1">
                                <img src="${item.imagen || '/assets/placeholder.jpg'}" 
                                     alt="${item.nombre}" 
                                     class="w-10 h-10 object-cover rounded">
                                <div class="flex-1">
                                    <p class="text-sm font-medium truncate">${item.nombre}</p>
                                    <p class="text-gray-600 text-xs">$${this.formatearPrecio(item.precio)} x ${item.cantidad}</p>
                                </div>
                            </div>
                            <button class="text-red-500 hover:text-red-700 transition eliminar-item" 
                                    data-producto-id="${item.id}">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3 pt-3 border-t">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-semibold">Total:</span>
                        <span class="font-bold">$${this.formatearPrecio(total)}</span>
                    </div>
                    <a href="/carrito.html" class="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold text-center">
                        Ver Carrito
                    </a>
                </div>
            `;
        } else {
            miniCarritoContent.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 text-sm">Tu carrito está vacío</p>
                </div>
            `;
        }

        const totalItems = this.carritoManager.getTotalItems();
        carritoBadge.textContent = totalItems;
        carritoBadge.classList.toggle('hidden', totalItems === 0);
    },

    inicializarEventosCarrito() {
        console.log('🔄 Inicializando eventos del carrito...');

        // Cerrar mini carrito desktop al hacer clic fuera
        document.addEventListener('click', (e) => {
            const miniCarritoDesktop = document.getElementById('mini-carrito-desktop');
            const carritoToggleDesktop = document.getElementById('carrito-toggle-desktop');

            if (miniCarritoDesktop && carritoToggleDesktop &&
                !miniCarritoDesktop.contains(e.target) &&
                !carritoToggleDesktop.contains(e.target)) {
                miniCarritoDesktop.classList.add('hidden');
            }
        });

        // Toggle mini carrito desktop
        document.addEventListener('click', (e) => {
            if (e.target.id === 'carrito-toggle-desktop' || e.target.closest('#carrito-toggle-desktop')) {
                this.toggleMiniCarritoDesktop();
            }
        });

        // Toggle mini carrito mobile
        document.addEventListener('click', (e) => {
            if (e.target.id === 'carrito-toggle-mobile' || e.target.closest('#carrito-toggle-mobile')) {
                this.toggleMiniCarritoMobile();
            }
        });
    },

    inicializarEventosGlobales() {
        console.log('🔄 Inicializando eventos globales...');

        // Delegación de eventos para botones dinámicos
        document.addEventListener('click', async (e) => {
            // Botones de agregar al carrito
            if (e.target.classList.contains('agregar-carrito-btn') ||
                e.target.closest('.agregar-carrito-btn') ||
                e.target.id === 'btn-agregar-carrito' ||
                e.target.closest('#btn-agregar-carrito') ||
                e.target.classList.contains('comprar-btn') ||
                e.target.closest('.comprar-btn')) {

                await this.manejarAgregarAlCarrito(e);
            }

            // Eliminar item del carrito
            if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
                const btn = e.target.classList.contains('eliminar-item') ? e.target : e.target.closest('.eliminar-item');
                this.eliminarDelCarrito(btn.dataset.productoId);
            }

            // Botones de favoritos
            if (e.target.classList.contains('favorito-btn') || e.target.closest('.favorito-btn')) {
                const btn = e.target.classList.contains('favorito-btn') ? e.target : e.target.closest('.favorito-btn');
                this.toggleFavorito(btn.dataset.productoId);
            }
        });

        // Cerrar mini carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarMiniCarrito();
            }
        });
    },

    async manejarAgregarAlCarrito(e) {
        e.preventDefault();

        let btn = e.target;

        // Encontrar el botón correcto
        if (!btn.classList.contains('agregar-carrito-btn') &&
            !btn.classList.contains('comprar-btn') &&
            btn.id !== 'btn-agregar-carrito') {
            btn = e.target.closest('.agregar-carrito-btn') ||
                e.target.closest('.comprar-btn') ||
                e.target.closest('#btn-agregar-carrito');
        }

        if (!btn) return;

        // Obtener datos del producto
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
            // Asegurarse de que CarritoManager esté inicializado
            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
            }

            if (!this.carritoManager) {
                this.mostrarNotificacion('❌ Error: Carrito no disponible', 'error');
                return;
            }

            console.log(`➕ Agregando producto ${productoId} al carrito`);

            const result = this.carritoManager.agregarProducto(
                productoId,
                1,
                {
                    nombre: productoNombre,
                    precio: productoPrecio
                }
            );

            console.log('📋 Resultado de agregar producto:', result);

            if (result.success) {
                this.actualizarMiniCarrito();
                this.mostrarNotificacion(`✅ "${productoNombre}" añadido al carrito`, 'success');

                // Disparar evento personalizado para que otras páginas se actualicen
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
                this.actualizarMiniCarrito();
                this.mostrarNotificacion('✅ Producto eliminado del carrito', 'success');

                // Disparar evento personalizado
                document.dispatchEvent(new CustomEvent('carritoActualizado', {
                    detail: { carrito: this.carritoManager.carrito }
                }));

                // Cerrar el menú mobile después de eliminar
                this.cerrarMenuMobile();
            } else {
                this.mostrarNotificacion('❌ Error eliminando producto', 'error');
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

    toggleMiniCarritoMobile() {
        const miniCarrito = document.getElementById('mini-carrito-mobile');
        if (miniCarrito) {
            miniCarrito.classList.toggle('hidden');

            if (!miniCarrito.classList.contains('hidden')) {
                this.actualizarMiniCarritoMobile();
            }
        }
    },

    cerrarMiniCarrito() {
        const miniCarritoDesktop = document.getElementById('mini-carrito-desktop');
        const miniCarritoMobile = document.getElementById('mini-carrito-mobile');

        if (miniCarritoDesktop) miniCarritoDesktop.classList.add('hidden');
        if (miniCarritoMobile) miniCarritoMobile.classList.add('hidden');
    },

    cerrarMenuMobile() {
        const menuCheckbox = document.getElementById('menu-checkbox');
        if (menuCheckbox) {
            menuCheckbox.checked = false;
        }
    },

    toggleFavorito(productoId) {
        console.log(`❤️ Toggle favorito producto: ${productoId}`);
        this.mostrarNotificacion('⭐ Función de favoritos próximamente', 'info');
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
        notificacion.className = `fixed top-4 right-4 z-50 text-white px-6 py-3 rounded-lg shadow-lg border ${colores[tipo] || colores.info} transition-all duration-300 transform translate-x-0 opacity-100`;
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

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar la aplicación
    app.init();

    // Exponer app globalmente para acceso desde otras páginas
    window.app = app;
});

// Manejar cambios en el carrito
document.addEventListener('carritoActualizado', function (e) {
    console.log('🔄 Carrito actualizado, refrescando mini carrito');
    if (window.app) {
        window.app.actualizarMiniCarrito();
    }
});