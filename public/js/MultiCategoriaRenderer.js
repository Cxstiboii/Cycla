class MultiCategoriaRenderer{

    constructor(apiBase = 'http://localhost:3000/api'){
        this.apiBase = apiBase;
        this.productoRenderer = new ProductoRenderer(apiBase);
        this.categorias = [
            {id: 1, nombre: "Ropa de ciclismo", containerId : 'categoria-1'},
            {id: 2, nombre: "Partes de Ciclismo", containerId : 'categoria-2'},
            {id: 3, nombre: "Bicicletas", containerId : 'categoria-3'},
        ];
    }

    async cargarTodasCategorias(productosPerCategory = 5){
        console.log(`Cargando las categorias...`)

        const promises = this.categorias.map(categoria => 
            this.cargarCategoria(categoria,productosPerCategory)
        );

        await Promise.all(promises);
        console.log(`Todas las categorias cargadas correctamente`);
    }

    async cargarCategoria(categoria, limit = 5){
        try{
            //Crear contenedor si no existe
            this.crearContenedorCategoria(categoria);

            const productos = await this.productoRenderer.cargarProductosCategoria(
                categoria.id,
                limit, 
                `productos-${categoria.containerId}`
            );

            if(productos.length > 0 && productos[0].categoria_nombre){
                this.actualizarTituloCategoria(categoria.containerId, productos[0].categoria_nombre);
            }

            
        }catch(error){
            console.log(`Error cargando categoria ${categoria.id}`, error);
        }
    }

    crearContenedorCategoria(categoria){
        let container = document.getElementById(categoria.containerId);

        if(!container){
            container = document.createElement(`div`);
            container.id = categoria.containerId;
            container.className = `categoria-section`;

            //Insertar en el DOM (Ajustar la posicion)
            const main = document.querySelector(`main`)  || document.body;
            main.appendChild(container);
        }

         // Estructura básica del contenedor
            container.innerHTML = `
            <h1 class="xl:mx-14 mx-6 mt-20">
                <span class="text-3xl block special-gothic-expanded-one-600 categoria-titulo" id="titulo-${categoria.containerId}">
                    ${categoria.nombre}
                </span>
                <a href="/productos.html?categoria=${categoria.id}" class="text-md font-semibold border-black inline-block hover:border-b-1">
                    Ver más
                </a>
            </h1>
            <section class="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 xl:mx-12 xl:my-0 mx-4 py-2 md:grid md:grid-cols-2 md:gap-12 xl:grid-cols-4 justify-items-center" 
                        id="productos-${categoria.containerId}">
                <div class="cargando">Cargando productos...</div>
            </section>
        `;
    }

    actualizarTituloCategoria(containerId,nombreReal){
        const tituloElement = document.getElementById(`titulo-${containerId}`);
        if(tituloElement){
            tituloElement.textContent = nombreReal;
        }
    }
}