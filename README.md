# Sistema de Gestión de Inventarios para PYMES

Mini Proyecto 1: sistema empresarial con CRUDs completos. El backend usa Node.js, Express, Sequelize y MySQL; el frontend usa React.
Este proyecto **no** incluye autenticación, login, registro ni roles. El foco son los CRUDs.

- Justificación y modelo entidad-relación: [docs/dia1-entregable.md](docs/dia1-entregable.md)

## Requisitos

- Node.js 20 o superior
- MySQL 8

## Backend: puesta en marcha

```bash
cd backend
npm install
cp .env.example .env        # completa DB_USER y DB_PASSWORD
npm run db:create           # crea la base inventario_pymes
npm run db:migrate          # crea las tablas
npm run dev                 # http://localhost:3000/api
```

Las pruebas de los endpoints están en [backend/pruebas.http](backend/pruebas.http).

## Comandos usados para crear el proyecto

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

## Frontend

La estructura (`src/components`, `src/pages`, `src/services`) ya está creada. La app de React se implementa en los siguientes días.
