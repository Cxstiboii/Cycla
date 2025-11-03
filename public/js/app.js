const app = {
    async init(){
        console.log(`🔄 Inicializando la aplicación...`);

        try {
            // Inicializar AuthManager primero
            if (!window.authManager) {
                console.error('❌ AuthManager no está disponible');
                return;
            }

            // Inicializar componentes en orden
            await this.inicializarAuth();
            this.inicializarRenders();
            await this.inicializarCarrito();

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

    async inicializarAuth() {
        try {
            console.log('🔐 Inicializando autenticación...');

            const token = localStorage.getItem('authToken');
            if (token) {
                const valido = await window.authManager.verificarAutenticacion();
                if (valido) {
                    console.log('✅ Usuario autenticado:', window.authManager.getUsuario().email);
                    this.actualizarNavbarAutenticado();
                } else {
                    console.log('⚠️ Token inválido, limpiando sesión');
                    window.authManager.logout();
                }
            } else {
                console.log('ℹ️ No hay usuario autenticado');
                this.actualizarNavbarNoAutenticado();
            }
        } catch (error) {
            console.error('❌ Error inicializando auth:', error);
        }
    },

    inicializarRenders(){
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

            // Inicializar CarritoManager si no existe
            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
                console.log('✅ CarritoManager inicializado');
            }

        } catch (error) {
            console.error('❌ Error inicializando renders:', error);
        }
    },

    async cargarLandingPage(){
        try{
            console.log('🔄 Cargando landing page...');
            if (this.multiCategoriaRenderer && typeof this.multiCategoriaRenderer.cargarTodasCategorias === 'function') {
                await this.multiCategoriaRenderer.cargarTodasCategorias(4);
                console.log('✅ Landing page cargada correctamente');
            } else {
                console.warn('⚠️ MultiCategoriaRenderer no disponible para cargar landing page');
            }
        }catch(error){
            console.error('❌ Error cargando landing page:', error);
        }
    },

    async inicializarCarrito() {
        try {
            console.log('🔄 Inicializando carrito...');

            // Asegurarse de que CarritoManager esté inicializado
            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
            }

            if (!this.carritoManager) {
                console.warn('⚠️ CarritoManager no disponible');
                return;
            }

            // Solo cargar carrito si el usuario está autenticado
            if (window.authManager.estaAutenticado()) {
                const result = await this.carritoManager.obtenerCarrito();

                if (result.success) {
                    console.log('✅ Carrito cargado correctamente');
                } else if (result.requiereLogin) {
                    console.log('⚠️ Carrito requiere login');
                    this.actualizarNavbarNoAutenticado();
                } else {
                    console.warn('⚠️ Carrito no se pudo cargar:', result.error);
                }
            } else {
                console.log('ℹ️ Usuario no autenticado, carrito no disponible');
            }

            this.actualizarNavbarCarrito();
            this.inicializarEventosCarrito();
            console.log('✅ Carrito inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando carrito:', error);
        }
    },

    actualizarNavbarAutenticado() {
        console.log('🔄 Actualizando navbar para usuario autenticado');

        // Buscar todos los navbars en la página
        const navs = document.querySelectorAll('nav');

        navs.forEach(nav => {
            this.actualizarNavbarIndividual(nav, true);
        });

        // Agregar carrito al navbar
        this.actualizarNavbarCarrito();
    },

    actualizarNavbarNoAutenticado() {
        console.log('🔄 Actualizando navbar para usuario no autenticado');

        // Buscar todos los navbars en la página
        const navs = document.querySelectorAll('nav');

        navs.forEach(nav => {
            this.actualizarNavbarIndividual(nav, false);
        });

        // Actualizar carrito (mostrar vacío)
        this.actualizarNavbarCarrito();
    },

    actualizarNavbarIndividual(nav, autenticado) {
        // Buscar navbar desktop
        const navDesktop = nav.querySelector('.hidden.lg\\:flex');
        if (navDesktop) {
            if (autenticado) {
                this.actualizarNavbarDesktopAutenticado(navDesktop);
            } else {
                this.actualizarNavbarDesktopNoAutenticado(navDesktop);
            }
        }

        // Buscar navbar mobile
        const navMobile = nav.querySelector('.lg\\:hidden');
        if (navMobile) {
            if (autenticado) {
                this.actualizarNavbarMobileAutenticado(navMobile);
            } else {
                this.actualizarNavbarMobileNoAutenticado(navMobile);
            }
        }
    },

    actualizarNavbarDesktopAutenticado(navDesktop) {
        const navContainer = navDesktop.querySelector('div:last-child');
        if (!navContainer) {
            console.warn('⚠️ Contenedor del navbar desktop no encontrado');
            return;
        }

        const usuario = window.authManager.getUsuario();

        // Remover enlaces de login/register si existen
        const loginLinks = navDesktop.querySelectorAll('a[href="/login"], a[href*="login"]');
        const registerLinks = navDesktop.querySelectorAll('a[href="/register"], a[href*="register"]');

        loginLinks.forEach(link => link.remove());
        registerLinks.forEach(link => link.remove());

        // Remover menú de usuario existente si existe
        const menuUsuarioExistente = navDesktop.querySelector('#menu-usuario-desktop');
        if (menuUsuarioExistente) {
            menuUsuarioExistente.remove();
        }

        // Agregar menú de usuario
        const usuarioHtml = `
            <div class="relative group" id="menu-usuario-desktop">
                <button class="flex items-center space-x-2 text-black font-medium special-gothic-expanded-one-600 py-2">
                    <span>${usuario.nombre}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden group-hover:block">
                    <div class="py-2">
                        <a href="/perfil" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mi Perfil</a>
                        <a href="/carrito" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mi Carrito</a>
                        ${usuario.esAdmin ?
            '<a href="/admin" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Administración</a>' :
            ''
        }
                        <div class="border-t border-gray-200 mt-2 pt-2">
                            <button class="btn-logout-nav block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', usuarioHtml);

        // Agregar evento de logout
        const logoutBtn = navDesktop.querySelector('.btn-logout-nav');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.authManager.logout();
            });
        }
    },

    actualizarNavbarMobileAutenticado(navMobile) {
        const menuList = navMobile.querySelector('ul');
        if (!menuList) {
            console.warn('⚠️ Menú mobile no encontrado');
            return;
        }

        const usuario = window.authManager.getUsuario();

        // Remover enlaces de login/register si existen
        const loginLinks = menuList.querySelectorAll('a[href="/login"], a[href*="login"]');
        const registerLinks = menuList.querySelectorAll('a[href="/register"], a[href*="register"]');
        loginLinks.forEach(link => link.remove());
        registerLinks.forEach(link => link.remove());

        // Remover opciones de usuario existentes
        const opcionesUsuario = menuList.querySelectorAll('a[href="/perfil"], a[href="/carrito"], a[href="/admin"], .btn-logout-mobile');
        opcionesUsuario.forEach(opcion => opcion.closest('li')?.remove());

        // Agregar opciones de usuario
        const usuarioHtml = `
            <li><a href="/perfil" class="block text-xl text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular">Mi Perfil</a></li>
            <li><a href="/carrito" class="block text-xl text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular">Mi Carrito</a></li>
            ${usuario.esAdmin ?
            '<li><a href="/admin" class="block text-xl text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular">Administración</a></li>' :
            ''
        }
            <li><button class="btn-logout-mobile block text-xl text-red-600 font-medium hover:text-red-800 special-gothic-expanded-one-regular w-full text-left">Cerrar Sesión</button></li>
        `;
        menuList.insertAdjacentHTML('beforeend', usuarioHtml);

        // Agregar evento de logout mobile
        const logoutBtn = menuList.querySelector('.btn-logout-mobile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.authManager.logout();
            });
        }
    },

    actualizarNavbarDesktopNoAutenticado(navDesktop) {
        const navContainer = navDesktop.querySelector('div:last-child');
        if (!navContainer) {
            console.warn('⚠️ Contenedor del navbar desktop no encontrado');
            return;
        }

        // Remover menú de usuario si existe
        const menuUsuario = navDesktop.querySelector('#menu-usuario-desktop');
        if (menuUsuario) {
            menuUsuario.remove();
        }

        // Verificar si ya existen los enlaces de login/register
        const existingLogin = navDesktop.querySelector('a[href="/login"], a[href*="login"]');
        const existingRegister = navDesktop.querySelector('a[href="/register"], a[href*="register"]');

        if (!existingLogin && !existingRegister) {
            const authHtml = `
                <a href="/login" class="text-black font-medium special-gothic-expanded-one-600 relative inline-block py-2 transition-all duration-300 hover:text-shadow-lg after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">Iniciar Sesión</a>
                <a href="/register" class="text-black font-medium special-gothic-expanded-one-600 relative inline-block py-2 transition-all duration-300 hover:text-shadow-lg after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">Registrarse</a>
            `;
            navContainer.insertAdjacentHTML('beforeend', authHtml);
        }
    },

    actualizarNavbarMobileNoAutenticado(navMobile) {
        const menuList = navMobile.querySelector('ul');
        if (!menuList) {
            console.warn('⚠️ Menú mobile no encontrado');
            return;
        }

        // Remover opciones de usuario si existen
        const opcionesUsuario = menuList.querySelectorAll('a[href="/perfil"], a[href="/carrito"], a[href="/admin"], .btn-logout-mobile');
        opcionesUsuario.forEach(opcion => opcion.closest('li')?.remove());

        // Verificar si ya existen los enlaces de login/register
        const existingLogin = menuList.querySelector('a[href="/login"], a[href*="login"]');
        const existingRegister = menuList.querySelector('a[href="/register"], a[href*="register"]');

        if (!existingLogin && !existingRegister) {
            const authHtml = `
                <li><a href="/login" class="block text-xl text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular">Iniciar sesión</a></li>
                <li><a href="/register" class="block text-xl text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular">Registrarse</a></li>
            `;
            menuList.insertAdjacentHTML('beforeend', authHtml);
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

        // Solo agregar el carrito si no existe
        if (!navDesktop.querySelector('#carrito-toggle-desktop')) {
            const carritoHtml = `
                <div class="relative">
                    <button id="carrito-toggle-desktop" class="flex items-center space-x-1 text-black hover:text-gray-700 transition-colors p-2">
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
        }
    },

    actualizarNavbarMobileCarrito(navMobile) {
        const menuList = navMobile.querySelector('ul');
        if (!menuList) {
            console.warn('⚠️ Menú mobile no encontrado para carrito');
            return;
        }

        // Solo agregar el carrito si no existe en mobile
        if (!navMobile.querySelector('#carrito-toggle-mobile')) {
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
        }
    },

    actualizarMiniCarrito() {
        // Actualizar carrito desktop
        this.actualizarMiniCarritoDesktop();

        // Actualizar carrito mobile
        this.actualizarMiniCarritoMobile();
    },

    actualizarMiniCarritoDesktop() {
        const miniCarritoContent = document.getElementById('mini-carrito-content-desktop');
        const carritoBadge = document.getElementById('carrito-badge-desktop');

        if (!this.carritoManager) {
            if (miniCarritoContent) {
                miniCarritoContent.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 mb-3">Carrito no disponible</p>
                    </div>
                `;
            }
            if (carritoBadge) {
                carritoBadge.classList.add('hidden');
            }
            return;
        }

        // Verificar si el usuario está autenticado
        if (!window.authManager.estaAutenticado()) {
            if (miniCarritoContent) {
                miniCarritoContent.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 mb-3">Inicia sesión para ver tu carrito</p>
                        <a href="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                            Iniciar Sesión
                        </a>
                    </div>
                `;
            }
            if (carritoBadge) {
                carritoBadge.classList.add('hidden');
            }
            return;
        }

        if (miniCarritoContent) {
            if (this.carritoManager.carrito.items && this.carritoManager.carrito.items.length > 0) {
                miniCarritoContent.innerHTML = `
                    <h3 class="text-lg font-semibold mb-4 border-b pb-2">Tu Carrito</h3>
                    <div class="max-h-64 overflow-y-auto">
                        ${this.carritoManager.carrito.items.map(item => `
                            <div class="flex items-center justify-between py-3 border-b">
                                <div class="flex items-center space-x-3 flex-1">
                                    <img src="${item.imagen || '/assets/placeholder.jpg'}" 
                                         alt="${item.nombre}" 
                                         class="w-12 h-12 object-cover rounded">
                                    <div class="flex-1">
                                        <p class="text-sm font-medium truncate">${item.nombre}</p>
                                        <p class="text-gray-600 text-sm">$${this.formatearPrecio(item.precio)} x ${item.cantidad}</p>
                                        <p class="text-green-600 font-semibold text-sm">$${this.formatearPrecio(item.subtotal)}</p>
                                    </div>
                                </div>
                                <button class="text-red-500 hover:text-red-700 transition eliminar-item ml-2" 
                                        data-producto-id="${item.producto_id}"
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
                            <span class="font-bold text-xl">$${this.formatearPrecio(this.carritoManager.carrito.total || 0)}</span>
                        </div>
                        <div class="flex space-x-2">
                            <a href="/carrito" class="flex-1 bg-black text-white text-center py-2 rounded hover:bg-gray-800 transition font-semibold">
                                Ver Carrito
                            </a>
                            <a href="/carrito" class="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold text-center">
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
        }

        if (carritoBadge) {
            const totalItems = this.carritoManager.getTotalItems();
            carritoBadge.textContent = totalItems;
            carritoBadge.classList.toggle('hidden', totalItems === 0);
        }
    },

    actualizarMiniCarritoMobile() {
        const miniCarritoContent = document.getElementById('mini-carrito-content-mobile');
        const carritoBadge = document.getElementById('carrito-badge-mobile');

        if (!this.carritoManager) {
            if (miniCarritoContent) {
                miniCarritoContent.innerHTML = `<p class="text-gray-500 text-sm">Carrito no disponible</p>`;
            }
            if (carritoBadge) {
                carritoBadge.classList.add('hidden');
            }
            return;
        }

        // Verificar si el usuario está autenticado
        if (!window.authManager.estaAutenticado()) {
            if (miniCarritoContent) {
                miniCarritoContent.innerHTML = `
                    <p class="text-gray-500 text-sm mb-3">Inicia sesión para ver tu carrito</p>
                    <a href="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition block text-center">
                        Iniciar Sesión
                    </a>
                `;
            }
            if (carritoBadge) {
                carritoBadge.classList.add('hidden');
            }
            return;
        }

        if (miniCarritoContent) {
            if (this.carritoManager.carrito.items && this.carritoManager.carrito.items.length > 0) {
                miniCarritoContent.innerHTML = `
                    <div class="space-y-3">
                        ${this.carritoManager.carrito.items.map(item => `
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
                                        data-producto-id="${item.producto_id}">
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
                            <span class="font-bold">$${this.formatearPrecio(this.carritoManager.carrito.total || 0)}</span>
                        </div>
                        <a href="/carrito" class="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold text-center">
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
        }

        if (carritoBadge) {
            const totalItems = this.carritoManager.getTotalItems();
            carritoBadge.textContent = totalItems;
            carritoBadge.classList.toggle('hidden', totalItems === 0);
        }
    },

    inicializarEventosCarrito() {
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

    inicializarEventosGlobales(){
        document.addEventListener('click', (e) => {
            // Botones de compra
            if(e.target.classList.contains('comprar-btn') || e.target.closest('.comprar-btn')) {
                const btn = e.target.classList.contains('comprar-btn') ? e.target : e.target.closest('.comprar-btn');
                this.comprarProducto(
                    btn.dataset.productoId,
                    btn.dataset.productoNombre,
                    parseFloat(btn.dataset.productoPrecio)
                );
            }

            // Botones de agregar al carrito
            if(e.target.classList.contains('agregar-carrito-btn') || e.target.closest('.agregar-carrito-btn')) {
                const btn = e.target.classList.contains('agregar-carrito-btn') ? e.target : e.target.closest('.agregar-carrito-btn');
                this.comprarProducto(
                    btn.dataset.productoId,
                    btn.dataset.productoNombre,
                    parseFloat(btn.dataset.productoPrecio)
                );
            }

            // Botones de favoritos
            if (e.target.classList.contains('favorito-btn') || e.target.closest('.favorito-btn')) {
                const btn = e.target.classList.contains('favorito-btn') ? e.target : e.target.closest('.favorito-btn');
                this.toggleFavorito(btn.dataset.productoId);
            }

            // Eliminar item del carrito
            if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
                const btn = e.target.classList.contains('eliminar-item') ? e.target : e.target.closest('.eliminar-item');
                this.eliminarDelCarrito(btn.dataset.productoId);
            }
        });

        // Cerrar mini carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarMiniCarrito();
            }
        });
    },

    async comprarProducto(productoId, productoNombre, productoPrecio){
        // Verificar si el usuario está autenticado
        if (!window.authManager.estaAutenticado()) {
            this.mostrarNotificacion('🔐 Debes iniciar sesión para agregar productos al carrito', 'warning');
            setTimeout(() => {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            }, 2000);
            return;
        }

        console.log(`🛒 Añadiendo al carrito: ${productoNombre} (ID: ${productoId})`);

        try {
            // Asegurarse de que CarritoManager esté inicializado
            if (!this.carritoManager && typeof CarritoManager !== 'undefined') {
                this.carritoManager = new CarritoManager();
            }

            if (!this.carritoManager) {
                this.mostrarNotificacion('❌ Error: Carrito no disponible', 'error');
                return;
            }

            const result = await this.carritoManager.agregarProducto(
                parseInt(productoId),
                1
            );

            if (result.success) {
                this.actualizarMiniCarrito();
                this.mostrarNotificacion(`✅ "${productoNombre}" añadido al carrito`, 'success');

                // Disparar evento personalizado para que otras páginas se actualicen
                document.dispatchEvent(new CustomEvent('carritoActualizado', {
                    detail: { carrito: this.carritoManager.carrito }
                }));
            } else if (result.requiereLogin) {
                this.mostrarNotificacion('🔐 Debes iniciar sesión para agregar productos al carrito', 'warning');
                setTimeout(() => {
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                }, 2000);
            } else {
                this.mostrarNotificacion(`❌ Error: ${result.error?.details || 'No se pudo agregar al carrito'}`, 'error');
            }
        } catch (error) {
            console.error('Error en comprarProducto:', error);
            this.mostrarNotificacion(`❌ Error agregando "${productoNombre}" al carrito`, 'error');
        }
    },

    async eliminarDelCarrito(productoId) {
        try {
            if (!this.carritoManager) {
                this.mostrarNotificacion('❌ Carrito no disponible', 'error');
                return;
            }

            const result = await this.carritoManager.eliminarProducto(parseInt(productoId));
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

    toggleFavorito(productoId){
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
    },

    // Nueva función para forzar actualización después del login
    async actualizarDespuesDeLogin() {
        console.log('🔄 Actualizando aplicación después del login...');
        await this.inicializarCarrito();
        this.actualizarNavbarAutenticado();
        this.actualizarMiniCarrito();
    }
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar AuthManager si existe
    if (typeof AuthManager !== 'undefined' && !window.authManager) {
        window.authManager = new AuthManager();
    }

    // Inicializar la aplicación
    app.init();

    // Exponer app globalmente para acceso desde otras páginas
    window.app = app;
});

// Manejar cambios de autenticación
document.addEventListener('authStateChanged', function(e) {
    console.log('🔄 Cambio de estado de autenticación detectado:', e.detail.estaAutenticado);

    if (e.detail.estaAutenticado) {
        // Usuario acaba de iniciar sesión
        app.actualizarDespuesDeLogin();
    } else {
        // Usuario cerró sesión
        app.actualizarNavbarNoAutenticado();
        app.actualizarMiniCarrito();
    }
});

// Manejar cambios en el carrito
document.addEventListener('carritoActualizado', function(e) {
    console.log('🔄 Carrito actualizado, refrescando mini carrito');
    app.actualizarMiniCarrito();
});