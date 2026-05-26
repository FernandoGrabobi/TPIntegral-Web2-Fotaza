require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // ← DEBE IR ACÁ ARRIBA

app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto_fotaza_dev',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const { setCurrentUser } = require('./middlewares/auth');
app.use(setCurrentUser);

const routes = require('./routes/index');
app.use('/', routes);

app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Página no encontrada.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Ocurrió un error interno.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Fotaza 2 corriendo en http://localhost:${PORT}`);
});