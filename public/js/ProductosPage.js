class ProductosPage {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.productoRenderer = new ProductoRenderer(this.apiBase);
        this.categoriaId = null;
        this.categorias = {
            1: { nombre: 'Ropa de Ciclismo', slug: 'ropa-ciclismo' },
            2: { nombre: 'Partes de Ciclismo', slug: 'partes-ciclismo' },
            3: { nombre: 'Bicicletas', slug: 'bicicletas' }
        };
    }

    async init() {
        console.log('🔄 Inicializando página de productos...');

        try {
            // Obtener categoría de la URL
            this.obtenerCategoriaDeURL();

            // Cargar productos de la categoría
            await this.cargarProductosCategoria();

            // Actualizar UI
            this.actualizarTituloYCrumbs();

            console.log('✅ Página de productos inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando página de productos:', error);
            this.mostrarError('Error al cargar los productos');
        }
    }

    obtenerCategoriaDeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.categoriaId = parseInt(urlParams.get('categoria')) || 1;

        console.log('🔍 Categoría obtenida:', this.categoriaId);
    }

    async cargarProductosCategoria() {
        try {
            console.log(`📦 Cargando productos de categoría ${this.categoriaId}...`);

            // Cargar muchos más productos (20 en lugar de 4)
            await this.productoRenderer.cargarProductosCategoria(
                this.categoriaId,
                20, // Más productos para la página completa
                'productos-container'
            );

        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.mostrarError('No se pudieron cargar los productos');
        }
    }

    actualizarTituloYCrumbs() {
        const categoria = this.categorias[this.categoriaId];

        // Actualizar título
        const tituloElement = document.getElementById('titulo-categoria');
        if (tituloElement && categoria) {
            tituloElement.textContent = categoria.nombre;
        }

        // Actualizar breadcrumb
        const breadcrumbElement = document.getElementById('breadcrumb-categoria');
        if (breadcrumbElement && categoria) {
            breadcrumbElement.textContent = categoria.nombre;
        }

        // Actualizar título de la página
        if (categoria) {
            document.title = `${categoria.nombre} - Cycla`;
        }
    }

    mostrarError(mensaje) {
        const container = document.getElementById('productos-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <p class="text-red-500 text-lg font-semibold mb-2">${mensaje}</p>
                    <p class="text-gray-600 mb-4">Intenta recargar la página</p>
                    <button onclick="window.location.reload()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition font-semibold">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const productosPage = new ProductosPage();
    productosPage.init();

    // Hacer disponible globalmente para debugging
    window.productosPage = productosPage;
});