# Components

Documentacion tecnica de los componentes reutilizables del frontend.

## Objetivo

Esta carpeta contiene componentes de UI y piezas reutilizables usadas por las paginas dentro de `app/`.

## Estructura general

- `Inputs/`: campos base para formularios.
- `Lists/`: tablas/listados, filtros y paginacion.
- `modal/`: contenedores y templates de modales.
- `ScrollTabs/`: tabs con navegacion por secciones.
- `TabbedContainer/`: contenedor de tabs por indice.
- `config/`: componentes especificos del modulo de configuracion.
- componentes raiz: layout/nav/autenticacion.

## Catalogo de componentes

### Componentes raiz

- `Login.tsx`: formulario de login. Usa `useSessionContext` para iniciar sesion y mostrar errores.
- `Navbar.tsx`: barra superior principal.
- `NavbarTabs.tsx`: unidad visual de tab para navbar.
- `Sidebar.tsx`: menu lateral de navegacion para modulo interno.
- `ScrollArea.tsx`: wrapper con scroll estilizado.
- `textWithLabel.tsx`: helper para renderizar texto con etiqueta.

### Inputs

- `Inputs/TextInput.tsx`: input de texto reutilizable.
- `Inputs/Select.tsx`: select reutilizable.

### Lists

- `Lists/List.tsx`: listado generico tipado para tablas.
- `Lists/ListUnit.tsx`: unidad/estructura para filas o celdas de lista.
- `Lists/Paginator.tsx`: controles de paginacion por pagina.
- `Lists/Filters.tsx`: formulario de filtros dinamicos por definicion.
- `Lists/EJEMPLO_USO_FILTERS.tsx`: ejemplo de integracion de `Filters` con `List`.

### Modales

- `modal/modalContainer.tsx`: contenedor base de modal (titulo + contenido + control open/close).
- `modal/FormModalTemplate.tsx`: template de contenido para formularios en modal.
- `modal/ConfirmationModalTemplate.tsx`: modal de confirmacion reutilizable.

### Tabs y navegacion por secciones

- `ScrollTabs/ScrollTabs.tsx`: orquestador principal de tabs con secciones.
- `ScrollTabs/ScrollTabsHeader.tsx`: cabecera/navegacion de tabs.
- `ScrollTabs/ScrollTabsContent.tsx`: contenido asociado a tabs.
- `ScrollTabs/TabSection.tsx`: seccion individual dentro de tabs.
- `TabbedContainer/index.tsx`: tabs por indice con callback `onTabChange`.

### Configuracion

- `config/GroupContainer.tsx`: contenedor para gestion de grupos (crear/editar/listar).

## Convenciones recomendadas

- Mantener componentes presentacionales separados de llamadas a servicios cuando sea posible.
- Tipar props con interfaces o types explicitos.
- Evitar logica de negocio pesada dentro de componentes de UI.
- Reusar `Inputs`, `Lists` y `modal` antes de crear componentes nuevos.

## Como agregar un componente nuevo

1. Crear archivo en la subcarpeta apropiada.
2. Definir props tipadas.
3. Agregar test en `tests/components` o carpeta equivalente.
4. Actualizar este README con una linea de descripcion.
5. Si se comparte entre modulos, evitar nombres acoplados a una sola pagina.
