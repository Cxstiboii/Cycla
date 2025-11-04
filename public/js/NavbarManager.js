// js/NavbarManager.js
class NavbarManager {
    constructor() {
        this.authManager = window.authManager;
    }

    inicializar() {
        console.log('🔄 Inicializando NavbarManager...');
        this.actualizarNavbar();
        this.configurarEventos();

        // Escuchar cambios de autenticación
        document.addEventListener('authStateChanged', () => {
            this.actualizarNavbar();
        });
    }

    actualizarNavbar() {
        const estaAutenticado = this.authManager.estaAutenticado();
        const usuario = this.authManager.getUsuario();

        console.log('🎯 Actualizando navbar - Autenticado:', estaAutenticado, 'Usuario:', usuario);

        // Actualizar navbar desktop
        this.actualizarNavbarDesktop(estaAutenticado, usuario);

        // Actualizar navbar mobile
        this.actualizarNavbarMobile(estaAutenticado, usuario);
    }

    actualizarNavbarDesktop(estaAutenticado, usuario) {
        const navDesktop = document.querySelector('.hidden.lg\\:flex');
        if (!navDesktop) return;

        // Buscar el contenedor de enlaces de usuario
        const navContainer = navDesktop.querySelector('div:last-child');
        if (!navContainer) return;

        // Remover menú de usuario existente si existe
        const menuExistente = navContainer.querySelector('#menu-usuario');
        if (menuExistente) {
            menuExistente.remove();
        }

        // Remover enlaces de login/register si existen
        const loginLink = navContainer.querySelector('a[href*="login"]');
        const registerLink = navContainer.querySelector('a[href*="register"]');
        if (loginLink) loginLink.remove();
        if (registerLink) registerLink.remove();

        if (estaAutenticado && usuario) {
            // Usuario autenticado - Mostrar menú de usuario
            const menuUsuarioHTML = `
                <div class="relative group" id="menu-usuario">
                    <button class="flex items-center space-x-2 text-black font-medium special-gothic-expanded-one-600 py-2 hover:text-gray-700 transition-colors">
                        <span id="nombre-usuario-nav">${usuario.nombre}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden group-hover:block">
                        <div class="py-2">
                            <a href="/views/perfil.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-semibold transition-colors">👤 Mi Perfil</a>
                            <a href="/views/carrito.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">🛒 Mi Carrito</a>
                            <a href="/views/pedidos.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">📦 Mis Pedidos</a>
                            ${usuario.esAdmin ?
                '<a href="/views/admin.html" class="block px-4 py-2 text-purple-700 hover:bg-purple-50 font-semibold transition-colors">⚙️ Administración</a>' :
                ''
            }
                            <div class="border-t border-gray-200 mt-2 pt-2">
                                <button id="btn-logout-desktop" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-semibold transition-colors">🚪 Cerrar Sesión</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            navContainer.insertAdjacentHTML('beforeend', menuUsuarioHTML);
        } else {
            // Usuario no autenticado - Mostrar enlaces de login/register
            const authLinksHTML = `
                <a href="/views/login.html" class="text-black font-medium special-gothic-expanded-one-600 relative inline-block py-2 transition-all duration-300 hover:text-shadow-lg after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                    Iniciar Sesión
                </a>
                <a href="/views/register.html" class="text-black font-medium special-gothic-expanded-one-600 relative inline-block py-2 transition-all duration-300 hover:text-shadow-lg after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                    Registrarse
                </a>
            `;
            navContainer.insertAdjacentHTML('beforeend', authLinksHTML);
        }
    }

    actualizarNavbarMobile(estaAutenticado, usuario) {
        const navMobile = document.querySelector('.lg\\:hidden');
        if (!navMobile) return;

        const menuList = navMobile.querySelector('ul');
        if (!menuList) return;

        // Remover sección de cuenta existente si existe
        const cuentaExistente = menuList.querySelector('.seccion-cuenta-mobile');
        if (cuentaExistente) {
            cuentaExistente.remove();
        }

        if (estaAutenticado && usuario) {
            // Usuario autenticado - Mostrar menú mobile
            const menuMobileHTML = `
                <li class="seccion-cuenta-mobile border-t border-gray-200 pt-4 mt-4">
                    <span class="text-gray-500 text-sm">Mi Cuenta - ${usuario.nombre}</span>
                    <a href="/views/perfil.html" class="block text-lg text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular py-2">👤 Mi Perfil</a>
                    <a href="/views/carrito.html" class="block text-lg text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular py-2">🛒 Mi Carrito</a>
                    <a href="/views/pedidos.html" class="block text-lg text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular py-2">📦 Mis Pedidos</a>
                    ${usuario.esAdmin ?
                '<a href="/views/admin.html" class="block text-lg text-purple-600 font-medium hover:text-purple-700 special-gothic-expanded-one-regular py-2">⚙️ Administración</a>' :
                ''
            }
                    <button id="btn-logout-mobile" class="block w-full text-left text-lg text-red-600 font-medium hover:text-red-700 special-gothic-expanded-one-regular py-2">🚪 Cerrar Sesión</button>
                </li>
            `;
            menuList.insertAdjacentHTML('beforeend', menuMobileHTML);
        } else {
            // Usuario no autenticado - Mostrar enlaces mobile
            const authMobileHTML = `
                <li class="seccion-cuenta-mobile border-t border-gray-200 pt-4 mt-4">
                    <a href="/views/login.html" class="block text-lg text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular py-2">🔐 Iniciar Sesión</a>
                    <a href="/views/register.html" class="block text-lg text-black font-medium hover:text-gray-900 special-gothic-expanded-one-regular py-2">👤 Registrarse</a>
                </li>
            `;
            menuList.insertAdjacentHTML('beforeend', authMobileHTML);
        }
    }

    configurarEventos() {
        // Delegación de eventos para logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-logout-desktop' || e.target.id === 'btn-logout-mobile' ||
                e.target.closest('#btn-logout-desktop') || e.target.closest('#btn-logout-mobile')) {
                e.preventDefault();
                this.cerrarSesion();
            }
        });

        // Cerrar menú dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const menuUsuario = document.getElementById('menu-usuario');
            if (menuUsuario && !menuUsuario.contains(e.target)) {
                const dropdown = menuUsuario.querySelector('div');
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    }

    cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.authManager.logout();
        }
    }
}

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', function() {
    window.navbarManager = new NavbarManager();
    window.navbarManager.inicializar();
});
<script src="/js/AuthManager.js"></script>
<script src="/js/NavbarManager.js"></script>