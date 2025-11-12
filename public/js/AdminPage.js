class AdminPage {
    // CORRECCIÓN: Usar class field declarations
    apiBase = 'http://localhost:3000/api';
    currentSection = 'dashboard';

    async init() {
        console.log('🔄 Inicializando página de administración...');

        try {
            // CORRECCIÓN: Usar globalThis en lugar de window
            if (!globalThis.authManager?.estaAutenticado()) {
                this.mostrarError('Debes iniciar sesión para acceder al panel de administración');
                return;
            }

            // CORRECCIÓN: Usar globalThis en lugar de window
            const usuario = globalThis.authManager.getUsuario();
            if (!usuario?.esAdmin) {
                this.mostrarError('No tienes permisos para acceder al panel de administración');
                return;
            }

            // Configurar eventos
            this.configurarEventos();

            // Cargar dashboard por defecto
            await this.cargarDashboard();

            console.log('✅ Página de administración inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando página de administración:', error);
            this.mostrarError('Error al cargar el panel de administración');
        }
    }

    configurarEventos() {
        // CORRECCIÓN: Usar for...of en lugar de forEach
        const navElements = document.querySelectorAll('.admin-nav');
        for (const nav of navElements) {
            nav.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.cambiarSeccion(section);
            });
        }

        // Botón nuevo producto
        const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
        if (btnNuevoProducto) {
            btnNuevoProducto.addEventListener('click', () => {
                this.mostrarModalProducto();
            });
        }

        // Botón agregar producto
        const btnAgregarProducto = document.getElementById('btn-agregar-producto');
        if (btnAgregarProducto) {
            btnAgregarProducto.addEventListener('click', () => {
                this.mostrarModalProducto();
            });
        }
    }

    async cambiarSeccion(section) {
        this.currentSection = section;

        // CORRECCIÓN: Usar for...of en lugar de forEach
        const sectionElements = document.querySelectorAll('.admin-section');
        for (const sec of sectionElements) {
            sec.classList.add('hidden');
        }

        // Mostrar sección actual
        const sectionElement = document.getElementById(`${section}-section`);
        if (sectionElement) {
            sectionElement.classList.remove('hidden');
        }

        // Cargar datos de la sección
        switch(section) {
            case 'dashboard':
                await this.cargarDashboard();
                break;
            case 'productos':
                await this.cargarProductos();
                break;
            case 'categorias':
                await this.cargarCategorias();
                break;
        }
    }

    async cargarDashboard() {
        try {
            console.log('📊 Cargando dashboard...');

            // Aquí cargarías las estadísticas desde tu API
            // Por ahora, mostraremos datos de ejemplo
            this.actualizarEstadisticas({
                totalProductos: 0,
                totalCategorias: 0,
                productosBajoStock: 0,
                valorInventario: 0
            });

        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
        }
    }

    actualizarEstadisticas(estadisticas) {
        document.getElementById('total-productos').textContent = estadisticas.totalProductos;
        document.getElementById('total-categorias').textContent = estadisticas.totalCategorias;
        document.getElementById('productos-bajo-stock').textContent = estadisticas.productosBajoStock;
        document.getElementById('valor-inventario').textContent = `$${estadisticas.valorInventario}`;
    }

    async cargarProductos() {
        try {
            console.log('📦 Cargando productos...');

            const response = await fetch(`${this.apiBase}/productos`);
            if (response.ok) {
                const productos = await response.json();
                this.mostrarProductos(productos);
            } else {
                throw new Error('Error al cargar productos');
            }

        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.mostrarError('Error al cargar los productos');
        }
    }

    mostrarProductos(productos) {
        const tabla = document.getElementById('tabla-productos');
        if (!tabla) return;

        if (productos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center">
                        <p class="text-gray-500">No hay productos disponibles</p>
                    </td>
                </tr>
            `;
            return;
        }

        tabla.innerHTML = productos.map(producto => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full object-cover" src="${producto.imagen_url || '/assets/placeholder.jpg'}" alt="${producto.nombre_producto}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${producto.nombre_producto}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.obtenerNombreCategoria(producto.fk_id_tipo_Producto)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $${this.formatearPrecio(producto.precio_unitario)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${producto.cantidad}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${producto.cantidad > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${producto.cantidad > 0 ? 'Disponible' : 'Agotado'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 editar-producto" data-producto-id="${producto.id}">Editar</button>
                    <button class="text-red-600 hover:text-red-900 eliminar-producto" data-producto-id="${producto.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    obtenerNombreCategoria(categoriaId) {
        const categorias = {
            1: 'Ropa de Ciclismo',
            2: 'Partes de Ciclismo',
            3: 'Bicicletas'
        };
        return categorias[categoriaId] || 'Sin categoría';
    }

    mostrarModalProducto() {
        const modal = document.getElementById('modal-producto');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    mostrarError(mensaje) {
        const container = document.querySelector('.max-w-7xl.mx-auto');
        if (container) {
            const errorHtml = `
                <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                    <p class="font-semibold">${mensaje}</p>
                    <button onclick="window.location.href='/'" class="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">
                        Volver al Inicio
                    </button>
                </div>
            `;
            container.innerHTML = errorHtml;
        }
    }

    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(precio);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const adminPage = new AdminPage();
    adminPage.init();

    // CORRECCIÓN: Usar globalThis en lugar de window
    globalThis.adminPage = adminPage;
});