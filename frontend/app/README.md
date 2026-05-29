# App Pages

Documentacion de rutas y paginas para el App Router de Next.js.

## Objetivo

Esta carpeta define las rutas del frontend (`page.tsx`) y la composicion por layouts (`layout.tsx`).

## Archivos base

- `layout.tsx`: layout raiz de toda la app.
- `providers.tsx`: proveedores globales (contextos).
- `page.tsx`: entry principal (`/`).
- `login/page.tsx`: login (`/login`).

## Layouts por modulo

- `nikkai/layout.tsx`: layout principal del area interna.
- `nikkai/member/layout.tsx`: layout del modulo de socios.
- `nikkai/member/add/layout.tsx`: layout del flujo de alta de socio.
- `nikkai/member/detail/layout.tsx`: layout del flujo de detalle/edicion de socio.
- `nikkai/event/layout.tsx`: layout del modulo de eventos.

## Mapa de rutas (pages)

### Publicas

- `/` -> `app/page.tsx`
- `/login` -> `app/login/page.tsx`

### Nikkai - Home

- `/nikkai/home` -> `app/nikkai/home/page.tsx`

### Nikkai - Socios (`member`)

- `/nikkai/member` -> `app/nikkai/member/page.tsx`
- `/nikkai/member/list` -> `app/nikkai/member/list/page.tsx`
- `/nikkai/member/contribution` -> `app/nikkai/member/contribution/page.tsx`

#### Alta de socio

- `/nikkai/member/add` -> `app/nikkai/member/add/page.tsx`
- `/nikkai/member/add/principal` -> `app/nikkai/member/add/principal/page.tsx`
- `/nikkai/member/add/partner` -> `app/nikkai/member/add/partner/page.tsx`
- `/nikkai/member/add/parients` -> `app/nikkai/member/add/parients/page.tsx`
- `/nikkai/member/add/children` -> `app/nikkai/member/add/children/page.tsx`
- `/nikkai/member/add/confirmation` -> `app/nikkai/member/add/confirmation/page.tsx`

#### Detalle de socio

- `/nikkai/member/detail` -> `app/nikkai/member/detail/page.tsx`
- `/nikkai/member/detail/principal` -> `app/nikkai/member/detail/principal/page.tsx`
- `/nikkai/member/detail/partner` -> `app/nikkai/member/detail/partner/page.tsx`
- `/nikkai/member/detail/parients` -> `app/nikkai/member/detail/parients/page.tsx`
- `/nikkai/member/detail/children` -> `app/nikkai/member/detail/children/page.tsx`

### Nikkai - Eventos (`event`)

- `/nikkai/event` -> `app/nikkai/event/page.tsx`
- `/nikkai/event/list` -> `app/nikkai/event/list/page.tsx`
- `/nikkai/event/add` -> `app/nikkai/event/add/page.tsx`
- `/nikkai/event/calendar` -> `app/nikkai/event/calendar/page.tsx`
- `/nikkai/event/detail` -> `app/nikkai/event/detail/page.tsx`
- `/nikkai/event/detail/[id]` -> `app/nikkai/event/detail/[id]/page.tsx`

### Nikkai - Calendario

- `/nikkai/calendar` -> `app/nikkai/calendar/page.tsx`
- `/nikkai/calendar/add` -> `app/nikkai/calendar/add/page.tsx`
- `/nikkai/calendar/events` -> `app/nikkai/calendar/events/page.tsx`
- `/nikkai/calendar/rents` -> `app/nikkai/calendar/rents/page.tsx`

### Nikkai - Documentos

- `/nikkai/documents` -> `app/nikkai/documents/page.tsx`
- `/nikkai/documents/regulations` -> `app/nikkai/documents/regulations/page.tsx`
- `/nikkai/documents/institutional-records` -> `app/nikkai/documents/institutional-records/page.tsx`

### Nikkai - Configuracion

- `/nikkai/config` -> `app/nikkai/config/page.tsx`
- `/nikkai/config/audit` -> `app/nikkai/config/audit/page.tsx`

## Reglas para nuevas paginas

1. Toda ruta nueva debe tener su `page.tsx` en la carpeta correcta.
2. Si comparte navegacion/estado comun, usar o extender un `layout.tsx` del modulo.
3. Para rutas protegidas, integrar el mecanismo de guardado/autorizacion ya usado en `nikkai`.
4. Agregar tests de pagina (o de componentes usados por la pagina).
5. Actualizar este README cuando se agregue o elimine una ruta.
