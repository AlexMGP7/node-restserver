const { response } = require("express");
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");

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

const googleSignIn = async (req, res = response) => {

    const { id_token } = req.body;

    try {

        const { nombre, img, correo } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            const data = {
                nombre,
                correo,
                password: ':P',
                img,
                google: true,
                rol: 'USER_ROLE'

            };
            usuario = new Usuario(data);
            await usuario.save();

        }

        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });

    } catch (error) {
        console.log(error); // Agrega esta línea
        res.status(400).json({
            ok: false,
            msg: 'El Token no se pudo verificar'
        })
    }


}

module.exports = {
    login,
    googleSignIn
};
