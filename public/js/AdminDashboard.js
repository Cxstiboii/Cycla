class AdminDashboard {
    constructor() {
        this.apiBase = 'http://localhost:3000/api/admin';
        this.productos = [];
        this.categorias = [];
        this.paginacionActual = {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
        };
    }

    async init() {
        console.log('🔄 Inicializando panel de administración...');

        try {
            await this.cargarCategorias();
            await this.cargarEstadisticas();
            await this.cargarProductos();
            this.configurarEventos();
            this.configurarNavegacion();

            console.log('✅ Panel de administración inicializado');
        } catch (error) {
            console.error('❌ Error inicializando panel:', error);
        }
    }

    configurarNavegacion() {
        const navLinks = document.querySelectorAll('.admin-nav');
        const sections = document.querySelectorAll('.admin-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetSection = link.dataset.section;

                // Ocultar todas las secciones
                sections.forEach(section => {
                    section.classList.add('hidden');
                });

                // Mostrar sección objetivo
                document.getElementById(`${targetSection}-section`).classList.remove('hidden');

                // Actualizar navegación activa
                navLinks.forEach(nav => nav.classList.remove('text-blue-600', 'font-semibold'));
                link.classList.add('text-blue-600', 'font-semibold');
            });
        });

        // Activar sección por defecto
        document.querySelector('.admin-nav[data-section="dashboard"]').classList.add('text-blue-600', 'font-semibold');
    }

    configurarEventos() {
        // Botones de navegación
        document.getElementById('btn-nuevo-producto').addEventListener('click', () => {
            this.mostrarSeccion('productos');
            this.mostrarModalProducto();
        });

        document.getElementById('btn-agregar-producto').addEventListener('click', () => {
            this.mostrarModalProducto();
        });

        // Modal
        document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
            this.ocultarModalProducto();
        });

        document.getElementById('btn-cancelar').addEventListener('click', () => {
            this.ocultarModalProducto();
        });

        // Formulario de producto
        document.getElementById('form-producto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarProducto();
        });

        // Filtros
        document.getElementById('buscar-producto').addEventListener('input', (e) => {
            this.filtrarProductos();
        });

        document.getElementById('filtro-categoria').addEventListener('change', () => {
            this.filtrarProductos();
        });

        document.getElementById('filtro-stock').addEventListener('change', () => {
            this.filtrarProductos();
        });

        document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
            this.limpiarFiltros();
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ocultarModalProducto();
            }
        });
    }

    mostrarSeccion(seccion) {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${seccion}-section`).classList.remove('hidden');

        // Actualizar navegación
        document.querySelectorAll('.admin-nav').forEach(nav => {
            nav.classList.remove('text-blue-600', 'font-semibold');
            if (nav.dataset.section === seccion) {
                nav.classList.add('text-blue-600', 'font-semibold');
            }
        });
    }

    async cargarEstadisticas() {
        try {
            const response = await fetch(`${this.apiBase}/estadisticas`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('total-productos').textContent = data.totalProductos;
                document.getElementById('total-categorias').textContent = data.totalCategorias;
                document.getElementById('productos-bajo-stock').textContent = data.productosBajoStock;
                document.getElementById('valor-inventario').textContent = `$${this.formatearPrecio(data.valorTotalInventario)}`;
            }
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
        }
    }

    async cargarCategorias() {
        try {
            const response = await fetch(`${this.apiBase}/categorias`);
            const data = await response.json();

            if (response.ok) {
                this.categorias = data;
                this.actualizarSelectCategorias();
            }
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
        }
    }

    actualizarSelectCategorias() {
        const selectModal = document.getElementById('categoria-producto');
        const selectFiltro = document.getElementById('filtro-categoria');

        // Limpiar selects
        selectModal.innerHTML = '<option value="">Seleccionar categoría</option>';
        selectFiltro.innerHTML = '<option value="">Todas las categorías</option>';

        // Llenar con categorías
        this.categorias.forEach(categoria => {
            const optionModal = document.createElement('option');
            optionModal.value = categoria.id;
            optionModal.textContent = categoria.Categoria;
            selectModal.appendChild(optionModal);

            const optionFiltro = document.createElement('option');
            optionFiltro.value = categoria.id;
            optionFiltro.textContent = categoria.Categoria;
            selectFiltro.appendChild(optionFiltro);
        });
    }

    async cargarProductos(page = 1) {
        try {
            const response = await fetch(`${this.apiBase}/productos?page=${page}&limit=10`);
            const data = await response.json();

            if (response.ok) {
                this.productos = data.productos;
                this.paginacionActual = data.pagination;
                this.mostrarProductos();
                this.mostrarPaginacion();
            }
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
        }
    }

    mostrarProductos() {
        const tbody = document.getElementById('tabla-productos');

        if (this.productos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No se encontraron productos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.productos.map(producto => this.crearFilaProducto(producto)).join('');
    }

    crearFilaProducto(producto) {
        const estadoStock = producto.cantidad === 0 ?
            '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Agotado</span>' :
            producto.cantidad < 10 ?
                '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Bajo Stock</span>' :
                '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">En Stock</span>';

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            ${producto.imagen_url ?
            `<img src="${producto.imagen_url}" alt="${producto.nombre_producto}" class="h-8 w-8 object-cover rounded">` :
            `<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>`
        }
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${producto.nombre_producto}</div>
                            <div class="text-sm text-gray-500">ID: ${producto.id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${producto.categoria_nombre}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">$${this.formatearPrecio(producto.precio_unitario)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 ${producto.cantidad < 10 ? 'text-orange-600 font-semibold' : ''}">
                        ${producto.cantidad} unidades
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${estadoStock}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 editar-producto" data-id="${producto.id}">
                        Editar
                    </button>
                    <button class="text-red-600 hover:text-red-900 eliminar-producto" data-id="${producto.id}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    }

    mostrarPaginacion() {
        const paginacion = document.getElementById('paginacion');
        const { page, totalPages, hasNext, hasPrev } = this.paginacionActual;

        if (totalPages <= 1) {
            paginacion.innerHTML = '';
            return;
        }

        let paginacionHTML = '<div class="flex items-center justify-between">';

        // Información de página
        paginacionHTML += `<div class="text-sm text-gray-700">
            Página ${page} de ${totalPages}
        </div>`;

        // Botones de paginación
        paginacionHTML += '<div class="flex space-x-2">';

        if (hasPrev) {
            paginacionHTML += `<button class="pagina-anterior px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50" data-page="${page - 1}">
                Anterior
            </button>`;
        }

        if (hasNext) {
            paginacionHTML += `<button class="pagina-siguiente px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50" data-page="${page + 1}">
                Siguiente
            </button>`;
        }

        paginacionHTML += '</div></div>';
        paginacion.innerHTML = paginacionHTML;

        // Event listeners para paginación
        document.querySelector('.pagina-anterior')?.addEventListener('click', (e) => {
            this.cargarProductos(parseInt(e.target.dataset.page));
        });

        document.querySelector('.pagina-siguiente')?.addEventListener('click', (e) => {
            this.cargarProductos(parseInt(e.target.dataset.page));
        });
    }

    mostrarModalProducto(producto = null) {
        const modal = document.getElementById('modal-producto');
        const titulo = document.getElementById('modal-titulo');
        const form = document.getElementById('form-producto');

        if (producto) {
            // Modo edición
            titulo.textContent = 'Editar Producto';
            document.getElementById('producto-id').value = producto.id;
            document.getElementById('nombre-producto').value = producto.nombre_producto;
            document.getElementById('descripcion-producto').value = producto.descripcion || '';
            document.getElementById('precio-producto').value = producto.precio_unitario;
            document.getElementById('stock-producto').value = producto.cantidad;
            document.getElementById('imagen-producto').value = producto.imagen_url || '';
            document.getElementById('categoria-producto').value = producto.fk_id_tipo_Producto;
        } else {
            // Modo creación
            titulo.textContent = 'Agregar Producto';
            form.reset();
            document.getElementById('producto-id').value = '';
        }

        modal.classList.remove('hidden');
        document.getElementById('modal-error').classList.add('hidden');
    }

    ocultarModalProducto() {
        document.getElementById('modal-producto').classList.add('hidden');
    }

    async guardarProducto() {
        const formData = new FormData(document.getElementById('form-producto'));
        const productoId = formData.get('producto-id');
        const esEdicion = !!productoId;

        const datosProducto = {
            nombre_producto: formData.get('nombre-producto'),
            descripcion: formData.get('descripcion-producto'),
            precio_unitario: parseFloat(formData.get('precio-producto')),
            cantidad: parseInt(formData.get('stock-producto')) || 0,
            imagen_url: formData.get('imagen-producto'),
            fk_id_tipo_Producto: parseInt(formData.get('categoria-producto'))
        };

        // Validaciones
        if (!datosProducto.nombre_producto || !datosProducto.precio_unitario || !datosProducto.fk_id_tipo_Producto) {
            this.mostrarErrorModal('Por favor completa todos los campos requeridos');
            return;
        }

        this.mostrarCargandoGuardar(true);

        try {
            const url = esEdicion ?
                `${this.apiBase}/productos/${productoId}` :
                `${this.apiBase}/productos`;

            const method = esEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosProducto)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.ocultarModalProducto();
                await this.cargarProductos(this.paginacionActual.page);
                await this.cargarEstadisticas();

                // Mostrar mensaje de éxito
                this.mostrarNotificacion(
                    `Producto ${esEdicion ? 'actualizado' : 'creado'} exitosamente`,
                    'success'
                );
            } else {
                this.mostrarErrorModal(data.error || 'Error guardando producto');
            }

        } catch (error) {
            console.error('❌ Error guardando producto:', error);
            this.mostrarErrorModal('Error de conexión. Intenta nuevamente.');
        } finally {
            this.mostrarCargandoGuardar(false);
        }
    }

    async eliminarProducto(productoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/productos/${productoId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await this.cargarProductos(this.paginacionActual.page);
                await this.cargarEstadisticas();
                this.mostrarNotificacion('Producto eliminado exitosamente', 'success');
            } else {
                this.mostrarNotificacion(data.error || 'Error eliminando producto', 'error');
            }

        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            this.mostrarNotificacion('Error de conexión. Intenta nuevamente.', 'error');
        }
    }

    filtrarProductos() {
        // Por simplicidad, recargamos los productos y filtramos en el cliente
        // En una aplicación real, esto se haría en el servidor
        this.cargarProductos(1);
    }

    limpiarFiltros() {
        document.getElementById('buscar-producto').value = '';
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('filtro-stock').value = '';
        this.cargarProductos(1);
    }

    mostrarCargandoGuardar(mostrar) {
        const btnTexto = document.getElementById('btn-guardar-texto');
        const btnCargando = document.getElementById('btn-guardar-cargando');
        const btn = document.getElementById('btn-guardar-producto');

        if (mostrar) {
            btnTexto.classList.add('hidden');
            btnCargando.classList.remove('hidden');
            btn.disabled = true;
        } else {
            btnTexto.classList.remove('hidden');
            btnCargando.classList.add('hidden');
            btn.disabled = false;
        }
    }

    mostrarErrorModal(mensaje) {
        const errorDiv = document.getElementById('modal-error');
        errorDiv.textContent = mensaje;
        errorDiv.classList.remove('hidden');
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold transform transition-transform duration-300 ${
            tipo === 'success' ? 'bg-green-500' :
                tipo === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } translate-x-full`;
        notification.textContent = mensaje;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    formatearPrecio(precio) {
        if (!precio) return '0';
        return parseFloat(precio).toLocaleString('es-CO');
    }

    // Delegación de eventos para botones dinámicos
    delegarEventos() {
        document.addEventListener('click', (e) => {
            // Botón editar
            if (e.target.classList.contains('editar-producto')) {
                const productoId = e.target.dataset.id;
                this.cargarProductoParaEditar(productoId);
            }

            // Botón eliminar
            if (e.target.classList.contains('eliminar-producto')) {
                const productoId = e.target.dataset.id;
                this.eliminarProducto(productoId);
            }
        });
    }

    async cargarProductoParaEditar(productoId) {
        try {
            const response = await fetch(`${this.apiBase}/productos/${productoId}`);
            const producto = await response.json();

            if (response.ok) {
                this.mostrarModalProducto(producto);
            } else {
                this.mostrarNotificacion('Error cargando producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error cargando producto:', error);
            this.mostrarNotificacion('Error de conexión', 'error');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const adminDashboard = new AdminDashboard();
    adminDashboard.init();
    adminDashboard.delegarEventos();

    // Hacer disponible globalmente para debugging
    window.adminDashboard = adminDashboard;
});