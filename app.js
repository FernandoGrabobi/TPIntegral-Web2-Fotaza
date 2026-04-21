require('dotenv').config(); // Carga las variables del .env
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

const authController = require('./controllers/authController');

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