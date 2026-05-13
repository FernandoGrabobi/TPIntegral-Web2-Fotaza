require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// ── Middlewares globales ──────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Sesión ────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto_fotaza_dev',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24hs
}));

// ── Motor de vistas PUG ───────────────────────────
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware de usuario actual en todas las vistas
const { setCurrentUser } = require('./middlewares/auth');
app.use(setCurrentUser);

// ── Rutas ─────────────────────────────────────────
const routes = require('./routes/index');
app.use('/', routes);

// ── 404 ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Página no encontrada.' });
});

// ── Error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Ocurrió un error interno.' });
});

// ── Iniciar servidor ──────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Fotaza 2 corriendo en http://localhost:${PORT}`);
});