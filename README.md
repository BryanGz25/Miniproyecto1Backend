# Sistema de Gestión de Inventarios para PYMES

Mini Proyecto 1: sistema empresarial con CRUDs completos. El backend usa Node.js, Express, Sequelize y MySQL; el frontend usa React y Vite, con estilo glassmorphism.
Este proyecto **no** incluye autenticación, login, registro ni roles. El foco son los CRUDs.

- Justificación y modelo entidad-relación: [docs/dia1-entregable.md](docs/dia1-entregable.md)

## Qué hace

| Sección | Qué permite |
|---|---|
| Resumen | Valor del inventario, productos por reponer y últimos movimientos |
| Productos | CRUD con categoría, proveedor, precios y stock con alerta de mínimo |
| Categorías | CRUD para clasificar productos (no se borra una categoría en uso) |
| Proveedores | CRUD de proveedores; al borrar uno, sus productos quedan sin proveedor |
| Movimientos | Entradas, salidas y ajustes que actualizan el stock automáticamente |

## Requisitos

- Node.js 20 o superior
- MySQL 8

## Puesta en marcha

Abre dos terminales, una para el backend y otra para el frontend.

**1. Backend** (http://localhost:3000/api)

```bash
cd backend
npm install
cp .env.example .env        # completa DB_USER y DB_PASSWORD
npm run db:create           # crea la base inventario_pymes
npm run db:migrate          # crea las tablas
npm run db:seed             # opcional: carga datos de ejemplo
npm run dev
```

**2. Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

En desarrollo, Vite redirige `/api` al backend, así que no hay que configurar CORS ni URLs.

## API REST

Las 4 entidades tienen los mismos 5 endpoints:

| Método | Ruta | Respuesta |
|---|---|---|
| POST | `/api/<recurso>` | 201 con el registro creado |
| GET | `/api/<recurso>` | 200 con el arreglo |
| GET | `/api/<recurso>/:id` | 200, o 404 si no existe |
| PUT | `/api/<recurso>/:id` | 200 con el registro actualizado |
| DELETE | `/api/<recurso>/:id` | 200 |

Recursos: `categorias`, `proveedores`, `productos` y `movimientos` (este último acepta `?productoId=` para filtrar).

**Errores:** 400 datos inválidos (con `detalles`), 404 no existe, 409 duplicado, stock insuficiente o registro en uso, 500 error interno.

Hay peticiones de ejemplo en [backend/pruebas.http](backend/pruebas.http).

## Estructura

```
backend/src/
├── config/        conexión a MySQL (lee .env)
├── database/      migraciones y seeders
├── models/        modelos Sequelize y relaciones
├── controllers/   lógica CRUD y validaciones
├── routes/        rutas /api/<recurso>
├── middlewares/   404 y errores centralizados
└── app.js · server.js

frontend/src/
├── components/    tabla, modal, confirmación, formularios, menú
├── pages/         una vista por entidad + resumen
├── services/      llamadas a la API (fetch)
├── hooks/         useCrud, useFormulario, useRuta
├── styles/        tokens y estilos glass
└── utils/         formato de colones, fechas y stock
```

## Comandos usados para crear el backend

```bash
npm init -y
npm install express sequelize mysql2 dotenv cors
npm install --save-dev sequelize-cli nodemon
npx sequelize-cli model:generate --name Categoria --attributes nombre:string,descripcion:string
npx sequelize-cli model:generate --name Proveedor --attributes nombre:string,identificacion:string,telefono:string,email:string,direccion:string,activo:boolean
npx sequelize-cli model:generate --name Producto --attributes sku:string,nombre:string,descripcion:string,precioCosto:decimal,precioVenta:decimal,stockActual:integer,stockMinimo:integer,categoriaId:integer,proveedorId:integer,activo:boolean
npx sequelize-cli model:generate --name MovimientoStock --attributes productoId:integer,tipo:enum,cantidad:integer,costoUnitario:decimal,motivo:string,fecha:date
npx sequelize-cli db:migrate
```
