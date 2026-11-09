# Sistema de Gestión de Inventarios para PYMES

Mini Proyecto 1: sistema empresarial con **20 tablas relacionadas, 20 CRUDs completos** y autenticación JWT. El backend usa Node.js, Express, Sequelize y MySQL; el frontend usa React, React Router y Vite, con estilo glassmorphism.

- Día 1 · justificación empresarial: [docs/dia1-entregable.md](docs/dia1-entregable.md)
- **Modelo entidad-relación de las 20 tablas:** [docs/modelo-er.md](docs/modelo-er.md)
- Día 2 · investigación sobre JWT: [docs/investigacion-jwt.md](docs/investigacion-jwt.md)
- Colección de pruebas (Postman / Thunder Client): [docs/postman/inventario.postman_collection.json](docs/postman/inventario.postman_collection.json)

## Qué hace

Tras iniciar sesión, la administración tiene **20 CRUDs** agrupados por área. Cada uno incluye tabla con buscador, formulario en modal (las claves foráneas se eligen en listas desplegables cargadas de la API) y eliminación con confirmación.

| Área | CRUDs |
|---|---|
| Inventario | Productos · Categorías · Marcas · Unidades de medida · Impuestos · Lotes · Movimientos de stock |
| Bodegas | Bodegas · Ubicaciones |
| Compras | Proveedores · Contactos de proveedor · Órdenes de compra · Detalle de órdenes |
| Ventas | Clientes · Métodos de pago · Ventas · Detalle de ventas |
| Personal | Departamentos · Empleados · Usuarios |

Además:
- **Resumen:** valor del inventario, productos por reponer y últimos movimientos.
- **Movimientos** actualizan el stock en una transacción y guardan el usuario y la bodega.
- **Órdenes de compra y ventas** quedan registradas a nombre del usuario que inició sesión.
- **Login / Registro:** sin sesión no se puede entrar a ninguna otra pantalla.

## Requisitos

- Node.js 20 o superior
- MySQL 8

## Variables de entorno (`backend/.env`)

Copia `backend/.env.example` a `backend/.env` y completa:

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `API_PORT` | `3000` | Puerto del backend |
| `DB_HOST`, `DB_PORT` | `127.0.0.1`, `3306` | Servidor MySQL |
| `DB_USER`, `DB_PASSWORD` | `root`, *(tu contraseña)* | Usuario de MySQL |
| `DB_NAME` | `inventario_pymes` | Base de datos (la crea `db:create`) |
| `JWT_SECRET` | 128 caracteres hex | Firma los tokens. **Genera uno propio**, el servidor no arranca sin él |
| `JWT_EXPIRES_IN` | `8h` | Duración de la sesión |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido del frontend |

Para generar el secreto:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`.env` está en `.gitignore`: nunca se sube al repositorio.

## Puesta en marcha rápida

Desde la raíz del proyecto:

```bash
npm run instalar            # instala raíz, backend y frontend
cp backend/.env.example backend/.env   # completa DB_PASSWORD y JWT_SECRET
npm run db:setup            # crea la base, las tablas y los datos de ejemplo
npm run dev                 # levanta backend y frontend juntos
```

Abre http://localhost:5173 y crea una cuenta, o entra con el **usuario demo** del seeder:

- Correo: `demo@inventario.test` (perfil Administrador)
- Contraseña: `Demo12345`

El seeder crea una cuenta por perfil con esa misma contraseña: `supervisor@`, `bodeguero@`, `vendedor@` y `consulta@inventario.test`.

Si ves "No se pudo conectar con el servidor", el backend no está corriendo: revisa en la terminal las líneas `[api]`.

## Puesta en marcha por separado

**1. Backend** (http://localhost:3000/api)

```bash
cd backend
npm install
cp .env.example .env        # completa DB_PASSWORD y JWT_SECRET
npm run db:create           # crea la base inventario_pymes
npm run db:migrate          # crea las tablas (incluida Usuarios)
npm run db:seed             # datos de ejemplo + usuario demo
npm run dev
```

**2. Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

En desarrollo, Vite redirige `/api` al backend, así que no hay que configurar CORS ni URLs.

> **¿Ya tenías el proyecto del Día 1?** Ejecuta `npm run db:migrate` y `npm run db:seed` en `backend/` y agrega `JWT_SECRET` a tu `.env`.

## Autenticación

| Método | Ruta | Acceso | Respuesta |
|---|---|---|---|
| POST | `/api/auth/register` | Público | 201 usuario (sin password) · 400 datos inválidos o correo duplicado |
| POST | `/api/auth/login` | Público | 200 `{ token, usuario }` · 401 credenciales inválidas |
| GET | `/api/auth/me` | Bearer | 200 usuario logueado, con perfil y permisos · 401 |

- Las contraseñas se guardan con **bcrypt** (costo 12) y deben tener entre 8 y 72 caracteres.
- El token es un **JWT HS256** que dura 8 h. Todas las demás rutas exigen `Authorization: Bearer <token>`; sin él responden `401 { "error": "No autorizado" }`.
- En React, `AuthContext` guarda el token en `localStorage`, `RutaProtegida` redirige a `/login` sin sesión y `services/api.js` agrega el token a cada petición. Ante un 401, cierra la sesión automáticamente.

## Perfiles y permisos

| Perfil | Qué puede hacer |
|---|---|
| Administrador | Todo. Es el único que administra usuarios y sus permisos |
| Supervisor | Ver, crear y editar toda la operación; no elimina |
| Bodeguero | Ver inventario, bodegas y compras; crear y editar productos, lotes, ubicaciones y movimientos |
| Vendedor | Clientes y ventas (ver, crear, editar); consulta el catálogo |
| Consulta | Solo lectura de inventario y bodegas. Es el perfil de quien se registra por su cuenta |

Cada permiso es `<recurso>.<acción>` (por ejemplo `productos.crear`). Los CRUD deducen la acción del método HTTP: GET `ver`, POST `crear`, PUT `editar`, DELETE `eliminar`. Sin el permiso, la API responde el mismo `404` de una ruta inexistente, de modo que el endpoint queda oculto para ese usuario.

Permisos efectivos = los del perfil + las excepciones del usuario. Se leen de la base de datos en cada petición, así que un cambio aplica de inmediato, sin volver a iniciar sesión. En React, el Administrador los gestiona en **Personal > Permisos**.

| Método | Ruta (solo Administrador) | Uso |
|---|---|---|
| GET | `/api/perfiles` | Lista de perfiles |
| GET | `/api/usuarios/:id/permisos` | Catálogo con el estado de cada permiso para ese usuario |
| PUT | `/api/usuarios/:id/permisos/:codigo` | Cuerpo `{ "habilitado": true }` o `false` |
| DELETE | `/api/usuarios/:id/permisos` | Quita las excepciones y vuelve a lo que indica el perfil |
| PUT | `/api/usuarios/:id` | Con `perfilId` cambia el perfil y descarta sus excepciones |

Un administrador no puede cambiar sus propios permisos o perfil, ni quitar permisos a otro administrador (`409`).

## Códigos de estado

| Código | Cuándo se responde |
|---|---|
| 200 / 201 | La operación ocurrió de verdad: consulta, cambio, registro creado (201) o correo aceptado por el servidor SMTP |
| 304 | GET con `If-None-Match` cuyo ETag sigue vigente: los datos no cambiaron |
| 400 | Datos inválidos, JSON mal formado, URL inválida o valor fuera de rango |
| 401 | Sin token, token inválido o vencido, o credenciales incorrectas |
| 404 | El registro o la ruta no existen, o el usuario no tiene permiso (el endpoint queda oculto) |
| 409 | Duplicado, registro con dependencias u operación en conflicto |
| 413 | El cuerpo supera 100 kB |
| 500 | Fallo interno real, por ejemplo la base de datos caída |
| 502 | El servidor de correo no aceptó el envío |
| 503 | El envío de correos no está configurado (falta `EMAIL_PASS`); no se simula |

La API no usa redirecciones (301/302), porque ningún recurso cambió de dirección.

## API REST (requiere token)

Las 20 entidades tienen los mismos 5 endpoints:

| Método | Ruta | Respuesta |
|---|---|---|
| POST | `/api/<recurso>` | 201 creado · 400 validación o clave foránea inexistente · 409 duplicado |
| GET | `/api/<recurso>` | 200 arreglo, con los datos relacionados incluidos |
| GET | `/api/<recurso>/:id` | 200 · 404 |
| PUT | `/api/<recurso>/:id` | 200 actualizado · 400 · 404 |
| DELETE | `/api/<recurso>/:id` | 200 · 404 · 409 si tiene registros dependientes |

Recursos: `usuarios`, `categorias`, `proveedores`, `productos`, `movimientos`, `marcas`, `unidades-medida`, `impuestos`, `bodegas`, `ubicaciones`, `lotes`, `contactos-proveedor`, `ordenes-compra`, `detalles-orden-compra`, `clientes`, `metodos-pago`, `ventas`, `detalles-venta`, `departamentos` y `empleados`.

Los listados aceptan filtrar por cualquier clave foránea, por ejemplo `GET /api/ubicaciones?bodegaId=1` o `GET /api/detalles-venta?ventaId=3`.

**Cómo están hechos:** hay **21 controladores**, uno por entidad más el de autenticación, y cada uno tiene su archivo de rutas.
- **Lógica escrita a mano (5):** las 4 entidades del Día 1 y Usuarios, porque llevan reglas especiales como el stock en transacción o el hash del password.
- **Generados con un ayudante (15):** las entidades de administración describen sus campos y relaciones en su propio archivo (por ejemplo `ventas.controller.js`) y usan `crudFactory.js` para armar los 5 endpoints. Así todas validan igual: obligatorios, tipos, formatos, rangos y que cada clave foránea exista.

| Área | Controladores |
|---|---|
| Autenticación | `authController.js` |
| Personal | `usuarios`, `departamentos`, `empleados` |
| Inventario | `categorias`, `productos`, `movimientos`, `marcas`, `unidadesMedida`, `impuestos`, `lotes` |
| Bodegas | `bodegas`, `ubicaciones` |
| Compras | `proveedores`, `contactosProveedor`, `ordenesCompra`, `detallesOrdenCompra` |
| Ventas | `clientes`, `metodosPago`, `ventas`, `detallesVenta` |

## Probar la API

**Postman o Thunder Client:** importa `docs/postman/inventario.postman_collection.json` y ejecuta la colección completa con el *Runner*. Son **164 peticiones en 12 carpetas**, que cubren los 20 CRUDs:
1. El **login guarda el token** automáticamente en la variable `{{token}}`.
2. Cada "Crear" guarda su id para las peticiones siguientes.
3. Cubre los caminos felices y las respuestas **400, 401, 404 y 409**, y al final borra lo que creó.

**REST Client (VS Code / Antigravity):** abre [backend/pruebas.http](backend/pruebas.http); la petición de login guarda el token para el resto.

## Estructura

```
backend/
├── .env.example
└── src/
    ├── config/        database.js (MySQL) y jwt.js (secreto y expiración)
    ├── database/      migraciones y seeders
    ├── models/        20 modelos Sequelize con sus relaciones (usuario.js, producto.js, venta.js…)
    ├── controllers/   21 controladores (authController.js + uno por entidad)
    │                  y crudFactory.js, el ayudante que comparten 15 de ellos
    ├── routes/        21 archivos de rutas (authRoutes.js + <entidad>.routes.js) e index.js
    ├── utils/         validaciones, relaciones compartidas y formato de decimales
    ├── middlewares/   authMiddleware.js (JWT) y errores.js
    └── app.js · server.js

frontend/src/
├── context/       AuthContext.jsx (sesión global)
├── components/    RutaProtegida.jsx, Layout, Sidebar, tabla, modal, confirmación, formularios
├── config/        entidades.js: tabla y formulario de cada vista de administración
├── pages/         Login.jsx, Registro.jsx, Resumen, Día 1 y admin/ (una vista por entidad)
├── services/      api.js (fetch + token + autologout) y servicios por entidad
├── hooks/         useCrud, useFormulario, useOpciones (listas de los <select>)
├── styles/        tokens y estilos glass
└── utils/         formato de colones, fechas y stock
```

## Comandos usados para crear el backend

```bash
npm init -y
npm install express sequelize mysql2 dotenv cors bcrypt jsonwebtoken
npm install --save-dev sequelize-cli nodemon
npx sequelize-cli model:generate --name Categoria --attributes nombre:string,descripcion:string
npx sequelize-cli model:generate --name Proveedor --attributes nombre:string,identificacion:string,telefono:string,email:string,direccion:string,activo:boolean
npx sequelize-cli model:generate --name Producto --attributes sku:string,nombre:string,descripcion:string,precioCosto:decimal,precioVenta:decimal,stockActual:integer,stockMinimo:integer,categoriaId:integer,proveedorId:integer,activo:boolean
npx sequelize-cli model:generate --name MovimientoStock --attributes productoId:integer,tipo:enum,cantidad:integer,costoUnitario:decimal,motivo:string,fecha:date
npx sequelize-cli model:generate --name Usuario --attributes nombre:string,correo:string,password:string
npx sequelize-cli db:migrate
```
