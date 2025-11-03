class ProductoPage {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.carritoManager = new CarritoManager(this.apiBase);
        this.productoId = null;
        this.producto = null;
        this.categoriaId = null;

        this.categorias = {
            1: { nombre: 'Ropa de Ciclismo', slug: 'ropa-ciclismo' },
            2: { nombre: 'Partes de Ciclismo', slug: 'partes-ciclismo' },
            3: { nombre: 'Bicicletas', slug: 'bicicletas' }
        };
    }

    async init() {
        console.log('🔄 Inicializando página de producto...');

        try {
            // Obtener ID del producto de la URL
            this.obtenerProductoIdDeURL();

            if (!this.productoId) {
                this.mostrarError('ID de producto no válido');
                return;
            }

            // Inicializar carrito
            await this.carritoManager.inicializar();

            // Cargar producto
            await this.cargarProducto();

            // Configurar eventos
            this.configurarEventos();

            console.log('✅ Página de producto inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando página de producto:', error);
            this.mostrarError('Error al cargar el producto');
        }
    }

    obtenerProductoIdDeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productoId = parseInt(urlParams.get('id'));

        console.log('🔍 ID de producto obtenido:', this.productoId);
    }

    async cargarProducto() {
        try {
            console.log(`📦 Cargando producto ID: ${this.productoId}...`);

            const response = await fetch(`${this.apiBase}/productos/${this.productoId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Producto no encontrado');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            this.producto = await response.json();
            this.categoriaId = this.producto.fk_id_tipo_Producto;

            console.log('✅ Producto cargado:', this.producto);

            this.mostrarProducto();
            await this.cargarProductosRelacionados();

        } catch (error) {
            console.error('❌ Error cargando producto:', error);
            this.mostrarError(error.message);
        }
    }

    mostrarProducto() {
        const loading = document.getElementById('loading-producto');
        const detalle = document.getElementById('producto-detalle');
        const error = document.getElementById('error-producto');

        if (loading) loading.classList.add('hidden');
        if (error) error.classList.add('hidden');
        if (detalle) {
            detalle.classList.remove('hidden');
            detalle.innerHTML = this.crearVistaProducto();
        }

        this.actualizarBreadcrumb();
        this.actualizarTituloPagina();
    }

    crearVistaProducto() {
        const esStockBajo = this.producto.cantidad < 10;
        const esStockAgotado = this.producto.cantidad === 0;
        const precioFormateado = this.formatearPrecio(this.producto.precio_unitario);

        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <!-- Imagen del producto -->
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                    <div class="flex justify-center items-center h-80 lg:h-96 bg-gray-100 rounded-2xl">
                        ${this.producto.imagen_url ?
            `<img src="${this.producto.imagen_url}" alt="${this.producto.nombre_producto}" class="max-w-full max-h-80 lg:max-h-96 object-contain transition-transform hover:scale-105 duration-300" loading="lazy">` :
            `<div class="text-gray-400 text-center">
                                <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span class="text-lg">Imagen no disponible</span>
                            </div>`
        }
                    </div>
                </div>

                <!-- Información del producto -->
                <div class="space-y-6">
                    <div>
                        <a href="/productos.html?categoria=${this.categoriaId}" class="inline-block bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full font-semibold mb-2 hover:bg-blue-200 transition-colors">
                            ${this.categorias[this.categoriaId]?.nombre || 'Categoría'}
                        </a>
                        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 special-gothic-expanded-one-600 mb-4">
                            ${this.producto.nombre_producto}
                        </h1>
                        <p class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            ${precioFormateado}
                        </p>
                    </div>

                    <!-- Estado del stock -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-semibold text-gray-700">Disponibilidad:</span>
                            ${esStockAgotado ?
            '<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">❌ Agotado</span>' :
            esStockBajo ?
                '<span class="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">⚠️ Últimas unidades</span>' :
                '<span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">✅ En stock</span>'
        }
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-lg font-semibold text-gray-700">Unidades disponibles:</span>
                            <span class="text-xl font-bold ${esStockBajo || esStockAgotado ? 'text-red-500' : 'text-green-500'}">
                                ${this.producto.cantidad}
                            </span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-lg font-semibold text-gray-700">Código:</span>
                            <span class="text-lg text-gray-600">#${this.producto.id}</span>
                        </div>
                    </div>

                    <!-- Selector de cantidad y botón de compra -->
                    <div class="space-y-4 pt-4">
                        <div class="flex items-center space-x-4">
                            <span class="text-lg font-semibold text-gray-700">Cantidad:</span>
                            <div class="flex items-center border border-gray-300 rounded-lg">
                                <button class="cantidad-btn decremento w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                        data-action="decrement">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                                    </svg>
                                </button>
                                <input type="number" id="cantidad-producto" value="1" min="1" max="${this.producto.cantidad}" 
                                       class="w-16 h-12 text-center border-0 focus:ring-0 focus:outline-none text-lg font-semibold">
                                <button class="cantidad-btn incremento w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                        data-action="increment">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-4">
                            <button id="btn-agregar-carrito" 
                                    class="flex-1 bg-black text-white py-4 px-8 rounded-xl hover:bg-gray-800 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    ${esStockAgotado ? 'disabled' : ''}>
                                <span>🛒</span>
                                <span>${esStockAgotado ? 'Producto Agotado' : 'Añadir al Carrito'}</span>
                            </button>
                            
                            <button class="flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    ${esStockAgotado ? 'disabled' : ''}>
                                <span>❤️</span>
                                <span class="ml-2">Favoritos</span>
                            </button>
                        </div>
                    </div>

                    <!-- Información adicional -->
                    <div class="pt-6 border-t border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                        <p class="text-gray-600 leading-relaxed">
                            ${this.producto.descripcion || 'Este producto no tiene descripción disponible. Es un artículo de alta calidad diseñado para satisfacer las necesidades de los ciclistas más exigentes.'}
                        </p>
                    </div>

                    <!-- Características -->
                    <div class="pt-6 border-t border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                        <ul class="text-gray-600 space-y-2">
                            <li class="flex items-center">
                                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Producto de alta calidad
                            </li>
                            <li class="flex items-center">
                                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Envío rápido disponible
                            </li>
                            <li class="flex items-center">
                                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Garantía del fabricante
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    async cargarProductosRelacionados() {
        try {
            if (!this.categoriaId) return;

            console.log(`🔄 Cargando productos relacionados de categoría ${this.categoriaId}...`);

            const response = await fetch(`${this.apiBase}/productos/categoria/${this.categoriaId}?limit=4`);

            if (response.ok) {
                const productos = await response.json();
                // Filtrar el producto actual
                const productosRelacionados = productos.filter(p => p.id !== this.productoId).slice(0, 4);
                this.mostrarProductosRelacionados(productosRelacionados);
            }
        } catch (error) {
            console.error('❌ Error cargando productos relacionados:', error);
        }
    }

    mostrarProductosRelacionados(productos) {
        const container = document.getElementById('productos-relacionados');
        if (!container) return;

        if (productos.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">No hay productos relacionados disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productos.map(producto => this.crearCardProductoRelacionado(producto)).join('');
    }

    crearCardProductoRelacionado(producto) {
        const precioFormateado = this.formatearPrecio(producto.precio_unitario);
        const esStockBajo = producto.cantidad < 10;

        return `
            <a href="/producto.html?id=${producto.id}" class="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-4 block group">
                <div class="bg-gray-100 rounded-2xl p-4 h-48 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    ${producto.imagen_url ?
            `<img src="${producto.imagen_url}" alt="${producto.nombre_producto}" class="max-w-full max-h-40 object-contain transition-transform group-hover:scale-105 duration-300">` :
            `<div class="text-gray-400 text-center">
                            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>`
        }
                </div>
                <div class="mt-4">
                    <h3 class="text-gray-800 font-bold text-lg special-gothic-expanded-one-regular leading-tight min-h-[3rem] line-clamp-2 group-hover:text-blue-600 transition-colors">
                        ${producto.nombre_producto}
                    </h3>
                    <p class="text-2xl font-bold text-gray-900 mt-2">${precioFormateado}</p>
                    <div class="flex justify-between items-center text-sm mt-2">
                        <span class="text-gray-600 ${esStockBajo ? 'text-red-500 font-semibold' : ''}">
                            ${producto.cantidad} unidades
                        </span>
                        <span class="text-gray-400">#${producto.id}</span>
                    </div>
                </div>
            </a>
        `;
    }

    actualizarBreadcrumb() {
        const breadcrumbCategoria = document.getElementById('breadcrumb-categoria');
        const breadcrumbProducto = document.getElementById('breadcrumb-producto');

        if (breadcrumbCategoria && this.categorias[this.categoriaId]) {
            breadcrumbCategoria.textContent = this.categorias[this.categoriaId].nombre;
            breadcrumbCategoria.href = `/productos.html?categoria=${this.categoriaId}`;
        }

        if (breadcrumbProducto && this.producto) {
            breadcrumbProducto.textContent = this.producto.nombre_producto;
        }
    }

    actualizarTituloPagina() {
        if (this.producto) {
            document.title = `${this.producto.nombre_producto} - Cycla`;
        }
    }

    configurarEventos() {
        // Eventos de cantidad
        this.configurarEventosCantidad();

        // Evento de agregar al carrito
        this.configurarEventoAgregarCarrito();

        // Actualizar estado inicial de botones
        this.actualizarEstadoBotonesCantidad();
    }

    configurarEventosCantidad() {
        const cantidadInput = document.getElementById('cantidad-producto');
        const botonesCantidad = document.querySelectorAll('.cantidad-btn');

        botonesCantidad.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.closest('.cantidad-btn').dataset.action;
                this.actualizarCantidad(action);
            });
        });

        if (cantidadInput) {
            cantidadInput.addEventListener('change', (e) => {
                let valor = parseInt(e.target.value);
                const max = parseInt(e.target.max);
                const min = parseInt(e.target.min);

                if (isNaN(valor) || valor < min) valor = min;
                if (valor > max) valor = max;

                e.target.value = valor;
                this.actualizarEstadoBotonesCantidad();
            });

            cantidadInput.addEventListener('input', (e) => {
                // Validar en tiempo real
                let valor = parseInt(e.target.value);
                const max = parseInt(e.target.max);

                if (valor > max) {
                    e.target.value = max;
                }
            });
        }
    }

    actualizarCantidad(action) {
        const cantidadInput = document.getElementById('cantidad-producto');
        if (!cantidadInput) return;

        let cantidad = parseInt(cantidadInput.value);
        const max = parseInt(cantidadInput.max);

        if (action === 'increment' && cantidad < max) {
            cantidad++;
        } else if (action === 'decrement' && cantidad > 1) {
            cantidad--;
        }

        cantidadInput.value = cantidad;
        this.actualizarEstadoBotonesCantidad();
    }

    actualizarEstadoBotonesCantidad() {
        const cantidadInput = document.getElementById('cantidad-producto');
        const btnDecremento = document.querySelector('.cantidad-btn[data-action="decrement"]');
        const btnIncremento = document.querySelector('.cantidad-btn[data-action="increment"]');

        if (!cantidadInput || !btnDecremento || !btnIncremento) return;

        const cantidad = parseInt(cantidadInput.value);
        const max = parseInt(cantidadInput.max);

        btnDecremento.disabled = cantidad <= 1;
        btnIncremento.disabled = cantidad >= max;
    }

    configurarEventoAgregarCarrito() {
        const btnAgregar = document.getElementById('btn-agregar-carrito');

        if (btnAgregar) {
            btnAgregar.addEventListener('click', async (e) => {
                e.preventDefault();

                if (this.producto.cantidad === 0) return;

                const cantidadInput = document.getElementById('cantidad-producto');
                const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;

                await this.agregarAlCarrito(cantidad);
            });
        }
    }

    async agregarAlCarrito(cantidad = 1) {
        try {
            console.log(`🛒 Agregando producto ${this.productoId} al carrito (cantidad: ${cantidad})`);

            const result = await this.carritoManager.agregarProducto(this.productoId, cantidad);

            if (result.success) {
                this.mostrarNotificacion(`✅ "${this.producto.nombre_producto}" agregado al carrito`, 'success');

                // Animación de confirmación
                const btn = document.getElementById('btn-agregar-carrito');
                if (btn) {
                    btn.innerHTML = '<span>✅</span><span>Agregado</span>';
                    btn.disabled = true;
                    btn.classList.remove('bg-black', 'hover:bg-gray-800');
                    btn.classList.add('bg-green-600');

                    setTimeout(() => {
                        btn.innerHTML = '<span>🛒</span><span>Añadir al Carrito</span>';
                        btn.disabled = false;
                        btn.classList.remove('bg-green-600');
                        btn.classList.add('bg-black', 'hover:bg-gray-800');
                    }, 2000);
                }
            } else {
                this.mostrarNotificacion(`❌ Error: ${result.error?.details || 'No se pudo agregar al carrito'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            this.mostrarNotificacion('❌ Error al agregar al carrito', 'error');
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Reutilizar la función de notificación de app.js si existe
        if (window.app && typeof window.app.mostrarNotificacion === 'function') {
            window.app.mostrarNotificacion(mensaje, tipo);
        } else {
            // Notificación simple alternativa
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

            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 3000);
        }
    }

    mostrarError(mensaje) {
        const loading = document.getElementById('loading-producto');
        const detalle = document.getElementById('producto-detalle');
        const error = document.getElementById('error-producto');

        if (loading) loading.classList.add('hidden');
        if (detalle) detalle.classList.add('hidden');
        if (error) {
            error.classList.remove('hidden');
            const mensajeError = error.querySelector('p.text-red-500');
            if (mensajeError) {
                mensajeError.textContent = mensaje;
            }
        }
    }

    formatearPrecio(precio) {
        if (!precio) return '$0';
        return `$${parseFloat(precio).toLocaleString('es-CO')}`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const productoPage = new ProductoPage();
    productoPage.init();

    // Hacer disponible globalmente para debugging
    window.productoPage = productoPage;
});

// Al final del archivo ProductoPage.js, agregar:
document.addEventListener('carritoActualizado', function(e) {
    console.log('🔄 Carrito actualizado en ProductoPage');
    // Actualizar cualquier estado relacionado con el carrito si es necesario
});