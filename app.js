require('dotenv').config(); // Carga las variables del .env
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
 /**
     *  nodemon app.js
     *  para arrancar el servidor
     *  http://localhost:3000/
     *  http://localhost:3000/auth/register
     */
const authController = require('./controllers/authController');

// 1. Importar el controlador de posts (lo crearemos pronto)
// const postController = require('./controllers/postController');

// 2. Ruta para ver el formulario de creación
app.get('/posts/create', (req, res) => {
    res.render('createPost', { title: 'Subir Publicación' });
});

// 3. Ruta para procesar la subida (la usaremos cuando hagamos el backend)
// app.post('/posts/create', postController.create);


app.get('/register', (req, res) => {
    res.render('register');
});
app.use(express.urlencoded({ extended: false }));

app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/auth/register', authController.register);

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'secreto_fotaza',
  resave: false,
  saveUninitialized: false
}));
app.get('/', (req, res) => {
  res.render('index', { title: 'Fotaza 2', message: '¡Bienvenido a la comunidad!' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});