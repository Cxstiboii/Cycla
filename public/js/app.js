const app = {
    init(){
        console.log(`Inicializando la aplicacion...`);

        this.inicializarRenders();
        this.cargarLandingPage();
        this.inicializarEventoGlobales();

    },

    inicializarRenders(){
        //Renderer para solo una categoria
        this.productoRenderer = new ProductoRenderer();

        //Rendererer para multiples categorias
        this.multiCategoriaRenderer = new MultiCategoriaRenderer();
    },

    async cargarLandingPage(){
        try{
             // Opción 1: Cargar una sola categoría
            // await this.productoRenderer.cargarProductosCategoria(1, 5, 'productos-container');
            
            // Opción 2: Cargar todas las categorías
            await this.multiCategoriaRenderer.cargarTodasCategorias(5);

        }catch(error){
            console.log(`Error inicializando landing page`, error);
        }    
    },

    inicializarEventoGlobales(){
        //Eventos de la compra
        document.addEventListener(`click`,(e) => {
            //Botones de compra
            if(e.target.classList.contains(`comprar-btn`)){
                this.comprarProducto(
                    e.target.dataset.productoId,
                    e.target.dataset.productoNombre
                );
            }

            if (e.target.classList.contains(`favorito-btn`)) {
                this.toggleFavorito(e.target.dataset.productoId);
            }
        })
    },

    comprarProducto(productoId, productoNombre){
        console.log(`Añadiendo al carrito: ${productoNombre} (ID: ${productoId})`);
        //Aqui la logica del carrito 
        this.mostrarNotificacion(`${productoNombre} añadido al carrito`);
    },

    toggleFavorito(productoId){
        console.log(`Toggle favorito producto : ${productoId}`);
    },

    mostrarNotificacion(mensaje){
        //Se puede implementar notificaciones en esta funcion
        alert(mensaje)
    },

    recargarProductos(){
        this.cargarLandingPage();
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Hacer disponible globalmente
window.app = app;