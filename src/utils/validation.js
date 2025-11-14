// src/utils/validation.js
const validator = require('validator');

class Validator {
    static sanitizeString(str, maxLength = 255) {
        if (!str || typeof str !== 'string') return '';
        return validator.escape(str.trim().slice(0, maxLength));
    }

    static validarEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return validator.isEmail(email) && email.length <= 100;
    }

    static validarIdentificacion(id) {
        if (!id || typeof id !== 'string') return false;
        // Solo alfanuméricos, guiones y espacios
        return /^[a-zA-Z0-9\s-]{5,15}$/.test(id);
    }

    static validarNombre(nombre) {
        if (!nombre || typeof nombre !== 'string') return false;
        // Solo letras, espacios y tildes
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,100}$/.test(nombre);
    }

    static validarContrasena(password) {
        if (!password || typeof password !== 'string') return false;
        // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password);
    }

    static validarPuntuacion(puntuacion) {
        const num = parseInt(puntuacion);
        return !isNaN(num) && num >= 0 && num <= 100000;
    }

    static validarRangoTiempo(tiempo) {
        const num = parseInt(tiempo);
        return !isNaN(num) && num >= 0 && num <= 7200; // máx 2 horas
    }
}

module.exports = Validator;