class ProductoRenderer {
    constructor(apiBase = 'http://localhost:3000/api') {
        this.apiBase = apiBase;
        
        //
        this.productosDestacados = {
            1: [1, 3, 4, 5],      // Ropa de Ciclismo
            2: [13, 2, 10, 11],  // Partes de Ciclismo  
            3: [39, 40, 43, 44]   // Bicicletas
        };


        // 🆕 Mapa de imágenes por defecto como fallback
        this.imagenesDefault = {
            'Maillot Profesional Manga Corta': '/assets/Ropa de Ciclismo/Maillot_Manga_Corta.png',
            'Chaqueta Impermeable': '/assets/Ropa de Ciclismo/Chaqueta_impermeable.png',
            'Guantes de Ciclismo con Gel': '/assets/Ropa de Ciclismo/guantes-ejemplo.png',
            
        };
    }

    async cargarProductosCategoria(categoriaId = 1, limit = 12, containerId = 'productos-container') {
    try {
        console.log(`🔄 Cargando productos de categoría ${categoriaId}...`);
        
        const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const todosProductos = await response.json();
        
        console.log(`📦 Productos encontrados:`, 
            todosProductos.map(p => ({ id: p.id, nombre: p.nombre_producto })));
        
        // 🆕 MOSTRAR TODOS los productos (hasta el límite)
        const productosAMostrar = todosProductos.slice(0, limit);
        
        console.log(`✅ ${productosAMostrar.length} productos a mostrar:`, 
            productosAMostrar.map(p => p.id));
        
        this.renderizarProductos(productosAMostrar, containerId);
        return productosAMostrar;
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        await this.cargarProductosNormales(categoriaId, limit, containerId);
        return [];
    }
}

    // 🆕 MÉTODO MEJORADO: Fallback con IDs específicos
    async cargarProductosNormales(categoriaId, limit, containerId) {
        try {
            console.log(`🔄 Usando fallback para categoría ${categoriaId}...`);
            
            // Intentar cargar productos destacados por IDs específicos
            const productosDestacadosIds = this.productosDestacados[categoriaId] || [];
            if (productosDestacadosIds.length > 0) {
                const productos = await this.cargarProductosPorIds(productosDestacadosIds);
                if (productos.length > 0) {
                    this.renderizarProductos(productos.slice(0, limit), containerId);
                    return productos;
                }
            }
            
            // Si no funciona, cargar productos normales de la categoría
            const response = await fetch(`${this.apiBase}/productos/categoria/${categoriaId}?limit=${limit}`);
            const productos = await response.json();
            this.renderizarProductos(productos, containerId);
            return productos;
            
        } catch (error) {
            this.mostrarError(containerId);
            return [];
        }
    }

    // 🆕 MÉTODO: Cargar productos por IDs específicos
    async cargarProductosPorIds(ids) {
        try {
            const response = await fetch(`${this.apiBase}/productos/ids?ids=${ids.join(',')}`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error cargando productos por IDs:', error);
            return [];
        }
    }

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
        return `
        <img src="${producto.imagen_url}" alt="${producto.nombre_producto}" 
        class="w-full h-48 object-contain"  // ← Cambié h-50 por h-48 para consistencia
        onerror="this.src='${this.getImagenFallback(producto)}'">`;
    }

    const imagenDefault = this.getImagenFallback(producto);
    return `
    <img src="${imagenDefault}" alt="${producto.nombre_producto}"
    class="w-full h-48 object-contain">`;
}
    getImagenFallback(producto){
        return this.imagenesDefault[producto.nombre_producto] || '/assets/placeholder.jpg';
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