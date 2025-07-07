const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config();

// Importa la configuración de Passport
require('./config/passport-setup');
const User = require('./models/User'); // Asegúrate de que este path sea correcto

const app = express();

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Configuración de la sesión
app.use(session({
    secret: process.env.SESSION_SECRET, // Usa una clave secreta fuerte en .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './views'); // Ruta a tu carpeta de vistas

// Rutas de autenticación
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Autenticación exitosa, redirigir al dashboard
        res.redirect('/dashboard');
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Middleware para verificar si el usuario está autenticado
const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/'); // Redirige al login si no está autenticado
    } else {
        next(); // Continúa si está autenticado
    }
};

// Rutas de la aplicación
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/dashboard', authCheck, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Rutas para las páginas simuladas
app.get('/profile', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

app.get('/search-results', authCheck, (req, res) => {
    res.render('search-results', { user: req.user });
});

app.get('/service-detail/:id', authCheck, (req, res) => {
    // En un caso real, buscarías el servicio por ID en la BD
    // Aquí solo renderizamos con datos de ejemplo
    res.render('service-detail', { user: req.user, serviceId: req.params.id });
});

app.get('/map-view', authCheck, (req, res) => {
    res.render('map-view', { user: req.user });
});

app.get('/register-provider', authCheck, (req, res) => {
    res.render('register-provider', { user: req.user });
});

app.get('/manage-service', authCheck, (req, res) => {
    res.render('manage-service', { user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});