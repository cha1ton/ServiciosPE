// app.js

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./config/passport-setup');

const app = express();

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
// Opcional: Si tus vistas EJS están en una carpeta diferente a 'views'
// app.set('views', path.join(__dirname, 'ruta/a/tus/vistas'));


// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 día de duración de la cookie
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Servir archivos estáticos (CSS, imágenes, JS para el modal, etc.)
// Ahora el dashboard.html se convierte en dashboard.ejs y será renderizado,
// pero style.css, user_placeholder.png, etc., siguen siendo estáticos.
app.use(express.static('public'));

// --- Rutas ---

// Ruta principal: ahora simplemente sirve index.html (el modal de login)
app.get('/', (req, res) => {
    // Si el usuario ya está autenticado, redirigir directamente a su perfil/dashboard
    if (req.isAuthenticated()) {
        return res.redirect('/profile'); // Redirige a la nueva ruta del dashboard
    }
    // Asegúrate de que index.html sigue estando en 'public'
    res.sendFile(__dirname + '/public/index.html');
});

// Inicia el flujo de autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// URL de callback después de la autenticación de Google
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        // Autenticación exitosa, redirige al nuevo dashboard
        res.redirect('/profile');
    }
);

// ***** MODIFICACIÓN CRÍTICA: Perfil del usuario (ruta protegida / dashboard) *****
app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        // Renderizamos la vista 'dashboard.ejs' y le pasamos el objeto 'user'
        res.render('dashboard', { user: req.user });
    } else {
        // Si no está autenticado, redirigir a la página principal (modal de login)
        res.redirect('/');
    }
});

// Cerrar sesión
app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});