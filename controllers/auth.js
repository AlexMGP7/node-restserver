const { response } = require("express");
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");

const login = async (req, res = response) => {
    const { correo, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });

        // Comprobar si el usuario existe y está activo
        if (!usuario || !usuario.estado) {
            return res.status(400).json({ msg: 'Credenciales no son correctas' });
        }

        // Comprobar la contraseña
        const validPassword = await bcryptjs.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ msg: 'Credenciales no son correctas' });
        }

        const token = await generarJWT(usuario.id);

        // Devolver datos seguros
        res.json({
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.rol,
                uid: usuario.id
            },
            token
        });
        

    } catch (error) {
        console.error('Error en el sistema de login:', error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}

module.exports = {
    login
};
