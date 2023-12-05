const jwt = require('jsonwebtoken');

const generarJWT = (uid = '') => {
    return new Promise((resolve, reject) => {
        if (!uid) {
            reject('El UID es necesario');
            return;
        }

        const payload = { uid };
        const secretKey = process.env.SECRETORPRIVATEKEY;
        const expiresIn = process.env.JWT_EXPIRATION || '4h';

        jwt.sign(payload, secretKey, { expiresIn }, (err, token) => {
            if (err) {
                console.error('Error al generar el token:', err);
                reject('Error al generar el token');
            } else {
                // Aquí podrías agregar lógica de registro de auditoría
                resolve(token);
            }
        });
    });
}

module.exports = {
    generarJWT
}
