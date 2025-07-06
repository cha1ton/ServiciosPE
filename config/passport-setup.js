//config/passport-setup.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Serializa el usuario para almacenarlo en la sesión (solo su ID)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserializa el usuario para recuperarlo de la sesión
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            // 1. Al primer uso: Obtener información básica del perfil (nombre, email, foto)
            // La información ya viene en el objeto 'profile'

            // 2. Al primer uso: Crear automáticamente una cuenta sin pasos adicionales
            // En usos posteriores: Reconocer al usuario existente

            const currentUser = await User.findOne({ googleId: profile.id });

            if (currentUser) {
                // El usuario existe, reconocerlo
                console.log('Usuario existente:', currentUser.email);
                done(null, currentUser);
            } else {
                // Nuevo usuario, crearlo
                console.log('Creando nuevo usuario:', profile.emails[0].value);
                const newUser = await new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value
                }).save();
                console.log('Usuario creado:', newUser);
                done(null, newUser);
            }
        }
    )
);