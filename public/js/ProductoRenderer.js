class ProductoRenderer {
    constructor(apiBase = 'http://localhost:3000/api') {
        this.apiBase = apiBase;

        // Productos específicos que queremos mostrar
        this.productosDestacados = {
            1: [1, 3, 4, 6],      // Ropa de Ciclismo: Maillot, Guantes, Chaqueta, Casco
            2: [13, 2, 10, 11],   // Partes de Ciclismo: Bidón, Sillín, GPS, Portabidones
            3: [39, 40, 43, 44]   // Bicicletas: Carretera, MTB, Triatlón, Gravel
        };

        // Mapa de imágenes por defecto como fallback
        this.imagenesDefault = {
            'Maillot Profesional Manga Corta': '/assets/productos/ropa-ciclismo/maillotProfesionaMangaCorta.png',
            'Guantes de Ciclismo con Gel': '/assets/productos/ropa-ciclismo/guantesCiclismoConGel.png',
            'Chaqueta Impermeable': '/assets/productos/ropa-ciclismo/chaquetaImpermeable.png',
            'Casco Aero Profesional': '/assets/productos/ropa-ciclismo/cascoAeroProfesional.png',
            'Sillin de Competición': '/assets/productos/partes-ciclismo/sillinDeCompeticion.png',
            'Bidón Deportivo 750ml': '/assets/productos/partes-ciclismo/bidonDeportivo.png',
            'Computadora GPS Ciclocomputador': '/assets/productos/partes-ciclismo/computadoraGpsCiclocomputador.png',
            'Portabidones Carbono': '/assets/productos/partes-ciclismo/portabidonesCarbono.png',
            'Bicicleta de Carretera Carbono': '/assets/productos/bicicletas/bicicletaDeCarreteraCarbono.png'
        };

        // Inicializar el carrito
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    async cargarProductosCategoria(categoriaId = 1, limit = 4, containerId = 'productos-container') {
        try {
            console.log(`🔄 Cargando ${limit} productos de categoría ${categoriaId}...`);
            console.log(`📡 URL: ${this.apiBase}/productos/categoria/${categoriaId}?limit=${limit}`);

            const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}?limit=${limit}`);

            console.log(`📊 Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const productos = await response.json();
            console.log(`📦 ${productos.length} productos recibidos para categoría ${categoriaId}`);

            this.renderizarProductos(productos, containerId);
            return productos;

        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            // Fallback: usar productos destacados
            return await this.cargarProductosDestacados(categoriaId, limit, containerId);
        }
    }

    // Método fallback con productos destacados
    async cargarProductosDestacados(categoriaId, limit, containerId) {
        try {
            console.log(`🔄 Usando productos destacados para categoría ${categoriaId}...`);

            const productosDestacadosIds = this.productosDestacados[categoriaId] || [];
            if (productosDestacadosIds.length === 0) {
                throw new Error('No hay productos destacados para esta categoría');
            }

            // Cargar todos los productos de la categoría y filtrar
            const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}?limit=20`);
            if (!response.ok) {
                throw new Error('Error cargando productos para filtrado');
            }

            const todosProductos = await response.json();
            const productosFiltrados = todosProductos.filter(producto =>
                productosDestacadosIds.includes(producto.id)
            ).slice(0, limit);

            console.log(`🎯 ${productosFiltrados.length} productos destacados cargados`);

            this.renderizarProductos(productosFiltrados, containerId);
            return productosFiltrados;

        } catch (error) {
            console.error('❌ Error cargando productos destacados:', error);
            this.mostrarError(containerId, 'No se pudieron cargar los productos');
            return [];
        }
    }

    renderizarProductos(productos, containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`❌ Contenedor #${containerId} no encontrado`);
            return;
        }

        if (!productos || productos.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">😔</div>
                    <p class="text-gray-500 text-lg">No hay productos disponibles</p>
                    <p class="text-gray-400 text-sm mt-2">Intenta recargar la página</p>
                </div>
            `;
            return;
        }

        console.log(`🎨 Renderizando ${productos.length} productos en #${containerId}`);

        container.innerHTML = productos.map(producto => this.crearCardProducto(producto)).join('');

        // Agregar event listeners para los botones de compra
        this.inicializarEventosProductos(containerId);
    }

    crearCardProducto(producto) {
        const esMasVendido = producto.cantidad > 50;
        const esStockBajo = producto.cantidad < 10;
        const precioFormateado = this.formatearPrecio(producto.precio_unitario);

        return `
            <div class="snap-start flex-shrink-0 w-72 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-4 group">
                <!-- Enlace en toda la tarjeta -->
                <a href="/producto.html?id=${producto.id}" class="block cursor-pointer">
                    <div class="bg-gray-100 rounded-2xl p-4 relative group-hover:bg-gray-200 transition-colors duration-300">
                        <div class="flex justify-between items-center mb-2">
                            ${esMasVendido ?
            '<span class="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-semibold">🔥 Más Vendido</span>' :
            '<span class="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">🆕 Nuevo</span>'
        }
                            <button class="text-gray-400 hover:text-red-500 transition favorito-btn" 
                                    data-producto-id="${producto.id}"
                                    title="Añadir a favoritos"
                                    onclick="event.preventDefault(); event.stopPropagation();">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </button>
                        </div>
                        
                        ${esStockBajo ?
            '<span class="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">⚠️ Últimas unidades</span>' :
            ''
        }
                        
                        <div class="mt-4 flex justify-center items-center h-48">
                            ${this.obtenerImagenProducto(producto)}
                        </div>
                    </div>
                    
                    <div class="mt-4 space-y-2">
                        <h3 class="text-gray-800 font-bold text-lg special-gothic-expanded-one-regular leading-tight min-h-[3rem] group-hover:text-blue-600 transition-colors">
                            ${producto.nombre_producto}
                        </h3>
                        <p class="text-2xl font-bold text-gray-900">${precioFormateado}</p>
                        
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-600 ${esStockBajo ? 'text-red-500 font-semibold' : ''}">
                                ${esStockBajo ? 'Solo ' : ''}${producto.cantidad} unidades
                            </span>
                            <span class="text-gray-400">Código: ${producto.id}</span>
                        </div>
                    </div>
                </a>
                
                <button class="w-full mt-4 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition font-semibold comprar-btn" 
                        data-producto-id="${producto.id}" 
                        data-producto-nombre="${producto.nombre_producto}"
                        data-producto-precio="${producto.precio_unitario}"
                        onclick="event.stopPropagation();">
                    🛒 Añadir al Carrito
                </button>
            </div>
        `;
    }

    obtenerImagenProducto(producto) {
        if (producto.imagen_url) {
            return `
                <img src="${producto.imagen_url}" 
                     alt="${producto.nombre_producto}" 
                     class="max-w-full max-h-48 object-contain transition-transform group-hover:scale-105 duration-300"
                     onerror="this.src='${this.getImagenFallback(producto)}'"
                     loading="lazy">
            `;
        }

        const imagenDefault = this.getImagenFallback(producto);
        return `
            <img src="${imagenDefault}" 
                 alt="${producto.nombre_producto}"
                 class="max-w-full max-h-48 object-contain transition-transform group-hover:scale-105 duration-300"
                 loading="lazy">
        `;
    }

    getImagenFallback(producto) {
        return this.imagenesDefault[producto.nombre_producto] || '/assets/placeholder.jpg';
    }

    inicializarEventosProductos(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Event listeners para botones de compra
        container.querySelectorAll('.comprar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productoId = btn.getAttribute('data-producto-id');
                const productoNombre = btn.getAttribute('data-producto-nombre');
                const productoPrecio = parseFloat(btn.getAttribute('data-producto-precio'));

                this.agregarAlCarrito({
                    id: productoId,
                    nombre: productoNombre,
                    precio: productoPrecio,
                    cantidad: 1
                });
            });
        });

        // Event listeners para botones de favoritos
        container.querySelectorAll('.favorito-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productoId = btn.getAttribute('data-producto-id');
                this.agregarAFavoritos(productoId);
            });
        });

        console.log(`🎯 Eventos de productos inicializados para #${containerId}`);
    }

    agregarAlCarrito(producto) {
        // Verificar si el producto ya está en el carrito
        const productoExistente = this.carrito.find(item => item.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            this.carrito.push(producto);
        }

        // Guardar en localStorage
        this.guardarCarrito();

        // Mostrar notificación
        this.mostrarNotificacion(`✅ "${producto.nombre}" agregado al carrito`);

        // Actualizar contador del carrito si existe
        this.actualizarContadorCarrito();

        console.log('🛒 Producto agregado:', producto);
    }

    agregarAFavoritos(productoId) {
        let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

        if (!favoritos.includes(productoId)) {
            favoritos.push(productoId);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            this.mostrarNotificacion('❤️ Producto agregado a favoritos');
        } else {
            this.mostrarNotificacion('⚠️ El producto ya está en favoritos');
        }
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    actualizarContadorCarrito() {
        const contador = document.querySelector('.carrito-contador');
        if (contador) {
            const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    mostrarNotificacion(mensaje) {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
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
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    formatearPrecio(precio) {
        if (!precio) return '$0';
        return `$${parseFloat(precio).toLocaleString('es-CO')}`;
    }

    mostrarError(containerId, mensaje = 'Error cargando productos') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <p class="text-red-500 text-lg font-semibold mb-2">${mensaje}</p>
                    <p class="text-gray-600 mb-4">Verifica tu conexión a internet</p>
                    <button onclick="window.location.reload()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition font-semibold">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Método para obtener el carrito
    obtenerCarrito() {
        return this.carrito;
    }

    // Método para limpiar el carrito
    limpiarCarrito() {
        this.carrito = [];
        this.guardarCarrito();
        this.actualizarContadorCarrito();
    }

    // Método para debug
    debug() {
        console.log('🔍 Debug ProductoRenderer:', {
            apiBase: this.apiBase,
            productosDestacados: this.productosDestacados,
            imagenesDefault: this.imagenesDefault,
            carrito: this.carrito
        });
    }
}