class ProductoRenderer {
    constructor(apiBase = 'http://localhost:3000/api') {
        this.apiBase = apiBase;

        // ✅ Esto YA lo tienes - perfecto!
        this.productosDestacados = {
            1: [1, 3, 4, 5],      // Ropa de Ciclismo
            2: [10, 12, 18, 20],  // Partes de Ciclismo  
            3: [39, 40, 43, 44]   // Bicicletas
        };
    }

    async cargarProductosCategoria(categoriaId = 1, limit = 4, containerId = 'productos-container') {
        try {
            console.log(`🔄 Cargando productos destacados de categoría ${categoriaId}...`);
            
            // 🆕 CAMBIO: Quitar ?limit=${limit} para obtener TODOS
            const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const todosProductos = await response.json();
            
            // 🆕 CAMBIO: Filtrar por tus IDs destacados
            const productosDestacadosIds = this.productosDestacados[categoriaId] || [];
            const productosFiltrados = todosProductos.filter(producto => 
                productosDestacadosIds.includes(producto.id)
            ).slice(0, limit); // Limitar a 4 productos como tienes
            
            console.log(`✅ ${productosFiltrados.length} productos destacados cargados`);
            
            this.renderizarProductos(productosFiltrados, containerId);
            return productosFiltrados;
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            
            // 🆕 CAMBIO: Usar fallback
            await this.cargarProductosNormales(categoriaId, limit, containerId);
            return [];
        }
    }

    // 🆕 MÉTODO NUEVO: Fallback
    async cargarProductosNormales(categoriaId, limit, containerId) {
        try {
            const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}?limit=${limit}`);
            const productos = await response.json();
            this.renderizarProductos(productos, containerId);
        } catch (error) {
            this.mostrarError(containerId);
        }
    }

    // ✅ El resto de tus métodos se mantienen IGUAL
    renderizarProductos(productos, containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Contenedor #${containerId} no encontrado`);
            return;
        }

        if (!productos || productos.length === 0) {
            container.innerHTML = '<div class="text-center py-8">No hay productos disponibles</div>';
            return;
        }

        const tituloElement = document.getElementById('categoria-titulo');
        if (tituloElement && productos.length > 0 && productos[0].categoria_nombre) {
            tituloElement.textContent = productos[0].categoria_nombre;
        }

        container.innerHTML = productos.map(producto => this.crearCardProducto(producto)).join('');
    }

    crearCardProducto(producto) {
        const esMasVendido = producto.cantidad > 50;

        return `
            <div class="snap-start flex-shrink-0 xl:w-auto w-max max-w-sm rounded-2xl bg-white border-gray-300 shadow-lg p-4 border-1">
                <div class="bg-gray-200 rounded-2xl p-4">
                    <div class="flex justify-between items-center">
                        ${esMasVendido ? 
                            '<span class="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">Más Vendido</span>' : 
                            '<span class="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">Nuevo</span>'
                        }
                        <button class="text-red-500 hover:text-red-700 transition favorito-btn" data-producto-id="${producto.id}">
                            ♥️
                        </button>
                    </div>
                    <div class="mt-4">
                        ${this.obtenerImagenProducto(producto)}
                    </div>
                </div>
                <h3 class="text-gray-800 font-bold text-lg special-gothic-expanded-one-regular mt-4">${producto.nombre_producto}</h3>
                <p class="text-gray-500">$${this.formatearPrecio(producto.precio_unitario)}</p>
                <p class="text-sm text-gray-600">Stock: ${producto.cantidad} unidades</p>
                
                <button class="w-full mt-4 bg-black text-white py-2 rounded-full hover:bg-gray-800 transition comprar-btn" 
                        data-producto-id="${producto.id}" data-producto-nombre="${producto.nombre_producto}">
                    Comprar
                </button>
            </div>
        `;
    }

    obtenerImagenProducto(producto) {
        if (producto.imagen_url) {
            return `<img src="${producto.imagen_url}" alt="${producto.nombre_producto}" class="w-full h-48 object-contain" onerror="this.src='/assets/placeholder.jpg'">`;
        }
        
        const imagenesMap = {
            'Maillot Profesional Manga Corta': '/assets/Ropa de Ciclismo/Maillot_Manga_Corta.png',
            'Chaqueta Impermeable': '/assets/Ropa de Ciclismo/Chaqueta_impermeable.png',
            'Guantes de Ciclismo con Gel': '/assets/Ropa de Ciclismo/guantes-ejemplo.png',
        };
        
        const imagen = imagenesMap[producto.nombre_producto] || '/assets/Camisetas/Camisa_Uno_Anverso-removebg-preview.png';
        return `<img src="${imagen}" alt="${producto.nombre_producto}" class="w-full h-48 object-contain">`;
    }

    formatearPrecio(precio) {
        return parseFloat(precio).toLocaleString('es-CO');
    }

    mostrarError(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Error cargando productos. Verifica la conexión.</p>
                    <button onclick="app.recargarProductos()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}