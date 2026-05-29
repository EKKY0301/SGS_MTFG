# Arquitectura del Frontend - SGS

Version pensada para documentacion academica. Se prioriza claridad visual sobre detalle de implementacion.

## Diagrama general de arquitectura

```mermaid
flowchart TB
    user[Usuario]

    subgraph presentation[Capa de presentacion]
        router[Next.js App Router]
        pages[Paginas y layouts]
        ui[Componentes de interfaz]
        router --> pages --> ui
    end

    subgraph application[Capa de aplicacion]
        providers[Providers y gestion de estado]
        auth[Control de sesion y autenticacion]
        modules[Modulos funcionales\nSocios, eventos, documentos, configuracion]
        providers --> auth
        providers --> modules
    end

    subgraph services[Capa de servicios]
        domain[Servicios de dominio]
        shared[Servicios compartidos y utilidades HTTP]
        domain --> shared
    end

    subgraph integration[Capa de integracion]
        api[API del backend NestJS]
        db[(PostgreSQL)]
        api --> db
    end

    user --> router
    ui --> providers
    auth --> domain
    modules --> domain
    shared --> api

    classDef actor fill:#f5efe6,stroke:#7a5c3e,color:#2b2118,stroke-width:1.5px;
    classDef layer fill:#eef3f8,stroke:#4c6a88,color:#13202d,stroke-width:1.2px;
    classDef data fill:#edf6ee,stroke:#567a5b,color:#16311a,stroke-width:1.2px;

    class user actor;
    class router,pages,ui,providers,auth,modules,domain,shared,api layer;
    class db data;
```

## Flujo funcional resumido

```mermaid
flowchart LR
    page[Pagina del sistema] --> component[Componente de interfaz]
    component --> state[Estado global o provider]
    state --> service[Servicio de dominio]
    service --> backend[Backend NestJS]
    backend --> database[(Base de datos)]
```

## Alcance del diagrama

- La capa de presentacion concentra navegacion, vistas y componentes reutilizables.
- La capa de aplicacion coordina estado global, sesion y logica funcional del frontend.
- La capa de servicios encapsula el acceso a datos y la comunicacion con el backend.
- La capa de integracion representa los sistemas externos consumidos por el frontend.

## Referencias internas

- Rutas y layouts: app/README.md
- Catalogo de componentes: components/README.md
- Servicios del frontend: services/README.md
