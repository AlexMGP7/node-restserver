const { response } = require("express");
const { ObjectId } = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models')

const coleccionesPermitidas = [
    'usuarios',
    'categoria',
    'productos',
    'roles'
];

const buscarUsuarios = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); //TRUE

    if (esMongoID) {
        const usuario = await Usuario.findById(termino);
        res.json({
            results: (usuario) ? [usuario] : []
        });
    };

    const regex = new RegExp(termino, 'i');

    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    res.json({
        results: usuarios
    });

};

const buscarCategorias = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); //TRUE

    if (esMongoID) {
        const categoria = await Categoria.findById(termino);
        res.json({
            results: (categoria) ? [categoria] : []
        });
    };

    const regex = new RegExp(termino, 'i');

    const categorias = await Categoria.find({ nombre: regex, estado: true });

    res.json({
        results: categorias
    });

};

const buscarProductos = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); //TRUE

    if (esMongoID) {
        const producto = await Producto.findById(termino)
            .populate('categoria', 'nombre');

        res.json({
            results: (producto) ? [producto] : []
        });
    };

    const regex = new RegExp(termino, 'i');

    const productos = await Producto.find({
        $or: [{ nombre: regex }, { descripcion: regex }],
        $and: [{ estado: true }]
    }).populate('categoria', 'nombre');

    res.json({
        results: productos
    });

};

const buscar = (req, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`
        });
    };

    switch (coleccion) {

        case 'usuarios':

            buscarUsuarios(termino, res)

            break;

        case 'categoria':

            buscarCategorias(termino, res)

            break;

        case 'productos':

            buscarProductos(termino, res)

            break;

        default:
            res.status(500).json({
                msg: 'Problema al realizar la busqueda por parte del backend'
            })
            break;
    }

};



module.exports = {
    buscar
}