# 📸 Fotaza 2 — Red Social de Fotografía

Proyecto Integrador de **Programación Web II** — Universidad de La Punta  
Desarrollador de Software

---

## 🚀 Instalación y ejecución local

### Requisitos previos
- Node.js v18+
- MySQL 8.0+
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/FernandoGrabobi/TPIntegral-Web2-Fotaza.git
cd TPIntegral-Web2-Fotaza

# 2. Instalar dependencias
npm install

# 3. Crear la base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE fotaza_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Configurar variables de entorno
cp .env.example .env
# Editá .env con tus datos de MySQL

# 5. Inicializar tablas y datos de prueba
npm run db:init

# 6. Iniciar el servidor
npm start
```

Abrí el navegador en: **http://localhost:3000**

---

## ⚙️ Variables de entorno (.env)

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=cualquier_texto_secreto_largo

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=fotaza_db
DB_DIALECT=mysql
```

---

## 👥 Usuarios de prueba

| Usuario     | Email                   | Contraseña | Rol       |
|-------------|-------------------------|------------|-----------|
| admin       | admin@fotaza.com        | 123456     | admin     |
| validador   | validador@fotaza.com    | 123456     | validator |
| ana_foto    | ana@fotaza.com          | 123456     | user      |
| carlos_lens | carlos@fotaza.com       | 123456     | user      |

---

## 🏗️ Estructura del proyecto

```
├── app.js                  # Punto de entrada
├── config/
│   └── config.json         # Configuración Sequelize
├── controllers/            # Lógica de negocio
├── middlewares/
│   └── auth.js             # Autenticación y roles
├── models/                 # Modelos Sequelize (ORM)
├── routes/
│   └── index.js            # Todas las rutas
├── scripts/
│   └── dbInit.js           # Inicialización de BD
├── views/                  # Vistas PUG
│   ├── auth/
│   ├── posts/
│   ├── users/
│   ├── search/
│   ├── notifications/
│   ├── collections/
│   ├── messages/
│   └── validator/
├── public/
│   ├── css/style.css
│   └── uploads/            # Archivos subidos
├── .env.example
└── package.json
```

---

## ✅ Funcionalidades implementadas

### 1. Autenticación
- Registro con validación de datos y unicidad de email/usuario
- Login con verificación de estado de cuenta
- Logout seguro
- Contraseñas cifradas con bcrypt
- Control de acceso por rol (user / validator / admin)

### 2. Gestor de contenidos
- Publicaciones con título, descripción, múltiples imágenes y etiquetas
- Sistema de licencias (copyright / libre) con texto de marca de agua
- Comentarios con apertura/cierre por el autor
- Valoración (1–5 estrellas) una vez por usuario (no el propio autor)
- Botón "Me interesa" para contactar al autor
- Mensajería privada entre usuarios

### 3. Sistema de denuncias
- Denuncias de publicaciones y comentarios
- Al superar 3 denuncias → publicación pasa a "bajo revisión"
- Panel de moderación para validadores
- Dar de baja o desestimar denuncias
- Al llegar a 3 publicaciones bajadas → cuenta inactiva

### 4. Motor de búsqueda
- Filtros combinables: texto, etiqueta, autor, licencia, puntaje mínimo
- Ordenamiento: más recientes, mejor valoradas, más antiguas

### 5. Seguidores (Followers)
- Seguir / dejar de seguir usuarios
- No seguirse a sí mismo, no duplicar follows
- Feed de publicaciones de usuarios seguidos
- Contadores en perfil: seguidores / siguiendo

### 6. Notificaciones
- Eventos: comentario, valoración, interés, nuevo seguidor
- Marcar como leída (individual o todas)
- Contador de no leídas en navbar

### 7. Colecciones / Favoritos
- Crear colecciones personales
- Guardar publicaciones (sin duplicados en la misma colección)
- Solo visibles por el propietario

---

## 🗄️ Base de datos

**Motor:** MySQL 8.0  
**ORM:** Sequelize 6  
**Normalización:** 3FN

### Modelos / Tablas
- `Users` — usuarios con roles y estados
- `Posts` — publicaciones con licencias
- `PostImages` — imágenes de cada publicación
- `Tags` + `PostTags` — etiquetas (M:N)
- `Comments` — comentarios
- `Ratings` — valoraciones (único por usuario/post)
- `Follows` — relación seguidor/seguido (único)
- `Reports` — denuncias de posts y comentarios
- `Notifications` — notificaciones del sistema
- `Collections` + `CollectionPosts` — colecciones/favoritos (M:N)
- `Interesteds` — interés en publicaciones
- `Messages` — mensajería privada

---

## 🛠️ Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Servidor   | Node.js + Express 5               |
| ORM        | Sequelize 6 + mysql2              |
| Vistas     | PUG (server-side rendering)       |
| Estilos    | Tailwind CSS (CDN)                |
| Archivos   | Multer                            |
| Sesiones   | express-session                   |
| Seguridad  | bcrypt, validaciones en servidor  |

---

## 📝 Problemas encontrados durante el desarrollo

### 1. Modelos en minúscula vs PascalCase
Sequelize carga automáticamente todos los `.js` de la carpeta `models/`. Los archivos originales (`user.js`, `post.js`) chocaban con los nuevos (`User.js`, `Post.js`). Solución: eliminar los archivos en minúscula.

### 2. Variables de entorno en config.json
Sequelize-CLI usa `config.json` pero no lee `.env` automáticamente. Solución: en `models/index.js` se leen primero las variables `DB_*` del entorno y se instancia Sequelize directamente.

### 3. Tailwind CDN con clases dinámicas en PUG
Las clases con `:` (responsive/hover) no funcionan en PUG porque el `:` rompe la sintaxis. Solución: reemplazar `:` por `_` en las clases dentro de PUG (ej: `md_grid-cols-3`). Tailwind CDN las reconoce igual.

---

## 📦 Despliegue en producción

La aplicación está disponible en: *(completar con URL del servidor)*

Servidores recomendados con soporte Node + MySQL:
- Railway.app
- Render.com
- Fly.io