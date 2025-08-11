const bcrypt = require('bcrypt');
const password = 'suchtsabado321'; // Reemplaza con la contraseña que deseas cifrar
const saltRounds = 10; // Usa el mismo número de rondas que tu backend

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Contraseña cifrada:', hash);
});