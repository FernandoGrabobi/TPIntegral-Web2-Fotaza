require('dotenv').config(); // Carga las variables del .env
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// 1. Configuración del Motor de Plantillas (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares (Los "filtros" por los que pasa la info)
app.use(express.urlencoded({ extended: false })); // Para entender formularios POST
app.use(express.json()); // Para entender JSON
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta para CSS/Imágenes

// 3. Configuración de Sesiones (Para el Login)
app.use(session({
  secret: 'secreto_fotaza',
  resave: false,
  saveUninitialized: false
}));

// 4. Ruta de prueba (Hola Mundo)
app.get('/', (req, res) => {
  res.render('index', { title: 'Fotaza 2', message: '¡Bienvenido a la comunidad!' });
});

// 5. Levantar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});