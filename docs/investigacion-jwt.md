# Investigación: JSON Web Tokens (JWT) en una API Node.js + React

Mini Proyecto 1 · Día 2 · Sistema de Gestión de Inventarios para PYMES

**Fuentes principales:** RFC 7519 (JWT), RFC 7515 (JWS), RFC 8725 (*JWT Best Current Practices*), OWASP *JSON Web Token Cheat Sheet*, OWASP *Cross-Site Request Forgery Prevention Cheat Sheet*, OWASP *Cross Site Scripting Prevention Cheat Sheet*, OWASP *Password Storage Cheat Sheet* y la documentación de `jsonwebtoken` y `bcrypt` en npm.

---

## 1. ¿Qué es un JWT?

Un JWT es una cadena compacta y firmada que transporta **afirmaciones** (*claims*) sobre un usuario, por ejemplo "este usuario es el id 7 y el token vence a las 18:00". El servidor lo emite al iniciar sesión y el cliente lo devuelve en cada petición.

Su ventaja es que es **autocontenido**: el servidor verifica la firma y confía en el contenido sin consultar una tabla de sesiones. Esto simplifica APIs REST sin estado y que escalan en varios servidores.

> Un JWT firmado **no está cifrado**. Cualquiera puede leer su contenido decodificando Base64URL. La firma solo garantiza que **nadie lo modificó**. Por eso nunca se guardan contraseñas ni datos sensibles en el payload.

## 2. Estructura

Tiene tres partes en Base64URL separadas por puntos: `encabezado.payload.firma`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3Iiwibm9tYnJlIjoiQW5hIiwiaWF0IjoxNzkzODcwMDAwLCJleHAiOjE3OTM4OTg4MDB9.4t1Jx...
```

| Parte | Contenido | Ejemplo decodificado |
|---|---|---|
| **Encabezado** (*header*) | Algoritmo de firma y tipo | `{ "alg": "HS256", "typ": "JWT" }` |
| **Payload** | Claims del usuario y metadatos | `{ "sub": "7", "nombre": "Ana", "iat": 1793870000, "exp": 1793898800 }` |
| **Firma** | `HMAC-SHA256(base64url(header) + "." + base64url(payload), secreto)` | bytes en Base64URL |

### Claims registrados (RFC 7519 §4.1)

| Claim | Significado | Uso en este proyecto |
|---|---|---|
| `sub` | *Subject*: a quién representa el token | id del usuario |
| `iat` | *Issued at*: cuándo se emitió | automático |
| `exp` | *Expiration*: cuándo deja de ser válido | 8 h después de `iat` |
| `nbf` | *Not before*: no válido antes de esta fecha | no se usa |
| `iss` / `aud` | Emisor y audiencia esperados | `inventario-api` / `inventario-web` |
| `jti` | Id único del token, útil para revocarlo | no se usa (ver §5.3) |

Además se pueden agregar *claims privados*, como `nombre`. Conviene que sean pocos: el token viaja en **cada** petición.

## 3. Firma y verificación

### 3.1 Algoritmos

| Familia | Ejemplos | Clave | Cuándo usarla |
|---|---|---|---|
| **HMAC** (simétrico) | HS256, HS384, HS512 | Un solo secreto compartido para firmar y verificar | Un único backend emite y verifica (nuestro caso) |
| **RSA / ECDSA** (asimétrico) | RS256, ES256, EdDSA | La clave privada firma y la pública verifica | Varios servicios verifican tokens de un servidor de identidad |

En este proyecto, el mismo servidor Express emite y verifica los tokens, así que **HS256** es suficiente y simple. El requisito es que `JWT_SECRET` sea **largo y aleatorio** (al menos 256 bits, es decir, 32 bytes) y que viva solo en `.env`, nunca en el repositorio.

### 3.2 Flujo

```
Cliente                         API Express                         MySQL
  │ POST /api/auth/login           │                                   │
  │ { correo, password } ────────► │ busca usuario por correo ───────► │
  │                                │ bcrypt.compare(password, hash)    │
  │                                │ jwt.sign({ sub }, JWT_SECRET,     │
  │ ◄──────── 200 { token, usuario } │   { expiresIn: '8h' })          │
  │                                │                                   │
  │ GET /api/productos             │                                   │
  │ Authorization: Bearer <token> ►│ authMiddleware:                   │
  │                                │   jwt.verify(token, JWT_SECRET,   │
  │                                │     { algorithms: ['HS256'] })    │
  │                                │   ✔ válido → req.usuario, next()  │
  │ ◄──────────────── 200 [ … ]    │   ✘ inválido/vencido → 401        │
```

### 3.3 Ataques conocidos y cómo se evitan (RFC 8725)

| Ataque | En qué consiste | Defensa |
|---|---|---|
| `alg: none` | Se envía un token sin firma esperando que el servidor lo acepte | Verificar siempre con una **lista blanca** de algoritmos: `algorithms: ['HS256']` |
| Confusión de algoritmo | Se firma con HS256 usando la clave *pública* RSA como secreto | La misma lista blanca; no mezclar familias de algoritmos |
| Secreto débil | Se adivina el secreto por fuerza bruta offline a partir de un token capturado | Secreto aleatorio de 32 bytes o más; el servidor no arranca si falta |
| Token reutilizado en otro sistema | Un token emitido para otro servicio se acepta aquí | Validar `iss` y `aud` |
| Manipulación del payload | Se cambia `sub` por el id de otro usuario | La firma deja de coincidir y `jwt.verify` lo rechaza |

## 4. Contraseñas: bcrypt

El JWT solo es tan seguro como el login que lo emite. Las contraseñas **nunca** se guardan en texto plano ni con hashes rápidos como MD5 o SHA-256: una GPU prueba miles de millones de esos hashes por segundo.

**bcrypt** es una función de derivación lenta a propósito:
- **Sal (*salt*) aleatoria por usuario:** dos contraseñas iguales producen hashes distintos y las tablas precalculadas (*rainbow tables*) no sirven.
- **Factor de costo** (*cost* o *salt rounds*): cada +1 duplica el tiempo. Usamos **12**, unos 200–300 ms por intento, imperceptible para un usuario y muy costoso para un atacante.
- El hash incluye algoritmo, costo y sal: `$2b$12$<sal 22 chars><hash 31 chars>`.

Reglas aplicadas en este proyecto:
- Mínimo **8 caracteres** antes de aplicar el hash (OWASP recomienda priorizar la longitud sobre las reglas de composición).
- bcrypt solo considera los primeros **72 bytes**, así que se limita la contraseña a 72 caracteres.
- El login responde **el mismo 401** si el correo no existe o si la contraseña es incorrecta. Así no se revela qué correos están registrados (enumeración de usuarios). Cuando el correo no existe, igual se ejecuta una comparación contra un hash ficticio para que el tiempo de respuesta no lo delate.
- La respuesta de la API **nunca** incluye el campo `password`.

## 5. Expiración

### 5.1 Por qué expirar

Un JWT es válido hasta su `exp` aunque el usuario cierre sesión, porque el servidor no guarda estado. Si alguien lo roba, puede usarlo hasta que venza. Una expiración corta **limita la ventana de daño**.

### 5.2 Cuánto tiempo

| Escenario | Expiración típica |
|---|---|
| Banca o datos muy sensibles | 5–15 min + *refresh token* |
| Aplicación de negocio interna (este caso) | 1–8 h, equivalente a una jornada laboral |
| Apps móviles | Access token corto + refresh token de días o semanas |

Elegimos **8 h** (configurable con `JWT_EXPIRES_IN`): el usuario inicia sesión al empezar el turno y no se le interrumpe a mitad del día.

### 5.3 Cerrar sesión y revocar

- **Logout en el cliente:** se borra el token del navegador. Es suficiente para la mayoría de los casos.
- **Revocación en el servidor:** como no hay estado, hay que agregar algo. Las opciones son una *lista negra* de `jti` hasta su `exp`, un campo `tokenVersion` en el usuario que se incrementa al cambiar la contraseña, o tokens cortos con *refresh token* rotativo guardado en la base de datos.
- **Refresh tokens:** un access token de pocos minutos más un refresh token de larga duración en cookie `httpOnly`, que se rota en cada uso. Es el patrón recomendado en producción; aquí queda como mejora futura.

## 6. Dónde guardar el token en React

| | `localStorage` / `sessionStorage` | Cookie `httpOnly; Secure; SameSite` |
|---|---|---|
| ¿Lo puede leer JavaScript? | **Sí** | **No** |
| Riesgo principal | **XSS**: un script inyectado puede robar el token y usarlo desde otro equipo | **CSRF**: otro sitio puede provocar peticiones que el navegador envía con la cookie |
| Cómo se envía | El código lo agrega: `Authorization: Bearer …` | El navegador lo adjunta automáticamente |
| Complejidad | Baja | Media: CORS con credenciales, protección CSRF, mismo dominio o subdominio |
| Sobrevive a recargar la página | Sí (`localStorage`) / solo la pestaña (`sessionStorage`) | Sí, hasta su expiración |
| Memoria de React (variable) | Lo más seguro frente a XSS persistente, pero se pierde al recargar | — |

**Conclusión:** la cookie `httpOnly` es más robusta, porque un XSS no puede *exfiltrar* el token, aunque sí puede hacer peticiones mientras la página está abierta. A cambio exige defensa CSRF. `localStorage` es más simple y es lo que el enunciado propone para React.

**Decisión en este proyecto:** `localStorage`, con estas mitigaciones:
1. React escapa por defecto todo lo que se renderiza con `{}`. **No se usa `dangerouslySetInnerHTML`** en ningún componente.
2. Expiración de 8 h. El frontend lee `exp` y cierra la sesión solo al vencer.
3. Ante **cualquier 401**, el interceptor borra el token y redirige a `/login` (*autologout*).
4. El token no se pone nunca en la URL, porque quedaría en el historial, los logs y el encabezado `Referer`.
5. Dependencias mínimas en el frontend (React, React Router y Vite) para reducir la superficie de ataque de la cadena de suministro.

## 7. Mitigar XSS y CSRF

### 7.1 XSS (*Cross-Site Scripting*)
Un atacante logra ejecutar JavaScript en nuestra página (por ejemplo, un nombre de producto con `<script>`) y con eso lee `localStorage`.
- **Escapar la salida:** React lo hace por defecto; evitar `dangerouslySetInnerHTML`, `eval` y `innerHTML`.
- **Validar la entrada en el servidor:** tipos, longitudes y formatos (ya implementado en los controllers).
- **Content-Security-Policy (CSP):** encabezado que prohíbe scripts de otros orígenes y scripts *inline*, por ejemplo `default-src 'self'; script-src 'self'; object-src 'none'`. Se configura en el servidor que publica el frontend o con `helmet` en Express.
- **Encabezados de seguridad** con `helmet`: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors` contra *clickjacking*.

### 7.2 CSRF (*Cross-Site Request Forgery*)
Otro sitio provoca que el navegador de la víctima envíe una petición a nuestra API con sus credenciales **automáticas** (cookies).
- **Con `Authorization: Bearer` desde `localStorage` (este proyecto), CSRF no aplica:** el navegador no agrega ese encabezado por sí solo y otro sitio no puede leer nuestro `localStorage`.
- **Si se usan cookies:** `SameSite=Lax` o `Strict`, un token anti-CSRF (*double submit* o *synchronizer token*), verificar `Origin` y `Referer`, y no aceptar cambios de estado por `GET`.
- **CORS restringido:** solo el origen del frontend (`CORS_ORIGIN`), nunca `*` junto con credenciales.

## 8. Middleware de autenticación en Express

El middleware intercepta cada petición antes del controller:

```js
// src/middlewares/authMiddleware.js (simplificado)
const [esquema, token] = (req.headers.authorization || '').split(' ');
if (esquema !== 'Bearer' || !token) return res.status(401).json({ error: 'No autorizado' });
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer, audience });
  req.usuario = await Usuario.findByPk(payload.sub);   // ¿sigue existiendo?
  if (!req.usuario) return res.status(401).json({ error: 'No autorizado' });
  next();
} catch {
  return res.status(401).json({ error: 'No autorizado' });   // firma inválida o token vencido
}
```

Buenas prácticas aplicadas:
- **Mensaje genérico** `{"error":"No autorizado"}`. No se explica si el token venció o si la firma es falsa, para no darle pistas a un atacante.
- **Se protege por defecto:** `router.use(authMiddleware)` va antes de todas las rutas de negocio; solo `register`, `login` y `health` quedan públicas.
- **Se recarga el usuario** desde la base de datos para que un usuario eliminado deje de tener acceso aunque su token siga vigente.
- **401 frente a 403:** 401 significa "no sé quién eres" (falta el token o es inválido); 403 significaría "sé quién eres pero no tienes permiso", que aplicaría con roles.

## 9. HTTPS

Un JWT es una credencial al portador (*bearer token*): **quien lo tenga, entra**. Por HTTP plano viaja en texto legible y cualquiera en la misma red (wifi pública, proxy) puede copiarlo.
- **Producción: siempre HTTPS** (TLS 1.2 o superior), con certificado gratuito de Let's Encrypt o el que provea el hosting.
- **HSTS** (`Strict-Transport-Security`) para que el navegador nunca vuelva a usar HTTP en ese dominio.
- **Cookies con `Secure`**, si se usan.
- En desarrollo local (`localhost`) se acepta HTTP porque el tráfico no sale del equipo.

## 10. Resumen de decisiones del proyecto

| Tema | Decisión |
|---|---|
| Librerías | `jsonwebtoken` (firma/verificación) y `bcrypt` (hash, costo 12) |
| Algoritmo | HS256 con lista blanca en `verify`; `iss` y `aud` validados |
| Secreto | `JWT_SECRET` de 64 bytes aleatorios en `.env`; el servidor no arranca sin él |
| Expiración | 8 h (`JWT_EXPIRES_IN`) |
| Contraseña | 8–72 caracteres; nunca se devuelve; mismo 401 para correo o contraseña incorrectos |
| Almacenamiento | `localStorage` + autologout ante 401 o vencimiento + sin `dangerouslySetInnerHTML` |
| Rutas | Públicas: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/health`. El resto exige `Bearer` |
| Mejoras para producción | HTTPS + HSTS, `helmet` con CSP, límite de intentos de login, refresh tokens en cookie `httpOnly` |
